// AI-Generated Code - 2026-09-28 - Composer

import Groq from "groq-sdk";
import type {
  BriefSection,
  Contact,
  Meeting,
  MeetingBrief,
  PrepareResponse,
  RecalledMemory,
} from "../types.js";
import { listMeetings } from "../store/db.js";
import {
  getMemoryProviderName,
  recallMemories,
  type RecalledFact,
} from "./hindsightService.js";

const BRIEF_SECTIONS: BriefSection[] = [
  "overview",
  "discussions",
  "decisions",
  "commitments",
  "missedFollowUps",
  "recurringConcerns",
  "preferences",
  "agenda",
  "questions",
  "timeline",
];

const RECALL_QUERIES = (contact: Contact) => [
  {
    section: "overview" as BriefSection,
    query: `Who is ${contact.name} at ${contact.company} and what is the relationship / deal context?`,
  },
  {
    section: "discussions" as BriefSection,
    query: `What was previously discussed with ${contact.name} across past meetings?`,
  },
  {
    section: "decisions" as BriefSection,
    query: `What important decisions were made with ${contact.name}?`,
  },
  {
    section: "commitments" as BriefSection,
    query: `What open or pending commitments and promises involve ${contact.name} or Maya?`,
  },
  {
    section: "missedFollowUps" as BriefSection,
    query: `What follow-ups were missed or overdue with ${contact.name}?`,
  },
  {
    section: "recurringConcerns" as BriefSection,
    query: `What recurring concerns does ${contact.name} raise (IT bandwidth, SOC2, change fatigue)?`,
  },
  {
    section: "preferences" as BriefSection,
    query: `What preferences and meeting prep style notes exist for ${contact.name} and for Maya?`,
  },
];

function emptyBrief(): MeetingBrief {
  return {
    overview: "No prior memory yet for this contact.",
    discussions: [],
    decisions: [],
    commitments: [],
    missedFollowUps: [],
    recurringConcerns: [],
    preferences: [],
    agenda: [
      "Introductions and goal for this meeting",
      "Discover current priorities",
      "Align on next steps",
    ],
    questions: [
      "What are your top priorities this quarter?",
      "Who else should be involved in evaluating this?",
      "What would success look like in 30 days?",
    ],
    timeline: [],
  };
}

function getGroq(): Groq | null {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) return null;
  return new Groq({ apiKey: key });
}

function dedupeFacts(facts: RecalledFact[]): RecalledFact[] {
  const seen = new Set<string>();
  const out: RecalledFact[] = [];
  for (const fact of facts) {
    const key = fact.text.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(fact);
  }
  return out;
}

function heuristicMemories(
  facts: RecalledFact[],
  contact: Contact
): RecalledMemory[] {
  return facts.slice(0, 10).map((fact, idx) => {
    const text = fact.text.toLowerCase();
    let section: BriefSection = "discussions";
    let why = `Relevant background for preparing Maya's meeting with ${contact.name}.`;

    if (text.startsWith("commitments")) {
      if (
        text.includes("missed") ||
        text.includes("not delivered") ||
        text.includes("overdue")
      ) {
        section = "missedFollowUps";
        why = "Flags a missed or overdue follow-up Maya should address up front.";
      } else {
        section = "commitments";
        why = "Surfaces an open commitment tied to this relationship.";
      }
    } else if (text.startsWith("concerns")) {
      section = "recurringConcerns";
      why = "Recurring concern or preference likely to matter in this meeting.";
      if (text.includes("prefer") || text.includes("agenda") || text.includes("prep")) {
        // Keep concerns primary; preferences also pulled via duplicate path below if needed
      }
    } else if (text.startsWith("decisions")) {
      section = "decisions";
      why = "Prior decision that should shape today's agenda.";
    } else if (text.startsWith("discussed")) {
      section = idx === 0 ? "overview" : "discussions";
      why =
        idx === 0
          ? "Core relationship context for the contact overview."
          : "Prior discussion context for continuity.";
    } else if (
      text.includes("missed") ||
      text.includes("not delivered") ||
      text.includes("overdue")
    ) {
      section = "missedFollowUps";
      why = "Flags a missed or overdue follow-up Maya should address up front.";
    } else if (text.includes("prefer") || text.includes("prep style")) {
      section = "preferences";
      why = "Communication or prep-style preference for a personalized brief.";
    }

    return {
      id: fact.id,
      text: fact.text,
      whyRelevant: why,
      section,
    };
  });
}

