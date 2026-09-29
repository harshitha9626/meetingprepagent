// AI-Generated Code - 2026-09-29 - Composer
import app from "../dist/index.js";

process.env.VERCEL = process.env.VERCEL || "1";
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "vercel-test-secret-key-32chars";

const server = app.listen(0, async () => {
  const port = server.address().port;
  const email = `user${Date.now()}@example.com`;
  try {
    const start = await fetch(
      `http://127.0.0.1:${port}/api/auth/register/start`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Alex Demo",
          email,
          password: "TestPass1!",
          confirmPassword: "TestPass1!",
        }),
      }
    );
    const sj = await start.json();
    console.log("start", start.status, sj.demoOtp ? `otp:${sj.demoOtp}` : "no-demo", sj.error || "");

    const bad = await fetch(`http://127.0.0.1:${port}/api/auth/register/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pendingId: sj.pendingId, otp: "000000" }),
    });
    const bj = await bad.json();
    console.log("bad_otp", bad.status, bj.error || "");

    const ver = await fetch(`http://127.0.0.1:${port}/api/auth/register/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pendingId: sj.pendingId, otp: sj.demoOtp }),
    });
    const vj = await ver.json();
    console.log("verify", ver.status, vj.user?.email || vj.error || "");

    const login = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "TestPass1!" }),
    });
    console.log("login", login.status);

    const dup = await fetch(`http://127.0.0.1:${port}/api/auth/register/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Alex Demo",
        email,
        password: "TestPass1!",
        confirmPassword: "TestPass1!",
      }),
    });
    const dj = await dup.json();
    console.log("dup", dup.status, dj.error || "");
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
