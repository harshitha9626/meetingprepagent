// AI-Generated Code - 2026-09-29 - Composer
/**
 * JWT auth middleware. Derives userId from the token — never from the request body.
 */

import type { NextFunction, Request, Response } from "express";
import { getUserFromToken, type AuthUser } from "../services/authService.js";
import { runWithAuthUser } from "../services/requestContext.js";

export type AuthedRequest = Request & { user: AuthUser };

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token?.trim()) return null;
  return token.trim();
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractBearer(req);
    if (!token) {
      res.status(401).json({
        error: "Authentication required. Please log in.",
        code: "UNAUTHORIZED",
      });
      return;
    }
    const user = await getUserFromToken(token);
    (req as AuthedRequest).user = user;
    runWithAuthUser(user, () => {
      next();
    });
  } catch (err) {
    const e = err as Error & { status?: number; code?: string };
    res.status(e.status ?? 401).json({
      error: e.message || "Authentication required. Please log in.",
      code: e.code || "UNAUTHORIZED",
    });
  }
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractBearer(req);
    if (token) {
      const user = await getUserFromToken(token);
      (req as AuthedRequest).user = user;
      runWithAuthUser(user, () => next());
      return;
    }
  } catch {
    /* treat as anonymous */
  }
  next();
}
