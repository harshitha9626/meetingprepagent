# JUDGE_QUESTIONS.md — Short accurate answers

Answers match the **current Briefed implementation**. Live Cloud proof requires `HINDSIGHT_API_KEY`.

---

### Q1. What problem are you solving?

Recurring meetings with the same contacts lose relationship context — discussions, promises, missed follow-ups, concerns, preferences. Briefed retains that context and prepares the *next* meeting from it.

### Q2. Why isn't this just a meeting summarizer?

A summarizer compresses one meeting. Briefed carries open loops **across** meetings (e.g. a still-pending architecture document), recalls them later, and shows **Memory Used** evidence. The product unit is the relationship over time.

### Q3. Why Hindsight?

Hindsight is the long-term agent memory: retain debriefs, extract/search facts, recall by query + tags. Without it this is a generic prep chatbot. We do not ship a parallel custom memory store.

### Q4. What does PostgreSQL/database do?

We use **SQLite** (`backend/data/briefed.sqlite`), not PostgreSQL. It stores structured app data: contacts, meeting titles/dates/status, debrief form copy, and `hindsight_document_id` pointers. It is **not** the relationship-intelligence search layer.

### Q5. What does Hindsight do?

Long-term memory: **retain** meeting debrief documents into a bank (`HINDSIGHT_BANK_ID`, default `briefed-maya`), then **recall** facts with contact tags. Implemented via `@vectorize-io/hindsight-client` (`retain` / `recall`) in `hindsightService.ts`.

### Q6. What information is retained?

Structured debrief text: what was discussed, decisions, commitments/promises, concerns and preferences (`formatDebriefContent`). Document id pattern: `meeting:{contactId}:{meetingId}`. Tags include `contact:{id}`.

### Q7. How is relevant memory recalled?

On prepare (`mode: "memory"`), the backend runs several contact-focused recall queries in parallel (`RECALL_QUERIES` in `briefService.ts`), each calling `recallMemories` with `tags: ["contact:{id}"]`. Results are deduped, then passed into brief composition. Empty tagged recall may fall back to a broader query that includes the contact id.

### Q8. How does the agent improve over multiple meetings?

Each successful debrief/seed **retains** again. Later prepares **recall** a larger history. Improvement is accumulated retained interactions, not model fine-tuning in this MVP.

### Q9. What happens when there is no previous memory?

Prepare can succeed with `memoryCount: 0`. UI status: no relevant memories recalled. Brief falls back toward empty/generic guidance; Memory Used shows the empty state. **Without memory** mode skips recall intentionally for comparison.

### Q10. How do you avoid irrelevant memories?

Contact tags on retain and recall, contact-named queries, and LLM prompts that forbid inventing facts outside recalled memory. Tag scoping is best-effort, not a full multi-tenant ACL — see limitations.

### Q11. What is the role of the LLM?

Optional **Groq** composes brief JSON from recalled facts (`HINDSIGHT MEMORY FACTS`). If `GROQ_API_KEY` is missing or Groq errors, the backend builds the brief with **heuristics from the same recalled facts** — it does not invent Hindsight memory.

### Q12. What happens if Hindsight is unavailable?

Retain/seed/prepare/relationship-memory **fail closed**. API returns a friendly error (e.g. missing key → configure `HINDSIGHT_API_KEY`; network → could not reach Hindsight). There is **no** fake recall path.

### Q13. What is your biggest limitation?

Requires a live Hindsight API key; single shared bank with tag-based contact scoping; demo reset clears SQLite only, not the Cloud bank; recall quality depends on Hindsight extraction latency/indexing after retain.

### Q14. How would you scale this?

Per-org or per-user banks, stronger isolation than tags alone, calendar-triggered prepare, CRM as a retain source, and evaluation harnesses for with/without-memory brief quality — same retain → recall → brief core.

### Q15. What would you build next?

Commitment due dates and nudges, calendar integration, multi-attendee memory, and richer Memory Used provenance — without replacing Hindsight as the memory layer.
