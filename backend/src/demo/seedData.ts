// AI-Generated Code - 2026-09-29 - Composer
/**
 * Ravi Sharma demo seed — realistic multi-meeting story.
 * App metadata → SQLite. Long-term facts → Hindsight retain (not UI-hardcoded briefs).
 * IDs are user-scoped so multiple accounts can seed without collisions.
 */

import type { Contact, DebriefPayload, Meeting } from "../types.js";

export const DEMO_CONTACT_ID = "contact-ravi-sharma";
export const DEMO_MEETING_1 = "meeting-ravi-1";
export const DEMO_MEETING_2 = "meeting-ravi-2";
export const DEMO_MEETING_3 = "meeting-ravi-3";
export const DEMO_MEETING_4 = "meeting-ravi-4";

/** Stable per-user demo ids (avoid cross-user primary key collisions). */
export function demoIdsForUser(userId: string): {
  contactId: string;
  meeting1: string;
  meeting2: string;
  meeting3: string;
  meeting4: string;
} {
  const suffix = userId.replace(/-/g, "").slice(0, 12);
  return {
    contactId: `contact-ravi-${suffix}`,
    meeting1: `meeting-ravi-1-${suffix}`,
    meeting2: `meeting-ravi-2-${suffix}`,
    meeting3: `meeting-ravi-3-${suffix}`,
    meeting4: `meeting-ravi-4-${suffix}`,
  };
}

export function buildDemoForUser(userId: string): {
  contact: Contact;
  meetings: Meeting[];
} {
  const ids = demoIdsForUser(userId);
  const contact: Contact = {
    ...demoContact,
    id: ids.contactId,
  };
  const meetings: Meeting[] = demoMeetings.map((m, i) => ({
    ...m,
    id: [ids.meeting1, ids.meeting2, ids.meeting3, ids.meeting4][i]!,
    contactId: ids.contactId,
  }));
  return { contact, meetings };
}

export const demoContact: Contact = {
  id: DEMO_CONTACT_ID,
  name: "Ravi Sharma",
  company: "Nimbus Retail",
  role: "VP Engineering",
  email: "ravi.sharma@nimbus-retail.example",
  notes: "Evaluating FlowOps deployment; cost-sensitive; prefers concise technical depth.",
  createdAt: "2026-03-01T10:00:00.000Z",
};

export const demoMeetings: Meeting[] = [
  {
    id: DEMO_MEETING_1,
    contactId: DEMO_CONTACT_ID,
    title: "Discovery — deployment approach",
    date: "2026-03-05",
    status: "logged",
    createdAt: "2026-03-05T16:00:00.000Z",
    debrief: {
      discussed:
        "Introduced FlowOps for Nimbus Retail warehouse visibility. Ravi Sharma (VP Engineering) focused on how FlowOps would deploy into their Kubernetes estate and what ongoing platform cost looks like.",
      decisions:
        "Agreed to continue evaluation. No vendor shortlist decision yet. Next step is a technical deep-dive on architecture.",
      commitments:
        "Maya (AE) promised to send a concise architecture document covering deployment topology, cost drivers, and security boundaries before the next meeting. Ravi will share current cluster sizing notes.",
      concernsAndPrefs:
        "Ravi is concerned about deployment cost (infra + ops overhead). He prefers concise technical explanations — short diagrams and bullets, not long slide decks. Outcome to remember: cost sensitivity + preference for concise tech depth + open architecture-doc promise.",
    },
  },
  {
    id: DEMO_MEETING_2,
    contactId: DEMO_CONTACT_ID,
    title: "Timeline & architecture follow-up",
    date: "2026-03-12",
    status: "logged",
    createdAt: "2026-03-12T17:00:00.000Z",
    debrief: {
      discussed:
        "Ravi asked detailed questions about the deployment timeline if Nimbus green-lights a pilot. Reviewed where FlowOps would sit relative to their existing observability stack.",
      decisions:
        "Tentative interest in a pilot if implementation can fit a two-week window. Architecture review still blocked on missing materials.",
      commitments:
        "Architecture document from Maya is STILL PENDING / MISSED — not delivered since Meeting 1. Ravi will hold an internal sync with platform after receiving it. Maya re-committed to send the architecture doc within 48 hours.",
      concernsAndPrefs:
        "Ravi prefers a two-week implementation timeline for any pilot. Deployment cost concern remains in the background. He again asked for concise technical explanations. Outcome: timeline preference = two weeks; architecture doc still an open/missed commitment.",
    },
  },
  {
    id: DEMO_MEETING_3,
    contactId: DEMO_CONTACT_ID,
    title: "Cost revisit & architecture checkpoint",
    date: "2026-03-19",
    status: "logged",
    createdAt: "2026-03-19T18:00:00.000Z",
    debrief: {
      discussed:
        "Ravi again raised concerns about deployment cost after an internal finance nudge. The architecture discussion from Meeting 1 was revisited in detail (namespaces, autoscaling, managed vs self-hosted options).",
      decisions:
        "Will not expand the pilot scope until cost model is clearer. Architecture direction still preferred: managed control plane + customer-vpc data plane, pending written architecture doc.",
      commitments:
        "Previous Maya commitment to send the architecture document is STILL RELEVANT and still not fulfilled (open/missed follow-up). Ravi asked Maya to bring a cost-annotated architecture one-pager to the next meeting.",
      concernsAndPrefs:
        "Recurring concern: deployment cost. Recurring preference: concise technical explanations and a two-week implementation timeline. Outcome: cost concern recurring; architecture thread unresolved; document commitment still open.",
    },
  },
  {
    id: DEMO_MEETING_4,
    contactId: DEMO_CONTACT_ID,
    title: "Pilot go / no-go prep",
    date: "2026-03-26",
    status: "upcoming",
    createdAt: "2026-03-24T09:00:00.000Z",
  },
];

