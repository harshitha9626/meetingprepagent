# Briefed — Hackathon Demo & Judge Material

**Product:** Briefed — Meeting Prep Agent  
**Core dependency:** Hindsight Cloud (long-term relationship memory)

---

# 1. One-Line Pitch

**Briefed prepares you for every meeting using Hindsight long-term relationship memory — so you walk in knowing what was promised, what was missed, and what this contact actually cares about.**

---

# 2. Problem

In real B2B work, the same contacts show up again and again. Between calls, people forget:

- What was discussed last time
- What they promised to send
- Which follow-ups slipped
- What this person prefers (concise notes, short timelines, cost sensitivity)

CRM notes and chat history exist, but preparing for the *next* meeting still means hunting through old threads. Without durable relationship memory, prep becomes generic or incomplete — and trust erodes when you miss a commitment.

This is not “chatbots forget chat context.” It is a **relationship operations** problem: recurring meetings need memory that compounds across interactions.

---

# 3. Solution

Briefed is a Meeting Prep Agent for one clear workflow:

1. Capture a post-meeting debrief (or load the Ravi demo).
2. **Retain** structured meeting facts into **Hindsight**.
3. Before the next meeting, **recall** contact-relevant memories from Hindsight.
4. Generate a **personalized meeting brief** grounded in those memories.
5. Show **Memory Used for This Meeting** so the recall is visible and auditable.

Application SQLite stores contacts and meeting metadata. **Hindsight stores the long-term relationship intelligence.**

---

# 4. Why Hindsight?

### Normal LLM

```
Conversation → response → context is lost
```

A prompt window is temporary. The next session starts cold unless you manually paste history.

### Our system

```
Interaction → Hindsight retain → long-term memory → Hindsight recall → personalized preparation
```

Hindsight is required because Briefed’s value is **cross-meeting memory**: extraction, searchable facts, contact-scoped retrieval (via tags), and reuse on a future prepare call — not a one-shot summary of a single transcript.

Without Hindsight, the product would be a normal prep chatbot. With Hindsight, meeting history becomes **relationship memory**.

---

# 5. Architecture

```
User
 ↓
Frontend (React + Vite)
 ↓
Backend / Agent Orchestrator (Express + TypeScript)
 ↓
 ┌──────────────────┬──────────────────┬──────────────────┐
 │                  │                  │                  │
 Hindsight          LLM (Groq)         Application DB
 Memory             Brief composer     (SQLite)
 │
 Retain / Recall
 ↓
Personalized Meeting Brief
+ Memory Used panel
 ↓
User
```

| Component | Role |
|-----------|------|
| **Frontend** | Contacts, timeline, Ravi demo, Prepare My Meeting, brief UI, Memory Used, before/after compare |
| **Backend orchestrator** | Validates input, formats debriefs, calls Hindsight retain/recall, calls Groq (optional), returns JSON |
| **Hindsight** | Long-term memory bank — retain meeting debriefs, recall by natural-language query + contact tags |
| **LLM (Groq)** | Turns recalled facts into a structured meeting brief; if unset, heuristics still use recalled facts |
| **SQLite** | Contacts, meeting titles/dates/status, debrief JSON, Hindsight document ids — **not** the memory brain |

---

# 6. Hindsight Memory Flow

1. **Meeting interaction is captured** — debrief form or seeded Ravi meetings.
2. **Important information is structured** — discussions, decisions, commitments, concerns/preferences in a retain payload (`formatDebriefContent`).
3. **Content is retained in Hindsight** — `HindsightClient.retain` with `documentId` + tags `contact:{id}`.
4. **A future prepare request triggers recall** — `POST /api/contacts/:id/prepare` with `mode: "memory"`.
5. **Relevant memories are retrieved** — multiple `recall` queries scoped by contact tags (with fallback if empty).
6. **The LLM uses those memories** — injected as `HINDSIGHT MEMORY FACTS` into the Groq prompt (or heuristic composition from the same facts).
7. **Personalized preparation is generated** — meeting brief + Memory Used list returned to the UI.

---

# 7. Ravi Demo

**Scenario already in code:** Ravi Sharma, VP Engineering @ Nimbus Retail. Three logged meetings retained into Hindsight; fourth upcoming for prep.

| Meeting | Story beats |
|---------|-------------|
| 1 | Deployment **cost** concern; prefers **concise technical** explanations; Maya promises an **architecture document** |
| 2 | Asks **deployment timeline**; architecture doc **still pending**; prefers **two-week** implementation |
| 3 | Raises **cost** again; architecture revisited; document commitment **still unresolved** |
| 4 (upcoming) | Target of **Prepare My Meeting** |

### 2-minute demo script (scenes)

**Scene 1 — Introduce Ravi**  
Open the app → **Start Ravi demo** → select Ravi (Demo Data badge).

