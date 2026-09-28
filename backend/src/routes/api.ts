// AI-Generated Code - 2026-09-28 - Composer

import { Router } from "express";
import { z } from "zod";
import {
  createContact,
  createMeeting,
  getContact,
  getMeeting,
  listContacts,
  listMeetings,
} from "../store/db.js";
import { prepareMeeting } from "../services/briefService.js";
import { submitDebrief } from "../services/debriefService.js";
import { resetDemo, seedDemo } from "../services/demoService.js";
import { getMemoryProviderName } from "../services/hindsightService.js";

const router = Router();

const contactSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  email: z.string().email().optional(),
});

const meetingSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(4),
  status: z.enum(["upcoming", "logged"]).optional(),
});

const debriefSchema = z.object({
  discussed: z.string().min(1),
  decisions: z.string().min(1),
  commitments: z.string().min(1),
  concernsAndPrefs: z.string().min(1),
});

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "briefed-api",
    memoryProvider: getMemoryProviderName(),
  });
});

router.get("/contacts", (_req, res) => {
  res.json({ contacts: listContacts() });
});

router.post("/contacts", (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid contact", code: "VALIDATION" });
    return;
  }
  const contact = createContact(parsed.data);
  res.status(201).json({ contact });
});

router.get("/contacts/:id", (req, res) => {
  const contact = getContact(req.params.id);
  if (!contact) {
    res.status(404).json({ error: "Contact not found", code: "NOT_FOUND" });
    return;
  }
  res.json({ contact, meetings: listMeetings(contact.id) });
});

router.get("/contacts/:id/meetings", (req, res) => {
  const contact = getContact(req.params.id);
  if (!contact) {
    res.status(404).json({ error: "Contact not found", code: "NOT_FOUND" });
    return;
  }
  res.json({ meetings: listMeetings(contact.id) });
});

router.post("/contacts/:id/meetings", (req, res) => {
  const contact = getContact(req.params.id);
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
    const contact = getContact(req.params.id);
    if (!contact) {
      res.status(404).json({ error: "Contact not found", code: "NOT_FOUND" });
      return;
    }
    const mode = req.body?.mode === "generic" ? "generic" : "memory";
    const result = await prepareMeeting(contact, mode);
    res.json(result);
  } catch (err) {
    console.error("prepare failed", err);
    res.status(502).json({
      error: "Failed to prepare meeting brief",
      code: "PREPARE_FAILED",
      retryable: true,
    });
  }
});

router.post("/meetings/:id/debrief", async (req, res) => {
  try {
    const parsed = debriefSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid debrief", code: "VALIDATION" });
      return;
    }
    if (!getMeeting(req.params.id)) {
      res.status(404).json({ error: "Meeting not found", code: "NOT_FOUND" });
      return;
    }
    const result = await submitDebrief(req.params.id, parsed.data);
    res.json(result);
  } catch (err) {
    console.error("debrief failed", err);
    const status = (err as { status?: number }).status ?? 502;
    res.status(status).json({
      error: status === 404 ? "Meeting not found" : "Failed to retain debrief",
      code: status === 404 ? "NOT_FOUND" : "RETAIN_FAILED",
      retryable: status !== 404,
    });
  }
});

router.post("/demo/seed", async (_req, res) => {
  try {
    const result = await seedDemo();
    res.json(result);
  } catch (err) {
    console.error("seed failed", err);
    res.status(502).json({
      error: "Demo seed failed",
      code: "SEED_FAILED",
      retryable: true,
    });
  }
});

router.post("/demo/reset", async (_req, res) => {
  try {
    const result = await resetDemo();
    res.json(result);
  } catch (err) {
    console.error("reset failed", err);
    res.status(500).json({ error: "Reset failed", code: "RESET_FAILED" });
  }
});

export default router;