/** Optional fill for logging Meeting 4 after the demo prep */
export const RAVI_MEETING4_SAMPLE: DebriefPayload = {
  discussed:
    "Reviewed cost-annotated architecture one-pager. Ravi compared managed vs self-hosted options and reconfirmed two-week pilot interest for Hyderabad DC only.",
  decisions:
    "Conditional go for a two-week pilot pending finance sign-off on the cost model.",
  commitments:
    "Maya: deliver revised cost table by Monday. Ravi: loop finance async. Maya: schedule kickoff the week of April 6 if approved.",
  concernsAndPrefs:
    "Deployment cost still the top concern. Concise technical format was appreciated.",
  followUps:
    "Bring revised cost table and confirm finance sign-off at the next sync.",
};

export function formatDebriefContent(
  contact: Contact,
  meeting: Meeting,
  debrief: DebriefPayload,
  meetingNumber: number
): string {
  return [
    `MEETING DEBRIEF FOR RELATIONSHIP MEMORY`,
    `Contact name: ${contact.name}`,
    `Contact company: ${contact.company}`,
    `Contact role: ${contact.role}`,
    `Contact ID: ${contact.id}`,
    `Relationship tag: contact:${contact.id}`,
    `Meeting title: ${meeting.title}`,
    `Meeting ID: ${meeting.id}`,
    `Meeting number: ${meetingNumber}`,
    `Meeting date: ${meeting.date}`,
    ``,
    `=== DISCUSSIONS ===`,
    debrief.discussed,
    ``,
    `=== DECISIONS / OUTCOMES ===`,
    debrief.decisions,
    ``,
    `=== PROMISES / COMMITMENTS / PENDING ACTIONS ===`,
    debrief.commitments,
    ``,
    `=== CONCERNS RAISED ===`,
    debrief.concernsAndPrefs,
    ``,
    `=== FOLLOW-UPS ===`,
    (debrief.followUps ?? "").trim() || "(none recorded)",
    ``,
    `=== MY COMMITMENTS ===`,
    (debrief.myCommitments ?? "").trim() || "(see promises section)",
    ``,
    `=== THEIR COMMITMENTS ===`,
    (debrief.theirCommitments ?? "").trim() || "(see promises section)",
    ``,
    `=== NEW INFORMATION ===`,
    (debrief.newInformation ?? "").trim() || "(none recorded)",
    ``,
    `=== OVERALL OUTCOME ===`,
    (debrief.outcome ?? "").trim() || "(see decisions)",
    ``,
    `=== CHANGES NOTED VS PRIOR MEETING ===`,
    (debrief.changesNoted ?? "").trim() || "(none recorded)",
    ``,
    `Agent owner: Maya (B2B Account Executive).`,
    `Extract and remember: discussions, decisions, promises (who/what/when), follow-ups, pending/missed actions, recurring concerns, preferences, and outcomes tied to ${contact.name}.`,
  ].join("\n");
}

export function buildSeedRetainItems(userId?: string): {
  contact: Contact;
  meetings: Meeting[];
  items: { meeting: Meeting; content: string; documentId: string }[];
} {
  const { contact, meetings } = userId
    ? buildDemoForUser(userId)
    : { contact: demoContact, meetings: demoMeetings };
  const logged = meetings.filter((m) => m.status === "logged" && m.debrief);
  const items = logged.map((meeting, index) => ({
    meeting,
    documentId: `meeting:${meeting.contactId}:${meeting.id}`,
    content: formatDebriefContent(
      contact,
      meeting,
      meeting.debrief!,
      index + 1
    ),
  }));
  return { contact, meetings, items };
}
