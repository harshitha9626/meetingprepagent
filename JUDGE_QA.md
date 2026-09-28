# JUDGE_QA.md — Concise Answers

Answers reflect the **actual Briefed codebase**. Live Cloud retain/recall is **NOT VERIFIED** here until `HINDSIGHT_API_KEY` is configured.

---

### What problem are you solving?

Recurring customer meetings need recall of past discussions, promises, missed follow-ups, and preferences. People forget; CRM notes are hard to prep from quickly. Briefed turns meeting debriefs into durable relationship memory and generates prep for the *next* meeting.

### Why is this different from a normal meeting summarizer?

A summarizer compresses one meeting. Briefed **carries open loops forward** across meetings (e.g. pending architecture document), recalls them later, and shows **Memory Used** evidence. The unit of value is the relationship over time, not one transcript.

### Why do you need Hindsight?

Hindsight is the long-term memory layer: retain debriefs, extract/search facts, recall by query + contact tags. A normal LLM call loses context when the session ends. Without Hindsight, this would be a generic prep chatbot.

### Why not just use PostgreSQL?

SQLite (app DB) stores contacts, meeting metadata, and debrief text for the UI. Relationship intelligence needs Hindsight’s retain/recall pipeline (extraction + multi-strategy retrieval). We did not build a second custom vector DB.

### What exactly is stored in Hindsight?

Structured meeting debrief documents (discussions, decisions, commitments, concerns/preferences) via `retain`, with `documentId` like `meeting:{contactId}:{meetingId}` and tags `contact:{id}`. Hindsight extracts facts from that content.

### How does recall affect the meeting preparation?

`prepareMeeting(..., "memory")` runs Hindsight `recall` queries, dedupes facts, then passes them to Groq as `HINDSIGHT MEMORY FACTS` (or builds the brief with heuristics from those same facts if Groq is unset). The brief and Memory Used panel are grounded in that recall set.

### How does the agent learn over multiple meetings?

Each debrief/seed calls retain. Later prepares recall a larger history. New debriefs upsert by `documentId` and add/update facts. Learning = accumulated retained interactions, not fine-tuning weights in this MVP.

### What happens when there is no memory?

Prepare may return `memoryCount: 0`; UI says no memories recalled. Generic mode (`mode: "generic"`) skips recall and shows non-personalized advice for comparison.

### How do you prevent irrelevant memories from affecting the brief?

Contact tags on retain/recall, contact-focused queries, and prompts that forbid inventing facts. If tagged recall is empty, code may fall back to a broader recall including contact id — a known tradeoff; not a perfect ACL system.

### What is your technical architecture?

React/Vite UI → Express TypeScript API → SQLite metadata + Hindsight Cloud (`@vectorize-io/hindsight-client`) for memory + optional Groq for brief prose. See `ARCHITECTURE.md`.

### What is your biggest limitation?

Requires a valid Hindsight API key (no mock memory). Single shared bank with tag-based contact scoping (not per-tenant banks). Reset clears SQLite only. Live Cloud E2E must be confirmed with your credentials before judging.

### What would you build next?

Per-user/org banks, calendar-triggered prep, CRM as retain source, commitment due dates, and evaluation of with/without-memory brief quality — without changing the retain → recall → brief core.
