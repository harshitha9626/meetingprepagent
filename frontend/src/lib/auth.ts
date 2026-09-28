// AI-Generated Code - 2026-09-29 - Composer
/**
 * Client-side token storage for JWT auth.
 * Cross-device access = login with the same email/password against the backend DB.
 */

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

const TOKEN_KEY = "briefed.auth.token";
const USER_KEY = "briefed.auth.user";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
