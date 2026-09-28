# FINAL_SUBMISSION.md

## Project name

**Briefed** (Meeting Prep Agent)

## One-line pitch

Meeting Prep Agent that retains relationship context in Hindsight and recalls it to personalize the next meeting brief.

## Problem

Relationship context gets lost across repeated meetings—promises, concerns, preferences, and open loops—so people restart cold or miss commitments. One-shot meeting summaries do not carry that state forward.

## Solution

Structured post-meeting debriefs are retained in Hindsight. Before the next meeting, Briefed recalls contact-relevant memories and generates a personalized Meeting Brief, with a **Memory Used** panel showing which facts influenced prep. Generic prepare mode skips recall for a real before/after.

## Target user

Account executives, customer success, founders, and others who run recurring B2B meetings with the same contacts.

## Key features

- Contacts + relationship timeline (SQLite metadata)
- Debrief → **Retain in Hindsight**
- **Start Ravi demo** (seed + retain Meetings 1–3)
- **Prepare My Meeting** (Hindsight recall → brief)
- **MEMORY USED** evidence panel
- **With Hindsight** / **Without memory** comparison
- **Relationship Memory** explorer
- Optional Groq prose; heuristic fallback from recalled facts
- Fails closed without `HINDSIGHT_API_KEY` (no mock memory)

## Hindsight's role

Sole long-term agent memory. Application DB does not replace it. SDK: `createBank`, `retain`, `recall` via `@vectorize-io/hindsight-client`. Bank default `briefed-maya`; contact tags `contact:{id}`.

## Tech stack

React + Vite + TypeScript + Tailwind · Express + TypeScript · SQLite · Hindsight Cloud · optional Groq

## Demo flow

1. **Start Ravi demo** → retain history  
2. Show **Relationship timeline** / **Relationship Memory**  
3. Optional: **Log debrief → retain** → **Retain in Hindsight**  
4. **Prepare My Meeting** → **Recalling relationship memory…**  
5. Show **MEETING BRIEF** + **MEMORY USED** + without/with compare  

Scripts: `LIVE_DEMO_SCRIPT.md`, `VIDEO_SCRIPT.md`. Data: `DEMO_DATA.md`.

## GitHub requirements

- Public repo with clear README (`README.md` / `README_FINAL.md`)
- How to run + env vars documented
- `.env` and secrets **not** committed (`.gitignore` includes `.env`)
- Hindsight integration documented (`HINDSIGHT_INTEGRATION.md`)
- No claim of unimplemented features

**Status:** Remote cleanliness **NOT VERIFIED** in this environment—confirm before submit.

## Live demo requirements

- `HINDSIGHT_API_KEY` configured; `/api/health` → `hindsightConfigured: true`
- Backend :8787, frontend :5173
- End-to-end: seed/retain → prepare/recall → Memory Used populated when recall succeeds
- Live retain/recall success **NOT VERIFIED** without a key in this workspace

## Video requirements

- 2–5 minutes following `VIDEO_SCRIPT.md`
- Visibly show: Ravi history, retain, prepare, recall progress, Memory Used influencing brief
- Article/social/video should focus on the product and Hindsight’s effect on behavior—not event framing
- Thumbnail guidance: `THUMBNAIL_TEXT.md`

## Content package files

| File | Purpose |
|------|---------|
| `ARTICLE.md` | 800–1,500 word technical article (no hackathon mention) |
| `SOCIAL_POST.md` | &lt;800 character technical social post |
| `VIDEO_SCRIPT.md` | Timed demo video script |
| `THUMBNAIL_TEXT.md` | Titles, subtitle, visual concept |
| `FINAL_SUBMISSION.md` | This summary |

## Known limitations

- Requires live Hindsight API key; no mock memory path
- Shared bank + tag scoping (not per-tenant banks)
- Demo reset clears SQLite only, not the Cloud bank
- Brief quality depends on recall results and optional Groq
- Live Cloud E2E in a given environment: **NOT VERIFIED** until key + successful retain/recall are confirmed
