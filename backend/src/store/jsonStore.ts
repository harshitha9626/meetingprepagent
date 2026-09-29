// AI-Generated Code - 2026-09-29 - Composer
/**
 * Ephemeral JSON file store for Vercel serverless.
 * Persists under /tmp for the life of the instance (hackathon limitation).
 * Avoids node:sqlite, which crashes FUNCTION_INVOCATION on Vercel.
 */

import fs from "node:fs";
import path from "node:path";
import type {
  Commitment,
  CommitmentStatus,
  Contact,
  DebriefPayload,
  Meeting,
  PromisedBy,
  UpcomingMeetingRow,
} from "../types.js";
import { isServerlessRuntime } from "./runtimeFlags.js";

export const ORPHAN_USER_ID = "orphan-pre-auth";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

type ContactRow = Contact & { userId: string };
type CommitmentRow = Commitment;

type FileStore = {
  users: UserRecord[];
  contacts: ContactRow[];
  meetings: Meeting[];
  commitments: CommitmentRow[];
};

let cache: FileStore | null = null;

function dataDir(): string {
  const override = process.env.BRIEFED_DB_DIR?.trim();
  if (override) return override;
  return "/tmp/briefed-data";
}

function storePath(): string {
  return path.join(dataDir(), "briefed-store.json");
}

function emptyStore(): FileStore {
  return { users: [], contacts: [], meetings: [], commitments: [] };
}

function load(): FileStore {
  if (cache) return cache;
  const dir = dataDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = storePath();
  if (!fs.existsSync(file)) {
    cache = emptyStore();
    persist();
    return cache;
  }
  try {
    cache = JSON.parse(fs.readFileSync(file, "utf8")) as FileStore;
    cache.users ??= [];
    cache.contacts ??= [];
    cache.meetings ??= [];
    cache.commitments ??= [];
  } catch {
    cache = emptyStore();
  }
  return cache;
}

function persist(): void {
  if (!cache) return;
  const dir = dataDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(storePath(), JSON.stringify(cache), "utf8");
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDbPath(): string {
  return storePath();
}

export function initDatabase(): void {
  load();
}

export function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  id?: string;
}): UserRecord {
  const store = load();
  const user: UserRecord = {
    id: input.id ?? crypto.randomUUID(),
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  persist();
  return user;
}

export function findUserByEmail(email: string): UserRecord | undefined {
  const normalized = email.trim().toLowerCase();
  return load().users.find((u) => u.email === normalized);
}

export function findUserById(id: string): UserRecord | undefined {
  return load().users.find((u) => u.id === id);
}

export function listContacts(userId: string): Contact[] {
  return load()
    .contacts.filter((c) => c.userId === userId)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ userId: _u, ...c }) => c);
}

export function getContact(id: string, userId?: string): Contact | undefined {
  const row = load().contacts.find((c) => c.id === id);
  if (!row) return undefined;
  if (userId && row.userId !== userId) return undefined;
  const { userId: _u, ...contact } = row;
  return contact;
}

export function createContact(
  input: Omit<Contact, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
    userId: string;
  }
): Contact {
  const store = load();
  const contact: ContactRow = {
    id: input.id ?? crypto.randomUUID(),
    userId: input.userId,
    name: input.name,
    company: input.company,
    role: input.role,
    email: input.email,
    notes: input.notes,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  store.contacts.push(contact);
  persist();
  const { userId: _u, ...out } = contact;
  return out;
}

export function listMeetings(contactId?: string): Meeting[] {
  const rows = load().meetings;
  const filtered = contactId
    ? rows.filter((m) => m.contactId === contactId)
    : rows;
  return filtered.sort((a, b) => a.date.localeCompare(b.date));
}

export function listUpcomingMeetings(userId: string): UpcomingMeetingRow[] {
  const store = load();
  const contactIds = new Set(
    store.contacts.filter((c) => c.userId === userId).map((c) => c.id)
  );
  return store.meetings
    .filter((m) => m.status === "upcoming" && contactIds.has(m.contactId))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => {
      const c = store.contacts.find((x) => x.id === m.contactId)!;
      return {
        id: m.id,
        contactId: m.contactId,
        contactName: c.name,
        company: c.company,
        role: c.role,
        title: m.title,
        date: m.date,
        status: "upcoming" as const,
      };
    });
}

export function getMeeting(id: string): Meeting | undefined {
  return load().meetings.find((m) => m.id === id);
}

export function getMeetingForUser(
  meetingId: string,
  userId: string
): Meeting | undefined {
  const meeting = getMeeting(meetingId);
  if (!meeting) return undefined;
  const contact = getContact(meeting.contactId, userId);
  return contact ? meeting : undefined;
}

