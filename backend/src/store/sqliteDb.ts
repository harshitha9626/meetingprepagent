// AI-Generated Code - 2026-09-29 - Composer
/**
 * Local SQLite store (Node node:sqlite).
 * Loaded only on non-Vercel runtimes via createRequire — never imported on Vercel.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import type {
  Commitment,
  CommitmentStatus,
  Contact,
  DebriefPayload,
  Meeting,
  PromisedBy,
  UpcomingMeetingRow,
} from "../types.js";

const require = createRequire(import.meta.url);
// Lazy-ish: only evaluated when this module is required (local runtime).
const { DatabaseSync } = require("node:sqlite") as {
  DatabaseSync: new (path: string) => {
    exec: (sql: string) => void;
    prepare: (sql: string) => {
      all: (...params: unknown[]) => unknown[];
      get: (...params: unknown[]) => unknown;
      run: (...params: unknown[]) => unknown;
    };
  };
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DB_PATH = path.join(DATA_DIR, "briefed.sqlite");

export const ORPHAN_USER_ID = "orphan-pre-auth";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

type DatabaseSyncInstance = InstanceType<typeof DatabaseSync>;
let db: DatabaseSyncInstance | null = null;

function tableColumns(database: DatabaseSyncInstance, table: string): Set<string> {
  const rows = database
    .prepare(`PRAGMA table_info(${table})`)
    .all() as Array<{ name: string }>;
  return new Set(rows.map((r) => r.name));
}

function migrateSchema(database: DatabaseSyncInstance): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  const contactCols = tableColumns(database, "contacts");
  if (!contactCols.has("user_id")) {
    database.exec(
      `ALTER TABLE contacts ADD COLUMN user_id TEXT NOT NULL DEFAULT '${ORPHAN_USER_ID}'`
    );
  }

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
  `);
}

function getDb(): DatabaseSyncInstance {
  if (db) return db;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('upcoming', 'logged')),
      debrief_json TEXT,
      hindsight_document_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_meetings_contact ON meetings(contact_id);
    CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);

    CREATE TABLE IF NOT EXISTS commitments (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      meeting_id TEXT,
      description TEXT NOT NULL,
      promised_by TEXT NOT NULL CHECK (promised_by IN ('me', 'contact')),
      status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'overdue')),
      due_date TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_commitments_contact ON commitments(contact_id);
    CREATE INDEX IF NOT EXISTS idx_commitments_status ON commitments(status);
  `);
  migrateSchema(db);
  return db;
}

function mapUser(row: Record<string, unknown>): UserRecord {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    createdAt: String(row.created_at),
  };
}

function mapContact(row: Record<string, unknown>): Contact {
  return {
    id: String(row.id),
    name: String(row.name),
    company: String(row.company),
    role: String(row.role),
    email: row.email ? String(row.email) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: String(row.created_at),
  };
}

function mapMeeting(row: Record<string, unknown>): Meeting {
  let debrief: DebriefPayload | undefined;
  if (row.debrief_json) {
    debrief = JSON.parse(String(row.debrief_json)) as DebriefPayload;
  }
  return {
    id: String(row.id),
    contactId: String(row.contact_id),
    title: String(row.title),
    date: String(row.date),
    status: String(row.status) as Meeting["status"],
    debrief,
    hindsightDocumentId: row.hindsight_document_id
      ? String(row.hindsight_document_id)
      : undefined,
    createdAt: String(row.created_at),
  };
}

// —— Users ——

export function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  id?: string;
}): UserRecord {
  const user: UserRecord = {
    id: input.id ?? crypto.randomUUID(),
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString(),
  };
  getDb()
    .prepare(
      `INSERT INTO users (id, name, email, password_hash, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(user.id, user.name, user.email, user.passwordHash, user.createdAt);
  return user;
}

export function findUserByEmail(email: string): UserRecord | undefined {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.trim().toLowerCase()) as Record<string, unknown> | undefined;
  return row ? mapUser(row) : undefined;
}

export function findUserById(id: string): UserRecord | undefined {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;
  return row ? mapUser(row) : undefined;
}

// —— Contacts (user-scoped) ——

export function listContacts(userId: string): Contact[] {
  const rows = getDb()
    .prepare(
      "SELECT * FROM contacts WHERE user_id = ? ORDER BY name ASC"
    )
    .all(userId) as Record<string, unknown>[];
  return rows.map(mapContact);
}

export function getContact(
  id: string,
  userId?: string
): Contact | undefined {
  if (userId) {
    const row = getDb()
      .prepare("SELECT * FROM contacts WHERE id = ? AND user_id = ?")
      .get(id, userId) as Record<string, unknown> | undefined;
    return row ? mapContact(row) : undefined;
  }
  const row = getDb()
    .prepare("SELECT * FROM contacts WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;
  return row ? mapContact(row) : undefined;
}

export function createContact(
  input: Omit<Contact, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
    userId: string;
  }
): Contact {
  const contact: Contact = {
    id: input.id ?? crypto.randomUUID(),
    name: input.name,
    company: input.company,
    role: input.role,
    email: input.email,
    notes: input.notes,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  getDb()
    .prepare(
      `INSERT INTO contacts (id, user_id, name, company, role, email, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      contact.id,
      input.userId,
      contact.name,
      contact.company,
      contact.role,
      contact.email ?? null,
      contact.notes ?? null,
      contact.createdAt
    );
  return contact;
}

export function listMeetings(contactId?: string): Meeting[] {
  const database = getDb();
  const rows = (
    contactId
      ? database
          .prepare(
            "SELECT * FROM meetings WHERE contact_id = ? ORDER BY date ASC"
          )
          .all(contactId)
      : database.prepare("SELECT * FROM meetings ORDER BY date ASC").all()
  ) as Record<string, unknown>[];
  return rows.map(mapMeeting);
}

/** Upcoming meetings for one user only. */
export function listUpcomingMeetings(userId: string): UpcomingMeetingRow[] {
  const rows = getDb()
    .prepare(
      `SELECT m.id, m.contact_id, m.title, m.date, m.status,
              c.name AS contact_name, c.company, c.role
       FROM meetings m
       JOIN contacts c ON c.id = m.contact_id
       WHERE m.status = 'upcoming' AND c.user_id = ?
       ORDER BY m.date ASC, m.created_at ASC`
    )
    .all(userId) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: String(row.id),
    contactId: String(row.contact_id),
    contactName: String(row.contact_name),
    company: String(row.company),
    role: String(row.role),
    title: String(row.title),
    date: String(row.date),
    status: "upcoming" as const,
  }));
}

