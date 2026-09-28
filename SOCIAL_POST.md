# SOCIAL_POST.md

Briefed is a Meeting Prep Agent for recurring customer meetings.

It retains structured debriefs in Hindsight, then recalls contact-tagged facts before the next meeting—so prep is relationship-specific, not a generic “ask about timeline” list.

With Hindsight: cost concerns, open promises, and prefs shape the brief. Without recall: bland prep. Memory Used shows the facts that influenced output.

Takeaways:
1. SQLite = contacts/meetings metadata only
2. Hindsight = sole long-term memory (retain/recall)
3. documentId + contact: tags scope memories
4. Prepare injects HINDSIGHT MEMORY FACTS into LLM/heuristics
5. Missing API key fails closed—no mock memory
6. Generic mode skips recall for a real before/after

Stack: React, Express, SQLite, Hindsight Cloud SDK, optional Groq
