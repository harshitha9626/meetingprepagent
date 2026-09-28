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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  health: () =>
    request<{ ok: boolean; memoryProvider: string }>("/api/health"),
  listContacts: () => request<{ contacts: Contact[] }>("/api/contacts"),
  getContact: (id: string) =>
    request<{ contact: Contact; meetings: Meeting[] }>(`/api/contacts/${id}`),
  createContact: (body: {
    name: string;
    company: string;
    role: string;
    email?: string;
  }) =>
    request<{ contact: Contact }>("/api/contacts", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  createMeeting: (
    contactId: string,
    body: { title: string; date: string; status?: "upcoming" | "logged" }
  ) =>
    request<{ meeting: Meeting }>(`/api/contacts/${contactId}/meetings`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  prepare: (contactId: string, mode: "memory" | "generic") =>
    request<PrepareResponse>(`/api/contacts/${contactId}/prepare`, {
      method: "POST",
      body: JSON.stringify({ mode }),
    }),
  debrief: (meetingId: string, body: DebriefPayload) =>
    request<{
      meeting: Meeting;
      retained: boolean;
      provider: string;
      documentId: string;
    }>(`/api/meetings/${meetingId}/debrief`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  seedDemo: () =>
    request<{ message: string; contact: Contact }>("/api/demo/seed", {
      method: "POST",
    }),
  resetDemo: () =>
    request<{ message: string }>("/api/demo/reset", { method: "POST" }),
};
