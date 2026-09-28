// AI-Generated Code - 2026-09-28 - Composer

import Groq from "groq-sdk";
import type {
  BriefSection,
  Contact,
  Meeting,
  MeetingBrief,
  MemoryDebugInfo,
  PrepareResponse,
  RecalledMemory,
} from "../types.js";
import {
  listCommitments,
  listMeetings,
  listOpenCommitments,
} from "../store/db.js";
import {
  getBankId,
  patchMemoryDebug,
  recallMemories,
  type RecalledFact,
} from "./hindsightService.js";
import {
  buildMeetingInsights,
  buildRelationshipEvolution,
  buildWhatChanged,
} from "./prepInsightsService.js";

const BRIEF_SECTIONS: BriefSection[] = [
  "overview",
  "discussions",
  "decisions",
  "commitments",
  "missedFollowUps",
  "recurringConcerns",
  "preferences",
  "outcomes",
  "agenda",
  "questions",
  "timeline",
];

const RECALL_QUERIES = (contact: Contact) => [
  {
    query: `${contact.name} at ${contact.company}: relationship overview, prior discussions, and outcomes.`,
  },
  {
    query: `${contact.name}: open commitments, promises, pending actions, and missed follow-ups.`,
  },
  {
    query: `${contact.name}: recurring concerns, communication preferences, timelines, and important decisions.`,
  },
];

