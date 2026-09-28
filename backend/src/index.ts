// AI-Generated Code - 2026-09-29 - Composer

import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import apiRouter from "./routes/api.js";
import { healthCheck } from "./services/hindsightService.js";
import { attachVideoSignaling } from "./services/videoSignaling.js";
import { getDbPath, initDatabase } from "./store/db.js";

initDatabase();

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use("/api", apiRouter);

app.get("/", (_req, res) => {
  const hs = healthCheck();
  res.json({
    name: "Briefed API",
    docs: "/api/health",
    memoryProvider: "hindsight",
    hindsightConfigured: hs.configured,
    sqlite: getDbPath(),
    videoSignaling: "/ws/video",
  });
});

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
