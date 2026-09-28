# VIDEO_SCRIPT.md — 2–5 minute demo

**On-screen product:** Briefed (Meeting Prep Agent)  
**URL:** http://localhost:5173  
**Prerequisite:** `HINDSIGHT_API_KEY` set; API + UI running. Warm-seed optional.

Do **not** mention a hackathon on camera. Use only real UI labels.

---

## 0:00–0:30 — Introduction

**Visual:** Briefed home screen.

**Say:**  
“This is Briefed — a Meeting Prep Agent for recurring customer meetings. It remembers relationship context in Hindsight, then uses that memory to prepare you for the next conversation.”

**On screen:** Product name / home.

---

## 0:30–1:00 — Problem

**Say:**  
“People meet the same contacts again and again, but lose the thread—cost concerns, promised documents, how someone likes to be briefed. A one-meeting summary doesn’t carry open loops forward. Briefed does: retain after the meeting, recall before the next one.”

**Visual:** Stay on home or point at memory flow strip if visible (Interaction → Retain → Long-term Memory → Recall → Brief).

---

## 1:00–3:00 — Live demo (must show all five beats)

### Beat 1 — Ravi’s previous relationship history (~1:00–1:25)

**Do:** Click **Start Ravi demo** (if not already seeded). Wait for banner: **“Hindsight remembered this relationship…”**  
Select **Ravi Sharma**. Show:

- **Demo Data** / story card  
- **Relationship timeline** (Meetings 1–3 logged, Meeting 4 upcoming)  
- Sidebar **Relationship Memory**

**Say:**  
“Here’s Ravi Sharma, VP Engineering at Nimbus Retail. Past history: deployment cost concerns, a promised architecture document that’s still open, preference for concise technical explanations and a two-week timeline.”

### Beat 2 — Meaningful interaction retained (~1:25–1:55)

**Do (preferred live retain):** On the **upcoming** meeting, click **Log debrief → retain** → **Fill Ravi sample debrief** → **Retain in Hindsight**.  
Show button state **Retaining in Hindsight…** then success **“Retained in Hindsight (hindsight). Document …”** and banner **“Hindsight remembered this interaction.”**

**Alternate:** If time is tight, narrate that **Start Ravi demo** already retained Meetings 1–3 (progress: **“Retaining Ravi’s 3 meetings into Hindsight…”**) and point at the retain banner / Debug Panel.

**Say:**  
“That was a real Hindsight retain—not a UI label. The debrief is pushed into our Hindsight bank, tagged to this contact.”

### Beat 3 & 4 — Later meeting preparation + Hindsight recall (~1:55–2:25)

**Do:** Click **Prepare My Meeting** or **Prepare with updated memory**.  
Show progress texts:

1. **“Recalling relationship memory…”** ← call this out as **Hindsight recall**  
2. **“Preparing your meeting brief…”**

**Say:**  
“Prepare triggers Hindsight recall for Ravi, then composes the brief from those facts.”

### Beat 5 — Recalled memories influence the brief (~2:25–3:00)

**Do:** On the prep view, show:

1. **MEMORY USED** / **Memory Used for This Meeting** — badges **Recalled from Hindsight**, fact cards  
2. **MEETING BRIEF** — personalized sections  
3. Optional: **Without memory** vs **With Hindsight** compare, or toggle **With Hindsight** / **Without memory**

**Say:**  
“Memory Used is the proof of recall. These facts change the preparation—open architecture commitments, cost, preferences—versus the generic side that never called Hindsight.”

---

## 3:00–3:30 — Hindsight architecture

**Visual:** Freeze on prep view or draw/show the flow.

**Say:**  
“User to React UI to Express API. SQLite stores contacts and meeting metadata. Hindsight retain writes long-term memory; Hindsight recall pulls it back; optional Groq—or heuristics—writes the brief from those facts. Hindsight is the only long-term memory layer. No mock memory if the key is missing.”

---

## 3:30–4:00 — Closing

**Visual:** MEETING BRIEF + MEMORY USED still visible.

**Say:**  
“Briefed gets more useful as interactions accumulate—because Hindsight remembers them. Retain after the meeting. Recall before the next one. Walk in knowing what you promised and what they care about.”

**End card (optional text):** Briefed — Meeting Prep Agent · retain → recall → personalized brief

---

## Shot checklist (edit verification)

- [ ] Ravi **Relationship timeline** / history visible  
- [ ] Retain moment labeled (**Retain in Hindsight** or seed retaining progress)  
- [ ] **Prepare My Meeting** + **Recalling relationship memory…**  
- [ ] **MEMORY USED** with recalled facts  
- [ ] **MEETING BRIEF** reflecting those themes  
- [ ] No claim of fake/offline Hindsight  

If recall returns `memoryCount: 0`, say so on camera—do not invent facts. Live Cloud success is **NOT VERIFIED** without a configured key.
