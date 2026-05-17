import { Router } from "express";
import { requireAdmin } from "../auth.js";
import { getFile, streamFile } from "../services/files.js";

export const filesRouter: Router = Router();

filesRouter.get("/:id", requireAdmin, async (req, res) => {
  const meta = await getFile(req.params.id as string);
  if (!meta) {
    res.status(404).json({ error: "File not found." });
    return;
  }
  res.setHeader("Content-Type", meta.mime);
  res.setHeader("Content-Length", String(meta.size));
  // `inline` so PDFs/images render in the browser tab; admin can still
  // right-click → Save As if they need a local copy.
  const safeName = meta.originalName.replace(/[^\w.\-+ ]/g, "_");
  res.setHeader("Content-Disposition", `inline; filename="${safeName}"`);

  streamFile(meta).on("error", (err) => {
    console.error("[files] stream error:", err);
    if (!res.headersSent) res.status(500).end();
  }).pipe(res);
});
