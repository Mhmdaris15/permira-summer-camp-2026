/**
 * Email templates — Summer Camp branded, email-client-safe HTML.
 *
 * Design notes (deliberately NOT the Winter Camp look):
 *   • Palette = Summer Camp tokens — warm cream card on a cream page, deep
 *     "clove" header band, saffron/terracotta accents, nature greens.
 *   • Table-based layout + 100% inline CSS so it renders in every client.
 *   • Web fonts can't load in email, so headings fall back to Georgia (a
 *     serif that echoes the site's Fraunces); body uses a system sans stack.
 *
 * Everything is a pure function: `renderTemplate(id, ctx) -> {subject, html}`.
 * Add a new template by extending `EmailTemplateId`, adding a builder here,
 * and registering it in `BUILDERS` / `TEMPLATE_META`. Nothing else changes.
 */
import type { EmailTemplateId, EmailTemplateMeta } from "../../types.js";

// --- Brand tokens (hex mirrors src/index.css @theme) ---
const C = {
  cream50: "#fdf8f1",
  cream100: "#faf0e1",
  cream200: "#f3e2c7",
  sand: "#d4a574",
  saffron: "#e07b3c",
  terracotta: "#c4502a",
  terracottaDark: "#a23d1f",
  clove700: "#6b2e1a",
  clove900: "#2c130b",
  ink: "#1a0e07",
  leaf: "#4a6b3a",
  pine: "#2f5d3a",
  fern: "#6f9e57",
  river: "#3f7c93",
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const CONTACT_EMAIL = "info@permiraspb.org";
const EVENT_LINE = "17–19 July 2026 · Kubenskiy Island, Saint Petersburg";

// --- HTML helpers ---

/** Escape user/dynamic text so it can't break or inject into the markup. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** First name for a warm greeting; falls back to the whole string. */
function firstName(full: string): string {
  const n = full.trim().split(/\s+/)[0];
  return n || "there";
}

/** Turn a plain-text block (escaped) into paragraphs + <br> line breaks. */
function paragraphsFromText(text: string): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .map(
      (block) =>
        `<p style="margin:0 0 16px;color:${C.clove700};font-size:15px;line-height:1.7;">${esc(
          block,
        ).replace(/\n/g, "<br/>")}</p>`,
    )
    .join("");
}

function p(html: string): string {
  return `<p style="margin:0 0 16px;color:${C.clove700};font-size:15px;line-height:1.7;">${html}</p>`;
}

