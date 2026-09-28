// AI-Generated Code - 2026-09-28 - Composer

export interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  email?: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  contactId: string;
  title: string;
  date: string;
  status: "upcoming" | "logged";
  debrief?: DebriefPayload;
  createdAt: string;
}

export interface DebriefPayload {
  discussed: string;
  decisions: string;
  commitments: string;
  concernsAndPrefs: string;
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
  timeline: { date: string; summary: string }[];
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
  | "timeline";

export interface RecalledMemory {
  id: string;
  text: string;
  whyRelevant: string;
  section: BriefSection;
}

export interface PrepareResponse {
  mode: "memory" | "generic";
  brief: MeetingBrief;
  memories: RecalledMemory[];
  meta: {
    memoryProvider: "hindsight" | "local";
    memoryCount: number;
    meetingCount: number;
    contactName: string;
  };
}

export interface AppData {
  contacts: Contact[];
  meetings: Meeting[];
  localMemories: LocalMemoryRecord[];
}

export interface LocalMemoryRecord {
  id: string;
  contactId: string;
  meetingId: string;
  documentId: string;
  content: string;
  createdAt: string;
}
