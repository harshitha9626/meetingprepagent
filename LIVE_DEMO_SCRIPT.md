# LIVE_DEMO_SCRIPT.md — Exact 2-minute judge flow

**UI:** http://localhost:5173 · **API:** http://localhost:8787  
**Prerequisite:** `HINDSIGHT_API_KEY` set in `backend/.env`; both `npm run dev` processes running.  
**Warm start (recommended):** Click **Start Ravi demo** once *before* judges sit down so retain latency is not in the critical path — then use a live debrief retain during the script. If cold-starting, fold seed retain into 0:20–1:00 as noted below.

Use **only** these real UI labels from the current app.

---

## 0:00–0:20 — Problem

**Say:**  
“People repeatedly meet the same contacts but lose important relationship context — promises, cost concerns, preferences. Briefed is a Meeting Prep Agent that remembers via Hindsight.”

**Do:** Point at the Briefed UI (home). Do not click yet.

---

## 0:20–0:40 — Open Ravi’s relationship history

**Do:**
1. If Ravi is not loaded: click **Start Ravi demo** and wait for the green banner.  
2. Select **Ravi Sharma** if needed.  
3. Point at:
   - **Demo Data** badge / **DemoStoryCard** story beats  
   - **Relationship timeline** (past meetings + upcoming)  
   - Sidebar **Relationship Memory** (recalled facts for this contact)

**Say:**  
“Here’s Ravi — VP Engineering. Past discussions: deployment cost. A promise: architecture document. Still open. Preferences: concise technical explanations, two-week timeline. That’s relationship history, not a generic chatbot prompt.”

**Cold start note:** While **Start Ravi demo** runs, progress text is **“Retaining Ravi’s 3 meetings into Hindsight…”** — that *is* the Hindsight retain (see next beat). Banner after success: **“Hindsight remembered this relationship — N interactions retained for Ravi Sharma.”**

---

## 0:40–1:00 — Hindsight RETAIN (call it out)

**Preferred live retain (warm start already seeded):**
1. On the **upcoming** meeting, click **Log debrief → retain**.  
2. Click **Fill Ravi sample debrief** (optional, faster).  
3. Click **Retain in Hindsight**.  
4. Wait until button shows **Retaining in Hindsight…** then success: **“Retained in Hindsight (hindsight). Document …”**  
5. Banner: **“Hindsight remembered this interaction.”**

**Say:**  
“This is the actual Hindsight retain — `retainMemory` → Hindsight Cloud SDK `retain` into our bank, tagged to Ravi. Not a hardcoded label.”

**If using seed as the retain moment instead:**  
Point at the retain banner / Debug Panel retain status after **Start Ravi demo**, and say the same: three debriefs were retained via Hindsight.

---

## 1:00–1:25 — Hindsight RECALL (Prepare)

**Do:**
1. Click **Prepare My Meeting**  
   — or after debrief: **Prepare with updated memory** / **Create next meeting + prepare**.  
2. Watch progress: **“Recalling relationship memory…”** then **“Preparing your meeting brief…”**.  
3. Prep view opens.

**Say:**  
“Prepare triggers Hindsight recall — contact-tagged queries against the same bank. Those facts feed the brief composer.”

---

## 1:25–1:45 — Memory Used

**Do:** Point at the right panel:
- Header **MEMORY USED** / **Memory Used for This Meeting**  
- Badge **Recalled from Hindsight**  
- Cards with fact text, optional **Open commitment** / **Learned previously**, **Source / interaction**

**Say:**  
“Memory Used is the proof. These are recalled Hindsight facts — cost, pending architecture doc, preferences — and they change what the agent prepares.”

**Optional 5 seconds:** Toggle **With Hindsight** vs **Without memory**, or point at **Without memory** / **With Hindsight** compare — generic side has no relationship recall.

---

## 1:45–2:00 — Final personalized brief + close

**Do:** Point at left panel **MEETING BRIEF** (sections: overview, concerns, commitments / missed follow-ups, agenda, questions, etc.).

**Say:**  
“This is the personalized brief for Ravi — grounded in recall, not inventing history.  
**The more interactions the agent remembers, the more useful the next meeting preparation becomes.**”

Stop. Leave Memory Used + brief on screen for Q&A.

---

## Cheat sheet — retain vs recall

| Moment | UI | Code |
|--------|-----|------|
| Retain | **Start Ravi demo** or **Retain in Hindsight** | `demoService.seedDemo` / `debriefService.submitDebrief` → `retainMemory` → `HindsightClient.retain` |
| Recall | **Prepare My Meeting** (progress: Recalling…) | `briefService.prepareMeeting` → `recallMemories` → `HindsightClient.recall` |

## Do not invent on stage

- No claim of offline / mock Hindsight  
- No claim that reset clears the Hindsight bank (reset clears **SQLite** app data only)  
- If `memoryCount` is 0, say so — do not invent facts
