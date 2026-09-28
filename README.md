# Briefed

Meeting Prep Agent for the **Hindsight Hackathon**.

> Walk into every customer meeting knowing what you promised, what’s still open, and what they care about — because Hindsight remembers.

## Architecture

| Layer | Role |
|-------|------|
| **Hindsight** | Sole long-term memory (retain / recall). No mock memory. |
| **SQLite** (`backend/data/briefed.sqlite`) | Contacts + meetings metadata only |
| **Groq** (optional) | Meeting Brief prose composition |
| **React UI** | Prep, debrief, Memory Used, with/without memory compare |

Core loop: `Debrief → Hindsight retain → Prepare → Hindsight recall → Personalized brief`

## Setup

1. Get a Hindsight Cloud API key from [ui.hindsight.vectorize.io](https://ui.hindsight.vectorize.io).
2. Configure backend env:

```bash
cd backend
cp .env.example .env
# edit .env — set HINDSIGHT_API_KEY (required)
```

3. Install & run:

```bash
# from repo root
npm install
npm --prefix backend install
npm --prefix frontend install
npm run dev
```

- API: http://localhost:8787  
- UI: http://localhost:5173  

API keys stay on the server only — never in the Vite bundle.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `HINDSIGHT_API_KEY` | **Yes** | Hindsight Cloud auth |
| `HINDSIGHT_BASE_URL` | No | Default `https://api.hindsight.vectorize.io` |
| `HINDSIGHT_BANK_ID` | No | Default `briefed-maya` |
| `GROQ_API_KEY` | No | Better brief writing |
| `GROQ_MODEL` | No | Default `llama-3.3-70b-versatile` |
| `PORT` | No | Default `8787` |

## Judge demo (2–3 min)

1. Ensure `HINDSIGHT_API_KEY` is set; restart API.
2. Open http://localhost:5173
3. Click **Start Ravi demo** — creates Ravi + retains 3 meetings in Hindsight (banner: remembered).
4. Show **Relationship timeline** growing + **Relationship Memory** sidebar.
5. Click **Prepare My Meeting** — loading: “Recalling relationship memory…”
6. Show **MEETING BRIEF**, **MEMORY USED**, and **Without memory vs With Hindsight** (WITH side is real recall).
7. Point at the memory flow strip: Interaction → Retain → Long-term Memory → Recall → Brief.

## Test the Hindsight memory flow

```bash
# health
curl http://localhost:8787/api/health

# seed (retain Meeting 1 + 2)
curl -X POST http://localhost:8787/api/demo/seed

# personalized prepare (recall)
curl -X POST http://localhost:8787/api/contacts/contact-ravi-sharma/prepare \
  -H "Content-Type: application/json" -d "{\"mode\":\"memory\"}"

# generic compare
curl -X POST http://localhost:8787/api/contacts/contact-ravi-sharma/prepare \
  -H "Content-Type: application/json" -d "{\"mode\":\"generic\"}"
```

Or in the UI: create/log a debrief → retain → prepare → confirm recalled commitments appear.

## SQLite schema

- `contacts(id, name, company, role, email, notes, created_at)`
- `meetings(id, contact_id, title, date, status, debrief_json, hindsight_document_id, created_at)`

## Judge materials

| Doc | Purpose |
|-----|---------|
| [ARTICLE.md](./ARTICLE.md) | Technical article (content submission) |
| [SOCIAL_POST.md](./SOCIAL_POST.md) | Short technical social post |
| [VIDEO_SCRIPT.md](./VIDEO_SCRIPT.md) | 2–5 min demo video script |
| [THUMBNAIL_TEXT.md](./THUMBNAIL_TEXT.md) | Thumbnail titles + visual concept |
| [FINAL_SUBMISSION.md](./FINAL_SUBMISSION.md) | Final submission summary |
| [README_FINAL.md](./README_FINAL.md) | Final submission README |
| [SUBMISSION_DESCRIPTION.md](./SUBMISSION_DESCRIPTION.md) | Concise product description |
| [HINDSIGHT_INTEGRATION.md](./HINDSIGHT_INTEGRATION.md) | Exact retain/recall implementation map |
| [DEMO_DATA.md](./DEMO_DATA.md) | Ravi Sharma seeded scenario |
| [FINAL_SUBMISSION_CHECKLIST.md](./FINAL_SUBMISSION_CHECKLIST.md) | Submission gate checklist |
| [FINAL_PITCH.md](./FINAL_PITCH.md) | 30s / 60s pitches + problem–solution framing |
| [LIVE_DEMO_SCRIPT.md](./LIVE_DEMO_SCRIPT.md) | Exact timed 2-minute demo with real UI labels |
| [JUDGE_QUESTIONS.md](./JUDGE_QUESTIONS.md) | Q1–Q15 short technical answers |
| [ARCHITECTURE_EXPLANATION.md](./ARCHITECTURE_EXPLANATION.md) | Judge-friendly architecture walkthrough |
| [DEMO_BACKUP_PLAN.md](./DEMO_BACKUP_PLAN.md) | What to do if Hindsight/LLM/demo fails (no fakes) |
| [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) | Alternate demo script + elevator pitch |
| [JUDGE_QA.md](./JUDGE_QA.md) | Concise Q&A (shorter set) |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Implementation-mapped architecture |
| [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md) | Pre-demo verification checklist |
