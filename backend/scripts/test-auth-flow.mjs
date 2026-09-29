// AI-Generated Code - 2026-09-29 - Composer
/**
 * Cross-user auth isolation smoke test.
 * Usage: node scripts/test-auth-flow.mjs
 * Requires AUTH_TEST_TOKEN_A / AUTH_TEST_TOKEN_B from two logged-in users,
 * or register+login manually first (in-memory users reset on API restart).
 */

const base = process.env.API_BASE || "http://localhost:8787/api";
const tokenA = process.env.AUTH_TEST_TOKEN_A?.trim();
const tokenB = process.env.AUTH_TEST_TOKEN_B?.trim();

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
  if (!tokenA || !tokenB) {
    console.log(
      "SKIP — set AUTH_TEST_TOKEN_A and AUTH_TEST_TOKEN_B after logging in two users."
    );
    return;
  }

  const contact = await req("/contacts", {
    method: "POST",
    token: tokenA,
    body: { name: "Acme Lead", company: "Acme", role: "CTO" },
  });
  assert(contact.status === 201, "create contact failed");
  const contactId = contact.data.contact.id;

  const listB = await req("/contacts", { token: tokenB });
  assert(
    !(listB.data.contacts || []).some((c) => c.id === contactId),
    "B must not see A's contacts"
  );

  console.log("OK — user isolation passed");
}

main().catch((err) => {
  console.error("FAIL", err.message);
  process.exit(1);
});
