// AI-Generated Code - 2026-09-28 - Composer
/**
 * Factual prep extras derived from SQLite meetings/commitments + already-recalled
 * Hindsight memories. No extra Hindsight calls.
 */

import type {
  Commitment,
  Contact,
  EvolutionStage,
  Meeting,
  MeetingInsights,
  RecalledMemory,
  RelationshipEvolution,
  WhatChangedItem,
} from "../types.js";

function clip(text: string, max = 120): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function loggedMeetings(meetings: Meeting[]): Meeting[] {
  return meetings
    .filter((m) => m.status === "logged")
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Build factual "What Changed Since Last Meeting?" items.
 * Uses interaction history + commitment tracker + recalled memory sections.
 */
export function buildWhatChanged(
  meetings: Meeting[],
  commitments: Commitment[],
  memories: RecalledMemory[]
): WhatChangedItem[] {
  const logged = loggedMeetings(meetings);
  const items: WhatChangedItem[] = [];
  const seen = new Set<string>();

  const push = (item: WhatChangedItem) => {
    const key = `${item.kind}:${item.text.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push(item);
  };

  if (logged.length >= 2) {
    const prev = logged[logged.length - 2];
    const last = logged[logged.length - 1];
    push({
      kind: "new_interaction",
      text: `Latest logged interaction: ${last.title} (${last.date}), after ${prev.title} (${prev.date}).`,
      source: "meetings",
    });
  } else if (logged.length === 1) {
    push({
      kind: "new_interaction",
      text: `First logged interaction on record: ${logged[0].title} (${logged[0].date}).`,
      source: "meetings",
    });
  }

  const lastDate = logged[logged.length - 1]?.date;
  for (const c of commitments) {
    if (c.status === "completed") {
      push({
        kind: "resolved_commitment",
        text: `Resolved commitment: ${clip(c.description)}${
          c.completedAt ? ` (completed ${c.completedAt.slice(0, 10)})` : ""
        }`,
        source: "commitments",
      });
    } else if (
      (c.status === "pending" || c.status === "overdue") &&
      (!lastDate || c.createdAt.slice(0, 10) >= lastDate)
    ) {
      push({
        kind: "new_commitment",
        text: `${c.status === "overdue" ? "Overdue" : "Open"} commitment: ${clip(c.description)}`,
        source: "commitments",
      });
    } else if (c.status === "overdue") {
      push({
        kind: "new_commitment",
        text: `Overdue follow-up: ${clip(c.description)}${
          c.dueDate ? ` (due ${c.dueDate})` : ""
        }`,
        source: "commitments",
      });
    }
  }

  for (const m of memories) {
    if (m.section === "recurringConcerns") {
      push({
        kind: "recurring_concern",
        text: clip(m.text),
        source: "hindsight",
      });
    } else if (m.section === "decisions") {
      push({
        kind: "new_decision",
        text: clip(m.text),
        source: "hindsight",
      });
    } else if (m.section === "preferences") {
      push({
        kind: "changed_preference",
        text: clip(m.text),
        source: "hindsight",
      });
    } else if (
      m.section === "missedFollowUps" ||
      (m.section === "commitments" &&
        /missed|pending|unresolved|still open|overdue/i.test(m.text))
    ) {
      push({
        kind: "new_commitment",
        text: clip(m.text),
        source: "hindsight",
      });
    }
  }

  return items.slice(0, 8);
}

export function buildMeetingInsights(
  contact: Contact,
  meetings: Meeting[],
  commitments: Commitment[],
  memories: RecalledMemory[]
): MeetingInsights {
  const logged = loggedMeetings(meetings);
  const upcoming = meetings.filter((m) => m.status === "upcoming");
  const last = logged[logged.length - 1] ?? null;
  const open = commitments.filter(
    (c) => c.status === "pending" || c.status === "overdue"
  );
  const overdue = commitments.filter((c) => c.status === "overdue");
  const concerns = memories
    .filter((m) => m.section === "recurringConcerns")
    .map((m) => m.text);
  const decisions = memories
    .filter((m) => m.section === "decisions")
    .map((m) => m.text);
  const topics = [
    ...memories
      .filter((m) => m.section === "discussions" || m.section === "outcomes")
      .map((m) => m.text),
    ...logged.map((m) => m.title),
  ];

  const topicSeen = new Set<string>();
  const topicsDiscussed: string[] = [];
  for (const t of topics) {
    const key = t.trim().toLowerCase();
    if (!key || topicSeen.has(key)) continue;
    topicSeen.add(key);
    topicsDiscussed.push(clip(t, 100));
    if (topicsDiscussed.length >= 6) break;
  }

  return {
    interactionCount: logged.length,
    upcomingCount: upcoming.length,
    lastInteraction: last
      ? { date: last.date, title: last.title, retained: Boolean(last.hindsightDocumentId) }
      : null,
    openCommitmentCount: open.length,
    overdueCommitmentCount: overdue.length,
    recurringConcerns: concerns.slice(0, 5).map((t) => clip(t)),
    recentDecisions: decisions.slice(0, 5).map((t) => clip(t)),
    topicsDiscussed,
    recalledMemoryCount: memories.length,
    contactName: contact.name,
  };
}

/**
 * Chronological “How the Relationship Evolved” from logged meetings +
 * recalled memories. No invented narrative.
 */
export function buildRelationshipEvolution(
  meetings: Meeting[],
  commitments: Commitment[],
  memories: RecalledMemory[]
): RelationshipEvolution {
  const logged = loggedMeetings(meetings);
  const stages: EvolutionStage[] = logged.map((m, index) => {
    const d = m.debrief;
    return {
      meetingId: m.id,
      meetingNumber: index + 1,
      date: m.date,
      title: m.title,
      majorTopic: clip(d?.discussed || m.title, 140),
      concern: d?.concernsAndPrefs ? clip(d.concernsAndPrefs, 120) : null,
      decision: d?.decisions ? clip(d.decisions, 120) : null,
      commitment: d?.commitments ? clip(d.commitments, 120) : null,
      change: d?.changesNoted
        ? clip(d.changesNoted, 120)
        : d?.outcome
          ? clip(d.outcome, 120)
          : null,
      retained: Boolean(m.hindsightDocumentId),
    };
  });

  const recurringFromMemory = memories
    .filter((m) => m.section === "recurringConcerns")
    .map((m) => clip(m.text, 100));
  const prefs = memories
    .filter((m) => m.section === "preferences")
    .map((m) => clip(m.text, 100));

  const openThreads = [
    ...commitments
      .filter((c) => c.status === "pending" || c.status === "overdue")
      .map((c) => clip(c.description, 100)),
    ...memories
      .filter(
        (m) =>
          m.section === "missedFollowUps" ||
          (m.section === "commitments" &&
            /pending|missed|still|open|unresolved/i.test(m.text))
      )
      .map((m) => clip(m.text, 100)),
  ];

  const threadSeen = new Set<string>();
  const uniqueThreads: string[] = [];
  for (const t of openThreads) {
    const k = t.toLowerCase();
    if (threadSeen.has(k)) continue;
    threadSeen.add(k);
    uniqueThreads.push(t);
    if (uniqueThreads.length >= 6) break;
  }

  const concernSeen = new Set<string>();
  const recurringConcerns: string[] = [];
  for (const t of recurringFromMemory) {
    const k = t.toLowerCase();
    if (concernSeen.has(k)) continue;
    concernSeen.add(k);
    recurringConcerns.push(t);
    if (recurringConcerns.length >= 5) break;
  }

  const prefSeen = new Set<string>();
  const preferences: string[] = [];
  for (const t of prefs) {
    const k = t.toLowerCase();
    if (prefSeen.has(k)) continue;
    prefSeen.add(k);
    preferences.push(t);
    if (preferences.length >= 5) break;
  }

  return {
    stages,
    recurringConcerns,
    openThreads: uniqueThreads,
    preferences,
  };
}
