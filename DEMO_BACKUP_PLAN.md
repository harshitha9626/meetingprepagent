# DEMO_BACKUP_PLAN.md — Failures without faking Hindsight

**Rule:** Never invent recalled memories, hardcode a “fake” brief as Hindsight output, or switch to a mock memory provider. The app fails closed by design.

---

## 1. Hindsight API fails (network, 5xx, SDK error)

**What the app does today**  
Seed, debrief retain, prepare (memory mode), and relationship-memory calls throw. API returns a friendly error (e.g. could not reach Hindsight). UI shows the error string via `friendlyClientError`.

**What you do on stage**
1. Stay calm: “Hindsight is the memory layer — we fail closed rather than invent facts.”  
2. Show the error briefly (proves authenticity).  
3. Retry once.  
4. If still down: switch to **architecture explanation** (`ARCHITECTURE_EXPLANATION.md`) + **Q&A** (`JUDGE_QUESTIONS.md`) + screenshots/video if you prepared them offline.

**NOT IMPLEMENTED:** Offline Hindsight mock, cached fake recall for demos.

---

## 2. API key is missing

**What the app does today**  
`requireHindsightApiKey()` throws `HINDSIGHT_NOT_CONFIGURED` (503). Message: add `HINDSIGHT_API_KEY` to `backend/.env` and restart. `/api/health` reports `hindsightConfigured: false`.

**What you do on stage**
1. Do not start the timed demo until health shows configured.  
2. If discovered live: open `.env`, paste key, **restart backend**, re-run **Start Ravi demo**.  
3. Narrate: “No key means no memory — by design for this hackathon.”

**NOT IMPLEMENTED:** Demo mode that bypasses Hindsight.

---

## 3. Recall returns no memories (`memoryCount === 0`)

**What the app does today**  
Prepare can still return a brief; status: *“No relevant memories were recalled…”* Memory Used shows empty state. With Hindsight compare panel will not invent points from empty recall. Possible causes: retain not finished indexing, wrong contact, bank empty, tag mismatch.

**What you do on stage**
1. Say: “Recall returned empty — we won’t invent Ravi’s cost concern.”  
2. Re-run **Start Ravi demo** or **Retain in Hindsight**, wait ~10–20s, **Prepare My Meeting** again.  
3. Open **Relationship Memory** → **Refresh** to see if facts appear.  
4. If still empty: explain retain path from code and use Q&A; do not paste fake Memory Used cards.

---

## 4. LLM generation fails (or `GROQ_API_KEY` unset)

**What the app does today**  
If Groq is missing: brief built with **heuristics from recalled Hindsight facts** (`llmStatus: "heuristic"`). If Groq errors: same heuristic fallback (`llmStatus: "error"`); UI may say brief used fallback composition. Memory still comes from recall.

**What you do on stage**
1. Continue the demo — Memory Used and recalled facts still prove Hindsight.  
2. Say: “The writer fell back to heuristics; the memory is still from Hindsight recall.”  
3. Optional: point at Debug Panel `llm` status.

**NOT IMPLEMENTED:** Separate “fake LLM” story that pretends Groq succeeded.

---

## 5. Demo data does not load (**Start Ravi demo** fails)

**What the app does today**  
`seedDemo` resets SQLite, creates Ravi + meetings, then **must retain** each past meeting. If retain fails, the whole seed fails — you do not get a half-fake Ravi with pretend memory.

**What you do on stage**
1. Check `/api/health` → `hindsightConfigured`.  
2. Confirm backend is on port 8787; frontend proxy works.  
3. Retry **Start Ravi demo**.  
4. Fallback narrative: walk **Log debrief → Retain in Hindsight** for one meeting if contacts already exist from a partial prior run; or create contact manually then debrief (still requires Hindsight for retain).  
5. If Hindsight is down entirely: pitch + architecture + Q&A only.

---

## Pre-demo 60-second checklist

```text
[ ] backend/.env has HINDSIGHT_API_KEY
[ ] curl http://localhost:8787/api/health → hindsightConfigured: true
[ ] Optional: npm run test:memory in backend
[ ] Optional warm seed: Start Ravi demo once; confirm Memory Used after Prepare
[ ] Groq optional but nicer prose
[ ] Browser on http://localhost:5173
[ ] LIVE_DEMO_SCRIPT.md open on a second screen
```

## Honest capability marks

| Capability | Status |
|------------|--------|
| Real Hindsight retain/recall in code | Implemented |
| Fail closed without key / on Hindsight error | Implemented |
| Heuristic brief if LLM fails (still needs recall facts for memory mode value) | Implemented |
| Mock / fake Hindsight for backup demo | **NOT IMPLEMENTED** (intentional) |
| Reset clears Hindsight Cloud bank | **NOT IMPLEMENTED** (reset clears SQLite only) |
