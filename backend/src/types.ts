// AI-Generated Code - 2026-09-28 - Composer

export interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  contactId: string;
  title: string;
  date: string;
  status: "upcoming" | "logged";
  debrief?: DebriefPayload;
  hindsightDocumentId?: string;
  createdAt: string;
}

export interface DebriefPayload {
  discussed: string;
  decisions: string;
  commitments: string;
  /** Concerns raised (legacy field name kept for seed/SQLite compatibility) */
  concernsAndPrefs: string;
  /** Follow-ups / next-meeting actions */
  followUps?: string;
  /** Commitments I (Maya) made — optional; falls back to commitments */
  myCommitments?: string;
  /** Commitments the contact made — optional */
  theirCommitments?: string;
  /** Important new information learned */
  newInformation?: string;
  /** Overall meeting outcome */
  outcome?: string;
  /** What changed vs prior meeting (user-noted) */
  changesNoted?: string;
}

export interface MeetingBrief {
  overview: string;
  discussions: string[];
  decisions: string[];
  commitments: string[];
  missedFollowUps: string[];
  recurringConcerns: string[];
  preferences: string[];
  agenda: string[];
  questions: string[];
  /** Relevant previous outcomes */
  outcomes: string[];
  timeline: { date: string; summary: string }[];
}

/** Structured app-DB commitment (status lives here; Hindsight holds narrative memory) */
export type CommitmentStatus = "pending" | "completed" | "overdue";
export type PromisedBy = "me" | "contact";

export interface Commitment {
  id: string;
  contactId: string;
  meetingId: string | null;
  description: string;
  promisedBy: PromisedBy;
  status: CommitmentStatus;
  dueDate: string | null;
  createdAt: string;
  completedAt: string | null;
  contactName?: string;
  meetingTitle?: string;
  meetingDate?: string;
}

export type BriefSection =
  | "overview"
  | "discussions"
  | "decisions"
  | "commitments"
  | "missedFollowUps"
  | "recurringConcerns"
  | "preferences"
  | "agenda"
  | "questions"
  | "outcomes"
  | "timeline";

export interface RecalledMemory {
  id: string;
  text: string;
  whyRelevant: string;
  section: BriefSection;
  /** When the fact was learned / occurred, if Hindsight provided it */
  whenLearned?: string | null;
  documentId?: string | null;
}

export interface MemoryDebugInfo {
  bankId: string;
  contactId: string;
  contactName: string;
  retain?: {
    status: "ok" | "error" | "skipped";
    documentIds?: string[];
    error?: string;
    at?: string;
  };
  recall?: {
    status: "ok" | "error" | "skipped";
    queryCount: number;
    memoryCount: number;
    error?: string;
    at?: string;
  };
  llm?: {
    status: "groq" | "heuristic" | "error" | "skipped";
    error?: string;
  };
}

/** Factual delta since last meeting — never invented */
export type WhatChangedKind =
  | "recurring_concern"
  | "new_decision"
  | "new_commitment"
  | "resolved_commitment"
  | "changed_preference"
  | "new_interaction";

export interface WhatChangedItem {
  kind: WhatChangedKind;
  text: string;
  source: "meetings" | "commitments" | "hindsight";
}

/** Factual stats only — no relationship scores */
export interface MeetingInsights {
  interactionCount: number;
  upcomingCount: number;
  lastInteraction: {
    date: string;
    title: string;
    retained: boolean;
  } | null;
  openCommitmentCount: number;
  overdueCommitmentCount: number;
  recurringConcerns: string[];
  recentDecisions: string[];
  topicsDiscussed: string[];
  recalledMemoryCount: number;
  contactName: string;
}

export interface UpcomingMeetingRow {
  id: string;
  contactId: string;
  contactName: string;
  company: string;
  role: string;
  title: string;
  date: string;
  status: "upcoming";
}

export interface EvolutionStage {
  meetingId: string;
  meetingNumber: number;
  date: string;
  title: string;
  majorTopic: string;
  concern: string | null;
  decision: string | null;
  commitment: string | null;
  change: string | null;
  retained: boolean;
}

export interface RelationshipEvolution {
  stages: EvolutionStage[];
  recurringConcerns: string[];
  openThreads: string[];
  preferences: string[];
}

export interface FollowUpDraft {
  subject: string;
  body: string;
  contactName: string;
  meetingTitle: string | null;
  meetingDate: string | null;
  basedOn: {
    debriefUsed: boolean;
    openCommitmentCount: number;
    memoryCount: number;
    preferenceHints: string[];
  };
}

export interface PrepareResponse {
  mode: "memory" | "generic";
  brief: MeetingBrief;
  memories: RecalledMemory[];
  /** Structured open commitments from app DB (not invented from Hindsight) */
  openCommitments: Commitment[];
  whatChanged: WhatChangedItem[];
  insights: MeetingInsights;
  evolution: RelationshipEvolution;
  meta: {
    memoryProvider: "hindsight";
    memoryCount: number;
    meetingCount: number;
    contactName: string;
  };
  debug: MemoryDebugInfo;
}
