import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAdminToken, verifyAdminSession } from "../lib/adminAuth";
import {
  AuthError,
  listParticipants,
  type Participant,
  type ParticipantStatus,
} from "../lib/participantsApi";
import {
  listEmailTemplates,
  previewEmail,
  sendEmail,
  type EmailAudience,
  type EmailTemplateId,
  type EmailTemplateMeta,
  type SendEmailResult,
} from "../lib/emailApi";
import { AdminNav } from "../components/admin/AdminNav";
import { ConfirmDialog } from "../components/admin/ConfirmDialog";
import { cn } from "../lib/cn";

type AudienceOption = { value: EmailAudience; label: string };
const AUDIENCES: AudienceOption[] = [
  { value: "individual", label: "One participant" },
  { value: "all", label: "Everyone" },
  { value: "accepted", label: "Accepted" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "waitlist", label: "Waitlist" },
];

export function AdminEmail() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [templates, setTemplates] = useState<EmailTemplateMeta[]>([]);
  const [configured, setConfigured] = useState(true);
  const [dryRun, setDryRun] = useState(false);

  // Compose state
  const [audience, setAudience] = useState<EmailAudience>("individual");
  const [participantId, setParticipantId] = useState<string>("");
  const [templateId, setTemplateId] = useState<EmailTemplateId>("accepted");
  const [subject, setSubject] = useState("");
  const [heading, setHeading] = useState("");
  const [message, setMessage] = useState("");

  const [previewHtml, setPreviewHtml] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendEmailResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAuthLost = useCallback(() => {
    clearAdminToken();
    navigate("/admin", { replace: true });
  }, [navigate]);

  // Auth gate.
  useEffect(() => {
    void (async () => {
      const ok = await verifyAdminSession();
      if (!ok) {
        handleAuthLost();
        return;
      }
      setAuthChecked(true);
    })();
  }, [handleAuthLost]);

  // Load participants + templates once authed.
  useEffect(() => {
    if (!authChecked) return;
    void (async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          listParticipants({ limit: 500 }),
          listEmailTemplates(),
        ]);
        setParticipants(pRes.rows);
        setTemplates(tRes.templates);
        setConfigured(tRes.configured);
        setDryRun(tRes.dryRun);
      } catch (err) {
        if (err instanceof AuthError) handleAuthLost();
        else setError(err instanceof Error ? err.message : "Failed to load.");
      }
    })();
  }, [authChecked, handleAuthLost]);

  const activeTemplate = templates.find((t) => t.id === templateId);
  const isCustom = templateId === "custom";

  const selectedParticipant = useMemo(
    () => participants.find((p) => p.id === participantId) ?? null,
    [participants, participantId],
  );

  const recipientCount = useMemo(() => {
    if (audience === "individual") return participantId ? 1 : 0;
    if (audience === "all") return participants.length;
    return participants.filter((p) => p.status === (audience as ParticipantStatus)).length;
  }, [audience, participantId, participants]);

  // Debounced live preview.
  const previewTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(previewTimer.current);
    previewTimer.current = window.setTimeout(() => {
      void (async () => {
        try {
          const { html } = await previewEmail({
            templateId,
            name: selectedParticipant?.fullName,
            subject: subject || undefined,
            heading: heading || undefined,
            message: message || undefined,
          });
          setPreviewHtml(html);
        } catch {
          /* preview is best-effort */
        }
      })();
    }, 350);
    return () => window.clearTimeout(previewTimer.current);
  }, [templateId, selectedParticipant, subject, heading, message]);

  const canSend =
    recipientCount > 0 &&
    (configured || dryRun) &&
    (!isCustom || (subject.trim() !== "" && message.trim() !== "")) &&
    !sending;

  async function doSend() {
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await sendEmail({
        audience,
        templateId,
        participantId: audience === "individual" ? participantId : undefined,
        subject: subject.trim() || undefined,
        heading: heading.trim() || undefined,
        message: message.trim() || undefined,
      });
      setResult(res);
    } catch (err) {
      if (err instanceof AuthError) handleAuthLost();
      else setError(err instanceof Error ? err.message : "Send failed.");
    } finally {
      setSending(false);
      setConfirmOpen(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-100 text-clove-700/70">
        Checking session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <AdminNav current="email" onSignOut={handleAuthLost} />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-light text-clove-900 md:text-4xl">
            Send email
          </h1>
          <p className="max-w-2xl text-sm text-clove-700/75">
            Send a branded notification to one participant or a whole group, or
            write a custom announcement. Every send is recorded in{" "}
            <button
              type="button"
              onClick={() => navigate("/admin/email/history")}
              className="font-medium text-terracotta-500 hover:underline"
            >
              Email history
            </button>
            .
          </p>
        </div>

        {/* Config banners */}
        {!configured && !dryRun && (
          <Banner tone="warn">
            Email isn't configured on the server yet. Set <code>RESEND_API_KEY</code>{" "}
            (and optionally <code>EMAIL_FROM</code>) to enable sending. You can still
            preview templates below.
          </Banner>
        )}
        {dryRun && (
          <Banner tone="info">
            Dry-run mode is on — sends are simulated and recorded in history, but no
            email is actually delivered.
          </Banner>
        )}
        {result && (
          <Banner tone={result.failed > 0 ? "warn" : "success"}>
            {result.dryRun > 0
              ? `Simulated ${result.dryRun} email(s) (dry-run).`
              : `Sent ${result.sent} of ${result.total} email(s)${
                  result.failed > 0 ? `, ${result.failed} failed` : ""
                }.`}{" "}
            <button
              type="button"
              onClick={() => navigate("/admin/email/history")}
              className="font-medium underline"
            >
              View history
            </button>
          </Banner>
        )}
        {error && <Banner tone="warn">{error}</Banner>}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Compose */}
          <div className="rounded-2xl border border-clove-900/8 bg-cream-50 p-6">
            {/* Audience */}
            <Label>Send to</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AUDIENCES.map((a) => {
                const count =
                  a.value === "individual"
                    ? null
                    : a.value === "all"
                      ? participants.length
                      : participants.filter((p) => p.status === (a.value as ParticipantStatus)).length;
                return (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setAudience(a.value)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left text-sm transition",
                      audience === a.value
                        ? "border-terracotta-500 bg-terracotta-500/10 text-clove-900"
                        : "border-clove-900/12 bg-cream-50 text-clove-700 hover:border-terracotta-500/40",
                    )}
                  >
                    <div className="font-medium">{a.label}</div>
                    {count !== null && (
                      <div className="text-[11px] text-clove-700/55">{count} people</div>
                    )}
                  </button>
                );
              })}
            </div>

            {audience === "individual" && (
              <div className="mt-4">
                <Label>Participant</Label>
                <select
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
                >
                  <option value="">Select a participant…</option>
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} — {p.email} ({p.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Template */}
            <div className="mt-5">
              <Label>Template</Label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value as EmailTemplateId)}
                className="mt-2 w-full rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              {activeTemplate && (
                <p className="mt-1.5 text-[12px] text-clove-700/60">{activeTemplate.description}</p>
              )}
            </div>

            {/* Subject */}
            <div className="mt-5">
              <Label>
                Subject{" "}
                {!isCustom && <span className="font-normal text-clove-700/50">(optional — a default is used)</span>}
              </Label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={isCustom ? "Subject line" : "Leave blank to use the template default"}
                className="mt-2 w-full rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
              />
            </div>

            {isCustom && (
              <div className="mt-5">
                <Label>
                  Heading <span className="font-normal text-clove-700/50">(optional)</span>
                </Label>
                <input
                  type="text"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="Big heading inside the email"
                  className="mt-2 w-full rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
                />
              </div>
            )}

            {/* Message */}
            <div className="mt-5">
              <Label>
                {isCustom ? "Message" : "Extra note "}
                {!isCustom && <span className="font-normal text-clove-700/50">(optional — appended to the template)</span>}
              </Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={isCustom ? 8 : 4}
                placeholder={
                  isCustom
                    ? "Write your announcement. Blank lines start new paragraphs."
                    : "Add a personal note (optional)…"
                }
                className="mt-2 w-full rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2.5 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-terracotta-500/20"
              />
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-clove-900/8 pt-4">
              <div className="text-sm text-clove-700/70">
                {recipientCount === 0 ? (
                  <span className="text-terracotta-500">No recipients selected</span>
                ) : (
                  <>
                    <span className="font-medium text-clove-900">{recipientCount}</span> recipient
                    {recipientCount === 1 ? "" : "s"}
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={!canSend}
                className="rounded-full bg-clove-900 px-6 py-2.5 text-sm font-medium text-cream-50 transition hover:bg-terracotta-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "Sending…" : dryRun ? "Simulate send" : "Send email"}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-clove-900/8 bg-cream-50 p-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <Label>Preview</Label>
              <span className="text-[11px] text-clove-700/55">
                {selectedParticipant ? `as sent to ${selectedParticipant.fullName}` : "sample data"}
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-clove-900/8 bg-white">
              <iframe
                title="Email preview"
                srcDoc={previewHtml}
                sandbox=""
                className="h-[640px] w-full"
              />
            </div>
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={confirmOpen}
        title={dryRun ? "Simulate this send?" : "Send this email?"}
        body={
          audience === "individual"
            ? `This will ${dryRun ? "simulate sending" : "send"} to ${selectedParticipant?.fullName ?? "the selected participant"}.`
            : `This will ${dryRun ? "simulate sending" : "send"} to ${recipientCount} participant${recipientCount === 1 ? "" : "s"} (${AUDIENCES.find((a) => a.value === audience)?.label}). This can't be undone.`
        }
        confirmLabel={dryRun ? "Simulate" : `Send to ${recipientCount}`}
        loading={sending}
        onConfirm={() => void doSend()}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-wider text-clove-700/70">
      {children}
    </span>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "info" | "warn" | "success";
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-river/30 bg-river/5 text-clove-800",
    warn: "border-terracotta-500/30 bg-terracotta-500/5 text-terracotta-600",
    success: "border-leaf/30 bg-leaf/5 text-leaf",
  }[tone];
  return (
    <div className={cn("mt-4 rounded-xl border px-4 py-3 text-sm", styles)}>{children}</div>
  );
}