function callout(accent: string, html: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;"><tr><td style="border-left:4px solid ${accent};background:${C.cream100};border-radius:0 12px 12px 0;padding:16px 18px;color:${C.clove900};font-size:14px;line-height:1.6;">${html}</td></tr></table>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 14px;font-family:${SERIF};font-weight:400;font-size:26px;line-height:1.25;color:${C.clove900};">${esc(
    text,
  )}</h1>`;
}

/** Shared shell: cream page, clove header band, accent rule, footer. */
function layout(opts: {
  preheader: string;
  eyebrow: string;
  accent: string;
  bodyHtml: string;
}): string {
  const { preheader, eyebrow, accent, bodyHtml } = opts;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="color-scheme" content="light"/>
</head>
<body style="margin:0;padding:0;background:${C.cream100};font-family:${SANS};">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream100};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:${C.cream50};border-radius:20px;overflow:hidden;box-shadow:0 20px 50px -24px rgba(44,19,11,0.45);">
          <!-- Header band -->
          <tr>
            <td style="background:${C.clove900};padding:28px 36px 24px;">
              <div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${C.saffron};font-weight:600;">${esc(
    eyebrow,
  )}</div>
              <div style="margin-top:8px;font-family:${SERIF};font-size:22px;color:${C.cream50};font-weight:400;">PERMIRA Summer Camp <span style="color:${C.saffron};">2026</span></div>
              <div style="margin-top:4px;font-size:12px;color:rgba(253,248,241,0.65);letter-spacing:0.02em;">Taste of Nusantara · Indonesia × Russia × ASEAN</div>
            </td>
          </tr>
          <!-- Accent rule -->
          <tr><td style="height:4px;background:${accent};font-size:0;line-height:0;">&nbsp;</td></tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 36px 8px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 36px 30px;border-top:1px solid ${C.cream200};background:${C.cream50};">
              <div style="font-size:12px;color:${C.clove700};line-height:1.6;">
                <strong style="color:${C.clove900};">PERMIRA Saint Petersburg</strong><br/>
                ${EVENT_LINE}<br/>
                <a href="mailto:${CONTACT_EMAIL}" style="color:${C.terracotta};text-decoration:none;">${CONTACT_EMAIL}</a>
              </div>
              <div style="margin-top:14px;font-size:11px;color:rgba(107,46,26,0.6);">© 2026 PERMIRA Saint Petersburg. You're receiving this because you registered for PERMIRA Summer Camp 2026.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// --- Template context + defaults ---

export type RenderContext = {
  /** Recipient full name (used for the greeting). */
  name: string;
  /** Overrides the default subject (required for `custom`). */
  subject?: string;
  /** Heading override (mainly for `custom`). */
  heading?: string;
  /** Free-form body for `custom`; an optional extra note for the rest. */
  message?: string;
};

const DEFAULT_SUBJECTS: Record<EmailTemplateId, string> = {
  registrationReceived: "We've received your registration — PERMIRA Summer Camp 2026",
  pending: "Your application is under review — PERMIRA Summer Camp 2026",
  accepted: "Congratulations — you're accepted to PERMIRA Summer Camp 2026",
  rejected: "Update on your PERMIRA Summer Camp 2026 application",
  custom: "A message from PERMIRA Summer Camp 2026",
};

// Optional admin note appended to a status template.
function noteBlock(message?: string): string {
  if (!message || !message.trim()) return "";
  return callout(
    C.sand,
    `<div style="font-weight:600;color:${C.clove900};margin-bottom:4px;">A note from the team</div>${esc(
      message,
    ).replace(/\n/g, "<br/>")}`,
  );
}

// --- Builders ---

type Builder = (ctx: RenderContext) => { eyebrow: string; accent: string; preheader: string; body: string };

const BUILDERS: Record<EmailTemplateId, Builder> = {
  registrationReceived: (ctx) => ({
    eyebrow: "Registration received",
    accent: C.river,
    preheader: "Thanks — we've received your registration and will be in touch.",
    body:
      heading(`Thank you, ${esc(firstName(ctx.name))} — we've got your application.`) +
      p(
        `We've received your registration for <strong>PERMIRA Summer Camp 2026</strong>, the Indonesia–Russia–ASEAN youth camp on Kubenskiy Island near Saint Petersburg.`,
      ) +
      callout(
        C.river,
        `<strong>What happens next?</strong><br/>Our team reviews every application personally. You'll get an email at this address as soon as a decision is made — no need to do anything for now.`,
      ) +
      p(`Dates &amp; place: <strong>${EVENT_LINE}</strong>.`) +
      noteBlock(ctx.message) +
      p(
        `Questions in the meantime? Just reply to this email or write to <a href="mailto:${CONTACT_EMAIL}" style="color:${C.terracotta};text-decoration:none;">${CONTACT_EMAIL}</a>.`,
      ),
  }),

  pending: (ctx) => ({
    eyebrow: "Application update",
    accent: C.saffron,
    preheader: "Your application is under review.",
    body:
      heading(`Your application is under review`) +
      p(`Hi ${esc(firstName(ctx.name))},`) +
      p(
        `Thank you for applying to <strong>PERMIRA Summer Camp 2026</strong>. Your application is currently <strong>under review</strong> by our selection team.`,
      ) +
      callout(
        C.saffron,
        `We'll email you the moment there's an update. Selection takes a little time because we read every application carefully — thank you for your patience.`,
      ) +
      noteBlock(ctx.message) +
      p(`Warm regards,<br/>The PERMIRA Summer Camp team`),
  }),

  accepted: (ctx) => ({
    eyebrow: "Congratulations",
    accent: C.leaf,
    preheader: "Great news — you've been accepted to PERMIRA Summer Camp 2026!",
    body:
      heading(`You're in, ${esc(firstName(ctx.name))}! 🎉`) +
      p(
        `We're delighted to invite you to join <strong>PERMIRA Summer Camp 2026</strong>. After a careful review, we'd love to have you with us.`,
      ) +
      callout(
        C.leaf,
        `<strong>Your place is confirmed.</strong><br/>${EVENT_LINE}. You'll arrive by boat at the island pier — full joining details are on the way.`,
      ) +
      p(
        `Keep an eye on this inbox for the next email with what to bring, the programme, and travel guidance. If you have questions, reply here or write to <a href="mailto:${CONTACT_EMAIL}" style="color:${C.terracotta};text-decoration:none;">${CONTACT_EMAIL}</a>.`,
      ) +
      noteBlock(ctx.message) +
      p(`See you on the island,<br/>The PERMIRA Summer Camp team`),
  }),

  rejected: (ctx) => ({
    eyebrow: "Application update",
    accent: C.terracotta,
    preheader: "An update on your PERMIRA Summer Camp 2026 application.",
    body:
      heading(`Update on your application`) +
      p(`Dear ${esc(firstName(ctx.name))},`) +
      p(
        `Thank you for your interest in <strong>PERMIRA Summer Camp 2026</strong> and for the time you put into your application.`,
      ) +
      p(
        `We received many strong applications this year, and after careful consideration we're unable to offer you a place at this edition. This was a difficult decision and is no reflection on your talent or enthusiasm.`,
      ) +
      callout(
        C.sand,
        `We genuinely hope you'll stay connected with PERMIRA and apply again for future programmes — we'd love to see you there.`,
      ) +
      noteBlock(ctx.message) +
      p(`With appreciation,<br/>The PERMIRA Summer Camp team`),
  }),

  custom: (ctx) => ({
    eyebrow: "Announcement",
    accent: C.saffron,
    preheader: (ctx.subject ?? DEFAULT_SUBJECTS.custom).slice(0, 120),
    body:
      heading(ctx.heading?.trim() || ctx.subject?.trim() || "A message from PERMIRA") +
      (ctx.name ? p(`Hi ${esc(firstName(ctx.name))},`) : "") +
      paragraphsFromText(ctx.message ?? ""),
  }),
};

