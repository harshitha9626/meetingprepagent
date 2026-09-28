// AI-Generated Code - 2026-09-29 - Composer

import { buildSeedRetainItems, buildDemoForUser } from "../demo/seedData.js";
import {
  createContact,
  createMeeting,
  getContact,
  listMeetings,
  resetAppData,
  updateMeeting,
} from "../store/db.js";
import {
  patchMemoryDebug,
  retainMemory,
  getBankId,
  isHindsightConfigured,
} from "./hindsightService.js";

/**
 * Seeds Ravi + meetings into SQLite for the authenticated user only.
 * Then attempts Hindsight retain into that user's bank.
 */
export async function seedDemo(userId: string) {
  resetAppData(userId);

  const { contact: seedContact, meetings: seedMeetings } =
    buildDemoForUser(userId);
  createContact({ ...seedContact, userId });
  for (const meeting of seedMeetings) {
    createMeeting(meeting);
  }

  const contact = getContact(seedContact.id, userId)!;
  const meetings = listMeetings(seedContact.id);
  const { items } = buildSeedRetainItems(userId);
  const retained: {
    meetingId: string;
    documentId: string;
    provider: string;
  }[] = [];
  const documentIds: string[] = [];
  const bankId = getBankId(userId);

  patchMemoryDebug({
    bankId,
    contactId: seedContact.id,
    contactName: seedContact.name,
    retain: {
      status: "ok",
      documentIds: [],
      at: new Date().toISOString(),
    },
  });

  if (!isHindsightConfigured()) {
    const message =
      "Hindsight is not configured. Add HINDSIGHT_API_KEY to backend/.env and restart the API.";
    patchMemoryDebug({
      retain: {
        status: "error",
        documentIds: [],
        error: message,
        at: new Date().toISOString(),
      },
    });
    return {
      contact,
      meetings,
      retained,
      hindsightConfigured: false,
      hindsightError: message,
      debug: {
        bankId,
        contactId: seedContact.id,
        retainCount: 0,
        documentIds: [],
      },
      message:
        "Ravi Sharma demo data loaded locally. Hindsight retain skipped — configure HINDSIGHT_API_KEY to retain and recall.",
    };
  }

  try {
    for (const item of items) {
      const result = await retainMemory({
        documentId: item.documentId,
        content: item.content,
        contactId: seedContact.id,
        meetingId: item.meeting.id,
        context: `Seed debrief — ${item.meeting.title}`,
        timestamp: `${item.meeting.date}T18:00:00.000Z`,
        tags: [
          `contact:${seedContact.id}`,
          `user:${userId}`,
          "type:meeting-debrief",
          "demo:seed",
        ],
      });
      documentIds.push(result.documentId);
      updateMeeting(item.meeting.id, {
        hindsightDocumentId: result.documentId,
      });
      retained.push({
        meetingId: item.meeting.id,
        documentId: result.documentId,
        provider: result.provider,
      });
    }
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : String(err);
    patchMemoryDebug({
      bankId,
      contactId: seedContact.id,
      contactName: seedContact.name,
      retain: {
        status: "error",
        documentIds,
        error: errMessage,
        at: new Date().toISOString(),
      },
    });
    return {
      contact: getContact(seedContact.id, userId)!,
      meetings: listMeetings(seedContact.id),
      retained,
      hindsightConfigured: true,
      hindsightError: errMessage,
      debug: {
        bankId,
        contactId: seedContact.id,
        retainCount: retained.length,
        documentIds,
      },
      message: `Ravi Sharma demo data loaded locally (${retained.length}/${items.length} retained in Hindsight). Retain error: ${errMessage}`,
    };
  }

  patchMemoryDebug({
    bankId,
    contactId: seedContact.id,
    contactName: seedContact.name,
    retain: {
      status: "ok",
      documentIds,
      at: new Date().toISOString(),
    },
  });

  return {
    contact: getContact(seedContact.id, userId)!,
    meetings: listMeetings(seedContact.id),
    retained,
    hindsightConfigured: true,
    debug: {
      bankId,
      contactId: seedContact.id,
      retainCount: retained.length,
      documentIds,
    },
    message: `Demo seeded: Ravi Sharma — ${retained.length} meetings retained in Hindsight (cost, architecture doc, timeline). Upcoming meeting ready to prepare.`,
  };
}

export async function resetDemo(userId: string) {
  resetAppData(userId);
  return {
    ok: true,
    message:
      "Your local Briefed data was cleared. Hindsight memories for your account remain; re-seed upserts the same document ids in your bank.",
  };
}
