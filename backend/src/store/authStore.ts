// AI-Generated Code - 2026-09-29 - Composer
/**
 * Simple in-memory user store (prototype). Cleared on restart.
 */

export type MemoryUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

const usersByEmail = new Map<string, MemoryUser>();
const usersById = new Map<string, MemoryUser>();

export function authStorageMode(): "memory" {
  return "memory";
}

export function findUserByEmail(email: string): MemoryUser | undefined {
  return usersByEmail.get(email.trim().toLowerCase());
}

export function findUserById(id: string): MemoryUser | undefined {
  return usersById.get(id);
}

export function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): MemoryUser {
  const email = input.email.trim().toLowerCase();
  if (usersByEmail.has(email)) {
    throw Object.assign(new Error("Email already registered"), {
      status: 409,
      code: "EMAIL_TAKEN",
    });
  }
  const user: MemoryUser = {
    id: crypto.randomUUID(),
    name: input.name,
    email,
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString(),
  };
  usersById.set(user.id, user);
  usersByEmail.set(email, user);
  return user;
}