function emptyBrief(): MeetingBrief {
  return {
    overview: "No prior Hindsight memory yet for this contact.",
    discussions: [],
    decisions: [],
    commitments: [],
    missedFollowUps: [],
    recurringConcerns: [],
    preferences: [],
    outcomes: [],
    agenda: [
      "Confirm goals for this meeting",
      "Review open items",
      "Align on next steps",
    ],
    questions: [
      "What are your top priorities this quarter?",
      "Who else should be involved?",
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
  return facts.slice(0, 12).map((fact, idx) => {
    const text = fact.text.toLowerCase();
    let section: BriefSection = "discussions";
    let why = `Relevant background for preparing Maya's meeting with ${contact.name}.`;

    if (
      text.includes("missed") ||
      text.includes("pending") ||
      text.includes("not delivered") ||
      text.includes("still relevant") ||
      (text.includes("architecture") &&
        (text.includes("document") || text.includes("doc")))
    ) {
      if (
        text.includes("missed") ||
        text.includes("pending") ||
        text.includes("not delivered") ||
        text.includes("still")
      ) {
        section = "missedFollowUps";
        why = "Open or missed follow-up Maya should address up front.";
      } else {
        section = "commitments";
        why = "Commitment tied to this relationship.";
      }
    } else if (text.includes("promised") || text.includes("commitment")) {
      section = "commitments";
      why = "Open commitment tied to this relationship.";
    } else if (
      text.includes("cost") ||
      text.includes("concern") ||
      text.includes("worried")
    ) {
      section = "recurringConcerns";
      why = "Recurring concern likely to surface again.";
    } else if (
      text.includes("prefer") ||
      text.includes("concise") ||
      text.includes("two-week") ||
      text.includes("timeline")
    ) {
      section = "preferences";
      why = "Preference that should shape how Maya prepares and presents.";
    } else if (
      text.includes("decision") ||
      text.includes("agreed") ||
      text.includes("tentative")
    ) {
      section = "decisions";
      why = "Prior decision that should shape today's agenda.";
    } else if (
      text.includes("outcome") ||
      text.includes("result") ||
      text.includes("green-light") ||
      text.includes("pilot")
    ) {
      section = "outcomes";
      why = "Prior outcome that frames the next conversation.";
    } else if (idx < 2) {
      section = "overview";
      why = "Core relationship context.";
    }

    return {
      id: fact.id,
      text: fact.text,
      whyRelevant: why,
      section,
      whenLearned: fact.whenLearned ?? null,
      documentId: fact.documentId ?? null,
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
    summary: m.title,
  }));

  const missed = by("missedFollowUps");
  const commitments = by("commitments");
  const concerns = by("recurringConcerns");
  const prefs = by("preferences");
  const outcomes = by("outcomes");

  return {
    overview:
      by("overview")[0] ??
      `${contact.name}, ${contact.role} at ${contact.company}. Grounded in ${memories.length} Hindsight memories across ${logged.length} logged meeting(s).`,
    discussions: by("discussions").slice(0, 6),
    decisions: by("decisions").slice(0, 6),
    commitments: commitments.slice(0, 6),
    missedFollowUps: missed.slice(0, 6),
    recurringConcerns: concerns.slice(0, 6),
    preferences: prefs.slice(0, 6),
    outcomes: outcomes.slice(0, 6),
    agenda: buildSmartAgenda({
      contact,
      missed,
      concerns,
      commitments,
      prefs,
      decisions: by("decisions"),
      openDbCount: 0,
    }),
    questions: buildSuggestedQuestions({
      contact,
      missed,
      concerns,
      commitments,
      prefs,
      decisions: by("decisions"),
      outcomes,
    }),
    timeline,
  };
}

function buildSmartAgenda(input: {
  contact: Contact;
  missed: string[];
  concerns: string[];
  commitments: string[];
  prefs: string[];
  decisions: string[];
  openDbCount: number;
}): string[] {
  const agenda: string[] = [];
  if (input.missed.length || input.openDbCount > 0) {
    agenda.push(
      input.missed[0]
        ? `Lead with open/missed follow-up: ${input.missed[0].slice(0, 90)}`
        : `Review ${input.openDbCount} open commitment(s) with ${input.contact.name}`
    );
  } else {
    agenda.push("Confirm goals for this meeting");
  }
  if (input.concerns.length) {
    agenda.push(`Address recurring concern: ${input.concerns[0].slice(0, 90)}`);
  }
  if (input.decisions.length) {
    agenda.push(`Reconfirm prior decision: ${input.decisions[0].slice(0, 90)}`);
  }
  if (input.commitments.length && !input.missed.length) {
    agenda.push(`Review commitments with ${input.contact.name}`);
  }
  if (input.prefs.length) {
    const prefHint = input.prefs[0].slice(0, 80);
    agenda.push(`Adapt format to learned preference: ${prefHint}`);
  }
  agenda.push("Agree clear owners and next steps");
  return agenda.slice(0, 5);
}

function buildSuggestedQuestions(input: {
  contact: Contact;
  missed: string[];
  concerns: string[];
  commitments: string[];
  prefs: string[];
  decisions: string[];
  outcomes: string[];
}): string[] {
  const qs: string[] = [];
  if (input.missed.length || input.commitments.length) {
    qs.push(
      `Is the open item still blocking ${input.contact.name}: "${(input.missed[0] || input.commitments[0]).slice(0, 70)}"?`
    );
  } else {
    qs.push("What changed since we last spoke?");
  }
  if (input.concerns.length) {
    qs.push(
      `How should we address this concern today: "${input.concerns[0].slice(0, 70)}"?`
    );
  }
  if (input.prefs.length) {
    qs.push(
      `Does this preference still hold: "${input.prefs[0].slice(0, 70)}"?`
    );
  }
  if (input.decisions.length) {
    qs.push(
      `Has anything changed since we decided: "${input.decisions[0].slice(0, 70)}"?`
    );
  }
  if (input.outcomes.length) {
    qs.push(
      `Building on the last outcome, what should we lock next with ${input.contact.name}?`
    );
  }
  qs.push("What would make this meeting a clear next-step decision?");
  return qs.slice(0, 5);
}

function genericBrief(contact: Contact, meetings: Meeting[]): MeetingBrief {
  const brief = emptyBrief();
  brief.overview = `${contact.name} is ${contact.role} at ${contact.company}. No Hindsight memory used.`;
  brief.timeline = meetings
    .filter((m) => m.status === "logged")
    .map((m) => ({ date: m.date, summary: m.title }));
  brief.discussions = ["Discuss the project at a high level."];
  brief.decisions = ["No relationship decisions available without memory."];
  brief.commitments = ["No open commitments available without memory."];
  brief.missedFollowUps = ["No missed follow-ups available without memory."];
  brief.recurringConcerns = ["No key concerns available without memory."];
  brief.preferences = ["No learned preferences available without memory."];
  brief.outcomes = ["No prior outcomes available without memory."];
  brief.agenda = [
    "Discuss the project",
    "Ask about timeline",
    "Discuss requirements",
  ];
  brief.questions = [
    "What are you working on?",
    "What is your timeline?",
    "What do you need?",
  ];
  return brief;
}

async function composeWithGroq(
  mode: "memory" | "generic",
  contact: Contact,
  meetings: Meeting[],
  facts: RecalledFact[]
): Promise<{
  brief: MeetingBrief;
  memories: RecalledMemory[];
  llmStatus: MemoryDebugInfo["llm"];
}> {
  const groq = getGroq();
  if (!groq) {
    if (mode === "generic") {
      return {
        brief: genericBrief(contact, meetings),
        memories: [],
        llmStatus: { status: "skipped" },
      };
    }
    const memories = heuristicMemories(facts, contact);
    return {
      brief: briefFromMemories(contact, meetings, memories),
      memories,
      llmStatus: { status: "heuristic" },
    };
  }

  try {
    const meetingSummary = meetings
      .map((m) => `- ${m.date} | ${m.status} | ${m.title}`)
      .join("\n");

    const memoryBlock =
      mode === "memory"
        ? facts
            .map(
              (f, i) =>
                `[${i + 1}] id=${f.id}` +
                (f.whenLearned ? ` when=${f.whenLearned}` : "") +
                `\n${f.text}`
            )
            .join("\n\n")
        : "(empty — generic mode; do not invent relationship memory)";

    const system = `You are Briefed, Maya's meeting prep agent.
Return ONLY valid JSON:
{
  "brief": {
    "overview": string,
    "discussions": string[],
    "decisions": string[],
    "commitments": string[],
    "missedFollowUps": string[],
    "recurringConcerns": string[],
    "preferences": string[],
    "outcomes": string[],
    "agenda": string[],
    "questions": string[],
    "timeline": [{"date": string, "summary": string}]
  },
  "memories": [{"id": string, "text": string, "whyRelevant": string, "section": "${BRIEF_SECTIONS.join("|")}", "whenLearned": string|null}]
}
Rules:
- Memory mode: ONLY use HINDSIGHT MEMORY FACTS. Do not invent.
- Include open architecture-document commitments and deployment-cost concerns when present in facts.
- Generic mode: bland non-personalized brief; memories = [].
- Pick 5-8 most useful memories with whyRelevant for today's prep.
- Keep bullets skim-friendly.`;

    const user = `MODE: ${mode}
CONTACT: ${contact.name} | ${contact.role} @ ${contact.company}
MEETING METADATA (dates/titles only — not a substitute for Hindsight):
${meetingSummary || "(none)"}
HINDSIGHT MEMORY FACTS:
${memoryBlock}
Produce the meeting brief JSON.`;

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
      temperature: mode === "generic" ? 0.4 : 0.15,
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
        brief: {
          ...emptyBrief(),
          ...parsed.brief,
          outcomes: parsed.brief?.outcomes ?? ["Unknown without memory."],
        },
        memories: [],
        llmStatus: { status: "groq" },
      };
    }

    const fallback = heuristicMemories(facts, contact);
    const memories = (parsed.memories?.length ? parsed.memories : fallback).map(
      (m) => {
        const src = facts.find((f) => f.id === m.id);
        return {
          ...m,
          whenLearned: m.whenLearned ?? src?.whenLearned ?? null,
          documentId: src?.documentId ?? null,
        };
      }
    );
    const brief = {
      ...emptyBrief(),
      ...parsed.brief,
      outcomes: parsed.brief?.outcomes ?? [],
    };
    if (!parsed.brief) {
      return {
        brief: briefFromMemories(contact, meetings, memories),
        memories,
        llmStatus: { status: "groq" },
      };
    }
    return { brief, memories, llmStatus: { status: "groq" } };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (mode === "generic") {
      return {
        brief: genericBrief(contact, meetings),
        memories: [],
        llmStatus: { status: "error", error: message },
      };
    }
    const memories = heuristicMemories(facts, contact);
    return {
      brief: briefFromMemories(contact, meetings, memories),
      memories,
      llmStatus: { status: "error", error: message },
    };
  }
}

