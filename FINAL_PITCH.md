# FINAL_PITCH.md — Briefed

**Product name:** Briefed (Meeting Prep Agent)  
**Hackathon:** Hindsight Hackathon

---

## One-line project description

Briefed prepares you for the next meeting with a contact by retaining past interactions in Hindsight and recalling them into a personalized meeting brief.

---

## 30-second pitch

“People meet the same customers again and again — but lose the thread: cost concerns, promised docs, open commitments. Briefed is a Meeting Prep Agent that keeps that relationship memory in Hindsight. After each meeting we retain the debrief; before the next one we recall it and generate a brief that shows exactly which memories were used. You walk in knowing what you promised and what they care about.”

---

## 60-second pitch

“Recurring B2B meetings fail when relationship context is scattered across notes or forgotten. Briefed solves that with a clear loop: post-meeting debrief → Hindsight retain → before the next meeting Hindsight recall → personalized Meeting Brief.

Our demo contact is Ravi Sharma, a VP Engineering. We load three past interactions — deployment cost concerns, a promised architecture document that’s still open, a preference for concise technical explanations and a two-week timeline. Those go into Hindsight, not a fake UI label.

When you click Prepare My Meeting, the backend actually recalls from Hindsight, passes those facts to the LLM (or a heuristic fallback), and shows a Memory Used panel so judges can see what shaped the prep.

The more interactions the agent remembers, the more useful the next meeting preparation becomes. Hindsight is not a feature sticker — it’s the long-term memory of the agent.”

---

## Problem

Sales, CS, and founder teams repeatedly meet the same contacts but lose important relationship context: prior discussions, promises, missed follow-ups, recurring concerns, and communication preferences. Generic meeting prep (“discuss the project / ask about timeline”) does not help.

## Solution

Briefed turns meeting debriefs into durable Hindsight memory, then recalls that memory when preparing the next meeting — producing a personalized brief with evidence of what was recalled (Memory Used).

## Why Hindsight is central

Hindsight is the **only** long-term memory layer. The app does not mock, invent, or store relationship intelligence in a second custom memory system. Without `HINDSIGHT_API_KEY`, retain and recall fail closed. SQLite holds contacts and meeting metadata; Hindsight holds what was discussed, decided, promised, and preferred.

## Key differentiator

Not a one-shot meeting summarizer. Briefed carries open loops **across** meetings and proves recall in the UI (Memory Used + With Hindsight vs Without memory).

## Real-world value

Before a customer call, the agent surfaces: what they worried about last time, what you still owe them, how they like to be briefed, and what to ask next — so fewer missed commitments and colder restarts.