function briefFromMemories(
  contact: Contact,
  meetings: Meeting[],
  memories: RecalledMemory[]
): MeetingBrief {
  const by = (section: BriefSection) =>
    memories.filter((m) => m.section === section).map((m) => m.text);

  const logged = meetings.filter((m) => m.status === "logged");
  const timeline = logged.map((m) => ({
    date: m.date,
    summary: m.title + (m.debrief ? ` — ${m.debrief.discussed.slice(0, 120)}…` : ""),
  }));

  const missed = by("missedFollowUps");
  const commitments = by("commitments");
  const concerns = by("recurringConcerns");
  const prefsFromConcerns = memories
    .filter((m) => m.section === "recurringConcerns" && /prefer|agenda|prep/i.test(m.text))
    .map((m) => m.text);
  const preferences = [...by("preferences"), ...prefsFromConcerns].filter(
    (v, i, arr) => arr.indexOf(v) === i
  );

  return {
    overview:
      by("overview")[0] ??
      `${contact.name}, ${contact.role} at ${contact.company}. ${logged.length} prior logged meeting(s) in Briefed memory.`,
    discussions: by("discussions").slice(0, 5),
    decisions: by("decisions").slice(0, 5),
    commitments: commitments.slice(0, 5),
    missedFollowUps: missed.slice(0, 5),
    recurringConcerns: concerns.slice(0, 5),
    preferences: preferences.slice(0, 5),
    agenda: [
      missed.length
        ? `Open with apology/update on missed follow-up: ${missed[0].slice(0, 100)}`
        : "Confirm goals for this meeting",
      commitments.length
        ? `Review open commitments with ${contact.name}`
        : "Review progress since last conversation",
      concerns.length
        ? `Address recurring concern: ${concerns[0].slice(0, 100)}`
        : "Uncover current blockers",
      "Align on pilot / next-step owners and dates",
      "Confirm attendees and materials for next touchpoint",
    ],
    questions: [
      missed.length
        ? "Does the delayed ROI one-pager still unblock your internal discussion?"
        : "What changed since we last spoke?",
      concerns.length
        ? "Has IT bandwidth improved enough to involve Jordan on a pilot timeline?"
        : "Who else needs to weigh in before a decision?",
      "What would make this meeting a clear go / no-go for the pilot?",
      "Any new security or compliance questions since SOC2 came up?",
      "What does a successful first 30 days look like for Ops?",
    ].slice(0, 5),
    timeline,
  };
}

function genericBrief(contact: Contact, meetings: Meeting[]): MeetingBrief {
  const brief = emptyBrief();
  brief.overview = `${contact.name} is ${contact.role} at ${contact.company}. No memory context used.`;
  brief.timeline = meetings
    .filter((m) => m.status === "logged")
    .map((m) => ({ date: m.date, summary: m.title }));
  brief.agenda = [
    "Rapport and meeting purpose",
    "Discovery questions on current process",
    "High-level product overview",
    "Identify stakeholders",
    "Propose generic next steps",
  ];
  brief.questions = [
    "What does your team work on day to day?",
    "What tools are you using today?",
    "What are your priorities this quarter?",
    "How do you usually evaluate vendors?",
    "When would you like to talk next?",
  ];
  brief.discussions = ["No prior discussion memory loaded (generic mode)."];
  brief.decisions = ["Unknown without memory."];
  brief.commitments = ["Unknown without memory."];
  brief.missedFollowUps = ["Unknown without memory."];
  brief.recurringConcerns = ["Unknown without memory."];
  brief.preferences = ["Using default AE prep template — not personalized."];
  return brief;
}

