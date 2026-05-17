import { Router } from "express";
import { isValidAdminToken, issueAdminJwt, requireAdmin } from "../auth.js";

export const authRouter: Router = Router();

authRouter.post("/login", (req, res) => {
  const { token } = (req.body ?? {}) as { token?: string };
  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "Provide `token` in the request body." });
    return;
  }
  if (!isValidAdminToken(token)) {
    res.status(401).json({ error: "Invalid token." });
    return;
  }
  try {
    const jwt = issueAdminJwt();
    res.json({ token: jwt, expiresInSeconds: 24 * 60 * 60 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server misconfigured.";
    res.status(500).json({ error: message });
  }
});

// Verifies the holder still has a valid session — used by the admin UI
// on mount to decide whether to show the login form or the dashboard.
authRouter.get("/me", requireAdmin, (_req, res) => {
  res.json({ ok: true, role: "admin" });
});
