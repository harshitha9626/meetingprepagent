# Hackathon Checklist — Briefed (Meeting Prep Agent)

## Problem

Account executives walk into recurring customer meetings without a reliable recall of what was promised, what was missed, and what the contact cares about. Generic AI prep does not remember the relationship.

## Solution

**Briefed** is a Meeting Prep Agent that retains meeting debriefs into **Hindsight**, recalls contact-scoped memories before the next meeting, and generates a personalized meeting brief — with a visible **Memory Used for This Meeting** panel so judges can see the memory, not just the copy.

## Hindsight Usage

| Moment | Operation | Where |
|--------|-----------|--------|
| Start Ravi demo / log debrief | **Retain** | `backend/src/services/hindsightService.ts` → `retainMemory` via `demoService` / `debriefService` |
| Prepare My Meeting | **Recall** | `briefService.prepareMeeting` → `recallMemories` (contact-tagged) |
| Relationship Memory sidebar | **Recall** | `relationshipMemoryService.getRelationshipMemory` |
| Bank setup | **createBank** | `ensureBank` with retain/reflect missions |

Hindsight is the only long-term relationship memory layer. SQLite stores contact/meeting **metadata** only.

## Memory Flow

```
Interaction (debrief / demo seed)
  → Hindsight Retain
  → Long-term Memory (bank)
  → Hindsight Recall (Prepare My Meeting)
  → Personalized Brief + Memory Used panel
```

## Demo

Exact 2-minute steps:

1. Ensure `HINDSIGHT_API_KEY` is set in `backend/.env`; restart API.
2. Open http://localhost:5173
3. Click **Start Ravi demo** — creates Ravi (Demo Data) and retains 3 meetings in Hindsight.
4. Show **Demo Data** badge, story card, **Relationship timeline**, **Relationship Memory**.
5. Point at the flow strip: Interaction → Retain → Long-term Memory → Recall → Brief.
6. Click **Prepare My Meeting** — loading: “Recalling relationship memory…” then “Preparing your meeting brief…”.
7. Show **MEETING BRIEF**, **MEMORY USED** (Recalled from Hindsight / Relevant to this meeting), and **Without memory vs With Hindsight**.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + TypeScript + Vite + Tailwind |
| Backend | Node.js + TypeScript + Express |
| LLM | Groq (optional; heuristic brief from recalled facts if unset) |
| Memory | Hindsight Cloud (`@vectorize-io/hindsight-client`) |
| Database | SQLite (`node:sqlite`) for contacts/meetings metadata |

## Environment Variables

Names only — never commit secret values:

- `HINDSIGHT_API_KEY` (required)
- `HINDSIGHT_BASE_URL`
- `HINDSIGHT_BANK_ID`
- `GROQ_API_KEY` (recommended)
- `GROQ_MODEL`
- `PORT`

## Known Limitations

- Live retain/recall requires a valid Hindsight Cloud API key; without it the app fails closed (no mock memory).
- One shared Hindsight bank per deployment; contacts are scoped with tags (`contact:{id}`), not separate banks.
- Demo reset clears SQLite only; re-seed upserts the same Hindsight `document_id`s.
- `whenLearned` depends on Hindsight returning temporal fields on recall results.
- Groq improves prose quality; without it the brief is still built from recalled Hindsight facts via heuristics.