function finalizePrepare(
  contact: Contact,
  mode: "memory" | "generic",
  meetings: Meeting[],
  brief: MeetingBrief,
  memories: RecalledMemory[],
  debug: MemoryDebugInfo,
  memoryCount: number
): PrepareResponse {
  const openCommitments = listOpenCommitments(contact.id);
  const allCommitments = listCommitments(contact.id);
  // Enrich agenda lead item with structured open commitments when memory brief is thin
  if (mode === "memory" && openCommitments.length > 0) {
    const lead = `Review ${openCommitments.length} open commitment(s): ${openCommitments[0].description.slice(0, 80)}`;
    if (!brief.agenda.some((a) => /open commitment/i.test(a))) {
      brief.agenda = [lead, ...brief.agenda].slice(0, 5);
    }
  }
  return {
    mode,
    brief,
    memories,
    openCommitments,
    whatChanged: buildWhatChanged(meetings, allCommitments, memories),
    insights: buildMeetingInsights(
      contact,
      meetings,
      allCommitments,
      memories
    ),
    evolution: buildRelationshipEvolution(
      meetings,
      allCommitments,
      memories
    ),
    meta: {
      memoryProvider: "hindsight",
      memoryCount,
      meetingCount: meetings.length,
      contactName: contact.name,
    },
    debug,
  };
}