export function createMeeting(
  input: Omit<Meeting, "id" | "createdAt" | "status"> & {
    id?: string;
    status?: Meeting["status"];
    createdAt?: string;
    hindsightDocumentId?: string;
  }
): Meeting {
  const store = load();
  const meeting: Meeting = {
    id: input.id ?? crypto.randomUUID(),
    contactId: input.contactId,
    title: input.title,
    date: input.date,
    status: input.status ?? "upcoming",
    debrief: input.debrief,
    hindsightDocumentId: input.hindsightDocumentId,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  store.meetings.push(meeting);
  persist();
  return meeting;
}

export function updateMeeting(
  id: string,
  patch: Partial<Meeting>
): Meeting | undefined {
  const store = load();
  const idx = store.meetings.findIndex((m) => m.id === id);
  if (idx < 0) return undefined;
  const existing = store.meetings[idx]!;
  const next: Meeting = {
    ...existing,
    ...patch,
    id: existing.id,
    contactId: existing.contactId,
  };
  store.meetings[idx] = next;
  persist();
  return next;
}

export function resetAppData(userId: string): void {
  const store = load();
  const keepContacts = store.contacts.filter((c) => c.userId !== userId);
  const removedIds = new Set(
    store.contacts.filter((c) => c.userId === userId).map((c) => c.id)
  );
  store.contacts = keepContacts;
  store.meetings = store.meetings.filter((m) => !removedIds.has(m.contactId));
  store.commitments = store.commitments.filter(
    (c) => !removedIds.has(c.contactId)
  );
  persist();
}

export function refreshOverdueCommitments(contactId?: string): void {
  const store = load();
  const today = todayIsoDate();
  let changed = false;
  for (const c of store.commitments) {
    if (contactId && c.contactId !== contactId) continue;
    if (
      c.status === "pending" &&
      c.dueDate &&
      c.dueDate < today
    ) {
      c.status = "overdue";
      changed = true;
    }
  }
  if (changed) persist();
}

function enrichCommitment(c: CommitmentRow): Commitment {
  const store = load();
  const contact = store.contacts.find((x) => x.id === c.contactId);
  const meeting = c.meetingId
    ? store.meetings.find((m) => m.id === c.meetingId)
    : undefined;
  return {
    ...c,
    contactName: contact?.name,
    meetingTitle: meeting?.title,
    meetingDate: meeting?.date,
  };
}

export function listCommitments(contactId: string): Commitment[] {
  refreshOverdueCommitments(contactId);
  return load()
    .commitments.filter((c) => c.contactId === contactId)
    .map(enrichCommitment)
    .sort((a, b) => {
      const rank = (s: CommitmentStatus) =>
        s === "overdue" ? 0 : s === "pending" ? 1 : 2;
      const d = rank(a.status) - rank(b.status);
      return d !== 0 ? d : b.createdAt.localeCompare(a.createdAt);
    });
}

export function listOpenCommitments(contactId: string): Commitment[] {
  return listCommitments(contactId).filter(
    (c) => c.status === "pending" || c.status === "overdue"
  );
}

export function getCommitment(id: string): Commitment | undefined {
  const row = load().commitments.find((c) => c.id === id);
  return row ? enrichCommitment(row) : undefined;
}

export function getCommitmentForUser(
  id: string,
  userId: string
): Commitment | undefined {
  const c = getCommitment(id);
  if (!c) return undefined;
  return getContact(c.contactId, userId) ? c : undefined;
}

export function findDuplicateCommitment(
  contactId: string,
  description: string,
  meetingId?: string | null
): Commitment | undefined {
  const normalized = description.trim().toLowerCase();
  return listCommitments(contactId).find(
    (c) =>
      c.description.trim().toLowerCase() === normalized &&
      (meetingId ? c.meetingId === meetingId : true) &&
      c.status !== "completed"
  );
}

export function createCommitment(input: {
  contactId: string;
  meetingId?: string | null;
  description: string;
  promisedBy: PromisedBy;
  dueDate?: string | null;
  status?: CommitmentStatus;
  userId?: string;
}): Commitment {
  const contact = getContact(input.contactId, input.userId);
  if (!contact) {
    throw Object.assign(new Error("Contact not found"), { status: 404 });
  }
  if (input.meetingId) {
    const meeting = getMeeting(input.meetingId);
    if (!meeting || meeting.contactId !== input.contactId) {
      throw Object.assign(new Error("Meeting not found for this contact"), {
        status: 400,
      });
    }
  }
  const description = input.description.trim();
  if (description.length < 3) {
    throw Object.assign(new Error("Commitment description is too short"), {
      status: 400,
      code: "VALIDATION",
    });
  }
  const dup = findDuplicateCommitment(
    input.contactId,
    description,
    input.meetingId
  );
  if (dup) {
    throw Object.assign(
      new Error(
        "An open commitment with the same description already exists for this interaction."
      ),
      { status: 409, code: "DUPLICATE" }
    );
  }

  let status: CommitmentStatus = input.status ?? "pending";
  const dueDate = input.dueDate?.trim() || null;
  if (status === "pending" && dueDate && dueDate < todayIsoDate()) {
    status = "overdue";
  }

  const row: CommitmentRow = {
    id: crypto.randomUUID(),
    contactId: input.contactId,
    meetingId: input.meetingId ?? null,
    description,
    promisedBy: input.promisedBy,
    status,
    dueDate,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  load().commitments.push(row);
  persist();
  return enrichCommitment(row);
}

export function updateCommitmentStatus(
  id: string,
  status: CommitmentStatus
): Commitment | undefined {
  const store = load();
  const row = store.commitments.find((c) => c.id === id);
  if (!row) return undefined;
  row.status = status;
  row.completedAt = status === "completed" ? new Date().toISOString() : null;
  persist();
  return enrichCommitment(row);
}

/** Ensure this module is only used on serverless (or tests). */
export function assertServerlessStore(): void {
  if (!isServerlessRuntime()) {
    throw new Error("jsonStore should only be used on serverless runtimes");
  }
}
