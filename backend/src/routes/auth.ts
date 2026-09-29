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
import { authStorageMode } from "../store/authStore.js";

const router = Router();

const registerSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
});

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

router.post("/register", async (req, res) => {
  try {
    const body = {
      name: req.body?.name,
      email: req.body?.email,
      password: req.body?.password,
      confirmPassword: req.body?.confirmPassword ?? req.body?.password,
    };
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid registration data",
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
        error: "Please enter your email and password",
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

router.post("/logout", requireAuth, (_req, res) => {
  res.json({ ok: true, message: "Logged out." });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: (req as AuthedRequest).user });
});

router.get("/session", async (req, res) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ")
      ? header.slice(7).trim()
      : null;
    if (!token) {
      res.status(401).json({ error: "Not authenticated", code: "UNAUTHORIZED" });
      return;
    }
    const user = await getUserFromToken(token);
    res.json({ user });
  } catch (err) {
    const e = err as Error & { status?: number; code?: string };
    res.status(e.status ?? 401).json({
      error: e.message || "Not authenticated",
      code: e.code || "UNAUTHORIZED",
    });
  }
});

router.get("/storage", (_req, res) => {
  res.json({ auth: { storage: authStorageMode() } });
});

export default router;
