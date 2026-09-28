// AI-Generated Code - 2026-09-28 - Composer

import "dotenv/config";
import cors from "cors";
import express from "express";
import apiRouter from "./routes/api.js";
import { getMemoryProviderName } from "./services/hindsightService.js";

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));
app.use("/api", apiRouter);

app.get("/", (_req, res) => {
  res.json({
    name: "Briefed API",
    docs: "/api/health",
    memoryProvider: getMemoryProviderName(),
  });
});

app.listen(port, () => {
  console.log(`Briefed API listening on http://localhost:${port}`);
  console.log(`Memory provider: ${getMemoryProviderName()}`);
});
