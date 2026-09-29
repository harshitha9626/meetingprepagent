// AI-Generated Code - 2026-09-29 - Composer
/**
 * Auth service: in-memory users + OTP registration (hackathon/demo).
 * Passwords hashed with bcryptjs. OTP hashed at rest in memory.
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  memoryCreateUser,
  memoryDeletePending,
  memoryFindUserByEmail,
  memoryFindUserById,
  memoryGetPendingByEmail,
  memoryGetPendingById,
  memoryUpsertPending,
  type MemoryUser,
  type PendingRegistration,
} from "../store/memoryAuthStore.js";

const BCRYPT_ROUNDS = 12;
const TOKEN_TTL = "7d";
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
const OTP_MAX_ATTEMPTS = 5;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      throw Object.assign(
        new Error(
          "JWT_SECRET must be set (min 16 characters) in the Vercel/project environment."
        ),
        { status: 500, code: "AUTH_MISCONFIGURED" }
      );
    }
    return "briefed-dev-jwt-secret-change-me";
  }
  return secret;
}

function toPublicUser(user: MemoryUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Please enter your name";
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  if (trimmed.length > 50) return "Name must be at most 50 characters";
  // Letters, spaces, hyphen, apostrophe only
  if (!/^[A-Za-z]+(?:[ '\-][A-Za-z]+)*$/.test(trimmed)) {
    return "Name may only contain letters and spaces";
  }
  return null;
}

export function validateEmailFormat(email: string): string | null {
  const normalized = normalizeEmail(email);
  if (!normalized) return "Please enter your email";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return "Enter a valid email address";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Please enter a password";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password must be at most 128 characters";
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one special character";
  }
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | null {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function shouldExposeDemoOtp(): boolean {
  if (process.env.DEMO_OTP === "0") return false;
  if (process.env.DEMO_OTP === "1") return true;
  // Default: demo OTP visible outside strict production email setups
  return !process.env.SMTP_HOST;
}

export function signAuthToken(user: MemoryUser): string {
  const payload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
  };
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: TOKEN_TTL,
    issuer: "briefed-api",
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: "briefed-api",
    }) as jwt.JwtPayload;
    if (!decoded.sub || typeof decoded.sub !== "string") {
      throw new Error("Invalid token subject");
    }
    return {
      sub: decoded.sub,
      email: String(decoded.email || ""),
    };
  } catch {
    throw Object.assign(
      new Error("Invalid or expired session. Please log in again."),
      { status: 401, code: "UNAUTHORIZED" }
    );
  }
}

export type RegisterStartResult = {
  pendingId: string;
  email: string;
  expiresInSeconds: number;
  resendAvailableInSeconds: number;
  demoOtp?: string;
  message: string;
};

export async function startRegistration(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<RegisterStartResult> {
  const nameError = validateName(input.name);
  if (nameError) {
    throw Object.assign(new Error(nameError), {
      status: 400,
      code: "VALIDATION",
    });
  }
  const emailError = validateEmailFormat(input.email);
  if (emailError) {
    throw Object.assign(new Error(emailError), {
      status: 400,
      code: "VALIDATION",
    });
  }
  const passwordError = validatePassword(input.password);
  if (passwordError) {
    throw Object.assign(new Error(passwordError), {
      status: 400,
      code: "VALIDATION",
    });
  }
  const confirmError = validateConfirmPassword(
    input.password,
    input.confirmPassword
  );
  if (confirmError) {
    throw Object.assign(new Error(confirmError), {
      status: 400,
      code: "VALIDATION",
    });
  }

  const name = input.name.trim().replace(/\s+/g, " ");
  const email = normalizeEmail(input.email);

  if (memoryFindUserByEmail(email)) {
    throw Object.assign(new Error("Email already registered"), {
      status: 409,
      code: "EMAIL_TAKEN",
    });
  }

  const existingPending = memoryGetPendingByEmail(email);
  if (
    existingPending &&
    Date.now() - existingPending.lastSentAt < OTP_RESEND_COOLDOWN_MS
  ) {
    const wait = Math.ceil(
      (OTP_RESEND_COOLDOWN_MS - (Date.now() - existingPending.lastSentAt)) /
        1000
    );
    throw Object.assign(
      new Error(`Please wait ${wait}s before requesting another OTP`),
      { status: 429, code: "OTP_COOLDOWN" }
    );
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS);
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const now = Date.now();
  const pending: PendingRegistration = {
    id: existingPending?.id ?? crypto.randomUUID(),
    name,
    email,
    passwordHash,
    otpHash,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    lastSentAt: now,
    createdAt: existingPending?.createdAt ?? new Date().toISOString(),
  };
  memoryUpsertPending(pending);

  console.info(
    `[briefed-auth] OTP issued for ${email} (expires in ${OTP_TTL_MS / 1000}s)`
  );
  if (shouldExposeDemoOtp()) {
    console.info(`[briefed-auth] DEMO OTP for ${email}: ${otp}`);
  }

  const result: RegisterStartResult = {
    pendingId: pending.id,
    email,
    expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
    resendAvailableInSeconds: Math.floor(OTP_RESEND_COOLDOWN_MS / 1000),
    message: "OTP sent. Enter the 6-digit code to verify your email.",
  };
  if (shouldExposeDemoOtp()) {
    result.demoOtp = otp;
    result.message =
      "Demo mode: use the OTP shown below (no email provider configured).";
  }
  return result;
}

export async function resendRegistrationOtp(input: {
  pendingId: string;
}): Promise<RegisterStartResult> {
  const pending = memoryGetPendingById(input.pendingId);
  if (!pending) {
    throw Object.assign(
      new Error("Registration session expired. Please start again."),
      { status: 400, code: "PENDING_NOT_FOUND" }
    );
  }
  if (memoryFindUserByEmail(pending.email)) {
    memoryDeletePending(pending.id);
    throw Object.assign(new Error("Email already registered"), {
      status: 409,
      code: "EMAIL_TAKEN",
    });
  }
  const now = Date.now();
  if (now - pending.lastSentAt < OTP_RESEND_COOLDOWN_MS) {
    const wait = Math.ceil(
      (OTP_RESEND_COOLDOWN_MS - (now - pending.lastSentAt)) / 1000
    );
    throw Object.assign(
      new Error(`Please wait ${wait}s before requesting another OTP`),
      { status: 429, code: "OTP_COOLDOWN" }
    );
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS);
  const updated: PendingRegistration = {
    ...pending,
    otpHash,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    lastSentAt: now,
  };
  memoryUpsertPending(updated);

  console.info(`[briefed-auth] OTP resent for ${pending.email}`);
  if (shouldExposeDemoOtp()) {
    console.info(`[briefed-auth] DEMO OTP for ${pending.email}: ${otp}`);
  }

  const result: RegisterStartResult = {
    pendingId: updated.id,
    email: updated.email,
    expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
    resendAvailableInSeconds: Math.floor(OTP_RESEND_COOLDOWN_MS / 1000),
    message: "A new OTP has been sent.",
  };
  if (shouldExposeDemoOtp()) {
    result.demoOtp = otp;
    result.message = "Demo mode: a new OTP is shown below.";
  }
  return result;
}

export async function verifyRegistrationOtp(input: {
  pendingId: string;
  otp: string;
}): Promise<{ user: AuthUser; token: string }> {
  const otp = String(input.otp ?? "").trim();
  if (!/^\d{6}$/.test(otp)) {
    throw Object.assign(new Error("Invalid OTP"), {
      status: 400,
      code: "VALIDATION",
    });
  }

  const pending = memoryGetPendingById(input.pendingId);
  if (!pending) {
    throw Object.assign(
      new Error("Registration session expired. Please start again."),
      { status: 400, code: "PENDING_NOT_FOUND" }
    );
  }

  if (Date.now() > pending.expiresAt) {
    memoryDeletePending(pending.id);
    throw Object.assign(new Error("OTP expired"), {
      status: 400,
      code: "OTP_EXPIRED",
    });
  }

  if (pending.attempts >= OTP_MAX_ATTEMPTS) {
    memoryDeletePending(pending.id);
    throw Object.assign(new Error("Too many OTP attempts"), {
      status: 429,
      code: "OTP_LOCKED",
    });
  }

  const match = await bcrypt.compare(otp, pending.otpHash);
  if (!match) {
    pending.attempts += 1;
    memoryUpsertPending(pending);
    if (pending.attempts >= OTP_MAX_ATTEMPTS) {
      memoryDeletePending(pending.id);
      throw Object.assign(new Error("Too many OTP attempts"), {
        status: 429,
        code: "OTP_LOCKED",
      });
    }
    throw Object.assign(new Error("Invalid OTP"), {
      status: 400,
      code: "OTP_INVALID",
    });
  }

  if (memoryFindUserByEmail(pending.email)) {
    memoryDeletePending(pending.id);
    throw Object.assign(new Error("Email already registered"), {
      status: 409,
      code: "EMAIL_TAKEN",
    });
  }

  const user = memoryCreateUser({
    name: pending.name,
    email: pending.email,
    passwordHash: pending.passwordHash,
  });
  memoryDeletePending(pending.id);
  const token = signAuthToken(user);
  return { user: toPublicUser(user), token };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser; token: string }> {
  const emailError = validateEmailFormat(input.email);
  if (emailError) {
    throw Object.assign(new Error(emailError), {
      status: 400,
      code: "VALIDATION",
    });
  }
  if (!input.password) {
    throw Object.assign(new Error("Please enter a password"), {
      status: 400,
      code: "VALIDATION",
    });
  }

  const email = normalizeEmail(input.email);
  const user = memoryFindUserByEmail(email);
  if (!user) {
    throw Object.assign(new Error("Invalid email or password"), {
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw Object.assign(new Error("Invalid email or password"), {
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  }
  return { user: toPublicUser(user), token: signAuthToken(user) };
}

export function getUserFromToken(token: string): AuthUser {
  const payload = verifyAuthToken(token);
  const user = memoryFindUserById(payload.sub);
  if (!user) {
    throw Object.assign(new Error("Account not found. Please log in again."), {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }
  return toPublicUser(user);
}
