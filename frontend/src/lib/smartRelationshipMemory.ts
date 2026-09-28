// AI-Generated Code - 2026-09-28 - Composer
/**
 * Groups Hindsight-recalled memories into Smart Relationship Memory categories.
 * Pure derivation from prepare() memories — no extra Hindsight calls, no hardcoded contact data.
 */

import type { RecalledMemory } from "./api";

export type SmartMemoryCategoryId =
  | "keyConcerns"
  | "preferences"
  | "openCommitments"
  | "pastDecisions"
  | "recentChanges";

export interface SmartMemoryItem {
  id: string;
  text: string;
  whenLearned?: string | null;
  documentId?: string | null;
  /** Highlight unresolved / missed commitments */
  urgent?: boolean;
  sourceMemoryId: string;
}

export interface SmartMemoryCategory {
  id: SmartMemoryCategoryId;
  title: string;
  items: SmartMemoryItem[];
}

export interface SmartRelationshipMemorySummary {
  totalSourceMemories: number;
  categorizedCount: number;
  categories: SmartMemoryCategory[];
}

const CATEGORY_META: {
  id: SmartMemoryCategoryId;
  title: string;
}[] = [
  { id: "keyConcerns", title: "KEY CONCERNS" },
  { id: "preferences", title: "PREFERENCES" },
  { id: "openCommitments", title: "OPEN COMMITMENTS" },
  { id: "pastDecisions", title: "PAST DECISIONS" },
  { id: "recentChanges", title: "RECENT CHANGES" },
];

const MAX_PER_CATEGORY = 6;

function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function isUrgentCommitment(text: string): boolean {
  return /missed|pending|unresolved|still (open|relevant|not)|not (yet )?delivered|overdue|open follow/i.test(
    text
  );
}

function parseWhen(when?: string | null): number | null {
  if (!when) return null;
  const t = Date.parse(when);
  return Number.isNaN(t) ? null : t;
}

/**
 * Pick a single primary category for a memory using section tags from prepare,
 * then keyword fallbacks on the recalled text. Returns null if it should stay
 * only in the raw Memory Used list.
 */
function classifyMemory(
  memory: RecalledMemory,
  recentCutoffMs: number | null
): SmartMemoryCategoryId | null {
  const text = memory.text.toLowerCase();
  const section = memory.section;

  // Section-first mapping from existing RecalledMemory.section
  if (section === "recurringConcerns") return "keyConcerns";
  if (section === "preferences") return "preferences";
  if (section === "commitments" || section === "missedFollowUps") {
    return "openCommitments";
  }
  if (section === "decisions") return "pastDecisions";
  if (section === "outcomes" || section === "timeline") return "recentChanges";

  // Keyword fallbacks for sections like discussions / overview / agenda
  if (
    /concern|worried|worry|cost|risk|blocker|hesitat|afraid|sensitive/.test(text)
  ) {
    return "keyConcerns";
  }
  if (
    /prefer|concise|style|format|agenda short|communication|two-week|timeline|likes? to/.test(
      text
    )
  ) {
    return "preferences";
  }
  if (
    /commit|promis|follow-?up|pending|missed|owed|deliver|action item|still open|unresolved/.test(
      text
    )
  ) {
    return "openCommitments";
  }
  if (
    /decid|agreed|agreement|chose|chosen|will not|tentative interest|direction/.test(
      text
    )
  ) {
    return "pastDecisions";
  }

  const whenMs = parseWhen(memory.whenLearned);
  if (
    recentCutoffMs != null &&
    whenMs != null &&
    whenMs >= recentCutoffMs
  ) {
    return "recentChanges";
  }
  if (
    /recent|since (the )?last|updated|changed|new (priority|info|develop)|shift|now approaching|this week|latest/.test(
      text
    )
  ) {
    return "recentChanges";
  }

  // Soft: outcomes-like overview bullets that are clearly new developments
  if (section === "overview" && /pilot|finance|kickoff|go\/no-go|conditional/.test(text)) {
    return "recentChanges";
  }

  return null;
}

function dedupeMemories(memories: RecalledMemory[]): RecalledMemory[] {
  const seen = new Set<string>();
  const out: RecalledMemory[] = [];
  for (const m of memories) {
    const key = normalizeText(m.text);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }
  return out;
}

function computeRecentCutoff(memories: RecalledMemory[]): number | null {
  const times = memories
    .map((m) => parseWhen(m.whenLearned))
    .filter((t): t is number => t != null)
    .sort((a, b) => b - a);
  if (times.length === 0) return null;
  // Treat the newest ~40% of dated memories (min 1) as “recent”
  const newest = times[0];
  const oldest = times[times.length - 1];
  if (newest === oldest) return newest;
  const span = newest - oldest;
  return newest - span * 0.4;
}

/**
 * Build Smart Relationship Memory categories from prepare() recalled memories.
 */
export function buildSmartRelationshipMemory(
  memories: RecalledMemory[]
): SmartRelationshipMemorySummary {
  const unique = dedupeMemories(memories);
  const recentCutoff = computeRecentCutoff(unique);

  const buckets: Record<SmartMemoryCategoryId, SmartMemoryItem[]> = {
    keyConcerns: [],
    preferences: [],
    openCommitments: [],
    pastDecisions: [],
    recentChanges: [],
  };

  const usedTexts = new Set<string>();

  for (const memory of unique) {
    const category = classifyMemory(memory, recentCutoff);
    if (!category) continue;
    const key = normalizeText(memory.text);
    if (usedTexts.has(key)) continue;
    if (buckets[category].length >= MAX_PER_CATEGORY) continue;

    usedTexts.add(key);
    buckets[category].push({
      id: `${category}-${memory.id}`,
      text: memory.text.trim(),
      whenLearned: memory.whenLearned ?? null,
      documentId: memory.documentId ?? null,
      urgent:
        category === "openCommitments"
          ? isUrgentCommitment(memory.text) ||
            memory.section === "missedFollowUps"
          : false,
      sourceMemoryId: memory.id,
    });
  }

  // Prefer more recent items first within each bucket when dates exist
  for (const id of Object.keys(buckets) as SmartMemoryCategoryId[]) {
    buckets[id].sort((a, b) => {
      const ta = parseWhen(a.whenLearned) ?? 0;
      const tb = parseWhen(b.whenLearned) ?? 0;
      return tb - ta;
    });
  }

  const categories = CATEGORY_META.map((meta) => ({
    id: meta.id,
    title: meta.title,
    items: buckets[meta.id],
  }));

  return {
    totalSourceMemories: memories.length,
    categorizedCount: usedTexts.size,
    categories,
  };
}
