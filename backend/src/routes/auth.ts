// AI-Generated Code - 2026-09-29 - Composer

import { Router } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import {
  getUserFromToken,
  loginUser,
  resendRegistrationOtp,
  startRegistration,
  verifyRegistrationOtp,
} from "../services/authService.js";
import { memoryAuthStats } from "../store/memoryAuthStore.js";

const router = Router();

const registerStartSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
});

const registerVerifySchema = z.object({
  pendingId: z.string().min(1),
  otp: z.string(),
});

const registerResendSchema = z.object({
  pendingId: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

router.post("/register/start", async (req, res) => {
  try {
    const parsed = registerStartSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid registration data",
        code: "VALIDATION",
      });
      return;
    }
    const result = await startRegistration(parsed.data);
    res.status(200).json(result);
  } catch (err) {
    const e = err as Error & { status?: number; code?: string };
    res.status(e.status ?? 500).json({
      error: e.message || "Registration failed",
      code: e.code || "REGISTER_FAILED",
    });
  }
});

/** Backward-compatible alias — starts OTP registration (does not create account yet). */
router.post("/register", async (req, res) => {
  try {
    const body = {
      name: req.body?.name,
      email: req.body?.email,
      password: req.body?.password,
      confirmPassword: req.body?.confirmPassword ?? req.body?.password,
    };
    const parsed = registerStartSchema.safeParse(body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid registration data",
        code: "VALIDATION",
      });
      return;
    }
    const result = await startRegistration(parsed.data);
    res.status(200).json(result);
  } catch (err) {
    const e = err as Error & { status?: number; code?: string };
    res.status(e.status ?? 500).json({
      error: e.message || "Registration failed",
      code: e.code || "REGISTER_FAILED",
    });
  }
});

router.post("/register/verify", async (req, res) => {
  try {
    const parsed = registerVerifySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid OTP",
        code: "VALIDATION",
      });
      return;
    }
    const result = await verifyRegistrationOtp(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    const e = err as Error & { status?: number; code?: string };
    res.status(e.status ?? 500).json({
      error: e.message || "OTP verification failed",
      code: e.code || "OTP_VERIFY_FAILED",
    });
  }
});

router.post("/register/resend", async (req, res) => {
  try {
    const parsed = registerResendSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid request",
        code: "VALIDATION",
      });
      return;
    }
    const result = await resendRegistrationOtp(parsed.data);
    res.json(result);
  } catch (err) {
    const e = err as Error & { status?: number; code?: string };
    res.status(e.status ?? 500).json({
      error: e.message || "Could not resend OTP",
      code: e.code || "OTP_RESEND_FAILED",
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
  const user = (req as AuthedRequest).user;
  res.json({ user });
});

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

router.get("/storage", (_req, res) => {
  res.json({ auth: memoryAuthStats() });
});

export default router;
