/**
 * Email service — the orchestration layer the routes call. Resolves the
 * audience to a concrete recipient list, renders the chosen template per
 * recipient, sends via the provider (throttled + retried), and records every
 * result to the email history log.
 */
import { randomUUID } from "node:crypto";
import type {
  EmailLogEntry,
  Participant,
  SendEmailRequest,
  SendEmailResult,
} from "../../types.js";
import { getParticipant, listParticipants } from "../participants.js";
import { appendEmailLogs } from "../emailLog.js";
import { renderTemplate, defaultSubject } from "./templates.js";
import { sendRawEmail, throttle } from "./provider.js";

const PARTICIPANT_STATUSES = new Set(["accepted", "pending", "rejected", "waitlist"]);

/** Resolve the request's audience into the participants who should receive it. */
async function resolveRecipients(req: SendEmailRequest): Promise<Participant[]> {
  if (req.audience === "individual") {
    if (!req.participantId) throw new Error("participantId is required for an individual send.");
    const p = await getParticipant(req.participantId);
    if (!p) throw new Error("Participant not found.");
    return [p];
  }
  if (req.audience === "all") {
    return (await listParticipants({ limit: 500 })).rows;
  }
  if (PARTICIPANT_STATUSES.has(req.audience)) {
    return (await listParticipants({ status: req.audience, limit: 500 })).rows;
  }
  throw new Error(`Unknown audience: ${req.audience}`);
}

function validate(req: SendEmailRequest): void {
  if (!req || typeof req !== "object") throw new Error("Body must be a JSON object.");
  if (!req.templateId) throw new Error("templateId is required.");
  if (!req.audience) throw new Error("audience is required.");
  if (req.templateId === "custom") {
    if (!req.subject?.trim()) throw new Error("A subject is required for a custom announcement.");
    if (!req.message?.trim()) throw new Error("A message is required for a custom announcement.");
  }
}

/**
 * Send a campaign. Never throws per-recipient — a failed send is captured in
 * that recipient's log entry so a group send always completes and reports.
 */
export async function sendCampaign(
  req: SendEmailRequest,
  meta: { sentBy?: string } = {},
): Promise<SendEmailResult> {
  validate(req);
  const recipients = await resolveRecipients(req);
  const batchId = randomUUID();
  const entries: EmailLogEntry[] = [];

  for (const person of recipients) {
    const { subject, html } = renderTemplate(req.templateId, {
      name: person.fullName,
      subject: req.subject,
      heading: req.heading,
      message: req.message,
    });

    const outcome = await sendRawEmail({ to: person.email, subject, html });

    entries.push({
      id: randomUUID(),
      to: person.email,
      toName: person.fullName,
      subject,
      templateId: req.templateId,
      audience: req.audience,
      status: outcome.dryRun ? "dry-run" : outcome.ok ? "sent" : "failed",
      providerId: outcome.providerId,
      error: outcome.error,
      participantId: person.id,
      batchId,
      sentAt: new Date().toISOString(),
      sentBy: meta.sentBy,
    });

    await throttle();
  }

  await appendEmailLogs(entries);

  const sent = entries.filter((e) => e.status === "sent").length;
  const failed = entries.filter((e) => e.status === "failed").length;
  const dryRun = entries.filter((e) => e.status === "dry-run").length;

  return { batchId, total: entries.length, sent, failed, dryRun, entries };
}

/** Render a template without sending — used by the compose preview. */
export function previewTemplate(req: {
  templateId: SendEmailRequest["templateId"];
  name?: string;
  subject?: string;
  heading?: string;
  message?: string;
}): { subject: string; html: string } {
  return renderTemplate(req.templateId, {
    name: req.name?.trim() || "Sample Participant",
    subject: req.subject,
    heading: req.heading,
    message: req.message ?? (req.templateId === "custom" ? "Your announcement text will appear here." : ""),
  });
}

export { defaultSubject };
