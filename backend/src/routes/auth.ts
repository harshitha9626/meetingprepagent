// AI-Generated Code - 2026-09-29 - Composer

import { Router } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import {
  getUserFromToken,
  loginUser,
  registerUser,
} from "../services/authService.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email address").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(254),
  password: z.string().min(1, "Password is required").max(128),
});

router.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || "Invalid registration data",
        code: "VALIDATION",
      });
      return;
    }
    const result = await registerUser(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    const e = err as Error & { status?: number; code?: string };
    res.status(e.status ?? 500).json({
      error: e.message || "Registration failed",
      code: e.code || "REGISTER_FAILED",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || "Invalid login data",
        code: "VALIDATION",
      });
      return;
    }
    const result = await loginUser(parsed.data);
    res.json(result);
  } catch (err) {
    const e = err as Error & { status?: number; code?: string };
    res.status(e.status ?? 500).json({
      error: e.message || "Login failed",
      code: e.code || "LOGIN_FAILED",
    });
  }
});

/** Stateless JWT logout — client discards the token. */
router.post("/logout", requireAuth, (_req, res) => {
  res.json({ ok: true, message: "Logged out." });
});

router.get("/me", requireAuth, (req, res) => {
  const user = (req as AuthedRequest).user;
  res.json({ user });
});

/** Validate token without requiring middleware chaining elsewhere. */
router.get("/session", (req, res) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ")
      ? header.slice(7).trim()
      : null;
    if (!token) {
      res.status(401).json({ error: "Not authenticated", code: "UNAUTHORIZED" });
      return;
    }
    const user = getUserFromToken(token);
    res.json({ user });
  } catch (err) {
    const e = err as Error & { status?: number; code?: string };
    res.status(e.status ?? 401).json({
      error: e.message || "Not authenticated",
      code: e.code || "UNAUTHORIZED",
    });
  }
});

export default router;
