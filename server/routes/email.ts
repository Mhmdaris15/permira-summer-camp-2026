/**
 * Admin email routes. Mounted behind `requireAdmin` in index.ts, so every
 * endpoint here already requires a valid admin session.
 *
 *   POST /api/email/send      — send a template to an individual or group
 *   POST /api/email/preview   — render a template to HTML (no send)
 *   GET  /api/email/history   — list previously sent emails + status
 *   GET  /api/email/templates — template metadata for the compose UI
 */
import { Router, type Response } from "express";
import type { EmailLogStatus, SendEmailRequest } from "../types.js";
import { sendCampaign, previewTemplate } from "../services/email/service.js";
import { listEmailLogs } from "../services/emailLog.js";
import { TEMPLATE_META } from "../services/email/templates.js";
import { isEmailConfigured, isDryRun } from "../services/email/provider.js";

export const emailRouter: Router = Router();

const LOG_STATUSES = new Set<EmailLogStatus>(["sent", "failed", "dry-run"]);

emailRouter.get("/templates", (_req, res) => {
  res.json({ templates: TEMPLATE_META, configured: isEmailConfigured(), dryRun: isDryRun() });
});

emailRouter.post("/preview", (req, res) => {
  try {
    const body = req.body as {
      templateId: SendEmailRequest["templateId"];
      name?: string;
      subject?: string;
      heading?: string;
      message?: string;
    };
    if (!body?.templateId) throw new Error("templateId is required.");
    const { subject, html } = previewTemplate(body);
    res.json({ subject, html });
  } catch (err) {
    handleError(err, res);
  }
});

emailRouter.post("/send", async (req, res) => {
  try {
    const result = await sendCampaign(req.body as SendEmailRequest, {
      sentBy: (res.locals.auth as { sub?: string } | undefined)?.sub ?? "admin",
    });
    res.json(result);
  } catch (err) {
    handleError(err, res);
  }
});

emailRouter.get("/history", async (req, res) => {
  const { status, limit, offset } = req.query;
  const result = await listEmailLogs({
    status:
      typeof status === "string" && LOG_STATUSES.has(status as EmailLogStatus)
        ? (status as EmailLogStatus)
        : undefined,
    limit: typeof limit === "string" ? Number(limit) : undefined,
    offset: typeof offset === "string" ? Number(offset) : undefined,
  });
  res.json(result);
});

function handleError(err: unknown, res: Response) {
  const message = err instanceof Error ? err.message : "Unknown error.";
  res.status(400).json({ error: message });
}
