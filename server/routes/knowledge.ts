import { Router } from "express";
import { composeContext, loadKnowledge, saveKnowledge, validateKnowledge } from "../knowledge.js";
import { requireAdmin, requireAdminLegacy } from "../auth.js";

export const knowledgeRouter: Router = Router();

// Public read — same shape the admin edits, used by the admin UI to bootstrap
// and (optionally) by the chat widget for inline FAQ surfacing later.
knowledgeRouter.get("/", async (_req, res) => {
  const kb = await loadKnowledge();
  res.json(kb);
});

// Returns the composed prompt context — handy for the admin "preview" pane.
knowledgeRouter.get("/preview", requireAdmin, async (_req, res) => {
  const kb = await loadKnowledge();
  res.json({ context: composeContext(kb) });
});

knowledgeRouter.put("/", requireAdmin, async (req, res) => {
  try {
    const validated = validateKnowledge(req.body);
    const saved = await saveKnowledge(validated);
    res.json(saved);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid payload.";
    res.status(400).json({ error: message });
  }
});

// Legacy verify endpoint — accepts either a JWT or the raw ADMIN_TOKEN.
// Kept so the previous admin UI can call it during migration; new clients
// should use POST /api/auth/login + GET /api/auth/me instead.
knowledgeRouter.post("/admin/verify", requireAdminLegacy, (_req, res) => {
  res.json({ ok: true });
});
