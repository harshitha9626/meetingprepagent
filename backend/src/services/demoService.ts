// AI-Generated Code - 2026-09-28 - Composer

import {
  buildSeedRetainItems,
  demoContact,
  demoMeetings,
} from "../demo/seedData.js";
import {
  createContact,
  createMeeting,
  getContact,
  replaceData,
  resetAppData,
} from "../store/db.js";
import { clearProviderMemories, retainMemory } from "./hindsightService.js";

export async function seedDemo() {
  resetAppData();
  await clearProviderMemories();

  createContact(demoContact);
  for (const meeting of demoMeetings) {
    createMeeting(meeting);
  }

  const { items } = buildSeedRetainItems();
  const retained = [];
  for (const item of items) {
    const result = await retainMemory({
      documentId: item.documentId,
      content: item.content,
      contactId: demoContact.id,
      meetingId: item.meeting.id,
      context: `Seed debrief — ${item.meeting.title}`,
      timestamp: `${item.meeting.date}T18:00:00.000Z`,
      tags: [`contact:${demoContact.id}`, "type:meeting-debrief", "demo:seed"],
    });
    retained.push({
      meetingId: item.meeting.id,
      documentId: item.documentId,
      provider: result.provider,
    });
  }

  return {
    contact: getContact(demoContact.id),
    meetings: demoMeetings,
    retained,
    message:
      "Demo seeded: Priya Shah @ Acme with 2 logged meetings + 1 upcoming. Memory retained for Meeting 1 and 2.",
  };
}

export async function resetDemo() {
  resetAppData();
  await clearProviderMemories();
  replaceData({ contacts: [], meetings: [], localMemories: [] });
  return { ok: true, message: "Demo data cleared. Run seed to reload Priya story." };
}
