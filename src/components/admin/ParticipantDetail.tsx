import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  fetchFileAsBlobUrl,
  patchParticipant,
  type Participant,
  type ParticipantPatch,
  type ParticipantStatus,
} from "../../lib/participantsApi";
import { StatusPill } from "./StatusPill";
import { sendEmail, type EmailTemplateId } from "../../lib/emailApi";
import { cn } from "../../lib/cn";

const STATUSES: ParticipantStatus[] = ["pending", "accepted", "rejected", "waitlist"];

// Which template a status maps to when "notify" is on. Waitlist has no
// dedicated template, so it isn't auto-emailed (use Compose for that).
const STATUS_EMAIL: Record<ParticipantStatus, EmailTemplateId | null> = {
  pending: "pending",
  accepted: "accepted",
  rejected: "rejected",
  waitlist: null,
};

export function ParticipantDetail({
  open,
  participant,
  onClose,
  onUpdated,
  onAuthLost,
}: {
  open: boolean;
  participant: Participant | null;
  onClose: () => void;
  onUpdated: (next: Participant) => void;
  onAuthLost: () => void;
}) {
  const [draft, setDraft] = useState<ParticipantPatch>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docs, setDocs] = useState<{ passport?: string; studentCard?: string }>({});
  const [docError, setDocError] = useState<string | null>(null);
  const [notify, setNotify] = useState(true);
  const [emailNote, setEmailNote] = useState<string | null>(null);

  useEffect(() => {
    setDraft({});
    setError(null);
    setDocError(null);
    setDocs({});
    if (!participant) return;

    // Eagerly load the passport + student-card scans as authenticated blob URLs.
    let cancelled = false;
    void (async () => {
      try {
        const [passport, studentCard] = await Promise.all([
          participant.passportFileId
            ? fetchFileAsBlobUrl(participant.passportFileId)
            : Promise.resolve(undefined),
          participant.studentCardFileId
            ? fetchFileAsBlobUrl(participant.studentCardFileId)
            : Promise.resolve(undefined),
        ]);
        if (cancelled) {
          if (passport) URL.revokeObjectURL(passport);
          if (studentCard) URL.revokeObjectURL(studentCard);
          return;
        }
        setDocs({ passport, studentCard });
      } catch (err) {
        if (!cancelled) setDocError(err instanceof Error ? err.message : "Failed to load documents.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [participant]);

  // Revoke blob URLs on unmount.
  useEffect(
    () => () => {
      if (docs.passport) URL.revokeObjectURL(docs.passport);
      if (docs.studentCard) URL.revokeObjectURL(docs.studentCard);
    },
    [docs.passport, docs.studentCard],
  );

  if (!participant) return null;

  const merged = { ...participant, ...draft };

  function field<K extends keyof ParticipantPatch>(key: K, value: ParticipantPatch[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!participant || Object.keys(draft).length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await patchParticipant(participant.id, draft);
      onUpdated(updated);
      setDraft({});
    } catch (err) {
      if (err instanceof Error && err.name === "AuthError") onAuthLost();
      else setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function quickStatus(status: ParticipantStatus) {
    if (!participant) return;
    setSaving(true);
    setError(null);
    setEmailNote(null);
    try {
      const updated = await patchParticipant(participant.id, { status });
      onUpdated(updated);
      setDraft((prev) => ({ ...prev, status: undefined }));

      // Optionally notify the participant with the matching template.
      const templateId = STATUS_EMAIL[status];
      if (notify && templateId) {
        try {
          const res = await sendEmail({
            audience: "individual",
            participantId: participant.id,
            templateId,
          });
          if (res.failed > 0) setEmailNote(`Status updated, but the email failed to send.`);
          else if (res.dryRun > 0) setEmailNote(`Status updated · ${status} email simulated (dry-run).`);
          else setEmailNote(`Status updated · ${status} email sent to ${participant.email}.`);
        } catch (mailErr) {
          setEmailNote(
            `Status updated, but the email failed: ${
              mailErr instanceof Error ? mailErr.message : "unknown error"
            }`,
          );
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AuthError") onAuthLost();
      else setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-stretch justify-center md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-clove-900/70 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.985 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mx-auto flex h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-cream-50 shadow-2xl md:my-8 md:h-auto md:max-h-[92dvh] md:rounded-3xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-clove-900/8 bg-cream-100/60 px-6 py-5 md:px-8 md:py-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl font-light text-clove-900">
                    {participant.fullName}
                  </h2>
                  <StatusPill status={participant.status} />
                </div>
                <div className="mt-1 text-xs text-clove-700/60">
                  Submitted {new Date(participant.submittedAt).toLocaleString()} ·
                  {" "}
                  {participant.nationality === "Indonesia" ? "🇮🇩" : "🇷🇺"} {participant.nationality}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-clove-700 transition hover:bg-cream-200 hover:text-clove-900"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div data-lenis-prevent className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
              {/* Quick status actions */}
              <div className="rounded-2xl border border-clove-900/8 bg-cream-100/50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="ml-2 text-xs font-medium uppercase tracking-wider text-clove-700/70">
                    Set status
                  </span>
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => quickStatus(s)}
                      disabled={saving || participant.status === s}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                        participant.status === s
                          ? "bg-clove-900 text-cream-50"
                          : "bg-cream-50 text-clove-700 hover:bg-clove-900 hover:text-cream-50",
                        saving && "opacity-60",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <label className="mt-3 flex items-center gap-2 pl-2 text-xs text-clove-700/80">
                  <input
                    type="checkbox"
                    checked={notify}
                    onChange={(e) => setNotify(e.target.checked)}
                    className="h-3.5 w-3.5 accent-terracotta-500"
                  />
                  Email the participant about this change (Accepted / Pending / Rejected)
                </label>
                {emailNote && (
                  <div className="mt-2 pl-2 text-xs text-clove-700/70">{emailNote}</div>
                )}
              </div>

              <form onSubmit={handleSave} className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                <Editable label="Full name" value={merged.fullName} onChange={(v) => field("fullName", v)} />
                <EditableSelect
                  label="Nationality"
                  value={merged.nationality}
                  options={[
                    { value: "Indonesia", label: "🇮🇩 Indonesia" },
                    { value: "Russia", label: "🇷🇺 Russia" },
                  ]}
                  onChange={(v) => field("nationality", v as "Indonesia" | "Russia")}
                />
                <Editable label="University" value={merged.university} onChange={(v) => field("university", v)} />
                <Editable label="Gender" value={merged.gender} onChange={(v) => field("gender", v)} />
                <Editable label="Email" type="email" value={merged.email} onChange={(v) => field("email", v)} />
                <Editable label="Phone" value={merged.phone} onChange={(v) => field("phone", v)} />
                <Editable
                  label="Telegram / WhatsApp"
                  value={merged.messenger}
                  onChange={(v) => field("messenger", v)}
                />
                <EditableTextArea
                  label="Dietary restrictions"
                  value={merged.dietary}
                  onChange={(v) => field("dietary", v)}
                  className="md:col-span-2"
                />
                <EditableTextArea
                  label="Prior experience"
                  value={merged.priorExperience}
                  onChange={(v) => field("priorExperience", v)}
                  className="md:col-span-2"
                />
                <EditableTextArea
                  label="Motivation"
                  value={merged.motivation}
                  onChange={(v) => field("motivation", v)}
                  rows={5}
                  className="md:col-span-2"
                />
                <EditableTextArea
                  label="Internal notes"
                  value={merged.notes}
                  onChange={(v) => field("notes", v)}
                  rows={3}
                  className="md:col-span-2"
                  hint="Visible to admins only."
                />
              </form>

              {/* Documents */}
              <section className="mt-10">
                <h3 className="font-display text-lg font-medium text-clove-900">Documents</h3>
                {docError && (
                  <p className="mt-2 text-sm text-terracotta-500">{docError}</p>
                )}
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DocCard label="Passport" url={docs.passport} fileId={participant.passportFileId} />
                  <DocCard label="Student card" url={docs.studentCard} fileId={participant.studentCardFileId} />
                </div>
              </section>

              {error && (
                <p className="mt-6 rounded-xl border border-terracotta-500/30 bg-terracotta-500/8 px-4 py-3 text-sm text-terracotta-600">
                  {error}
                </p>
              )}
            </div>

            <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-clove-900/8 bg-cream-100/60 px-6 py-4 md:px-8">
              <span className="font-mono text-[11px] text-clove-700/55">{participant.id}</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-clove-900/15 bg-cream-50 px-5 py-2 text-sm font-medium text-clove-700 transition hover:border-clove-900/30"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || Object.keys(draft).length === 0}
                  className="rounded-full bg-clove-900 px-5 py-2 text-sm font-medium text-cream-50 transition hover:bg-terracotta-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Editable({
  label,
  value,
  onChange,
  type = "text",
  className,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-clove-900">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
      />
    </label>
  );
}

function EditableTextArea({
  label,
  value,
  onChange,
  rows = 3,
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-clove-900">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-terracotta-500/20"
      />
      {hint && <span className="text-[11px] text-clove-700/55">{hint}</span>}
    </label>
  );
}

function EditableSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-clove-900">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}

function DocCard({
  label,
  url,
  fileId,
}: {
  label: string;
  url: string | undefined;
  fileId: string | null;
}) {
  if (!fileId) {
    return (
      <div className="rounded-2xl border border-dashed border-clove-900/15 bg-cream-100 p-5 text-sm text-clove-700/60">
        <div className="font-medium text-clove-900">{label}</div>
        <div className="mt-1">Not provided.</div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-clove-900/8 bg-cream-100">
      <div className="flex items-center justify-between gap-3 border-b border-clove-900/8 bg-cream-50 px-4 py-2.5">
        <div className="font-medium text-clove-900">{label}</div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-terracotta-500 hover:underline"
          >
            Open in new tab ↗
          </a>
        )}
      </div>
      <div className="grid h-72 place-items-center bg-clove-900/5">
        {url ? (
          <object data={url} type="application/pdf" className="h-full w-full">
            <img src={url} alt={label} className="max-h-full max-w-full object-contain" />
          </object>
        ) : (
          <span className="text-sm text-clove-700/60">Loading…</span>
        )}
      </div>
    </div>
  );
}
