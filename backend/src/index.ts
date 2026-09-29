// AI-Generated Code - 2026-09-29 - Composer
/**
 * Express entry for local Node + Vercel serverless.
 * - Local: HTTP server + WebSocket signaling via server.listen()
 * - Vercel: export default app only (never listen)
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
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
import { shouldListenLocally } from "./store/runtimeFlags.js";
import { authStorageMode } from "./store/authStore.js";

// Always load backend/.env relative to this file (works even if cwd is repo root).
dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
});

const isVercel = isServerlessRuntime();
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

/** Ultra-safe health — must never throw / crash the function. */
function sendHealth(res: express.Response): void {
  let sqliteOk = false;
  let sqliteError: string | undefined;
  let dbPath = "/tmp/briefed-data/briefed-store.json";
  try {
    dbPath = getDbPath();
    initDatabase();
    sqliteOk = true;
  } catch (err) {
    sqliteError = err instanceof Error ? err.message : String(err);
  }

  let hindsightConfigured = false;
  let bankId = "briefed-maya";
  try {
    const hs = healthCheck();
    hindsightConfigured = hs.configured;
    bankId = hs.bankId;
  } catch {
    /* health must not fail if Hindsight client throws */
  }

  let authStorage: string = "unknown";
  try {
    authStorage = authStorageMode();
  } catch {
    /* ignore */
  }

  res.status(200).json({
    ok: true,
    service: "briefed-api",
    memoryProvider: "hindsight",
    hindsightConfigured,
    bankId,
    authStorage,
    videoSignaling: isVercel
      ? "unavailable-on-vercel-serverless"
      : "/ws/video",
    auth: true,
    runtime: isVercel ? "vercel" : "local",
    sqlite: {
      ok: sqliteOk,
      path: dbPath,
      error: sqliteError,
      ephemeral: isVercel,
    },
    jwtConfigured: Boolean(process.env.JWT_SECRET?.trim()),
    dataDir: (() => {
      try {
        return resolveDataDir();
      } catch {
        return "/tmp/briefed-data";
      }
    })(),
  });
}

// Register health BEFORE DB middleware / routers so cold-start diagnostics always work.
app.get("/api/health", (_req, res) => {
  sendHealth(res);
});
app.get("/health", (_req, res) => {
  sendHealth(res);
});

/** Ensure DB is ready before API handlers (lazy-safe on cold start). */
app.use((req, res, next) => {
  if (
    req.path === "/" ||
    req.path === "/health" ||
    req.path === "/api/health" ||
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
    console.error(
      "[briefed] database init failed",
      err instanceof Error ? err.message : "unknown error"
    );
    res.status(500).json({
      error:
        "Database could not be initialized. On Vercel, app data uses /tmp (ephemeral).",
      code: "DB_INIT_FAILED",
      detail: err instanceof Error ? err.message : String(err),
      dbPath: getDbPath(),
      dataDir: resolveDataDir(),
      runtime: isVercel ? "serverless" : "local",
    });
  }
});

app.use("/api", apiRouter);

// Safe root status (must be registered before mounting apiRouter at "/")
app.get("/", (_req, res) => {
  sendHealth(res);
});

// Platform may forward without /api prefix.
app.use(apiRouter);

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(
      "[briefed] unhandled error",
      err instanceof Error ? err.message : "unknown error"
    );
    if (res.headersSent) return;
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
);

/**
 * Vercel Express expects a default export.
 * Do NOT call server.listen() on Vercel — it causes FUNCTION_INVOCATION_FAILED.
 */
export default app;

function logBootStatus(): void {
  try {
    console.log(`Auth storage: ${authStorageMode()}`);
    console.log(
      `JWT: ${process.env.JWT_SECRET?.trim() ? "configured" : "missing"}`
    );
  } catch (err) {
    console.error(
      "[briefed] boot status failed",
      err instanceof Error ? err.message : "unknown error"
    );
  }
}

async function startLocal() {
  try {
    initDatabase();
  } catch (err) {
    console.error(
      "[briefed] local database init failed",
      err instanceof Error ? err.message : "unknown error"
    );
    process.exitCode = 1;
  }

  const { attachVideoSignaling } = await import("./services/videoSignaling.js");
  const server = createServer(app);
  attachVideoSignaling(server, "/ws/video");

  server.listen(port, () => {
    console.log(`Briefed API listening on http://localhost:${port}`);
    logBootStatus();
    console.log(`SQLite: ${getDbPath()}`);
    console.log(`Video signaling: ws://localhost:${port}/ws/video`);
    try {
      const hs = healthCheck();
      console.log(
        `Hindsight: ${hs.configured ? `configured (bank=${hs.bankId})` : "MISSING API KEY"}`
      );
    } catch {
      console.log("Hindsight: status unavailable");
    }
  });
}

if (shouldListenLocally()) {
  void startLocal();
} else {
  logBootStatus();
}