export function getMeeting(id: string): Meeting | undefined {
  const row = getDb()
    .prepare("SELECT * FROM meetings WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;
  return row ? mapMeeting(row) : undefined;
}

/** Meeting only if its contact belongs to userId. */
export function getMeetingForUser(
  meetingId: string,
  userId: string
): Meeting | undefined {
  const row = getDb()
    .prepare(
      `SELECT m.* FROM meetings m
       JOIN contacts c ON c.id = m.contact_id
       WHERE m.id = ? AND c.user_id = ?`
    )
    .get(meetingId, userId) as Record<string, unknown> | undefined;
  return row ? mapMeeting(row) : undefined;
}

export function createMeeting(
  input: Omit<Meeting, "id" | "createdAt" | "status"> & {
    id?: string;
    status?: Meeting["status"];
    createdAt?: string;
    hindsightDocumentId?: string;
  }
): Meeting {
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
  getDb()
    .prepare(
      `INSERT INTO meetings
        (id, contact_id, title, date, status, debrief_json, hindsight_document_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      meeting.id,
      meeting.contactId,
      meeting.title,
      meeting.date,
      meeting.status,
      meeting.debrief ? JSON.stringify(meeting.debrief) : null,
      meeting.hindsightDocumentId ?? null,
      meeting.createdAt
    );
  return meeting;
}

export function updateMeeting(
  id: string,
  patch: Partial<Meeting>
): Meeting | undefined {
  const existing = getMeeting(id);
  if (!existing) return undefined;
  const next: Meeting = {
    ...existing,
    ...patch,
    id: existing.id,
    contactId: existing.contactId,
  };
  getDb()
    .prepare(
      `UPDATE meetings SET
        title = ?, date = ?, status = ?, debrief_json = ?, hindsight_document_id = ?
       WHERE id = ?`
    )
    .run(
      next.title,
      next.date,
      next.status,
      next.debrief ? JSON.stringify(next.debrief) : null,
      next.hindsightDocumentId ?? null,
      id
    );
  return next;
}

/** Clear only this user's SQLite contacts (cascade meetings/commitments). */
export function resetAppData(userId: string): void {
  getDb()
    .prepare("DELETE FROM contacts WHERE user_id = ?")
    .run(userId);
}

export function getDbPath(): string {
  return DB_PATH;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function mapCommitment(row: Record<string, unknown>): Commitment {
  return {
    id: String(row.id),
    contactId: String(row.contact_id),
    meetingId: row.meeting_id ? String(row.meeting_id) : null,
    description: String(row.description),
    promisedBy: String(row.promised_by) as PromisedBy,
    status: String(row.status) as CommitmentStatus,
    dueDate: row.due_date ? String(row.due_date) : null,
    createdAt: String(row.created_at),
    completedAt: row.completed_at ? String(row.completed_at) : null,
    contactName: row.contact_name ? String(row.contact_name) : undefined,
    meetingTitle: row.meeting_title ? String(row.meeting_title) : undefined,
    meetingDate: row.meeting_date ? String(row.meeting_date) : undefined,
  };
}

export function refreshOverdueCommitments(contactId?: string): void {
  const today = todayIsoDate();
  if (contactId) {
    getDb()
      .prepare(
        `UPDATE commitments SET status = 'overdue'
         WHERE contact_id = ? AND status = 'pending'
           AND due_date IS NOT NULL AND due_date < ?`
      )
      .run(contactId, today);
  } else {
    getDb()
      .prepare(
        `UPDATE commitments SET status = 'overdue'
         WHERE status = 'pending'
           AND due_date IS NOT NULL AND due_date < ?`
      )
      .run(today);
  }
}

export function listCommitments(contactId: string): Commitment[] {
  refreshOverdueCommitments(contactId);
  const rows = getDb()
    .prepare(
      `SELECT c.*, ct.name AS contact_name, m.title AS meeting_title, m.date AS meeting_date
       FROM commitments c
       JOIN contacts ct ON ct.id = c.contact_id
       LEFT JOIN meetings m ON m.id = c.meeting_id
       WHERE c.contact_id = ?
       ORDER BY
         CASE c.status WHEN 'overdue' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END,
         c.created_at DESC`
    )
    .all(contactId) as Record<string, unknown>[];
  return rows.map(mapCommitment);
}

export function listOpenCommitments(contactId: string): Commitment[] {
  return listCommitments(contactId).filter(
    (c) => c.status === "pending" || c.status === "overdue"
  );
}

export function getCommitment(id: string): Commitment | undefined {
  const row = getDb()
    .prepare(
      `SELECT c.*, ct.name AS contact_name, m.title AS meeting_title, m.date AS meeting_date
       FROM commitments c
       JOIN contacts ct ON ct.id = c.contact_id
       LEFT JOIN meetings m ON m.id = c.meeting_id
       WHERE c.id = ?`
    )
    .get(id) as Record<string, unknown> | undefined;
  return row ? mapCommitment(row) : undefined;
}

export function getCommitmentForUser(
  id: string,
  userId: string
): Commitment | undefined {
  const row = getDb()
    .prepare(
      `SELECT c.*, ct.name AS contact_name, m.title AS meeting_title, m.date AS meeting_date
       FROM commitments c
       JOIN contacts ct ON ct.id = c.contact_id
       LEFT JOIN meetings m ON m.id = c.meeting_id
       WHERE c.id = ? AND ct.user_id = ?`
    )
    .get(id, userId) as Record<string, unknown> | undefined;
  return row ? mapCommitment(row) : undefined;
}

export function findDuplicateCommitment(
  contactId: string,
  description: string,
  meetingId?: string | null
): Commitment | undefined {
  const normalized = description.trim().toLowerCase();
  const rows = listCommitments(contactId);
  return rows.find(
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
    const err = new Error("Contact not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  if (input.meetingId) {
    const meeting = getMeeting(input.meetingId);
    if (!meeting || meeting.contactId !== input.contactId) {
      const err = new Error("Meeting not found for this contact");
      (err as Error & { status: number }).status = 400;
      throw err;
    }
  }
  const description = input.description.trim();
  if (description.length < 3) {
    const err = new Error("Commitment description is too short");
    (err as Error & { status: number; code: string }).status = 400;
    (err as Error & { code: string }).code = "VALIDATION";
    throw err;
  }

  const dup = findDuplicateCommitment(
    input.contactId,
    description,
    input.meetingId
  );
  if (dup) {
    const err = new Error(
      "An open commitment with the same description already exists for this interaction."
    );
    (err as Error & { status: number; code: string }).status = 409;
    (err as Error & { code: string }).code = "DUPLICATE";
    throw err;
  }

  let status: CommitmentStatus = input.status ?? "pending";
  const dueDate = input.dueDate?.trim() || null;
  if (status === "pending" && dueDate && dueDate < todayIsoDate()) {
    status = "overdue";
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO commitments
        (id, contact_id, meeting_id, description, promised_by, status, due_date, created_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`
    )
    .run(
      id,
      input.contactId,
      input.meetingId ?? null,
      description,
      input.promisedBy,
      status,
      dueDate,
      createdAt
    );
  return getCommitment(id)!;
}

export function updateCommitmentStatus(
  id: string,
  status: CommitmentStatus
): Commitment | undefined {
  const existing = getCommitment(id);
  if (!existing) return undefined;
  const completedAt =
    status === "completed" ? new Date().toISOString() : null;
  getDb()
    .prepare(
      `UPDATE commitments SET status = ?, completed_at = ? WHERE id = ?`
    )
    .run(status, completedAt, id);
  return getCommitment(id);
}

/** Ensure DB is opened/migrated at process start. */
export function initDatabase(): void {
  getDb();
}
