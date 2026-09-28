// AI-Generated Code - 2026-09-29 - Composer
/**
 * Request-scoped authenticated user for Hindsight bank isolation.
 */

import { AsyncLocalStorage } from "node:async_hooks";
import type { AuthUser } from "./authService.js";

const store = new AsyncLocalStorage<AuthUser>();

export function runWithAuthUser<T>(user: AuthUser, fn: () => T): T {
  return store.run(user, fn);
}

export function getAuthUser(): AuthUser | undefined {
  return store.getStore();
}

export function requireAuthUser(): AuthUser {
  const user = store.getStore();
  if (!user) {
    throw Object.assign(new Error("Authentication required."), {
      status: 401,
      code: "UNAUTHORIZED",
    });
  }
  return user;
}
