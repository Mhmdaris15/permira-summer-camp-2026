import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthClaims } from "./types.js";

const JWT_TTL_SECONDS = 24 * 60 * 60; // 24h

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET must be set on the server (16+ chars).");
  }
  return secret;
}

function getAdminToken(): string {
  const t = process.env.ADMIN_TOKEN;
  if (!t) throw new Error("ADMIN_TOKEN is not set on the server.");
  return t;
}

export function isValidAdminToken(provided: string): boolean {
  try {
    const expected = getAdminToken();
    return timingSafeEqual(provided, expected);
  } catch {
    return false;
  }
}

export function issueAdminJwt(): string {
  return jwt.sign({ sub: "admin" }, getJwtSecret(), {
    expiresIn: JWT_TTL_SECONDS,
    issuer: "permira-server",
    audience: "permira-admin",
  });
}

/**
 * Verifies a Bearer JWT and attaches claims to res.locals.auth.
 * Falls back to ADMIN_TOKEN bearer for the legacy verify endpoint only —
 * see knowledgeRouter — which is mounted with `requireAdminLegacy`.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const provided = readBearer(req);
  if (!provided) {
    res.status(401).json({ error: "Missing Authorization header." });
    return;
  }
  try {
    const claims = jwt.verify(provided, getJwtSecret(), {
      issuer: "permira-server",
      audience: "permira-admin",
    }) as AuthClaims;
    res.locals.auth = claims;
    next();
  } catch (err) {
    const reason =
      err instanceof jwt.TokenExpiredError
        ? "Session expired — please sign in again."
        : "Invalid or expired session.";
    res.status(401).json({ error: reason });
  }
}

/**
 * Accepts either a valid JWT OR the raw ADMIN_TOKEN. Used only by the
 * legacy `/verify` endpoint so existing admin sessions don't break while
 * the frontend migrates to JWTs.
 */
export function requireAdminLegacy(req: Request, res: Response, next: NextFunction) {
  const provided = readBearer(req);
  if (!provided) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }
  if (isValidAdminToken(provided)) return next();
  // Fall through to JWT validation
  requireAdmin(req, res, next);
}

function readBearer(req: Request): string {
  const header = req.header("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
