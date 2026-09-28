# FINAL_SUBMISSION_CHECKLIST.md

Mark items after you verify them with your own credentials and machine.  
Items already checked against this workspace are noted; live Hindsight requires your API key.

---

## Application & demo

- [ ] Application runs (`npm run dev` — API :8787, UI :5173)
- [ ] Hindsight API key configured (`backend/.env` → `HINDSIGHT_API_KEY`)
- [ ] Hindsight retain verified (`Start Ravi demo` or debrief succeeds; `/api/debug/memory` retain ok)
- [ ] Hindsight recall verified (`Prepare My Meeting` → `meta.memoryCount > 0`)
- [ ] Recall affects generated preparation (brief / With Hindsight panel cite cost, architecture doc, prefs when recalled)
- [ ] Ravi demo works (contact, timeline, three logged + one upcoming)
- [ ] Memory Used section works (cards with **Recalled from Hindsight**)
- [ ] Live demo tested end-to-end under 2 minutes
- [ ] Demo video flow ready (optional recording following `LIVE_DEMO_SCRIPT.md`)

## Integrity (no fakes)

- [ ] No fake memory responses (code fails closed without key — verify in `hindsightService.ts`)
- [ ] No hardcoded recall pretending to be Hindsight (seed text is retain **input** only; brief from recall/heuristics on recall results)
- [ ] Error states work (missing key message; prepare/seed failure surfaces in UI)

## Docs & repository

- [ ] README complete (`README.md` and/or `README_FINAL.md`)
- [ ] Submission docs present: `SUBMISSION_DESCRIPTION.md`, `HINDSIGHT_INTEGRATION.md`, `DEMO_DATA.md`, this checklist
- [ ] Environment secrets excluded from Git (`.env` in `.gitignore`; confirm `backend/.env` never committed)
- [ ] No unnecessary files/secrets committed (`dist/`, `node_modules/`, `*.sqlite*` should be ignored)
- [ ] GitHub repository clean (remote exists, no secrets, README points to run/demo)

---

## Status in this Cursor environment (honesty)

| Check | Status |
|-------|--------|
| Production build (backend `tsc`, frontend Vite) | Previously verified pass — re-run before submit |
| `HINDSIGHT_API_KEY` | Was **EMPTY** → live retain/recall **NOT VERIFIED** here |
| Fake/mock memory path | Absent in code (good) |
| `.gitignore` includes `.env`, `*.sqlite*` | Present in repo `.gitignore` |
| GitHub remote / clean history | **NOT VERIFIED** — confirm before final submit |

---

## Pre-submit commands

```bash
# 1. Secrets
# Ensure backend/.env is local only and not staged

# 2. Health
curl http://localhost:8787/api/health
# expect hindsightConfigured: true

# 3. Memory flow
cd backend && npm run test:memory

# 4. Builds
npm run build:api
npm run build:web

# 5. Manual UI
# Start Ravi demo → Prepare My Meeting → Memory Used → optional debrief retain
```

## Sign-off

| Role | Name | Date | Notes |
|------|------|------|-------|
| Demo owner | | | Key set + live retain/recall OK |
| Repo owner | | | No `.env` in Git; README_FINAL linked |
