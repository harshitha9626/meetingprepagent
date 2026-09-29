// AI-Generated Code - 2026-09-29 - Composer
/**
 * Express entry for local Node + Vercel serverless.
 * - Local: HTTP server + WebSocket signaling via server.listen()
 * - Vercel: export default app (no listen); SQLite uses /tmp
 */

import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import apiRouter from "./routes/api.js";
import { healthCheck } from "./services/hindsightService.js";
import {
  getDbPath,
  initDatabase,
  isServerlessRuntime,
  resolveDataDir,
} from "./store/db.js";

const isVercel = Boolean(process.env.VERCEL);
const port = Number(process.env.PORT || 8787);

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));

/** Ensure DB is ready before API handlers (lazy-safe on cold start). */
app.use((req, res, next) => {
  // Auth is in-memory — do not block login/register on SQLite/JSON store.
  if (
    req.path === "/" ||
    req.path.startsWith("/api/auth") ||
    req.path.startsWith("/auth")
  ) {
    next();
    return;
  }
  try {
    initDatabase();
    next();
  } catch (err) {
    console.error("[briefed] database init failed", err);
    res.status(500).json({
      error:
        "Database could not be initialized. On Vercel, app data uses /tmp (ephemeral).",
      code: "DB_INIT_FAILED",
      detail: err instanceof Error ? err.message : String(err),
      dbPath: getDbPath(),
      dataDir: resolveDataDir(),
      runtime: isVercel || isServerlessRuntime() ? "serverless" : "local",
    });
  }
});

app.use("/api", apiRouter);
// If the platform forwards without the /api prefix, keep the same router reachable.
app.use(apiRouter);

app.get("/", (_req, res) => {
  let dbOk = false;
  let dbError: string | undefined;
  try {
    initDatabase();
    dbOk = true;
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
  }
  const hs = healthCheck();
  res.json({
    name: "Briefed API",
    docs: "/api/health",
    memoryProvider: "hindsight",
    hindsightConfigured: hs.configured,
    sqlite: getDbPath(),
    sqliteOk: dbOk,
    sqliteError: dbError,
    dataDir: resolveDataDir(),
    runtime: isVercel ? "vercel" : "local",
    videoSignaling: isVercel
      ? "unavailable-on-vercel-serverless"
      : "/ws/video",
    jwtConfigured: Boolean(process.env.JWT_SECRET?.trim()),
  });
});

/**
 * Vercel Express expects a default export.
 * Do NOT call server.listen() on Vercel — it causes FUNCTION_INVOCATION_FAILED.
 */
export default app;

async function startLocal() {
  try {
    initDatabase();
  } catch (err) {
    console.error("[briefed] local database init failed", err);
    process.exitCode = 1;
  }

  const { attachVideoSignaling } = await import("./services/videoSignaling.js");
  const server = createServer(app);
  attachVideoSignaling(server, "/ws/video");

  server.listen(port, () => {
    const hs = healthCheck();
    console.log(`Briefed API listening on http://localhost:${port}`);
    console.log(`SQLite: ${getDbPath()}`);
    console.log(`Video signaling: ws://localhost:${port}/ws/video`);
    console.log(
      `Hindsight: ${hs.configured ? `configured (bank=${hs.bankId})` : "MISSING API KEY"}`
    );
  });
}

if (!process.env.VERCEL) {
  void startLocal();
}