**Scene 2 — Previous interactions**  
Show the **Relationship timeline** (three logged meetings + upcoming).

**Scene 3 — Retained**  
Point to the banner: Hindsight remembered the interactions / retained document count. Optionally open **Relationship Memory**.

**Scene 4 — Prepare**  
Click **Prepare My Meeting** → loading: “Recalling relationship memory…” → “Preparing your meeting brief…”.

**Scene 5 — Recalled memories**  
Open **Memory Used for This Meeting** — labels: Recalled from Hindsight, Relevant to this meeting, Open commitment / Learned previously.

**Scene 6 — Personalized brief**  
Walk MEETING BRIEF: contact, discussions, key concerns, open commitments, missed follow-ups, preferences, agenda, questions.

**Scene 7 — Compare**  
Show **Without memory** vs **With Hindsight**. WITH side must come from the real prepare(memory) response.

---

# 8. Judge Narration

Say something like this (natural tone):

> “This is Briefed — a meeting prep agent for people who meet the same customers repeatedly.  
>  
> Meet Ravi Sharma, a VP of Engineering evaluating our product. Across three past meetings he worried about deployment cost, asked for a two-week timeline, and we promised an architecture document that we still haven’t delivered.  
>  
> Those interactions weren’t just saved as notes in our app database. They were retained into Hindsight — long-term relationship memory.  
>  
> Now Ravi’s next meeting is coming up. When I click Prepare My Meeting, we don’t invent a generic agenda. We recall from Hindsight, then generate a brief grounded in what we actually remember — cost concerns, the pending architecture document, his preference for concise technical explanations.  
>  
> Here’s Memory Used for This Meeting — you can see each recalled fact and why it matters today.  
>  
> And here’s the contrast: without memory you get generic advice — discuss the project, ask about timeline. With Hindsight you get preparation that sounds like you’ve been in the room before.  
>  
> Meeting history becomes relationship memory — and that memory makes the next meeting better.”

---

# 9. Key Differentiator

**Meeting history becomes relationship memory.**

A summarizer compresses one meeting. Briefed **accumulates** commitments, misses, concerns, and preferences across meetings, **retrieves** what matters for the next one, and **shows** the evidence. The product is not “talk to a bot about meetings” — it is “walk into this meeting prepared because the agent remembers this relationship.”

---

# 10. Technical Stack

Inspected from the current repository:

| Layer | Actual technology |
|-------|-------------------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| Backend | Node.js, TypeScript, Express 5, Zod, dotenv, tsx |
| Memory | Hindsight Cloud via `@vectorize-io/hindsight-client` (^0.10.1) |
| LLM | Groq (`groq-sdk`), model default `llama-3.3-70b-versatile` (optional) |
| App DB | SQLite via Node built-in `node:sqlite` (`backend/data/briefed.sqlite`) |
| Demo UX | Vite proxy `/api` → `localhost:8787` |

---

# 11. Hindsight Proof

### Retain (actual)

| Path | Detail |
|------|--------|
| SDK | `HindsightClient.retain(bankId, content, { documentId, tags, timestamp, metadata, context })` |
| Wrapper | `backend/src/services/hindsightService.ts` → `retainMemory()` |
| Callers | `demoService.seedDemo()` — `POST /api/demo/seed`; `debriefService.submitDebrief()` — `POST /api/meetings/:id/debrief` |
| Bank | `createBank` / `ensureBank` in `hindsightService.ts` (`HINDSIGHT_BANK_ID`, default `briefed-maya`) |
| Contact association | Tags `contact:{contactId}` + contact identity in retain content |

### Recall (actual)

| Path | Detail |
|------|--------|
| SDK | `HindsightClient.recall(bankId, query, { budget, maxTokens, tags? })` |
| Wrapper | `hindsightService.ts` → `recallMemories()` |
| Prepare | `briefService.prepareMeeting(..., "memory")` — parallel recall queries then compose |
| Explorer | `relationshipMemoryService.getRelationshipMemory()` — `GET /api/contacts/:id/relationship-memory` |
| Endpoint | `POST /api/contacts/:id/prepare` with `{ "mode": "memory" }` |

### Recalled memories → LLM (actual)

| Path | Detail |
|------|--------|
| File | `backend/src/services/briefService.ts` → `composeWithGroq()` |
| Mechanism | User prompt section `HINDSIGHT MEMORY FACTS:` lists recalled fact texts/ids |
| API | `groq.chat.completions.create(...)` when `GROQ_API_KEY` is set |
| Fallback | If Groq is missing/fails: `heuristicMemories` / `briefFromMemories` still use **the same recalled facts** — not frontend hardcode |
| Generic mode | `mode: "generic"` skips Hindsight recall on purpose (comparison demo) |

