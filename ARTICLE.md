# Meeting Prep That Remembers Across Conversations

I built Briefed because relationship context keeps disappearing between meetings.

I work with recurring B2B conversations—the same VP Engineering, the same evaluation thread, weeks apart. After meeting one, everyone “knows” the customer cares about deployment cost and wants a concise architecture write-up. By meeting three, that knowledge is scattered across notes, Slack, and memory. Someone walks in cold. An open promise goes unmentioned. The customer has to re-explain themselves.

That is the problem Briefed solves: **not summarizing one call, but carrying meaningful relationship state into the next one.**

## Why ordinary meeting summaries are not enough

Meeting summarizers are good at compressing a transcript into bullets for the meeting you just finished. They answer: *What happened in this hour?*

They do not reliably answer: *What is still open with this person? What did we promise? What do they hate about how we present?* Those questions span meetings. A summary of meeting two that never mentions the architecture document from meeting one—because it was not discussed that day—leaves the most important open loop invisible.

I did not want another “recap this Zoom” tool. I wanted a **meeting prep agent** whose behavior changes as interactions accumulate.

## Design decision: Hindsight as long-term agent memory

The architecture splits two concerns deliberately:

- **Application database (SQLite)** holds structured metadata: contacts, meeting titles, dates, status, and a copy of the debrief form for the UI.
- **Hindsight** holds long-term agent memory: retain debriefs, extract/search facts, recall by query and contact tags.

I considered stuffing everything into SQL and prompting an LLM with “all past notes.” That works for a demo with three meetings and falls apart as noise grows. I also refused a fake in-app memory layer that returns canned Ravi facts. If the API key is missing, Briefed fails closed. No mock recall. No hardcoded brief pretending to be memory.

Hindsight is therefore not a badge on the landing page—it is the only place relationship intelligence lives across sessions.

## How the agent retains meaningful interaction information

After a meeting, the user fills a short debrief: what was discussed, decisions, commitments, concerns and preferences. The backend formats that into a structured document and calls Hindsight retain, keyed by `meeting:{contactId}:{meetingId}` and tagged `contact:{id}`.

Here is the real retain path from the current backend:

```typescript
// backend/src/services/hindsightService.ts
await hs.retain(getBankId(), input.content, {
  context: input.context ?? "Meeting debrief for Briefed prep agent",
  timestamp: input.timestamp,
  documentId: input.documentId,
  tags,
  metadata: {
    contactId: input.contactId,
    meetingId: input.meetingId,
    source: "briefed-debrief",
  },
});
```

For the Ravi Sharma demo scenario, three logged meetings are retained the same way: discovery (cost concern + architecture-doc promise), timeline follow-up (two-week preference + document still pending), and cost checkpoint (recurring cost + open document). Those strings are **retain inputs**, not fake recall outputs. Meeting four stays upcoming until someone prepares for it.

## How a later meeting recalls relevant memories

When the user clicks **Prepare My Meeting**, the backend runs memory-mode prepare: several contact-focused recall queries in parallel, each calling Hindsight `recall` with `tags: ["contact:{id}"]`. Facts are deduped, then passed into brief composition.

If Groq is configured, the LLM sees a block labeled `HINDSIGHT MEMORY FACTS` and is instructed to use only those facts—not invent relationship history. If Groq is unset or fails, a heuristic builder still shapes the brief from the **same recalled facts**. Generic mode skips recall on purpose so we can show the contrast.

The UI surfaces proof in **MEMORY USED**: each card is a recalled fact, why it matters for today’s prep, and source/interaction when available. That panel is how I keep myself honest—if recall is empty, the UI says so instead of inventing Ravi’s cost concern.

## Before memory vs after memory

The product includes an explicit side-by-side.

**Without memory** (prepare with Hindsight recall skipped):

- Discuss the project at a high level  
- Ask about timeline  
- Discuss requirements  

Useful to no one who has already met Ravi three times.

**With Hindsight** (after retain + successful recall):

Preparation is grounded in recalled themes from the relationship—deployment cost sensitivity, a still-open architecture document commitment, preference for concise technical explanations, interest in a two-week pilot window. Exact wording depends on what Hindsight returns; the agent does not paste a hardcoded “final answer.” The **MEETING BRIEF** sections (overview, missed follow-ups, concerns, preferences, agenda, questions) and the **Memory Used** list should move together: if a fact appears in Memory Used, it should be allowed to influence the brief; if recall returns nothing, we do not pretend.

That behavioral change—generic advice versus relationship-specific prep—is the entire product thesis.

## Tech stack

- **Frontend:** React, Vite, TypeScript, Tailwind  
- **Backend:** Node.js, Express, TypeScript  
- **App data:** SQLite  
- **Long-term memory:** Hindsight Cloud via `@vectorize-io/hindsight-client` (`retain` / `recall`, bank id default `briefed-maya`)  
- **Optional prose:** Groq (`llama-3.3-70b-versatile` by default)

API keys stay on the server. The browser never talks to Hindsight directly.

## Honest limitation / lesson learned

The hardest lesson was resisting the urge to “make the demo always pretty.” Early instincts say: if recall is empty, show the seeded story anyway. That would have been a fake memory system with Hindsight branding. Instead, empty recall is an empty **Memory Used** panel and a clear status message. Live retain/recall quality also depends on a configured API key and on Hindsight having extracted facts after retain—something you must verify in your environment (**NOT VERIFIED** here without a key). Tag-based contact scoping on a shared bank is good enough for an MVP and not a multi-tenant memory ACL.

I would rather show a failed closed system than a confident lie. The agent only gets better when interactions are actually retained and later actually recalled—and the UI shows the receipts.
