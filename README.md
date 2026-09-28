# Briefed

Meeting Prep Agent for the **Hindsight Hackathon**.

> Walk into every customer meeting knowing what you promised, what’s still open, and what they care about — because the agent remembers.

## What it is

**Briefed** helps a B2B AE (Maya) prepare for meetings by retaining debriefs into **Hindsight** and recalling them into a personalized **Meeting Brief**.

Core loop:

`Debrief → Hindsight retain → Prepare → Hindsight recall → Personalized brief + “What I Remember”`

## Stack

- Frontend: React + TypeScript + Vite + Tailwind
- Backend: Node.js + TypeScript + Express
- Memory: Hindsight (`@vectorize-io/hindsight-client`)
- LLM (optional): Groq for brief composition
- Local fallback memory when `MEMORY_PROVIDER=local` (offline demo)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API: `http://localhost:8787`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: `http://localhost:5173`

### 3. Environment

In `backend/.env`:

| Variable | Purpose |
|----------|---------|
| `HINDSIGHT_API_KEY` | Hindsight Cloud API key |
| `HINDSIGHT_BASE_URL` | Default `https://api.hindsight.vectorize.io` |
| `HINDSIGHT_BANK_ID` | Default `briefed-maya` |
| `MEMORY_PROVIDER` | `hindsight` or `local` |
| `GROQ_API_KEY` | Optional; improves brief writing |
| `GROQ_MODEL` | Default `llama-3.3-70b-versatile` |

For the hackathon demo, set real Hindsight credentials and `MEMORY_PROVIDER=hindsight` (or leave unset when `HINDSIGHT_API_KEY` is present).

## Demo flow (2–3 min)

1. Click **Load Priya demo** — seeds Priya Shah @ Acme with Meeting 1 + 2 retained.
2. Select Priya → **Prepare with memory** — show commitments, missed ROI one-pager, SOC2 / IT concerns.
3. Point to **What I Remember** (fact + why relevant).
4. Toggle **Without memory** — generic discovery brief.
5. Toggle **With memory** — personalized brief again.
6. Optional: open upcoming meeting → log a new debrief → prepare again to show improvement.

## API

- `GET /api/health`
- `GET/POST /api/contacts`
- `GET /api/contacts/:id`
- `POST /api/contacts/:id/meetings`
- `POST /api/contacts/:id/prepare` `{ "mode": "memory" | "generic" }`
- `POST /api/meetings/:id/debrief`
- `POST /api/demo/seed`
- `POST /api/demo/reset`

## Product notes

- Persona: Maya (B2B AE)
- Contact story: Priya Shah, VP Ops, Acme Corp
- Not a summarizer chatbot — value is long-term relationship memory via Hindsight
