# HINDSIGHT_INTEGRATION.md — Actual implementation

Source of truth: `backend/src/services/hindsightService.ts`, `briefService.ts`, `debriefService.ts`, `demoService.ts`, `relationshipMemoryService.ts`, `routes/api.ts`, `index.ts`.

---

## Where Hindsight is initialized

| Piece | Location | Behavior |
|-------|----------|----------|
| Env load | `backend/src/index.ts` | `import "dotenv/config"` |
| Client singleton | `getHindsightClient()` in `hindsightService.ts` | Creates `new HindsightClient({ baseUrl, apiKey })` on first use |
| Bank ensure | `ensureBank()` | Calls `hs.createBank(bankId, { name, retainMission, reflectMission, enableObservations, disposition })` before retain/recall |

Package: `@vectorize-io/hindsight-client`.

---

## Authentication / API key handling

- Key read from `process.env.HINDSIGHT_API_KEY` (server-side only).
- `requireHindsightApiKey()` throws if empty, with `status: 503` and `code: "HINDSIGHT_NOT_CONFIGURED"`.
- `isHindsightConfigured()` / `healthCheck()` expose configuration status without leaking the key.
- Frontend never receives the API key; it only calls `/api/*`.

Base URL: `HINDSIGHT_BASE_URL` or default `https://api.hindsight.vectorize.io`.

---

## Memory bank / namespace

| Setting | Value |
|---------|--------|
| Env | `HINDSIGHT_BANK_ID` |
| Default | `briefed-maya` |
| Display name on create | `"Briefed — Maya Meeting Memory"` |

Contact scoping uses **tags**, e.g. `contact:{contactId}`, not separate banks per contact.

---

## Retain implementation

**Function:** `retainMemory(input)` in `hindsightService.ts`

**SDK call:**
```ts
await hs.retain(getBankId(), input.content, {
  context: input.context ?? "Meeting debrief for Briefed prep agent",
  timestamp: input.timestamp,
  documentId: input.documentId,
  tags, // default [`contact:${contactId}`]
  metadata: { contactId, meetingId, source: "briefed-debrief" },
});
```

**Content:** `formatDebriefContent(...)` — structured text with discussions, decisions, commitments, concerns/preferences (`seedData.ts`).

**Document IDs:** `meeting:{contactId}:{meetingId}`.

**Callers:**
- `demoService.seedDemo` — retains logged Meetings 1–3 for Ravi (extra tags `type:meeting-debrief`, `demo:seed`)
- `debriefService.submitDebrief` — retains one meeting after form submit

On failure: debug snapshot records error; error is rethrown (no silent mock retain).

---

## Recall implementation

**Function:** `recallMemories(query, contactId)` in `hindsightService.ts`

**Primary SDK call:**
```ts
await hs.recall(getBankId(), query, {
  budget: "mid",
  maxTokens: 3072,
  tags: [`contact:${contactId}`],
});
```

**Fallback (if tagged results empty):** second `recall` without tags, query appended with `(contact id ${contactId})`.

Results mapped to `{ id, text, whenLearned, documentId, context }`. Empty text filtered out.

**Prepare path:** `prepareMeeting(..., "memory")` runs three parallel queries (`RECALL_QUERIES` in `briefService.ts`), then `dedupeFacts`.

**Generic mode:** skips recall entirely (`recall.status: "skipped"`).

**Other recall caller:** `relationshipMemoryService.getRelationshipMemory` for the Relationship Memory UI.

On failure: error rethrown — prepare does not invent facts.

---

## Backend endpoints involved

| Method | Path | Hindsight usage |
|--------|------|-----------------|
| `GET` | `/api/health` | Reports `hindsightConfigured`, `bankId` (no network retain/recall) |
| `GET` | `/api/debug/memory` | Last retain/recall debug snapshot (no secrets) |
| `POST` | `/api/demo/seed` | Retain ×3 (Ravi logged meetings) |
| `POST` | `/api/meetings/:id/debrief` | Retain one debrief |
| `POST` | `/api/contacts/:id/prepare` | Recall (if `mode` ≠ `generic`) then compose brief |
| `GET` | `/api/contacts/:id/relationship-memory` | Recall for explorer |

`POST /api/demo/reset` clears **SQLite** only — does **not** delete Hindsight bank contents.

---

## How recalled memories reach the LLM

1. `prepareMeeting` collects `RecalledFact[]` from `recallMemories`.
2. `composeWithGroq` builds `memoryBlock` from those facts.
3. If `GROQ_API_KEY` is set, Groq chat completion receives:

   - System: JSON schema + rule “Memory mode: ONLY use HINDSIGHT MEMORY FACTS. Do not invent.”
   - User: contact metadata, meeting titles/dates, then section **`HINDSIGHT MEMORY FACTS:`** + numbered facts.

4. If Groq is unset or errors: `heuristicMemories` / `briefFromMemories` build the brief **from the same recalled facts** (`llmStatus`: `heuristic` or `error`).

Generic mode passes an empty memory block and instructs a non-personalized brief.

---

## How generated output uses those memories

| Output field | Role |
|--------------|------|
| `brief.*` | Skimmable prep sections (overview, commitments, missedFollowUps, recurringConcerns, preferences, agenda, questions, …) grounded on facts in memory mode |
| `memories[]` | Shown in **Memory Used** (`text`, `whyRelevant`, `section`, `whenLearned`, `documentId`) |
| `meta.memoryCount` | Count of recalled facts |
| `debug.recall` / `debug.llm` | Operator visibility |

UI components: `MeetingBriefView`, `MemoryUsedPanel`, `BeforeAfterCompare` (with side must come from a real `mode: "memory"` prepare response).

---

## Explicitly not claimed

- Hindsight **reflect** is configured on bank create (`reflectMission`) but **not** called on the prepare path.
- No custom REST wrappers beyond the official SDK `retain` / `recall` / `createBank`.
- Live Cloud retain/recall success in a given environment: **NOT VERIFIED** without a configured API key.
