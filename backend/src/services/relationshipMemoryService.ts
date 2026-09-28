// AI-Generated Code - 2026-09-28 - Composer
/**
 * Relationship Memory explorer — recalls from Hindsight for a contact.
 * App SQLite is only used for meeting timeline metadata.
 */

import type { Contact, Meeting, RecalledMemory } from "../types.js";
import { listMeetings } from "../store/db.js";
import { getBankId, recallMemories } from "./hindsightService.js";
import type { RecalledFact } from "./hindsightService.js";

function classify(fact: RecalledFact): RecalledMemory["section"] {
  const t = fact.text.toLowerCase();
  if (
    t.includes("missed") ||
    t.includes("pending") ||
    t.includes("not delivered") ||
    t.includes("unresolved") ||
    t.includes("still relevant")
  ) {
    return "missedFollowUps";
  }
  if (t.includes("prefer") || t.includes("concise") || t.includes("two-week")) {
    return "preferences";
  }
  if (t.includes("cost") || t.includes("concern")) {
    return "recurringConcerns";
  }
  if (t.includes("promise") || t.includes("commitment") || t.includes("send")) {
    return "commitments";
  }
  if (t.includes("decision") || t.includes("agreed")) {
    return "decisions";
  }
  return "discussions";
}

function sourceFromFact(fact: RecalledFact, meetings: Meeting[]): string {
  if (fact.documentId) {
    const match = meetings.find((m) => fact.documentId?.includes(m.id));
    if (match) return `${match.date} · ${match.title}`;
  }
  if (fact.whenLearned) {
    try {
      return new Date(fact.whenLearned).toISOString().slice(0, 10);
    } catch {
      return fact.whenLearned;
    }
  }
  return "Hindsight memory";
}

export async function getRelationshipMemory(contact: Contact) {
  const meetings = listMeetings(contact.id);
  const logged = meetings.filter((m) => m.status === "logged");
  const last = [...logged].sort((a, b) => b.date.localeCompare(a.date))[0];

  const queries = [
    `${contact.name}: important facts, discussions, and outcomes`,
    `${contact.name}: preferences and communication style`,
    `${contact.name}: concerns especially deployment cost`,
    `${contact.name}: commitments, promises, pending or missed follow-ups`,
  ];

  const bags = await Promise.all(
    queries.map(async (q) => (await recallMemories(q, contact.id)).facts)
  );

  const seen = new Set<string>();
  const facts: RecalledFact[] = [];
  for (const bag of bags.flat()) {
    const key = bag.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    facts.push(bag);
  }

  const memories: RecalledMemory[] = facts.map((f) => {
    const section = classify(f);
    return {
      id: f.id,
      text: f.text,
      section,
      whenLearned: f.whenLearned ?? null,
      documentId: f.documentId ?? null,
      whyRelevant: `Remembered for ${contact.name} · ${sourceFromFact(f, meetings)}`,
    };
  });

  const by = (s: RecalledMemory["section"]) =>
    memories.filter((m) => m.section === s).map((m) => m.text);

  return {
    contact: {
      id: contact.id,
      name: contact.name,
      company: contact.company,
      role: contact.role,
    },
    bankId: getBankId(),
    memoryCount: memories.length,
    facts: memories,
    preferences: by("preferences"),
    concerns: by("recurringConcerns"),
    commitments: [...by("commitments"), ...by("missedFollowUps")],
    timeline: meetings.map((m) => ({
      date: m.date,
      title: m.title,
      status: m.status,
      retained: Boolean(m.hindsightDocumentId),
    })),
    lastInteraction: last
      ? {
          date: last.date,
          title: last.title,
          retained: Boolean(last.hindsightDocumentId),
        }
      : null,
  };
}
