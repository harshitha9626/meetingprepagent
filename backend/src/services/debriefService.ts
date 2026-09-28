// AI-Generated Code - 2026-09-28 - Composer

import { formatDebriefContent } from "../demo/seedData.js";
import {
  getContact,
  getMeeting,
  listMeetings,
  updateMeeting,
} from "../store/db.js";
import type { DebriefPayload } from "../types.js";
import { retainMemory } from "./hindsightService.js";

export async function submitDebrief(
  meetingId: string,
  debrief: DebriefPayload
) {
  const meeting = getMeeting(meetingId);
  if (!meeting) {
    const err = new Error("Meeting not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  const contact = getContact(meeting.contactId);
  if (!contact) {
    const err = new Error("Contact not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  const priorLogged = listMeetings(contact.id).filter(
    (m) => m.status === "logged" && m.id !== meeting.id
  );
  const meetingNumber = priorLogged.length + 1;
  const content = formatDebriefContent(
    contact,
    { ...meeting, debrief },
    debrief,
    meetingNumber
  );
  const documentId = `meeting:${contact.id}:${meeting.id}`;

  const { provider } = await retainMemory({
    documentId,
    content,
    contactId: contact.id,
    meetingId: meeting.id,
    context: `Debrief for ${contact.name} — ${meeting.title}`,
    timestamp: `${meeting.date}T18:00:00.000Z`,
    tags: [`contact:${contact.id}`, "type:meeting-debrief"],
  });

  const updated = updateMeeting(meetingId, {
    status: "logged",
    debrief,
  });

  return {
    meeting: updated,
    retained: true,
    provider,
    documentId,
    preview: content.slice(0, 280),
  };
}
