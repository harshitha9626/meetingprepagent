# FINAL_CHECKLIST.md — Hackathon Judge Readiness

Mark items after you run them with your own keys.  
**In this Cursor environment:** build passes; live Hindsight is **NOT VERIFIED** (`HINDSIGHT_API_KEY` empty).

## Configuration

- [ ] Hindsight API key configured (`backend/.env` → `HINDSIGHT_API_KEY`)
- [ ] LLM API key configured if you want Groq prose (`GROQ_API_KEY`) — optional
- [ ] Backend running (`http://localhost:8787`)
- [ ] Frontend running (`http://localhost:5173`)

## Hindsight authenticity

- [ ] Retain works (`POST /api/demo/seed` or debrief succeeds) — **NOT VERIFIED without key**
- [ ] Recall works (`prepare` returns `meta.memoryCount > 0`) — **NOT VERIFIED without key**
- [ ] No fake/mock memory provider in code — **VERIFIED** (fails closed if key missing)
- [ ] No hardcoded final brief pretending to be recall — **VERIFIED** (seed text is retain *input*; brief uses recall/heuristics from recall results; generic mode intentionally empty of Hindsight)
- [ ] Meeting brief uses recalled information — **IMPLEMENTED**; live proof **NOT VERIFIED without key**
- [ ] Memory Used section works — **IMPLEMENTED** (populated from prepare `memories` when recall returns facts)

## Demo path

- [ ] Ravi demo works (Start Ravi demo) — UI ready; retain **NOT VERIFIED without key**
- [ ] Relationship timeline / history visible after seed
- [ ] Prepare My Meeting shows loading copy
- [ ] Memory Used section visible on prep view
- [ ] Generic vs personalized comparison works
- [ ] New debrief can retain again and re-prepare — **IMPLEMENTED**; live **NOT VERIFIED without key**
- [ ] Demo can be completed in under 2 minutes (with keys preconfigured)

## Quality / safety

- [ ] Error handling works (missing key shows friendly message) — **VERIFIED**
- [ ] No API keys in frontend bundle / UI — **VERIFIED** (keys only in backend `.env`)
- [ ] Build passes — **VERIFIED** (`tsc` + Vite production build)
- [ ] README explains Hindsight integration — **VERIFIED** (`README.md`, `HACKATHON_CHECKLIST.md`, `HACKATHON_DEMO.md`)
- [ ] Judge materials present — `DEMO_SCRIPT.md`, `JUDGE_QA.md`, `ARCHITECTURE.md`, this file
- [ ] GitHub repository is clean — **NOT VERIFIED** (no `origin` / push was configured earlier; confirm `.env` not committed)

## Pre-flight commands

```bash
cd backend
# edit .env — set HINDSIGHT_API_KEY
npm run build
npm run test:memory
npm run dev

cd ../frontend
npm run build
npm run dev
```

## Sign-off

| Check | Result in this environment |
|-------|----------------------------|
| TypeScript / production build | Pass |
| App starts | Pass (when servers running) |
| Hindsight retain live | **NOT VERIFIED** — key missing |
| Hindsight recall live | **NOT VERIFIED** — key missing |
| Fake memory path | Absent (good) |
