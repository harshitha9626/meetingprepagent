// AI-Generated Code - 2026-09-29 - Composer
/**
 * Simple auth: in-memory users + bcrypt passwords + JWT sessions.
 * No email verification / OTP.
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  findUserById,
  type MemoryUser,
} from "../store/authStore.js";

const BCRYPT_ROUNDS = 10;
const TOKEN_TTL = "7d";

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
        new Error("JWT_SECRET must be set (min 16 characters)."),
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

export function signAuthToken(user: MemoryUser): string {
  return jwt.sign(
    { sub: user.id, email: user.email } satisfies AuthTokenPayload,
    getJwtSecret(),
    { expiresIn: TOKEN_TTL, issuer: "briefed-api" }
  );
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: "briefed-api",
    }) as jwt.JwtPayload;
    if (!decoded.sub || typeof decoded.sub !== "string") {
      throw new Error("Invalid token");
    }
    return { sub: decoded.sub, email: String(decoded.email || "") };
  } catch {
    throw Object.assign(
      new Error("Invalid or expired session. Please log in again."),
      { status: 401, code: "UNAUTHORIZED" }
    );
  }
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<{ user: AuthUser; message: string }> {
  const nameError = validateName(input.name);
  if (nameError) {
    throw Object.assign(new Error(nameError), { status: 400, code: "VALIDATION" });
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

  if (findUserByEmail(email)) {
    throw Object.assign(new Error("Email already registered"), {
      status: 409,
      code: "EMAIL_TAKEN",
    });
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = createUser({ name, email, passwordHash });
  return {
    user: toPublicUser(user),
    message: "Account created. Please log in.",
  };
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

  const user = findUserByEmail(normalizeEmail(input.email));
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

export async function getUserFromToken(token: string): Promise<AuthUser> {
  const payload = verifyAuthToken(token);
  const user = findUserById(payload.sub);
  if (!user) {
    throw Object.assign(new Error("Account not found. Please log in again."), {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }
  return toPublicUser(user);
}
