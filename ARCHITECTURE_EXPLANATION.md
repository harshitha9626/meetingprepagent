# ARCHITECTURE_EXPLANATION.md — Judge-friendly

## One diagram (actual product)

```
User
  ↓
Frontend          (React + Vite — Briefed UI)
  ↓
Backend / API     (Express + TypeScript)
  ↓
Application Database   (SQLite — contacts & meetings)
  ↓
Hindsight RETAIN       (HindsightClient.retain)
  ↓
Long-term Agent Memory (Hindsight Cloud bank)
  ↓
Hindsight RECALL       (HindsightClient.recall)
  ↓
LLM                    (Groq if configured; else heuristic from recalled facts)
  ↓
Personalized Meeting Brief (+ Memory Used panel)
```

## Three kinds of data (keep these separate when talking to judges)

### 1. Structured application data — SQLite

**What:** Who the contact is, which meetings exist, titles, dates, status (`logged` / `upcoming`), raw debrief form fields, pointer `hindsight_document_id`.

**Why:** Power the UI list, timeline, and forms. Fast local CRUD.

**Not:** Vector search or durable relationship “intelligence.”

### 2. Long-term agent memory — Hindsight

**What:** Retained debrief documents; Hindsight extracts searchable memories/facts. Scoped with tags like `contact:{id}` in bank `briefed-maya` (or `HINDSIGHT_BANK_ID`).

**Why:** Remember across sessions and meetings. Sole memory provider in code — no mock store.

**APIs used in code:** SDK `retain` and `recall` (via `hindsightService.retainMemory` / `recallMemories`). Bank ensured with `createBank`.

### 3. Generated meeting preparation — Brief + Memory Used

**What:** Meeting Brief sections (overview, discussions, decisions, commitments, missed follow-ups, concerns, preferences, agenda, questions, …) plus Memory Used cards listing recalled facts.

**How:** Recalled facts → Groq prompt (or heuristic composer) → JSON brief. Generic mode skips recall to show the contrast.

## Request paths (names from the codebase)

| User action | API | Memory step |
|-------------|-----|-------------|
| **Start Ravi demo** | `POST /api/demo/seed` | Retain × past meetings |
| **Retain in Hindsight** | `POST /api/meetings/:id/debrief` | Retain one debrief |
| **Prepare My Meeting** | `POST /api/contacts/:id/prepare` `{ "mode": "memory" }` | Recall → compose |
| **Without memory** | same prepare with `{ "mode": "generic" }` | Recall skipped |
| **Relationship Memory** | `GET /api/contacts/:id/relationship-memory` | Recall for explorer |

## Simple analogy for judges

- **SQLite** = filing cabinet of contact cards and meeting dates  
- **Hindsight** = the agent’s long-term memory of what happened with each person  
- **LLM** = the writer that turns recalled memories into a skimmable brief  

If Hindsight is missing, Briefed refuses to pretend it remembers.
