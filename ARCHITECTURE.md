# ARCHITECTURE.md — Actual Implementation

## End-to-end flow (as built)

```
User
  ↓
Meeting Prep UI  (frontend/ — React + Vite + Tailwind)
  ↓
Backend          (backend/ — Express + TypeScript orchestrator)
  ↓
Application Database  (SQLite via node:sqlite — contacts & meetings metadata)
  ↓
Hindsight RETAIN      (HindsightClient.retain)
  ↓
Hindsight Long-Term Memory  (Cloud bank: HINDSIGHT_BANK_ID / default briefed-maya)
  ↓
Hindsight RECALL      (HindsightClient.recall)
  ↓
LLM / Meeting Preparation  (Groq if GROQ_API_KEY set; else heuristic from recalled facts)
  ↓
Personalized Meeting Brief + Memory Used panel
  ↓
User
```

## What each layer stores / does

| Layer | Stores / does | Does NOT |
|-------|----------------|----------|
| **Frontend** | UI state, calls `/api/*` | Never holds Hindsight/Groq API keys |
| **Backend** | Orchestration, prompts, error handling | Not the system of record for relationship facts |
| **SQLite** (`backend/data/briefed.sqlite`) | Contacts, meeting titles/dates/status, debrief JSON, `hindsight_document_id` | Not vector search / long-term fact graph |
| **Hindsight** | Retained debrief documents → extracted memories; recall by query + tags | Not the contact list UI |
| **Groq** | Optional brief JSON generation from recalled facts | Not memory storage |

## Key code map

| Step | Implementation |
|------|----------------|
| Seed Ravi / retain ×3 | `POST /api/demo/seed` → `demoService.seedDemo` → `retainMemory` |
| Debrief update memory | `POST /api/meetings/:id/debrief` → `submitDebrief` → `retainMemory` |
| Retain SDK | `hindsightService.retainMemory` → `client.retain(bankId, content, { documentId, tags, … })` |
| Prepare + recall | `POST /api/contacts/:id/prepare` `{ mode: "memory" }` → `prepareMeeting` → `recallMemories` × N |
| Recall SDK | `hindsightService.recallMemories` → `client.recall(bankId, query, { tags: ["contact:…"] })` |
| Facts → LLM | `briefService.composeWithGroq` prompt section `HINDSIGHT MEMORY FACTS:` |
| Relationship explorer | `GET /api/contacts/:id/relationship-memory` → more recalls |
| Generic compare | `mode: "generic"` — **skips** Hindsight recall by design |

## Database vs Hindsight (clear split)

```
Application DB (SQLite)          Hindsight (Cloud bank)
─────────────────────────        ─────────────────────────────
Who is the contact?              What was discussed / decided?
Which meetings exist?            What was promised / missed?
Debrief form fields (copy)       Preferences & concerns as memories
UI timeline                      Searchable long-term recall
document_id pointer              Fact extraction & retrieval
```

## Honest gaps

- **Live retain/recall against Hindsight Cloud:** NOT VERIFIED in this workspace without `HINDSIGHT_API_KEY`.
- **Hindsight `reflect`:** not used on the prepare path.
- **Per-contact banks:** not implemented; isolation is via tags on one bank.
