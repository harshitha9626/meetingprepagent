// AI-Generated Code - 2026-09-28 - Composer

import { HindsightClient } from "@vectorize-io/hindsight-client";
import {
  addLocalMemory,
  clearLocalMemories,
  listLocalMemories,
} from "../store/db.js";
import type { LocalMemoryRecord } from "../types.js";

export type MemoryProviderName = "hindsight" | "local";

export interface RetainInput {
  documentId: string;
  content: string;
  contactId: string;
  meetingId: string;
  context?: string;
  timestamp?: string;
  tags?: string[];
}

export interface RecalledFact {
  id: string;
  text: string;
}

function env(name: string, fallback = ""): string {
  return process.env[name]?.trim() || fallback;
}

export function getMemoryProviderName(): MemoryProviderName {
  const forced = env("MEMORY_PROVIDER").toLowerCase();
  if (forced === "local") return "local";
  if (forced === "hindsight") return "hindsight";
  // Auto: use Hindsight only when an API key is present
  if (env("HINDSIGHT_API_KEY")) return "hindsight";
  return "local";
}

export function getBankId(): string {
  return env("HINDSIGHT_BANK_ID", "briefed-maya");
}

let client: HindsightClient | null = null;

function getHindsightClient(): HindsightClient {
  if (!client) {
    client = new HindsightClient({
      baseUrl: env("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io"),
      apiKey: env("HINDSIGHT_API_KEY") || undefined,
    });
  }
  return client;
}

function scoreLocal(content: string, query: string): number {
  const hay = content.toLowerCase();
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
  let score = 0;
  for (const term of terms) {
    if (hay.includes(term)) score += 1;
  }
  return score;
}

function chunkLocalContent(record: LocalMemoryRecord): RecalledFact[] {
  const content = record.content;
  const sections: { label: string; body: string }[] = [];
  const patterns = [
    { label: "Discussed", re: /Discussed:\s*([\s\S]*?)(?=\nDecisions:|\nCommitments|\nConcerns|$)/i },
    { label: "Decisions", re: /Decisions:\s*([\s\S]*?)(?=\nCommitments|\nConcerns|$)/i },
    {
      label: "Commitments",
      re: /Commitments[\s\S]*?:\s*([\s\S]*?)(?=\nConcerns|$)/i,
    },
    {
      label: "Concerns and preferences",
      re: /Concerns[\s\S]*?:\s*([\s\S]*?)(?=\nUser \(agent owner\)|$)/i,
    },
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern.re);
    if (match?.[1]?.trim()) {
      const header = content.match(
        /Contact:.*\n[\s\S]*?Date:\s*(.*)/i
      );
      const date = header?.[1]?.trim() ?? "";
      const contactLine = content.match(/Contact:\s*(.*)/i)?.[1]?.trim() ?? "";
      sections.push({
        label: pattern.label,
        body: `${pattern.label} (${contactLine}${date ? `, ${date}` : ""}): ${match[1].trim()}`,
      });
    }
  }

  if (sections.length === 0) {
    return [
      {
        id: `${record.id}:0`,
        text: content.slice(0, 500),
      },
    ];
  }

  return sections.map((section, i) => ({
    id: `${record.id}:${i}`,
    text: section.body,
  }));
}

async function ensureBank(): Promise<void> {
  const hs = getHindsightClient();
  const bankId = getBankId();
  try {
    await hs.createBank(bankId, {
      name: "Briefed — Maya Meeting Memory",
      retainMission:
        "Extract meeting discussions, decisions, commitments (who/what/when), missed follow-ups, recurring concerns, contact preferences, and Maya's prep style.",
      reflectMission:
        "I am Maya's meeting prep agent. Prioritize commitments, decisions, open loops, recurring concerns, and preparation preferences for each contact.",
      enableObservations: true,
    });
  } catch {
    // Bank may already exist / cloud may reject recreate — retain/recall still proceed
  }
}

export async function retainMemory(input: RetainInput): Promise<{
  provider: MemoryProviderName;
}> {
  const provider = getMemoryProviderName();
  const tags = input.tags ?? [`contact:${input.contactId}`];

  if (provider === "hindsight") {
    await ensureBank();
    const hs = getHindsightClient();
    await hs.retain(getBankId(), input.content, {
      context: input.context ?? "Meeting debrief for Briefed prep agent",
      timestamp: input.timestamp,
      documentId: input.documentId,
      tags,
      metadata: {
        contactId: input.contactId,
        meetingId: input.meetingId,
        source: "briefed-debrief",
      },
    });
    return { provider };
  }

  addLocalMemory({
    id: crypto.randomUUID(),
    contactId: input.contactId,
    meetingId: input.meetingId,
    documentId: input.documentId,
    content: input.content,
    createdAt: new Date().toISOString(),
  });
  return { provider };
}

export async function recallMemories(
  query: string,
  contactId: string
): Promise<{ provider: MemoryProviderName; facts: RecalledFact[] }> {
  const provider = getMemoryProviderName();

  if (provider === "hindsight") {
    await ensureBank();
    const hs = getHindsightClient();
    const result = await hs.recall(getBankId(), query, {
      budget: "mid",
      maxTokens: 2048,
      tags: [`contact:${contactId}`],
    });

    const facts: RecalledFact[] = (result.results ?? []).map(
      (r: { id?: string; text?: string }, idx: number) => ({
        id: r.id ?? `hs-${idx}`,
        text: r.text ?? "",
      })
    ).filter((f: RecalledFact) => f.text.trim().length > 0);

    // Fallback without tags if tagged recall is empty (older banks / seed)
    if (facts.length === 0) {
      const broad = await hs.recall(getBankId(), query, {
        budget: "mid",
        maxTokens: 2048,
      });
      const broadFacts: RecalledFact[] = (broad.results ?? []).map(
        (r: { id?: string; text?: string }, idx: number) => ({
          id: r.id ?? `hsb-${idx}`,
          text: r.text ?? "",
        })
      ).filter((f: RecalledFact) => f.text.trim().length > 0);
      return { provider, facts: broadFacts };
    }

    return { provider, facts };
  }

  const records = listLocalMemories(contactId);
  const facts = records
    .flatMap(chunkLocalContent)
    .map((fact) => ({ fact, score: scoreLocal(fact.text, query) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((x) => x.fact);

  // If keyword scoring finds nothing, return recent chunks
  if (facts.length === 0) {
    return {
      provider,
      facts: records.flatMap(chunkLocalContent).slice(0, 10),
    };
  }

  return { provider, facts };
}

export async function clearProviderMemories(): Promise<void> {
  clearLocalMemories();
  // Hindsight bank clearing is demo-scoped via re-seed retain with new docs;
  // full bank wipe depends on cloud plan — local clear always runs.
}
