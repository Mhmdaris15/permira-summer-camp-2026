import { Router } from "express";
import { requireAdmin } from "../auth.js";
import { getSignedFileUrl } from "../services/files.js";

export const filesRouter: Router = Router();

// Returns a short-lived presigned R2 URL the admin browser can load directly
// (image/PDF preview or download). Objects are private in R2; the JWT gate
// here is what authorizes minting the signed URL.
filesRouter.get("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await getSignedFileUrl(req.params.id as string);
    if (!result) {
      res.status(404).json({ error: "File not found." });
      return;
    }
    res.json(result);
  } catch (err) {
    console.error("[files] presign error:", err);
    // Admin-only endpoint, so it's safe (and useful) to surface the reason.
    res.status(500).json({
      error: "Could not generate file URL.",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});
