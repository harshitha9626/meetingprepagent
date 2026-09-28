// AI-Generated Code - 2026-09-28 - Composer

import { formatDebriefContent } from "../demo/seedData.js";
import {
  createCommitment,
  findDuplicateCommitment,
  getContact,
  getMeeting,
  listMeetings,
  updateMeeting,
} from "../store/db.js";
import type { DebriefPayload, PromisedBy } from "../types.js";
import { retainMemory } from "./hindsightService.js";

function normalizeDebrief(debrief: DebriefPayload): DebriefPayload {
  const optional = (v?: string) => (v ?? "").trim() || undefined;
  return {
    discussed: debrief.discussed.trim(),
    decisions: debrief.decisions.trim(),
    commitments: debrief.commitments.trim(),
    concernsAndPrefs: debrief.concernsAndPrefs.trim(),
    followUps: (debrief.followUps ?? "").trim(),
    myCommitments: optional(debrief.myCommitments),
    theirCommitments: optional(debrief.theirCommitments),
    newInformation: optional(debrief.newInformation),
    outcome: optional(debrief.outcome),
    changesNoted: optional(debrief.changesNoted),
  };
}

export type DebriefOptions = {
  /** When true (default), save New Commitments text as a structured commitment */
  trackCommitment?: boolean;
  promisedBy?: PromisedBy;
  dueDate?: string | null;
};

/**
 * Save debrief to SQLite first, then retain via existing Hindsight retainMemory.
 * Optionally creates a structured commitment from the debrief commitments field.
 */
export async function submitDebrief(
  meetingId: string,
  debriefInput: DebriefPayload,
  options: DebriefOptions = {}
) {
  const meeting = getMeeting(meetingId);
  if (!meeting) {
    const err = new Error("Meeting not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  const contact = getContact(meeting.contactId);
  if (!contact) {
    const err = new Error(
      "Contact not found. Select a valid contact before saving a debrief."
    );
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  const debrief = normalizeDebrief(debriefInput);
  if (
    !debrief.discussed ||
    !debrief.decisions ||
    !debrief.commitments ||
    !debrief.concernsAndPrefs ||
    !debrief.followUps
  ) {
    const err = new Error(
      "Debrief is incomplete. Fill Key Discussion, Decisions, Commitments, Concerns, and Follow-ups."
    );
    (err as Error & { status: number; code: string }).status = 400;
    (err as Error & { code: string }).code = "VALIDATION";
    throw err;
  }

  let updated = updateMeeting(meetingId, {
    status: "logged",
    debrief,
  });
  if (!updated) {
    const err = new Error("Failed to save debrief to the application database.");
    (err as Error & { status: number }).status = 500;
    throw err;
  }

  const trackCommitment = options.trackCommitment !== false;
  let commitment = null;
  if (trackCommitment && debrief.commitments.length >= 3) {
    const existing = findDuplicateCommitment(
      contact.id,
      debrief.commitments,
      meeting.id
    );
    if (!existing) {
      try {
        commitment = createCommitment({
          contactId: contact.id,
          meetingId: meeting.id,
          description: debrief.commitments,
          promisedBy: options.promisedBy ?? "me",
          dueDate: options.dueDate ?? null,
        });
      } catch (err) {
        const code = (err as Error & { code?: string }).code;
        if (code !== "DUPLICATE") throw err;
        commitment = existing ?? null;
      }
    } else {
      commitment = existing;
    }
  }

  const priorLogged = listMeetings(contact.id).filter(
    (m) => m.status === "logged" && m.id !== meeting.id
  );
  const meetingNumber = priorLogged.length + 1;
  const content = formatDebriefContent(
    contact,
    { ...updated, debrief },
    debrief,
    meetingNumber
  );
  const documentId = `meeting:${contact.id}:${meeting.id}`;

  try {
    const { provider } = await retainMemory({
      documentId,
      content,
      contactId: contact.id,
      meetingId: meeting.id,
      context: `Debrief for ${contact.name} — ${meeting.title}`,
      timestamp: `${meeting.date}T18:00:00.000Z`,
      tags: [`contact:${contact.id}`, "type:meeting-debrief"],
    });

    updated = updateMeeting(meetingId, {
      hindsightDocumentId: documentId,
    })!;

    return {
      meeting: updated,
      saved: true,
      retained: true,
      provider,
      documentId,
      commitment,
      message: commitment
        ? "Meeting debrief saved and remembered. Commitment tracked."
        : "Meeting debrief saved and remembered.",
      preview: content.slice(0, 280),
    };
  } catch (err) {
    const hindsightError =
      err instanceof Error ? err.message : "Hindsight retain failed";
    return {
      meeting: updated,
      saved: true,
      retained: false,
      provider: null,
      documentId: null,
      commitment,
      hindsightError,
      message: commitment
        ? "Debrief and commitment saved, but Hindsight could not remember this interaction."
        : "Debrief saved, but Hindsight could not remember this interaction.",
      preview: content.slice(0, 280),
    };
  }
}
