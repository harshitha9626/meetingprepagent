// AI-Generated Code - 2026-09-29 - Composer

import { Router, type Request } from "express";
import { z } from "zod";
import {
  createCommitment,
  createContact,
  createMeeting,
  getCommitmentForUser,
  getContact,
  getDbPath,
  getMeetingForUser,
  initDatabase,
  listCommitments,
  listContacts,
  listMeetings,
  listUpcomingMeetings,
  updateCommitmentStatus,
} from "../store/db.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import authRouter from "./auth.js";
import { prepareMeeting } from "../services/briefService.js";
import { submitDebrief } from "../services/debriefService.js";
import { resetDemo, seedDemo } from "../services/demoService.js";
import { generateFollowUpDraft } from "../services/followUpService.js";
import { healthCheck, getLastMemoryDebug } from "../services/hindsightService.js";
import { getRelationshipMemory } from "../services/relationshipMemoryService.js";

const router = Router();

const contactSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  email: z.string().email().optional(),
  notes: z.string().optional(),
});

const meetingSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(4),
  status: z.enum(["upcoming", "logged"]).optional(),
});

const debriefSchema = z.object({
  discussed: z.string().trim().min(8, "Add key discussion points"),
  decisions: z.string().trim().min(3, "Add decisions made"),
  commitments: z.string().trim().min(3, "Add new commitments"),
  concernsAndPrefs: z.string().trim().min(3, "Add concerns raised"),
  followUps: z.string().trim().min(3, "Add follow-ups"),
  myCommitments: z.string().trim().optional(),
  theirCommitments: z.string().trim().optional(),
  newInformation: z.string().trim().optional(),
  outcome: z.string().trim().optional(),
  changesNoted: z.string().trim().optional(),
  trackCommitment: z.boolean().optional(),
  promisedBy: z.enum(["me", "contact"]).optional(),
  dueDate: z.string().nullable().optional(),
});

const commitmentCreateSchema = z.object({
  description: z.string().trim().min(3, "Add a commitment description"),
  promisedBy: z.enum(["me", "contact"]),
  meetingId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

const commitmentStatusSchema = z.object({
  status: z.enum(["pending", "completed", "overdue"]),
});

function friendlyError(err: unknown) {
  const e = err as Error & { status?: number; code?: string };
  const code = e.code || "REQUEST_FAILED";
  let message = e.message || "Something went wrong";
  if (code === "HINDSIGHT_NOT_CONFIGURED") {
    message =
      "Hindsight is not configured. Add HINDSIGHT_API_KEY to backend/.env and restart the API.";
  } else if (/fetch|network|ECONNREFUSED|ENOTFOUND/i.test(message)) {
    message =
      "Could not reach Hindsight or the language model. Check your network and API status, then retry.";
  } else if (/rate|quota|credit|429/i.test(message)) {
    message =
      "Memory or LLM service rate-limited or out of credits. Wait a moment and try again.";
  }
  return {
    status: e.status ?? 502,
    body: {
      error: message,
      code,
      retryable: (e.status ?? 502) >= 500 || code === "HINDSIGHT_NOT_CONFIGURED",
    },
  };
}

function errorPayload(err: unknown) {
  return friendlyError(err);
}

function userId(req: Request): string {
  const user = (req as AuthedRequest).user;
  if (!user?.id) {
    throw Object.assign(new Error("Authentication required."), {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }
  return user.id;
}

// Public auth + health
router.use("/auth", authRouter);

router.get("/health", (_req, res) => {
  const hs = healthCheck();
  let sqliteOk = false;
  let sqliteError: string | undefined;
  try {
    initDatabase();
    sqliteOk = true;
  } catch (err) {
    sqliteError = err instanceof Error ? err.message : String(err);
  }
  res.json({
    ok: sqliteOk,
    service: "briefed-api",
    memoryProvider: "hindsight",
    hindsightConfigured: hs.configured,
    bankId: hs.bankId,
    videoSignaling: process.env.VERCEL
      ? "unavailable-on-vercel-serverless"
      : "/ws/video",
    auth: true,
    runtime: process.env.VERCEL ? "vercel" : "local",
    sqlite: {
      ok: sqliteOk,
      path: getDbPath(),
      error: sqliteError,
      ephemeral: Boolean(process.env.VERCEL),
    },
    jwtConfigured: Boolean(process.env.JWT_SECRET?.trim()),
  });
});

// Everything below requires a valid JWT
router.use(requireAuth);

router.get("/debug/memory", (req, res) => {
  const hs = healthCheck();
  res.json({
    debug: getLastMemoryDebug(),
    hindsight: hs,
    userId: userId(req),
  });
});

router.get("/meetings/upcoming", (req, res) => {
  res.json({
    meetings: listUpcomingMeetings(userId(req)),
  });
});

router.get("/contacts", (req, res) => {
  res.json({ contacts: listContacts(userId(req)) });
});

router.post("/contacts", (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid contact", code: "VALIDATION" });
    return;
  }
  const contact = createContact({
    ...parsed.data,
    userId: userId(req),
  });
  res.status(201).json({ contact });
});

router.get("/contacts/:id", (req, res) => {
  const contact = getContact(req.params.id, userId(req));
  if (!contact) {
    res.status(404).json({ error: "Contact not found", code: "NOT_FOUND" });
    return;
  }
  res.json({ contact, meetings: listMeetings(contact.id) });
});

router.get("/contacts/:id/meetings", (req, res) => {
  const contact = getContact(req.params.id, userId(req));
  if (!contact) {
    res.status(404).json({ error: "Contact not found", code: "NOT_FOUND" });
    return;
  }
  res.json({ meetings: listMeetings(contact.id) });
});

router.get("/contacts/:id/commitments", (req, res) => {
  try {
    const contact = getContact(req.params.id, userId(req));
    if (!contact) {
      res.status(404).json({ error: "Contact not found", code: "NOT_FOUND" });
      return;
    }
    const status = req.query.status as string | undefined;
    let commitments = listCommitments(contact.id);
    if (status && status !== "all") {
      commitments = commitments.filter((c) => c.status === status);
    }
    res.json({ commitments });
  } catch (err) {
    console.error("list commitments failed", err);
    const { status, body } = errorPayload(err);
    res.status(status).json(body);
  }
});

router.post("/contacts/:id/commitments", (req, res) => {
  try {
    const uid = userId(req);
    const contact = getContact(req.params.id, uid);
    if (!contact) {
      res.status(404).json({ error: "Contact not found", code: "NOT_FOUND" });
      return;
    }
    const parsed = commitmentCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || "Invalid commitment",
        code: "VALIDATION",
      });
      return;
    }
    const commitment = createCommitment({
      contactId: contact.id,
      meetingId: parsed.data.meetingId ?? null,
      description: parsed.data.description,
      promisedBy: parsed.data.promisedBy,
      dueDate: parsed.data.dueDate ?? null,
      userId: uid,
    });
    res.status(201).json({ commitment });
  } catch (err) {
    console.error("create commitment failed", err);
    const { status, body } = errorPayload(err);
    res.status(status).json(body);
  }
});