**Not implemented:** Hindsight `reflect` is not used in the prepare path. There is **no** local/mock Hindsight fallback — missing `HINDSIGHT_API_KEY` fails closed.

---

# 12. Likely Judge Questions

**1. Why Hindsight?**  
Because we need durable, searchable relationship memory across meetings. A normal LLM session forgets; Hindsight retain/recall is the product’s core loop.

**2. Why not a normal database?**  
SQLite holds contacts and meeting metadata. Relationship facts need extraction, semantic/keyword/graph/temporal retrieval, and contact-scoped recall — which Hindsight provides. We do not store a second vector DB of our own.

**3. How does the agent learn?**  
Each debrief (or demo seed) is retained into Hindsight. Over meetings, facts about commitments, concerns, and preferences accumulate and surface on later recalls.

**4. What exactly is stored in memory?**  
Structured meeting debrief text (discussions, decisions, commitments, concerns/preferences). Hindsight extracts facts from that content. We pass `documentId` and tags; we do not claim to store raw private keys or full CRM dumps.

**5. How do you retrieve relevant memories?**  
On prepare, the backend runs several natural-language recall queries for the contact, primarily filtered by tag `contact:{id}`, then dedupes results.

**6. How do you prevent irrelevant memories?**  
Contact tags, contact name in queries, and brief prompts that say only use Hindsight facts. There is also an untagged fallback if tagged recall is empty — a known tradeoff for demo robustness.

**7. How is privacy handled?**  
API keys stay on the server. Frontend never receives Hindsight/Groq secrets. Demo data is labeled. Production multi-tenant isolation would need stricter bank/ACL design than this MVP.

**8. What happens when no memory exists?**  
Prepare can return zero recalled memories; the UI states that clearly. Generic mode shows non-personalized advice.

**9. What happens when Hindsight is unavailable?**  
Retain/prepare fail with a user-friendly configuration or connectivity error. We do not fake memories.

**10. How is the system scalable?**  
Orchestrator is a thin Node API; memory scale is delegated to Hindsight Cloud banks. App DB stays small (metadata). Deeper scale work: per-org banks, async retain, tighter tag filters.

**11. What is the real business value?**  
Fewer missed commitments, faster prep, higher trust in recurring customer conversations — especially for AEs handling many accounts.

**12. Who would use this?**  
Primary persona in this build: a B2B AE (Maya) preparing for customer meetings. Same pattern can extend to CSMs or founders with repeating stakeholder calls.

**13. How is this different from a meeting summarizer?**  
Summarizers compress one meeting. Briefed carries **open loops and preferences forward** and proves recall in the Memory Used panel.

**14. What happens after 50 or 100 meetings?**  
Hindsight continues to store/retrieve; observation consolidation (enabled on bank config) helps. We would add mental models per contact and stronger filtering — not yet built as product features in this MVP.

**15. What would you build next?**  
Calendar triggers, CRM sync as retain sources, per-user banks, commitment due-date tracking, and evaluation harnesses for with/without memory quality — without changing the retain→recall→brief core.

---

# 13. 30-Second Pitch

“Briefed is meeting prep that remembers. Before you meet a customer again, it recalls what you discussed, what you promised, and what they care about — using Hindsight as long-term memory — then gives you a personalized brief you can trust, with the memories shown on screen.”

---

# 14. 60-Second Pitch

“Every AE knows the pain: you walk into call three and can’t remember what you promised on call one. Notes exist, but prep is still manual. Briefed turns meeting debriefs into Hindsight relationship memory. When you prepare for the next meeting with someone like Ravi Sharma, we retain past interactions, recall cost concerns, pending architecture documents, and communication preferences, then generate a meeting brief grounded in those facts. Judges can see Memory Used for This Meeting — this isn’t a generic chatbot with a clever prompt. Meeting history becomes relationship memory, and that memory makes the next meeting better.”

---

# 15. Final Demo Checklist

```
[ ] Backend running (http://localhost:8787)
[ ] Frontend running (http://localhost:5173)
[ ] Hindsight API key configured (backend/.env → HINDSIGHT_API_KEY)
[ ] LLM API key configured (optional but recommended → GROQ_API_KEY)
[ ] Ravi demo data available (Start Ravi demo)
[ ] Hindsight retain tested (seed or debrief succeeds)
[ ] Hindsight recall tested (prepare memoryCount > 0)
[ ] Meeting brief generated
[ ] Memory Used section visible
[ ] Generic vs personalized comparison works
[ ] No API keys visible in UI or browser Network response bodies for secrets
[ ] Browser tabs cleaned
[ ] Screen recording ready (optional)
[ ] Run: cd backend && npm run test:memory
```

**Pre-demo command reminder**

```bash
# backend/.env must include HINDSIGHT_API_KEY
cd backend && npm run dev
cd frontend && npm run dev
```
