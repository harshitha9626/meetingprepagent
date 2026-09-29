// AI-Generated Code - 2026-09-29 - Composer
/**
 * Password hashing + JWT issuance. Secrets never leave the backend.
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  findUserById,
  type UserRecord,
} from "../store/db.js";

const BCRYPT_ROUNDS = 12;
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
    // Dev-friendly fallback; production / Vercel must set JWT_SECRET
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

function toPublicUser(user: UserRecord): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password.length > 128) {
    return "Password must be at most 128 characters.";
  }
  return null;
}

export function signAuthToken(user: UserRecord): string {
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
    throw Object.assign(new Error("Invalid or expired session. Please log in again."), {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: AuthUser; token: string }> {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const passwordError = validatePassword(input.password);
  if (!name) {
    throw Object.assign(new Error("Name is required."), {
      status: 400,
      code: "VALIDATION",
    });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw Object.assign(new Error("Enter a valid email address."), {
      status: 400,
      code: "VALIDATION",
    });
  }
  if (passwordError) {
    throw Object.assign(new Error(passwordError), {
      status: 400,
      code: "VALIDATION",
    });
  }
  if (findUserByEmail(email)) {
    throw Object.assign(new Error("An account with this email already exists."), {
      status: 409,
      code: "EMAIL_TAKEN",
    });
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = createUser({ name, email, passwordHash });
  const token = signAuthToken(user);
  return { user: toPublicUser(user), token };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser; token: string }> {
  const email = normalizeEmail(input.email);
  const user = findUserByEmail(email);
  if (!user) {
    throw Object.assign(new Error("Invalid email or password."), {
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw Object.assign(new Error("Invalid email or password."), {
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  }
  const token = signAuthToken(user);
  return { user: toPublicUser(user), token };
}

export function getUserFromToken(token: string): AuthUser {
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
