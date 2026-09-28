# DEMO_SCRIPT.md — Briefed Judge Demo

**Product:** Briefed (Meeting Prep Agent)  
**Status note:** Live Hindsight retain/recall is **implemented in code** but **NOT VERIFIED end-to-end in this environment** until `HINDSIGHT_API_KEY` is set in `backend/.env`. Without the key, Start Ravi demo fails closed (no fake memory).

---

## 30-second elevator pitch

“Briefed prepares you for recurring meetings using Hindsight long-term relationship memory. It retains what was discussed, promised, and preferred, recalls that before the next meeting, and shows exactly which memories shaped your brief — so you don’t walk in cold or miss a commitment.”

---

## 2-minute judge demo script

### Before you start (30 seconds, off-camera)

1. Set `HINDSIGHT_API_KEY` (and ideally `GROQ_API_KEY`) in `backend/.env`
2. Restart backend: `cd backend && npm run dev`
3. Frontend: `cd frontend && npm run dev`
4. Open http://localhost:5173
5. Optional proof: `cd backend && npm run test:memory`

### Exact clicks + what to say

| Time | Action (click) | What to say |
|------|----------------|-------------|
| 0:00 | Point at homepage / Briefed title | “This is Briefed — meeting prep that remembers relationships, not just one transcript.” |
| 0:10 | Click **Start Ravi demo** | “I’ll load Ravi Sharma — a VP Engineering contact. Three past meetings will be retained into Hindsight.” |
| 0:25 | Wait for success banner | “That was **Hindsight retain** — not a fake UI label. The debriefs are pushed into our Hindsight bank tagged to Ravi.” |
| 0:35 | Point at **Demo Data** badge + timeline | “Here’s relationship history: cost concerns, a promised architecture doc that’s still open, two-week timeline preference.” |
| 0:50 | Point at **Relationship Memory** (or Refresh) | “This sidebar recalls from Hindsight for the selected contact.” |
| 1:00 | Point at memory flow strip | “Interaction → Retain → Long-term memory → Recall → Personalized brief. That’s why this isn’t a normal chatbot.” |
| 1:10 | Click **Prepare My Meeting** | “Now we prepare for the next meeting.” |
| 1:15 | Loading: “Recalling relationship memory…” | “This is **Hindsight recall** — contacting the memory bank for Ravi.” |
| 1:25 | Loading: “Preparing your meeting brief…” | “Then the backend passes recalled facts into the LLM to write the brief.” |
| 1:35 | Show **MEETING BRIEF** | “Personalized prep: concerns, open commitments, missed follow-ups, preferences, agenda, questions.” |
| 1:45 | Show **MEMORY USED** | “Proof of recall — each card is a Hindsight fact, why it’s relevant, and source when available.” |
| 1:55 | Point at **Without memory / With Hindsight** | “Without memory: generic advice. With Hindsight: cost, pending architecture doc, concise style — from recall, not hardcoded answers.” |

### Where retain happens

- **UI:** Start Ravi demo **or** Log debrief → Retain in Hindsight  
- **API:** `POST /api/demo/seed` or `POST /api/meetings/:id/debrief`  
- **Code:** `demoService.seedDemo` / `debriefService.submitDebrief` → `hindsightService.retainMemory` → `HindsightClient.retain`

### Where recall happens

- **UI:** Prepare My Meeting (memory mode); also Relationship Memory refresh  
- **API:** `POST /api/contacts/:id/prepare` `{ "mode": "memory" }`; `GET /api/contacts/:id/relationship-memory`  
- **Code:** `briefService.prepareMeeting` / `relationshipMemoryService` → `hindsightService.recallMemories` → `HindsightClient.recall`

### How to show the agent gets better with history

1. After the Ravi prepare, open the **upcoming** meeting → **Log debrief** (Fill Ravi sample optional) → **Retain in Hindsight**.  
2. Say: “New interaction retained — memory just grew.”  
3. Click **Prepare with updated memory** / Prepare My Meeting again.  
4. Say: “Recall now includes the newest debrief. That’s improvement over time — accumulate, then prepare.”

---

## Demo story beats (Ravi)

| Beat | Content |
|------|---------|
| PAST | Deployment cost concern; prefers concise technical explanations |
| PAST | Architecture document promised |
| PAST | Document still pending / unresolved; two-week timeline preference |
| NOW | Upcoming meeting |
| AGENT | Hindsight recall → brief |
| RESULT | Prep specific to Ravi, not generic “discuss project / ask timeline” |
