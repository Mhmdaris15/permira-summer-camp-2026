/**
 * Email transport — Resend over HTTPS (the same approach the Winter Camp
 * project uses: dependency-free `fetch` to the Resend REST API, sending as
 * info@permiraspb.org). Kept behind a small `sendRawEmail` interface so a
 * different provider (SMTP/nodemailer, SES, …) can be swapped in later
 * without touching templates, the service, or the routes.
 *
 * Config (env):
 *   RESEND_API_KEY  — Resend API key. If absent, sends fail cleanly (or are
 *                     simulated when EMAIL_DRY_RUN is on) rather than crashing.
 *   EMAIL_FROM      — From header. Default: PERMIRA Summer Camp <info@permiraspb.org>
 *   EMAIL_DRY_RUN   — "1"/"true" → don't call Resend; log and report success
 *                     as a "dry-run" so the whole flow is testable locally.
 */
import { logger } from "../../logger.js";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "PERMIRA Summer Camp 2026 <info@permiraspb.org>";

export type RawEmail = { to: string; subject: string; html: string };
export type SendOutcome = {
  ok: boolean;
  providerId?: string;
  error?: string;
  dryRun?: boolean;
};

function fromAddress(): string {
  const v = process.env.EMAIL_FROM?.trim();
  return v && v.length > 0 ? v : DEFAULT_FROM;
}

export function isDryRun(): boolean {
  const v = process.env.EMAIL_DRY_RUN?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function isEmailConfigured(): boolean {
  return isDryRun() || Boolean(process.env.RESEND_API_KEY?.trim());
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Send one email with a small retry (Resend's free tier is ~2 req/s; the
 * caller is responsible for throttling *between* recipients).
 */
export async function sendRawEmail(msg: RawEmail, attempts = 2): Promise<SendOutcome> {
  const key = process.env.RESEND_API_KEY?.trim();

  if (isDryRun()) {
    logger.info({ to: msg.to, subject: msg.subject }, "[email] dry-run (not actually sent)");
    return { ok: true, dryRun: true, providerId: "dry-run" };
  }
  if (!key) {
    logger.warn("[email] RESEND_API_KEY is not set — cannot send");
    return { ok: false, error: "Email is not configured on the server (RESEND_API_KEY missing)." };
  }

  let last: SendOutcome = { ok: false, error: "Not attempted." };
  for (let i = 0; i < Math.max(1, attempts); i++) {
    last = await attemptSend(key, msg);
    if (last.ok) return last;
    if (i < attempts - 1) await delay(1500);
  }
  return last;
}

async function attemptSend(key: string, msg: RawEmail): Promise<SendOutcome> {
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Resend ${res.status}: ${text.slice(0, 300)}` };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, providerId: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error." };
  }
}

/** Throttle to respect Resend's rate limit; skipped in dry-run for speed. */
export async function throttle(): Promise<void> {
  if (isDryRun()) return;
  await delay(600);
}
