// AI-Generated Code - 2026-09-28 - Composer

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AppData, Contact, Meeting, LocalMemoryRecord } from "../types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

function emptyData(): AppData {
  return { contacts: [], meetings: [], localMemories: [] };
}

function ensureStore(): AppData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const data = emptyData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return data;
  }
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as AppData;
}

function writeStore(data: AppData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function readData(): AppData {
  return ensureStore();
}

export function replaceData(data: AppData): void {
  writeStore(data);
}

export function listContacts(): Contact[] {
  return readData().contacts;
}

export function getContact(id: string): Contact | undefined {
  return readData().contacts.find((c) => c.id === id);
}

export function createContact(
  input: Omit<Contact, "id" | "createdAt"> & { id?: string }
): Contact {
  const data = readData();
  const contact: Contact = {
    id: input.id ?? crypto.randomUUID(),
    name: input.name,
    company: input.company,
    role: input.role,
    email: input.email,
    createdAt: new Date().toISOString(),
  };
  data.contacts.push(contact);
  writeStore(data);
  return contact;
}

export function listMeetings(contactId?: string): Meeting[] {
  const meetings = readData().meetings;
  const filtered = contactId
    ? meetings.filter((m) => m.contactId === contactId)
    : meetings;
  return filtered.sort((a, b) => a.date.localeCompare(b.date));
}

export function getMeeting(id: string): Meeting | undefined {
  return readData().meetings.find((m) => m.id === id);
}

export function createMeeting(
  input: Omit<Meeting, "id" | "createdAt" | "status"> & {
    id?: string;
    status?: Meeting["status"];
  }
): Meeting {
  const data = readData();
  const meeting: Meeting = {
    id: input.id ?? crypto.randomUUID(),
    contactId: input.contactId,
    title: input.title,
    date: input.date,
    status: input.status ?? "upcoming",
    debrief: input.debrief,
    createdAt: new Date().toISOString(),
  };
  data.meetings.push(meeting);
  writeStore(data);
  return meeting;
}

export function updateMeeting(id: string, patch: Partial<Meeting>): Meeting | undefined {
  const data = readData();
  const idx = data.meetings.findIndex((m) => m.id === id);
  if (idx < 0) return undefined;
  data.meetings[idx] = { ...data.meetings[idx], ...patch, id };
  writeStore(data);
  return data.meetings[idx];
}

export function addLocalMemory(record: LocalMemoryRecord): void {
  const data = readData();
  data.localMemories = data.localMemories.filter(
    (m) => m.documentId !== record.documentId
  );
  data.localMemories.push(record);
  writeStore(data);
}

export function listLocalMemories(contactId?: string): LocalMemoryRecord[] {
  const memories = readData().localMemories;
  return contactId
    ? memories.filter((m) => m.contactId === contactId)
    : memories;
}

export function clearLocalMemories(): void {
  const data = readData();
  data.localMemories = [];
  writeStore(data);
}

export function resetAppData(): void {
  writeStore(emptyData());
}
