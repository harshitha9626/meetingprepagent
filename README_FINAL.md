# README_FINAL.md — Briefed (Meeting Prep Agent)

## Project name

**Briefed**

## One-line description

Meeting Prep Agent that retains relationship context in Hindsight and recalls it to generate a personalized brief for the next meeting.

## Problem

People repeatedly meet the same contacts but lose important relationship context — discussions, promises, missed follow-ups, recurring concerns, and preferences. Generic prep (“discuss the project / ask about timeline”) does not prevent cold restarts or missed commitments.

## Solution

Briefed captures a structured post-meeting debrief, **retains** it in Hindsight as long-term memory, then **recalls** relevant facts before the next meeting and composes a personalized Meeting Brief. A **Memory Used** panel shows which recalled facts shaped the prep.

## Key features

- Contact + meeting timeline (SQLite metadata)
- Post-meeting debrief form → Hindsight retain
- **Start Ravi demo** — seeds Ravi Sharma and retains three past meetings
- **Prepare My Meeting** — Hindsight recall → brief composition
- **Memory Used** — evidence of recalled facts
- **With Hindsight** / **Without memory** comparison
- **Relationship Memory** explorer for the selected contact
- Optional Groq LLM for brief prose; heuristic fallback from recalled facts if Groq is unset or fails
- Fails closed when `HINDSIGHT_API_KEY` is missing (no mock memory)

## Why Hindsight is important

Hindsight is the **only** long-term memory layer. Relationship intelligence is not stored as a second custom vector DB or fake in-app memory. Without Hindsight, Briefed cannot retain or recall — and will not pretend to.

## Architecture

```
User → React UI → Express API → SQLite (contacts/meetings)
                              → Hindsight retain → Cloud bank
                              → Hindsight recall → facts
                              → Groq / heuristics → Meeting Brief + Memory Used
```

See `ARCHITECTURE.md` / `ARCHITECTURE_EXPLANATION.md` for detail.

## Hindsight retain / recall flow

1. **Retain:** Debrief or demo seed → `retainMemory` → `HindsightClient.retain` into bank (default `briefed-maya`), tags `contact:{id}`.
2. **Recall:** Prepare (memory mode) → parallel contact-focused queries → `recallMemories` → `HindsightClient.recall`.
3. **Use:** Recalled facts injected as `HINDSIGHT MEMORY FACTS` into the LLM prompt (or heuristic brief builder).
4. **Show:** Response includes `brief` + `memories` for the Memory Used UI.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TypeScript, Tailwind |
| Backend | Node.js, Express, TypeScript |
| App DB | SQLite (`node:sqlite`) |
| Memory | Hindsight Cloud (`@vectorize-io/hindsight-client`) |
| LLM (optional) | Groq (`llama-3.3-70b-versatile` default) |

## How to run locally

```bash
# from repo root
npm install
npm --prefix backend install
npm --prefix frontend install

cd backend
cp .env.example .env
# set HINDSIGHT_API_KEY (required)

cd ..
npm run dev
```

- API: http://localhost:8787  
- UI: http://localhost:5173  

Optional memory-flow test (requires key):

```bash
cd backend && npm run test:memory
```

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `HINDSIGHT_API_KEY` | **Yes** | Hindsight Cloud authentication |
| `HINDSIGHT_BASE_URL` | No | Default `https://api.hindsight.vectorize.io` |
| `HINDSIGHT_BANK_ID` | No | Default `briefed-maya` |
| `GROQ_API_KEY` | No | Better brief prose |
| `GROQ_MODEL` | No | Default `llama-3.3-70b-versatile` |
| `PORT` | No | Default `8787` |

Keys stay on the server (`backend/.env`). Never ship them in the Vite bundle.

## Demo scenario

**Ravi Sharma** (VP Engineering, Nimbus Retail) evaluating FlowOps:

1. Click **Start Ravi demo** — creates contact + meetings; retains Meetings 1–3 into Hindsight.
2. Review **Relationship timeline** and **Relationship Memory**.
3. Click **Prepare My Meeting** — progress: “Recalling relationship memory…”
4. Show **MEETING BRIEF**, **MEMORY USED**, and **Without memory** / **With Hindsight**.

Expected themes in recall (when Hindsight returns facts): deployment cost concern, pending architecture document, concise technical preference, two-week timeline. Exact wording is **dynamically recalled**, not hardcoded as the brief answer.

Full scenario: `DEMO_DATA.md`. Script: `LIVE_DEMO_SCRIPT.md`.

## Known limitations

- Live retain/recall require a valid Hindsight API key — **NOT VERIFIED** in environments where the key is empty.
- Single shared bank with contact **tags** for scoping (not per-tenant banks).
- Demo **reset** clears SQLite app data only — does **not** wipe the Hindsight Cloud bank.
- Tag-filtered recall may fall back to a broader query if empty (tradeoff).
- Brief quality depends on Hindsight extraction timing after retain and optional Groq availability.

## Future improvements

- Per-org / per-user Hindsight banks
- Calendar-triggered prepare
- CRM as a retain source
- Commitment due dates and nudges
- Evaluation of with/without-memory brief quality

These are **not implemented** in the current MVP.
