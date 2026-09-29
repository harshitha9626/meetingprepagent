// AI-Generated Code - 2026-09-29 - Composer

import { clearSession, getToken, type AuthUser } from "./auth";

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
  concernsAndPrefs: string;
  followUps: string;
  myCommitments?: string;
  theirCommitments?: string;
  newInformation?: string;
  outcome?: string;
  changesNoted?: string;
  trackCommitment?: boolean;
  promisedBy?: PromisedBy;
  dueDate?: string | null;
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
  outcomes: string[];
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
  | "outcomes"
  | "timeline";

export interface RecalledMemory {
  id: string;
  text: string;
  whyRelevant: string;
  section: BriefSection;
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
  openCommitments: Commitment[];
  whatChanged?: WhatChangedItem[];
  insights?: MeetingInsights;
  evolution?: RelationshipEvolution;
  meta: {
    memoryProvider: "hindsight";
    memoryCount: number;
    meetingCount: number;
    contactName: string;
  };
  debug: MemoryDebugInfo;
}

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

export interface RelationshipMemory {
  contact: { id: string; name: string; company: string; role: string };
  bankId: string;
  memoryCount: number;
  facts: RecalledMemory[];
  preferences: string[];
  concerns: string[];
  commitments: string[];
  timeline: {
    date: string;
    title: string;
    status: string;
    retained: boolean;
  }[];
  lastInteraction: {
    date: string;
    title: string;
    retained: boolean;
  } | null;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  opts?: { auth?: boolean }
): Promise<T> {
  const needsAuth = opts?.auth !== false;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (needsAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers,
    });
  } catch {
    throw new Error(
      "Cannot reach the API. Start the backend on port 8787 and check your network."
    );
  }
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
  };
      if (!res.ok) {
    if (res.status === 401 && needsAuth) {
      clearSession();
      window.dispatchEvent(new CustomEvent("briefed:auth-expired"));
    }
    const message =
      data.error ||
      (data.code === "HINDSIGHT_NOT_CONFIGURED"
        ? "Hindsight is not configured. Add HINDSIGHT_API_KEY to backend/.env and restart the API."
        : data.code === "AUTH_MISCONFIGURED"
          ? "Server auth is misconfigured. Set JWT_SECRET in Vercel environment variables."
          : res.status === 500
            ? "Server error (500). If this is Vercel, check /api/health and that JWT_SECRET is set, then redeploy."
            : `Request failed (${res.status})`);
    const err = new Error(message);
    (err as Error & { code?: string; status?: number }).code = data.code;
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return data as T;
}

export type RegisterStartResponse = {
  pendingId: string;
  email: string;
  expiresInSeconds: number;
  resendAvailableInSeconds: number;
  demoOtp?: string;
  message: string;
};

export const api = {
  registerStart: (body: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) =>
    request<RegisterStartResponse>(
      "/api/auth/register/start",
      { method: "POST", body: JSON.stringify(body) },
      { auth: false }
    ),
  registerVerify: (body: { pendingId: string; otp: string }) =>
    request<{ user: AuthUser; token: string }>(
      "/api/auth/register/verify",
      { method: "POST", body: JSON.stringify(body) },
      { auth: false }
    ),
  registerResend: (body: { pendingId: string }) =>
    request<RegisterStartResponse>(
      "/api/auth/register/resend",
      { method: "POST", body: JSON.stringify(body) },
      { auth: false }
    ),
  login: (body: { email: string; password: string }) =>
    request<{ user: AuthUser; token: string }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify(body) },
      { auth: false }
    ),
  logout: () =>
    request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
  me: () => request<{ user: AuthUser }>("/api/auth/me"),
  health: () =>
    request<{
      ok: boolean;
      memoryProvider: string;
      hindsightConfigured: boolean;
      bankId: string;
    }>("/api/health", undefined, { auth: false }),
  debugMemory: () =>
    request<{ debug: MemoryDebugInfo; hindsight: { configured: boolean; bankId: string } }>(
      "/api/debug/memory"
    ),
  listContacts: () => request<{ contacts: Contact[] }>("/api/contacts"),
  listUpcomingMeetings: () =>
    request<{ meetings: UpcomingMeetingRow[] }>("/api/meetings/upcoming"),
  getContact: (id: string) =>
    request<{ contact: Contact; meetings: Meeting[] }>(`/api/contacts/${id}`),
  relationshipMemory: (id: string) =>
    request<RelationshipMemory>(`/api/contacts/${id}/relationship-memory`),
  createContact: (body: {
    name: string;
    company: string;
    role: string;
    email?: string;
    notes?: string;
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
  generateFollowUp: (contactId: string, meetingId?: string | null) =>
    request<{ draft: FollowUpDraft }>(`/api/contacts/${contactId}/follow-up`, {
      method: "POST",
      body: JSON.stringify({ meetingId: meetingId ?? null }),
    }),
  debrief: (meetingId: string, body: DebriefPayload) =>
    request<{
      meeting: Meeting;
      saved: boolean;
      retained: boolean;
      provider: string | null;
      documentId: string | null;
      message?: string;
      hindsightError?: string;
      commitment?: Commitment | null;
    }>(`/api/meetings/${meetingId}/debrief`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listCommitments: (contactId: string, status?: string) =>
    request<{ commitments: Commitment[] }>(
      `/api/contacts/${contactId}/commitments${
        status && status !== "all" ? `?status=${encodeURIComponent(status)}` : ""
      }`
    ),
  createCommitment: (
    contactId: string,
    body: {
      description: string;
      promisedBy: PromisedBy;
      meetingId?: string | null;
      dueDate?: string | null;
    }
  ) =>
    request<{ commitment: Commitment }>(
      `/api/contacts/${contactId}/commitments`,
      { method: "POST", body: JSON.stringify(body) }
    ),
  updateCommitmentStatus: (id: string, status: CommitmentStatus) =>
    request<{ commitment: Commitment }>(`/api/commitments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  seedDemo: () =>
    request<{
      message: string;
      contact: Contact;
      meetings?: Meeting[];
      retained?: { meetingId: string; documentId: string; provider: string }[];
      hindsightConfigured?: boolean;
      hindsightError?: string;
      debug?: {
        bankId: string;
        contactId: string;
        retainCount: number;
        documentIds: string[];
      };
    }>("/api/demo/seed", {
      method: "POST",
    }),
  resetDemo: () =>
    request<{ message: string }>("/api/demo/reset", { method: "POST" }),
};
