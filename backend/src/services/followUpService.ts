// AI-Generated Code - 2026-09-28 - Composer
/**
 * Personalized follow-up email draft from last debrief + open commitments +
 * Hindsight-recalled preferences. Does not send email; does not store media.
 */

import type { Contact, FollowUpDraft, Meeting } from "../types.js";
import { getMeeting, listMeetings, listOpenCommitments } from "../store/db.js";
import { recallMemories } from "./hindsightService.js";

function clip(text: string, max: number): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function firstSentence(text: string, max = 160): string {
  const cleaned = text.trim().replace(/\s+/g, " ");
  const m = cleaned.match(/^[^.!?]+[.!?]?/);
  return clip(m?.[0] || cleaned, max);
}

export async function generateFollowUpDraft(
  contact: Contact,
  meetingId?: string | null
): Promise<FollowUpDraft> {
  const meetings = listMeetings(contact.id);
  let meeting: Meeting | undefined;
  if (meetingId) {
    meeting = getMeeting(meetingId);
    if (!meeting || meeting.contactId !== contact.id) {
      const err = new Error("Meeting not found for this contact");
      (err as Error & { status: number }).status = 404;
      throw err;
    }
  } else {
    meeting =
      meetings
        .filter((m) => m.status === "logged" && m.debrief)
        .sort((a, b) => b.date.localeCompare(a.date))[0] ??
      meetings.filter((m) => m.status === "logged").sort((a, b) =>
        b.date.localeCompare(a.date)
      )[0];
  }

  const open = listOpenCommitments(contact.id);
  const debrief = meeting?.debrief;

  let preferenceHints: string[] = [];
  let memoryCount = 0;
  try {
    const { facts } = await recallMemories(
      `${contact.name}: communication preferences, format preferences, and recurring concerns.`,
      contact.id
    );
    memoryCount = facts.length;
    preferenceHints = facts
      .filter((f) => /prefer|concise|timeline|format|bullet|diagram/i.test(f.text))
      .slice(0, 3)
      .map((f) => firstSentence(f.text, 120));
    if (preferenceHints.length === 0) {
      preferenceHints = facts.slice(0, 2).map((f) => firstSentence(f.text, 120));
    }
  } catch {
    // Follow-up can still be drafted from local debrief + commitments
    preferenceHints = [];
  }

  const topic =
    debrief?.discussed
      ? firstSentence(debrief.discussed, 60)
      : meeting?.title || "our discussion";

  const subject = `Follow-up — ${clip(topic.replace(/[.!?]+$/, ""), 70)}`;

  const nextSteps: string[] = [];
  if (debrief?.followUps) nextSteps.push(firstSentence(debrief.followUps, 140));
  if (debrief?.myCommitments) {
    nextSteps.push(`I will: ${firstSentence(debrief.myCommitments, 120)}`);
  } else if (debrief?.commitments && /maya|i will|i'll|promised/i.test(debrief.commitments)) {
    nextSteps.push(firstSentence(debrief.commitments, 140));
  }
  if (debrief?.theirCommitments) {
    nextSteps.push(
      `${contact.name} to: ${firstSentence(debrief.theirCommitments, 120)}`
    );
  }
  for (const c of open.slice(0, 3)) {
    const who = c.promisedBy === "me" ? "Me" : contact.name;
    nextSteps.push(
      `${who}: ${clip(c.description, 100)}${c.status === "overdue" ? " (overdue)" : ""}`
    );
  }
  // Dedupe next steps
  const seen = new Set<string>();
  const uniqueSteps = nextSteps.filter((s) => {
    const k = s.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 5);

  if (uniqueSteps.length === 0) {
    uniqueSteps.push("Confirm next steps and owners before our next sync.");
  }

  const lines: string[] = [
    `Hi ${contact.name.split(" ")[0]},`,
    ``,
    `Thanks for ${meeting ? `today's discussion (${meeting.title})` : "the conversation"}.`,
  ];

  if (debrief?.discussed) {
    lines.push(``, firstSentence(debrief.discussed, 220));
  }
  if (debrief?.decisions) {
    lines.push(``, `Decision / direction: ${firstSentence(debrief.decisions, 180)}`);
  }
  if (debrief?.outcome) {
    lines.push(``, `Outcome: ${firstSentence(debrief.outcome, 160)}`);
  }
  if (debrief?.concernsAndPrefs) {
    lines.push(
      ``,
      `I heard your concern/preference around: ${firstSentence(debrief.concernsAndPrefs, 160)}`
    );
  }
  if (preferenceHints[0]) {
    lines.push(
      ``,
      `I'll keep materials aligned with what has worked for you — ${preferenceHints[0]}`
    );
  }
  if (open.length > 0) {
    lines.push(
      ``,
      `We still have ${open.length} open commitment(s) on the relationship — I'll make sure those stay visible for our next prep.`
    );
  }

  lines.push(``, `Next steps:`);
  for (const step of uniqueSteps) {
    lines.push(`- ${step}`);
  }

  lines.push(
    ``,
    `Happy to adjust if anything above is off.`,
    ``,
    `Regards,`,
    `Maya`
  );

  return {
    subject,
    body: lines.join("\n"),
    contactName: contact.name,
    meetingTitle: meeting?.title ?? null,
    meetingDate: meeting?.date ?? null,
    basedOn: {
      debriefUsed: Boolean(debrief),
      openCommitmentCount: open.length,
      memoryCount,
      preferenceHints,
    },
  };
}