async function composeWithGroq(
  mode: "memory" | "generic",
  contact: Contact,
  meetings: Meeting[],
  facts: RecalledFact[]
): Promise<{ brief: MeetingBrief; memories: RecalledMemory[] }> {
  const groq = getGroq();
  if (!groq) {
    if (mode === "generic") {
      return { brief: genericBrief(contact, meetings), memories: [] };
    }
    const memories = heuristicMemories(facts, contact);
    return { brief: briefFromMemories(contact, meetings, memories), memories };
  }

  const meetingSummary = meetings
    .map(
      (m) =>
        `- ${m.date} | ${m.status} | ${m.title}` +
        (m.debrief
          ? `\n  discussed: ${m.debrief.discussed.slice(0, 180)}`
          : "")
    )
    .join("\n");

  const memoryBlock =
    mode === "memory"
      ? facts.map((f, i) => `[${i + 1}] ${f.text}`).join("\n")
      : "(intentionally empty — generic mode)";

  const system = `You are Briefed, a meeting prep agent for Maya (B2B AE).
Return ONLY valid JSON matching this schema:
{
  "brief": {
    "overview": string,
    "discussions": string[],
    "decisions": string[],
    "commitments": string[],
    "missedFollowUps": string[],
    "recurringConcerns": string[],
    "preferences": string[],
    "agenda": string[],
    "questions": string[],
    "timeline": [{"date": string, "summary": string}]
  },
  "memories": [{"id": string, "text": string, "whyRelevant": string, "section": one of ${BRIEF_SECTIONS.join("|")}}]
}
Rules:
- In memory mode, only assert facts supported by MEMORY FACTS. If unknown, say so briefly.
- In generic mode, produce a bland non-personalized brief and set memories to [].
- memories should be the most useful 5-8 facts with whyRelevant tied to today's prep.
- Keep bullets crisp for a 2-minute skim.`;

  const user = `MODE: ${mode}
CONTACT: ${contact.name} | ${contact.role} @ ${contact.company}
MEETINGS:
${meetingSummary || "(none)"}
MEMORY FACTS:
${memoryBlock}
Produce the meeting brief JSON.`;

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
    temperature: mode === "generic" ? 0.4 : 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as {
    brief?: MeetingBrief;
    memories?: RecalledMemory[];
  };

  if (mode === "generic") {
    return {
      brief: parsed.brief ?? genericBrief(contact, meetings),
      memories: [],
    };
  }

  const memories =
    parsed.memories?.length
      ? parsed.memories
      : heuristicMemories(facts, contact);
  const brief =
    parsed.brief ?? briefFromMemories(contact, meetings, memories);
  return { brief, memories };
}

export async function prepareMeeting(
  contact: Contact,
  mode: "memory" | "generic"
): Promise<PrepareResponse> {
  const meetings = listMeetings(contact.id);
  const provider = getMemoryProviderName();

  if (mode === "generic") {
    const { brief, memories } = await composeWithGroq(
      "generic",
      contact,
      meetings,
      []
    );
    return {
      mode,
      brief,
      memories,
      meta: {
        memoryProvider: provider,
        memoryCount: 0,
        meetingCount: meetings.length,
        contactName: contact.name,
      },
    };
  }

  const queryResults = await Promise.all(
    RECALL_QUERIES(contact).map(async (q) => {
      const { facts } = await recallMemories(q.query, contact.id);
      return facts.map((f) => ({ ...f, hintSection: q.section }));
    })
  );

  const flat = dedupeFacts(queryResults.flat());
  const { brief, memories } = await composeWithGroq(
    "memory",
    contact,
    meetings,
    flat
  );

  // Prefer section hints when composer omitted them
  const enriched = memories.map((m) => {
    if (m.section) return m;
    return m;
  });

  return {
    mode,
    brief,
    memories: enriched,
    meta: {
      memoryProvider: provider,
      memoryCount: flat.length,
      meetingCount: meetings.length,
      contactName: contact.name,
    },
  };
}