router.patch("/commitments/:id", (req, res) => {
  try {
    const parsed = commitmentStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid status", code: "VALIDATION" });
      return;
    }
    const existing = getCommitmentForUser(
      req.params.id,
      userId(req)
    );
    if (!existing) {
      res.status(404).json({ error: "Commitment not found", code: "NOT_FOUND" });
      return;
    }
    const commitment = updateCommitmentStatus(
      req.params.id,
      parsed.data.status
    );
    res.json({ commitment });
  } catch (err) {
    console.error("update commitment failed", err);
    const { status, body } = errorPayload(err);
    res.status(status).json(body);
  }
});

router.get("/contacts/:id/relationship-memory", async (req, res) => {
  try {
    const contact = getContact(req.params.id, userId(req));
    if (!contact) {
      res.status(404).json({
        error: "Contact not found. Select a valid contact.",
        code: "NOT_FOUND",
      });
      return;
    }
    const memory = await getRelationshipMemory(contact);
    res.json(memory);
  } catch (err) {
    console.error("relationship-memory failed", err);
    const { status, body } = errorPayload(err);
    res.status(status).json(body);
  }
});

router.post("/contacts/:id/meetings", (req, res) => {
  const contact = getContact(req.params.id, userId(req));
  if (!contact) {
    res.status(404).json({ error: "Contact not found", code: "NOT_FOUND" });
    return;
  }
  const parsed = meetingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid meeting", code: "VALIDATION" });
    return;
  }
  const meeting = createMeeting({
    contactId: contact.id,
    title: parsed.data.title,
    date: parsed.data.date,
    status: parsed.data.status,
  });
  res.status(201).json({ meeting });
});

router.post("/contacts/:id/prepare", async (req, res) => {
  try {
    const contact = getContact(req.params.id, userId(req));
    if (!contact) {
      res.status(404).json({ error: "Contact not found", code: "NOT_FOUND" });
      return;
    }
    const mode = req.body?.mode === "generic" ? "generic" : "memory";
    const result = await prepareMeeting(contact, mode);
    res.json(result);
  } catch (err) {
    console.error("prepare failed", err);
    const { status, body } = errorPayload(err);
    res.status(status).json(body);
  }
});

router.post("/contacts/:id/follow-up", async (req, res) => {
  try {
    const contact = getContact(req.params.id, userId(req));
    if (!contact) {
      res.status(404).json({ error: "Contact not found", code: "NOT_FOUND" });
      return;
    }
    const meetingId =
      typeof req.body?.meetingId === "string" ? req.body.meetingId : null;
    const draft = await generateFollowUpDraft(contact, meetingId);
    res.json({ draft });
  } catch (err) {
    console.error("follow-up draft failed", err);
    const { status, body } = errorPayload(err);
    res.status(status).json(body);
  }
});

router.post("/meetings/:id/debrief", async (req, res) => {
  try {
    const parsed = debriefSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error:
          parsed.error.issues[0]?.message ||
          "Debrief is incomplete. Add discussions, decisions, commitments, and concerns.",
        code: "VALIDATION",
      });
      return;
    }
    const meeting = getMeetingForUser(
      req.params.id,
      userId(req)
    );
    if (!meeting) {
      res.status(404).json({ error: "Meeting not found", code: "NOT_FOUND" });
      return;
    }
    const result = await submitDebrief(req.params.id, parsed.data, {
      trackCommitment: parsed.data.trackCommitment,
      promisedBy: parsed.data.promisedBy,
      dueDate: parsed.data.dueDate,
    });
    res.json(result);
  } catch (err) {
    console.error("debrief failed", err);
    const { status, body } = errorPayload(err);
    res.status(status).json(body);
  }
});

router.post("/demo/seed", async (req, res) => {
  try {
    const result = await seedDemo(userId(req));
    res.json(result);
  } catch (err) {
    console.error("seed failed", err);
    const { status, body } = errorPayload(err);
    res.status(status).json(body);
  }
});

router.post("/demo/reset", async (req, res) => {
  try {
    const result = await resetDemo(userId(req));
    res.json(result);
  } catch (err) {
    console.error("reset failed", err);
    res.status(500).json({ error: "Reset failed", code: "RESET_FAILED" });
  }
});

export default router;
