// AI-Generated Code - 2026-09-29 - Composer
/**
 * In-memory auth store for hackathon/demo.
 * Users and pending OTP registrations live in process memory only.
 * Lost on cold start / redeploy — intentional for Vercel compatibility.
 */

export type MemoryUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type PendingRegistration = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  otpHash: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  createdAt: string;
};

const usersById = new Map<string, MemoryUser>();
const usersByEmail = new Map<string, MemoryUser>();
const pendingById = new Map<string, PendingRegistration>();
const pendingByEmail = new Map<string, string>(); // email → pendingId

export function memoryFindUserByEmail(email: string): MemoryUser | undefined {
  return usersByEmail.get(email.trim().toLowerCase());
}

export function memoryFindUserById(id: string): MemoryUser | undefined {
  return usersById.get(id);
}

export function memoryCreateUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  id?: string;
}): MemoryUser {
  const email = input.email.trim().toLowerCase();
  if (usersByEmail.has(email)) {
    throw Object.assign(new Error("Email already registered"), {
      status: 409,
      code: "EMAIL_TAKEN",
    });
  }
  const user: MemoryUser = {
    id: input.id ?? crypto.randomUUID(),
    name: input.name,
    email,
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString(),
  };
  usersById.set(user.id, user);
  usersByEmail.set(email, user);
  return user;
}

export function memoryGetPendingById(
  id: string
): PendingRegistration | undefined {
  return pendingById.get(id);
}

export function memoryGetPendingByEmail(
  email: string
): PendingRegistration | undefined {
  const id = pendingByEmail.get(email.trim().toLowerCase());
  return id ? pendingById.get(id) : undefined;
}

export function memoryUpsertPending(
  pending: PendingRegistration
): PendingRegistration {
  const email = pending.email.trim().toLowerCase();
  const existingId = pendingByEmail.get(email);
  if (existingId && existingId !== pending.id) {
    pendingById.delete(existingId);
  }
  pendingById.set(pending.id, { ...pending, email });
  pendingByEmail.set(email, pending.id);
  return pending;
}

export function memoryDeletePending(id: string): void {
  const pending = pendingById.get(id);
  if (!pending) return;
  pendingById.delete(id);
  const mapped = pendingByEmail.get(pending.email);
  if (mapped === id) pendingByEmail.delete(pending.email);
}

export function memoryAuthStats(): {
  users: number;
  pending: number;
  storage: "memory";
} {
  return {
    users: usersById.size,
    pending: pendingById.size,
    storage: "memory",
  };
}
