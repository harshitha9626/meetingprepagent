# DEMO_DATA.md — Ravi Sharma scenario

Seed source: `backend/src/demo/seedData.ts`  
Triggered by: **Start Ravi demo** → `POST /api/demo/seed` → SQLite write + Hindsight retain for logged meetings.

---

## Seeded vs dynamically generated

| Kind | What | Where it comes from |
|------|------|---------------------|
| **Seeded demo data** | Contact profile, meeting titles/dates/status, debrief field text for Meetings 1–3 | Hardcoded in `seedData.ts`, copied into SQLite; debrief text **retained into Hindsight** |
| **Dynamically generated** | Meeting Brief prose, Memory Used cards, Relationship Memory list | Produced at prepare/explorer time from **Hindsight recall** (+ optional Groq). Exact strings are **not** hardcoded as the final brief |
| **Optional UI sample** | Meeting 4 debrief fill button | `RAVI_MEETING4_SAMPLE` / `Fill Ravi sample debrief` — only used if the user chooses to log Meeting 4; not auto-retained on seed |

**Important:** Seed text is **retain input**, not a fake “recall response.” The brief must come from recall (or empty/heuristic from whatever recall returned).

---

## Contact profile (seeded)

| Field | Value |
|-------|--------|
| ID | `contact-ravi-sharma` |
| Name | Ravi Sharma |
| Company | Nimbus Retail |
| Role | VP Engineering |
| Email | `ravi.sharma@nimbus-retail.example` |
| Notes | Evaluating FlowOps deployment; cost-sensitive; prefers concise technical depth |

Agent persona in debriefs: **Maya** (B2B Account Executive).

---

## Meeting 1 (seeded, status: `logged`)

| Field | Value |
|-------|--------|
| ID | `meeting-ravi-1` |
| Title | Discovery — deployment approach |
| Date | 2026-03-05 |

**Discussed:** FlowOps for warehouse visibility; Kubernetes deployment and platform cost.  
**Decisions:** Continue evaluation; next step architecture deep-dive.  
**Commitments:** Maya promised a concise **architecture document** (topology, cost drivers, security); Ravi to share cluster sizing notes.  
**Concerns / prefs:** **Deployment cost**; prefers **concise technical explanations**.

---

## Meeting 2 (seeded, status: `logged`)

| Field | Value |
|-------|--------|
| ID | `meeting-ravi-2` |
| Title | Timeline & architecture follow-up |
| Date | 2026-03-12 |

**Discussed:** Pilot deployment timeline; fit vs observability stack.  
**Decisions:** Tentative pilot interest if it fits a **two-week** window; architecture review blocked on missing materials.  
**Commitments:** Architecture document **still pending / missed**; Maya re-commits to send within 48 hours.  
**Concerns / prefs:** **Two-week** implementation preference; cost still in background; concise tech again.

---

## Meeting 3 (seeded, status: `logged`)

| Field | Value |
|-------|--------|
| ID | `meeting-ravi-3` |
| Title | Cost revisit & architecture checkpoint |
| Date | 2026-03-19 |

**Discussed:** Deployment cost after finance nudge; architecture revisited (namespaces, autoscaling, managed vs self-hosted).  
**Decisions:** Do not expand pilot until cost model clearer; preferred direction managed control plane + customer-vpc data plane, pending written doc.  
**Commitments:** Architecture document **still open/missed**; Ravi asks for a **cost-annotated architecture one-pager** next meeting.  
**Concerns / prefs:** Recurring **deployment cost**; concise explanations; two-week timeline.

---

## Meeting 4 (seeded metadata only, status: `upcoming`)

| Field | Value |
|-------|--------|
| ID | `meeting-ravi-4` |
| Title | Pilot go / no-go prep |
| Date | 2026-03-26 |
| Debrief | **None on seed** — this is the meeting Prepare My Meeting targets |

Optional later sample debrief (`Fill Ravi sample debrief`) is **not** part of the automatic seed retain set.

---

## Important promises (seeded themes)

- Maya → send concise architecture document (Meeting 1).
- Maya → re-commit / deliver architecture doc within 48 hours (Meeting 2).
- Maya → bring cost-annotated architecture one-pager to next meeting (Meeting 3).

## Unresolved commitments (seeded themes)

- Architecture document still not fulfilled through Meeting 3 (open / missed follow-up).
- Cost model clarity blocking pilot expansion.

## Preferences (seeded themes)

- Concise technical explanations (short diagrams/bullets, not long decks).
- Two-week implementation / pilot timeline preference.

## Concerns (seeded themes)

- Recurring **deployment cost** (infra + ops); reinforced by finance nudge in Meeting 3.

---

## What the next meeting preparation should recall

When Hindsight recall succeeds for Ravi, prepare should surface facts along these themes (wording varies by extraction/recall):

1. Deployment **cost** sensitivity (recurring).  
2. **Pending / missed architecture document** (and cost-annotated one-pager ask).  
3. Preference for **concise technical** prep.  
4. Interest in a **two-week** pilot window.  
5. Evaluation still open; pilot scope gated on cost clarity.

Then the **generated** Meeting Brief / Memory Used should reflect those recalled facts — not paste this markdown into the UI as a fake answer.

---

## Document IDs retained on seed

- `meeting:contact-ravi-sharma:meeting-ravi-1`
- `meeting:contact-ravi-sharma:meeting-ravi-2`
- `meeting:contact-ravi-sharma:meeting-ravi-3`

Meeting 4 has no retain until a user submits **Retain in Hindsight**.
