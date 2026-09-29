// AI-Generated Code - 2026-09-29 - Composer
/**
 * Database facade.
 * - Vercel/serverless → JSON file under /tmp (no node:sqlite import)
 * - Local → SQLite via lazy createRequire (persistent backend/data)
 */

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isServerlessRuntime } from "./runtimeFlags.js";
import * as jsonStore from "./jsonStore.js";

export { isServerlessRuntime } from "./runtimeFlags.js";
export const ORPHAN_USER_ID = "orphan-pre-auth";

export type UserRecord = jsonStore.UserRecord;

type StoreApi = typeof jsonStore;

const require = createRequire(import.meta.url);
let sqliteStore: StoreApi | null = null;

function store(): StoreApi {
  if (isServerlessRuntime()) {
    return jsonStore;
  }
  if (!sqliteStore) {
    // Loaded only on local Node — keeps node:sqlite off the Vercel cold-start path.
    sqliteStore = require("./sqliteDb.js") as StoreApi;
  }
  return sqliteStore;
}

export function resolveDataDir(): string {
  const override = process.env.BRIEFED_DB_DIR?.trim();
  if (override) return override;
  if (isServerlessRuntime()) return "/tmp/briefed-data";
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.join(__dirname, "..", "..", "data");
}

export function getDbPath(): string {
  return store().getDbPath();
}

export function initDatabase(): void {
  store().initDatabase();
}

export function createUser(
  ...args: Parameters<StoreApi["createUser"]>
): ReturnType<StoreApi["createUser"]> {
  return store().createUser(...args);
}

export function findUserByEmail(
  ...args: Parameters<StoreApi["findUserByEmail"]>
): ReturnType<StoreApi["findUserByEmail"]> {
  return store().findUserByEmail(...args);
}

export function findUserById(
  ...args: Parameters<StoreApi["findUserById"]>
): ReturnType<StoreApi["findUserById"]> {
  return store().findUserById(...args);
}

export function listContacts(
  ...args: Parameters<StoreApi["listContacts"]>
): ReturnType<StoreApi["listContacts"]> {
  return store().listContacts(...args);
}

export function getContact(
  ...args: Parameters<StoreApi["getContact"]>
): ReturnType<StoreApi["getContact"]> {
  return store().getContact(...args);
}

export function createContact(
  ...args: Parameters<StoreApi["createContact"]>
): ReturnType<StoreApi["createContact"]> {
  return store().createContact(...args);
}

export function listMeetings(
  ...args: Parameters<StoreApi["listMeetings"]>
): ReturnType<StoreApi["listMeetings"]> {
  return store().listMeetings(...args);
}

export function listUpcomingMeetings(
  ...args: Parameters<StoreApi["listUpcomingMeetings"]>
): ReturnType<StoreApi["listUpcomingMeetings"]> {
  return store().listUpcomingMeetings(...args);
}

export function getMeeting(
  ...args: Parameters<StoreApi["getMeeting"]>
): ReturnType<StoreApi["getMeeting"]> {
  return store().getMeeting(...args);
}

export function getMeetingForUser(
  ...args: Parameters<StoreApi["getMeetingForUser"]>
): ReturnType<StoreApi["getMeetingForUser"]> {
  return store().getMeetingForUser(...args);
}

export function createMeeting(
  ...args: Parameters<StoreApi["createMeeting"]>
): ReturnType<StoreApi["createMeeting"]> {
  return store().createMeeting(...args);
}

export function updateMeeting(
  ...args: Parameters<StoreApi["updateMeeting"]>
): ReturnType<StoreApi["updateMeeting"]> {
  return store().updateMeeting(...args);
}

export function resetAppData(
  ...args: Parameters<StoreApi["resetAppData"]>
): ReturnType<StoreApi["resetAppData"]> {
  return store().resetAppData(...args);
}

export function refreshOverdueCommitments(
  ...args: Parameters<StoreApi["refreshOverdueCommitments"]>
): ReturnType<StoreApi["refreshOverdueCommitments"]> {
  return store().refreshOverdueCommitments(...args);
}

export function listCommitments(
  ...args: Parameters<StoreApi["listCommitments"]>
): ReturnType<StoreApi["listCommitments"]> {
  return store().listCommitments(...args);
}

export function listOpenCommitments(
  ...args: Parameters<StoreApi["listOpenCommitments"]>
): ReturnType<StoreApi["listOpenCommitments"]> {
  return store().listOpenCommitments(...args);
}

export function getCommitment(
  ...args: Parameters<StoreApi["getCommitment"]>
): ReturnType<StoreApi["getCommitment"]> {
  return store().getCommitment(...args);
}

export function getCommitmentForUser(
  ...args: Parameters<StoreApi["getCommitmentForUser"]>
): ReturnType<StoreApi["getCommitmentForUser"]> {
  return store().getCommitmentForUser(...args);
}

export function findDuplicateCommitment(
  ...args: Parameters<StoreApi["findDuplicateCommitment"]>
): ReturnType<StoreApi["findDuplicateCommitment"]> {
  return store().findDuplicateCommitment(...args);
}

export function createCommitment(
  ...args: Parameters<StoreApi["createCommitment"]>
): ReturnType<StoreApi["createCommitment"]> {
  return store().createCommitment(...args);
}

export function updateCommitmentStatus(
  ...args: Parameters<StoreApi["updateCommitmentStatus"]>
): ReturnType<StoreApi["updateCommitmentStatus"]> {
  return store().updateCommitmentStatus(...args);
}