export function renderTemplate(
  id: EmailTemplateId,
  ctx: RenderContext,
): { subject: string; html: string } {
  const builder = BUILDERS[id];
  if (!builder) throw new Error(`Unknown email template: ${id}`);
  const { eyebrow, accent, preheader, body } = builder(ctx);
  const subject = ctx.subject?.trim() || DEFAULT_SUBJECTS[id];
  const html = layout({ preheader, eyebrow, accent, bodyHtml: body });
  return { subject, html };
}

export function defaultSubject(id: EmailTemplateId): string {
  return DEFAULT_SUBJECTS[id];
}

export const TEMPLATE_META: EmailTemplateMeta[] = [
  {
    id: "registrationReceived",
    label: "Registration Received",
    description: "Confirms an application was received and explains what happens next.",
    requiresContent: false,
  },
  {
    id: "pending",
    label: "Pending / Under Review",
    description: "Lets an applicant know their application is being reviewed.",
    requiresContent: false,
  },
  {
    id: "accepted",
    label: "Accepted",
    description: "Congratulates a participant and confirms their place.",
    requiresContent: false,
  },
  {
    id: "rejected",
    label: "Rejected",
    description: "A warm, respectful decline with encouragement to reapply.",
    requiresContent: false,
  },
  {
    id: "custom",
    label: "Custom Announcement",
    description: "A free-form announcement — you provide the subject and message.",
    requiresContent: true,
  },
];
