// AI-Generated Code - 2026-09-29 - Composer
/**
 * Cross-user auth isolation smoke test (Node fetch).
 * Usage: node scripts/test-auth-flow.mjs
 */

const base = process.env.API_BASE || "http://localhost:8787/api";
const pass = "TestPass123!";
const emailA = `harshitha-${Date.now()}@example.com`;
const emailB = `other-${Date.now()}@example.com`;

async function req(path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  console.log("API", base);

  const regA = await req("/auth/register", {
    method: "POST",
    body: { name: "Harshitha", email: emailA, password: pass },
  });
  assert(regA.status === 201, `register A failed: ${JSON.stringify(regA.data)}`);
  const tokenA = regA.data.token;

  const dup = await req("/auth/register", {
    method: "POST",
    body: { name: "Dup", email: emailA, password: pass },
  });
  assert(dup.status === 409, `duplicate should be 409, got ${dup.status}`);

  const contact = await req("/contacts", {
    method: "POST",
    token: tokenA,
    body: { name: "Acme Lead", company: "Acme", role: "CTO" },
  });
  assert(contact.status === 201, "create contact failed");
  const contactId = contact.data.contact.id;

  const meeting = await req(`/contacts/${contactId}/meetings`, {
    method: "POST",
    token: tokenA,
    body: { title: "Kickoff", date: "2026-09-29", status: "upcoming" },
  });
  assert(meeting.status === 201, "create meeting failed");

  const commit = await req(`/contacts/${contactId}/commitments`, {
    method: "POST",
    token: tokenA,
    body: {
      description: "Send architecture notes",
      promisedBy: "me",
      meetingId: meeting.data.meeting.id,
    },
  });
  assert(commit.status === 201, "create commitment failed");

  const wrong = await req("/auth/login", {
    method: "POST",
    body: { email: emailA, password: "wrong-password" },
  });
  assert(wrong.status === 401, "wrong password should 401");

  const loginA = await req("/auth/login", {
    method: "POST",
    body: { email: emailA, password: pass },
  });
  assert(loginA.status === 200, "login A failed");
  const tokenA2 = loginA.data.token;

  const listA = await req("/contacts", { token: tokenA2 });
  assert(listA.data.contacts?.length >= 1, "A should see own contacts");

  const regB = await req("/auth/register", {
    method: "POST",
    body: { name: "Other", email: emailB, password: pass },
  });
  assert(regB.status === 201, "register B failed");
  const tokenB = regB.data.token;

  const listB = await req("/contacts", { token: tokenB });
  assert(
    (listB.data.contacts || []).length === 0,
    "B must not see A's contacts"
  );

  const leak = await req(`/contacts/${contactId}`, { token: tokenB });
  assert(leak.status === 404, "B must not access A's contact by id");

  const unauth = await req("/contacts");
  assert(unauth.status === 401, "unauthenticated contacts should 401");

  const dbg = await req("/debug/memory", { token: tokenA2 });
  assert(
    String(dbg.data.hindsight?.bankId || "").startsWith("briefed-user-"),
    `expected per-user bank, got ${dbg.data.hindsight?.bankId}`
  );

  console.log("OK — auth, persistence login, and user isolation passed");
  console.log("User A bank:", dbg.data.hindsight.bankId);
}

main().catch((err) => {
  console.error("FAIL", err.message);
  process.exit(1);
});
