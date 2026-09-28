// AI-Generated Code - 2026-09-28 - Composer
/**
 * E2E: seed retain (3 meetings) → prepare recall → generic compare.
 * Requires HINDSIGHT_API_KEY in backend/.env
 *
 * Run from backend/: npm run test:memory
 */

import "dotenv/config";

const API = process.env.API_BASE || "http://localhost:8787";

async function post(path: string, body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${path} → ${res.status}: ${data.error || JSON.stringify(data)}`);
  }
  return data;
}

async function get(path: string) {
  const res = await fetch(`${API}${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return data;
}

async function main() {
  const health = await get("/api/health");
  console.log("health:", health);
  if (!health.hindsightConfigured) {
    throw new Error("Set HINDSIGHT_API_KEY in backend/.env before running this test.");
  }

  console.log("\n1) RETAIN — seed 3 Ravi meetings into Hindsight…");
  const seed = await post("/api/demo/seed");
  console.log(seed.message);
  console.log("retained docs:", seed.debug?.documentIds || seed.retained);

  const contactId = seed.contact.id as string;

  console.log("\n2) RECALL + BRIEF — prepare with memory…");
  const personalized = await post(`/api/contacts/${contactId}/prepare`, {
    mode: "memory",
  });
  console.log("debug:", personalized.debug);
  console.log("memoryCount:", personalized.meta.memoryCount);
  console.log("missedFollowUps:", personalized.brief.missedFollowUps);
  console.log("recurringConcerns:", personalized.brief.recurringConcerns);
  console.log("preferences:", personalized.brief.preferences);
  console.log("outcomes:", personalized.brief.outcomes);
  console.log("Memory Used count:", personalized.memories?.length);

  const blob = JSON.stringify(personalized).toLowerCase();
  const mustHint = ["cost", "architecture", "concise", "two-week", "timeline", "document"];
  const hits = mustHint.filter((k) => blob.includes(k));
  console.log("story keyword hits:", hits);

  console.log("\n3) GENERIC compare (no recall)…");
  const generic = await post(`/api/contacts/${contactId}/prepare`, {
    mode: "generic",
  });
  console.log("generic memoryCount:", generic.meta.memoryCount);

  if (personalized.meta.memoryCount < 1) {
    throw new Error("Expected Hindsight recall memoryCount > 0");
  }
  if (personalized.debug?.recall?.status !== "ok") {
    throw new Error("Expected recall status ok in debug");
  }
  if (hits.length < 2) {
    console.warn("Warning: few Ravi story keywords in brief — check extraction quality");
  }

  console.log("\n✓ retain → recall → brief flow OK");
}

main().catch((err) => {
  console.error("\n✗", err.message || err);
  process.exit(1);
});
