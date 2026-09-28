// AI-Generated Code - 2026-09-29 - Composer
/**
 * Hindsight is the ONLY long-term memory layer.
 * Each authenticated user gets an isolated bank: briefed-user-{userId}.
 */

import { HindsightClient } from "@vectorize-io/hindsight-client";
import type { MemoryDebugInfo } from "../types.js";
import { getAuthUser } from "./requestContext.js";

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
  whenLearned?: string | null;
  documentId?: string | null;
  context?: string | null;
}

function env(name: string, fallback = ""): string {
  return process.env[name]?.trim() || fallback;
}

/** In-memory debug snapshot for the last retain/recall (no secrets). */
let lastDebug: MemoryDebugInfo = {
  bankId: "",
  contactId: "",
  contactName: "",
};

const ensuredBanks = new Set<string>();

export function getLastMemoryDebug(): MemoryDebugInfo {
  return { ...lastDebug };
}

export function patchMemoryDebug(patch: Partial<MemoryDebugInfo>): void {
  lastDebug = { ...lastDebug, ...patch };
}

export function requireHindsightApiKey(): string {
  const key = env("HINDSIGHT_API_KEY");
  if (!key) {
    const err = new Error(
      "HINDSIGHT_API_KEY is required. Hindsight is the core memory system — set it in backend/.env"
    );
    (err as Error & { status: number; code: string }).status = 503;
    (err as Error & { code: string }).code = "HINDSIGHT_NOT_CONFIGURED";
    throw err;
  }
  return key;
}

/** Sanitize user id for Hindsight bank naming. */
export function bankIdForUser(userId: string): string {
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  return `briefed-user-${safe || "unknown"}`;
}

/**
 * Active Hindsight bank.
 * Authenticated requests → per-user bank.
 * Unauthenticated health checks → env prefix (not used for retain/recall).
 */
export function getBankId(userId?: string): string {
  if (userId) return bankIdForUser(userId);
  const auth = getAuthUser();
  if (auth?.id) return bankIdForUser(auth.id);
  return env("HINDSIGHT_BANK_ID", "briefed-maya");
}

let client: HindsightClient | null = null;

export function getHindsightClient(): HindsightClient {
  const apiKey = requireHindsightApiKey();
  if (!client) {
    client = new HindsightClient({
      baseUrl: env("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io"),
      apiKey,
    });
  }
  return client;
}

export function resetHindsightClient(): void {
  client = null;
  ensuredBanks.clear();
}

export function isHindsightConfigured(): boolean {
  return Boolean(env("HINDSIGHT_API_KEY"));
}

async function ensureBank(bankId: string): Promise<void> {
  if (ensuredBanks.has(bankId)) return;
  const hs = getHindsightClient();
  const auth = getAuthUser();
  const label = auth?.name ? `${auth.name}'s Meeting Memory` : "Briefed Meeting Memory";
  await hs.createBank(bankId, {
    name: `Briefed — ${label}`,
    retainMission:
      "Extract meeting discussions, decisions, outcomes, commitments (who/what/when), missed or pending follow-ups, recurring concerns (especially cost), and communication preferences. Prefer precise, attributable facts per contact. Keep memories scoped to this user's relationships only.",
    reflectMission:
      "I am a B2B meeting prep agent for this Briefed user. Prioritize commitments, decisions, open loops, recurring concerns, preferences, and prior outcomes for each contact.",
    enableObservations: true,
    disposition: { skepticism: 2, literalism: 4, empathy: 3 },
  });
  ensuredBanks.add(bankId);
}

function pickWhenLearned(r: {
  occurred_start?: string | null;
  mentioned_at?: string | null;
}): string | null {
  return r.occurred_start || r.mentioned_at || null;
}

export async function retainMemory(input: RetainInput): Promise<{
  provider: "hindsight";
  documentId: string;
}> {
  const bankId = getBankId();
  const auth = getAuthUser();
  patchMemoryDebug({
    bankId,
    contactId: input.contactId,
    retain: {
      status: "ok",
      documentIds: [input.documentId],
      at: new Date().toISOString(),
    },
  });

  try {
    await ensureBank(bankId);
    const hs = getHindsightClient();
    const tags =
      input.tags ??
      [
        `contact:${input.contactId}`,
        ...(auth ? [`user:${auth.id}`] : []),
      ];

    await hs.retain(bankId, input.content, {
      context: input.context ?? "Meeting debrief for Briefed prep agent",
      timestamp: input.timestamp,
      documentId: input.documentId,
      tags,
      metadata: {
        contactId: input.contactId,
        meetingId: input.meetingId,
        ...(auth?.id ? { userId: auth.id } : {}),
        source: "briefed-debrief",
      },
    });

    patchMemoryDebug({
      retain: {
        status: "ok",
        documentIds: [input.documentId],
        at: new Date().toISOString(),
      },
    });

    return { provider: "hindsight", documentId: input.documentId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    patchMemoryDebug({
      retain: {
        status: "error",
        documentIds: [input.documentId],
        error: message,
        at: new Date().toISOString(),
      },
    });
    throw err;
  }
}

export async function recallMemories(
  query: string,
  contactId: string
): Promise<{ provider: "hindsight"; facts: RecalledFact[] }> {
  const bankId = getBankId();
  try {
    await ensureBank(bankId);
    const hs = getHindsightClient();

    const tagged = await hs.recall(bankId, query, {
      budget: "mid",
      maxTokens: 3072,
      tags: [`contact:${contactId}`],
    });

    const mapResults = (
      results: Array<{
        id?: string;
        text?: string;
        occurred_start?: string | null;
        mentioned_at?: string | null;
        document_id?: string | null;
        context?: string | null;
      }>,
      prefix: string
    ): RecalledFact[] =>
      (results ?? [])
        .map((r, idx) => ({
          id: r.id ?? `${prefix}-${idx}`,
          text: (r.text ?? "").trim(),
          whenLearned: pickWhenLearned(r),
          documentId: r.document_id ?? null,
          context: r.context ?? null,
        }))
        .filter((f) => f.text.length > 0);

    const facts = mapResults(tagged.results ?? [], "hs");

    patchMemoryDebug({
      bankId,
      contactId,
      recall: {
        status: "ok",
        queryCount: 1,
        memoryCount: facts.length,
        at: new Date().toISOString(),
      },
    });

    return { provider: "hindsight", facts };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    patchMemoryDebug({
      bankId,
      contactId,
      recall: {
        status: "error",
        queryCount: 1,
        memoryCount: 0,
        error: message,
        at: new Date().toISOString(),
      },
    });
    throw err;
  }
}

export function healthCheck(): {
  configured: boolean;
  bankId: string;
} {
  const auth = getAuthUser();
  return {
    configured: isHindsightConfigured(),
    bankId: auth ? bankIdForUser(auth.id) : env("HINDSIGHT_BANK_ID", "briefed-maya"),
  };
}