export async function prepareMeeting(
  contact: Contact,
  mode: "memory" | "generic"
): Promise<PrepareResponse> {
  const meetings = listMeetings(contact.id);
  const baseDebug: MemoryDebugInfo = {
    bankId: getBankId(),
    contactId: contact.id,
    contactName: contact.name,
  };

  if (mode === "generic") {
    patchMemoryDebug({
      ...baseDebug,
      recall: {
        status: "skipped",
        queryCount: 0,
        memoryCount: 0,
        at: new Date().toISOString(),
      },
    });
    const { brief, memories, llmStatus } = await composeWithGroq(
      "generic",
      contact,
      meetings,
      []
    );
    const debug: MemoryDebugInfo = {
      ...baseDebug,
      recall: {
        status: "skipped",
        queryCount: 0,
        memoryCount: 0,
        at: new Date().toISOString(),
      },
      llm: llmStatus,
    };
    patchMemoryDebug(debug);
    return finalizePrepare(
      contact,
      mode,
      meetings,
      brief,
      memories,
      debug,
      0
    );
  }

  // Memory mode: MUST recall from Hindsight before composing
  patchMemoryDebug({
    ...baseDebug,
    recall: {
      status: "ok",
      queryCount: 0,
      memoryCount: 0,
      at: new Date().toISOString(),
    },
  });

  let flat: RecalledFact[] = [];
  try {
    const queryResults = await Promise.all(
      RECALL_QUERIES(contact).map(async (q) => {
        const { facts } = await recallMemories(q.query, contact.id);
        return facts;
      })
    );
    flat = dedupeFacts(queryResults.flat());
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const debug: MemoryDebugInfo = {
      ...baseDebug,
      recall: {
        status: "error",
        queryCount: RECALL_QUERIES(contact).length,
        memoryCount: 0,
        error: message,
        at: new Date().toISOString(),
      },
      llm: { status: "skipped" },
    };
    patchMemoryDebug(debug);
    throw err;
  }

  const { brief, memories, llmStatus } = await composeWithGroq(
    "memory",
    contact,
    meetings,
    flat
  );

  const debug: MemoryDebugInfo = {
    ...baseDebug,
    recall: {
      status: "ok",
      queryCount: RECALL_QUERIES(contact).length,
      memoryCount: flat.length,
      at: new Date().toISOString(),
    },
    llm: llmStatus,
  };
  patchMemoryDebug(debug);

  return finalizePrepare(
    contact,
    mode,
    meetings,
    brief,
    memories,
    debug,
    flat.length
  );
}
