// AI-Generated Code - 2026-09-28 - Composer

import type { Contact, DebriefPayload, Meeting } from "../types.js";

export const DEMO_CONTACT_ID = "contact-priya-acme";
export const DEMO_MEETING_1 = "meeting-priya-1";
export const DEMO_MEETING_2 = "meeting-priya-2";
export const DEMO_MEETING_3 = "meeting-priya-3";

export const demoContact: Contact = {
  id: DEMO_CONTACT_ID,
  name: "Priya Shah",
  company: "Acme Corp",
  role: "VP Operations",
  email: "priya.shah@acme.example",
  createdAt: "2026-03-01T10:00:00.000Z",
};

export const demoMeetings: Meeting[] = [
  {
    id: DEMO_MEETING_1,
    contactId: DEMO_CONTACT_ID,
    title: "Discovery call — FlowOps pilot",
    date: "2026-03-07",
    status: "logged",
    createdAt: "2026-03-07T16:00:00.000Z",
    debrief: {
      discussed:
        "Priya walked through Acme's ops reporting stack. Teams spend ~12 hours/week assembling manual reports across three tools. She is evaluating FlowOps for a 6-week pilot with the Ops and Finance pods.",
      decisions:
        "Agreed to explore a scoped pilot focused on weekly ops dashboards. Priya will socialize the idea with her Ops leads before the next call.",
      commitments:
        "Maya (AE): send a one-page SOC2 / security overview before next meeting. Priya: share current report template samples.",
      concernsAndPrefs:
        "Priya asked detailed questions about SOC2 Type II and data residency. She prefers concise agendas and dislikes long slide decks. Maya noted she prepares best with a short bullet agenda that leads with open commitments.",
    },
  },
  {
    id: DEMO_MEETING_2,
    contactId: DEMO_CONTACT_ID,
    title: "Pilot scoping + IT constraints",
    date: "2026-03-21",
    status: "logged",
    createdAt: "2026-03-21T17:30:00.000Z",
    debrief: {
      discussed:
        "Reviewed pilot scope for weekly ops dashboards. Priya raised IT bandwidth as the main blocker — her IT partner is buried in a ERP cutover. Discussed whether Finance can join a later phase.",
      decisions:
        "Decision: invite Acme IT lead (Jordan Lee) to the next meeting before locking pilot timeline. Pilot remains interested but contingent on IT capacity.",
      commitments:
        "Maya promised an ROI one-pager with time-saved estimates by Friday 2026-03-22 (MISSED — not delivered). Priya will check Jordan's availability for next week.",
      concernsAndPrefs:
        "Recurring concern: IT bandwidth / change fatigue during ERP cutover. Priya reiterated SOC2 must be clear before any sandbox access. She still wants a short agenda and wants Maya to open with any missed commitments.",
    },
  },
  {
    id: DEMO_MEETING_3,
    contactId: DEMO_CONTACT_ID,
    title: "Pilot go / no-go prep",
    date: "2026-03-28",
    status: "upcoming",
    createdAt: "2026-03-25T09:00:00.000Z",
  },
];

export function formatDebriefContent(
  contact: Contact,
  meeting: Meeting,
  debrief: DebriefPayload,
  meetingNumber: number
): string {
  return [
    `Meeting debrief`,
    `Contact: ${contact.name} (${contact.company}), ${contact.role}`,
    `Contact ID: ${contact.id}`,
    `Meeting: ${meeting.title}`,
    `Meeting ID: ${meeting.id}`,
    `Meeting #: ${meetingNumber}`,
    `Date: ${meeting.date}`,
    ``,
    `Discussed:`,
    debrief.discussed,
    ``,
    `Decisions:`,
    debrief.decisions,
    ``,
    `Commitments and promises (who / what / when):`,
    debrief.commitments,
    ``,
    `Concerns, preferences, and prep style notes:`,
    debrief.concernsAndPrefs,
    ``,
    `User (agent owner): Maya — B2B Account Executive. Prep preference: short bullet agendas, lead with open/missed commitments, keep questions under 5 when possible.`,
  ].join("\n");
}

export function buildSeedRetainItems(): {
  contact: Contact;
  meetings: Meeting[];
  items: { meeting: Meeting; content: string; documentId: string }[];
} {
  const logged = demoMeetings.filter((m) => m.status === "logged" && m.debrief);
  const items = logged.map((meeting, index) => ({
    meeting,
    documentId: `meeting:${meeting.contactId}:${meeting.id}`,
    content: formatDebriefContent(
      demoContact,
      meeting,
      meeting.debrief!,
      index + 1
    ),
  }));
  return { contact: demoContact, meetings: demoMeetings, items };
}
