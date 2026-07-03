import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAdminToken, verifyAdminSession } from "../lib/adminAuth";
import { AuthError } from "../lib/participantsApi";
import {
  listEmailHistory,
  type EmailHistoryResponse,
  type EmailLogEntry,
  type EmailLogStatus,
} from "../lib/emailApi";
import { AdminNav } from "../components/admin/AdminNav";
import { cn } from "../lib/cn";

const STATUS_OPTIONS: { value: EmailLogStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
  { value: "dry-run", label: "Dry-run" },
];

const TEMPLATE_LABELS: Record<string, string> = {
  registrationReceived: "Registration Received",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  custom: "Custom",
};

export function AdminEmailHistory() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [status, setStatus] = useState<EmailLogStatus | "">("");
  const [data, setData] = useState<EmailHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthLost = useCallback(() => {
    clearAdminToken();
    navigate("/admin", { replace: true });
  }, [navigate]);

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

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listEmailHistory({ status: status || undefined, limit: 200 });
      setData(res);
    } catch (err) {
      if (err instanceof AuthError) handleAuthLost();
      else setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [status, handleAuthLost]);

  useEffect(() => {
    if (!authChecked) return;
    void refresh();
  }, [authChecked, refresh]);

  if (!authChecked) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-100 text-clove-700/70">
        Checking session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <AdminNav current="history" onSignOut={handleAuthLost} />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-light text-clove-900 md:text-4xl">
            Email history
          </h1>
          <p className="max-w-2xl text-sm text-clove-700/75">
            Every email sent from the dashboard, with its delivery status. Newest first.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-clove-900/8 bg-cream-50 p-3 md:flex-row md:items-center md:justify-between">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EmailLogStatus | "")}
            className="rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="flex items-center gap-3">
            <span className="text-sm text-clove-700/60">{data ? `${data.total} total` : "…"}</span>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="rounded-full border border-clove-900/15 bg-cream-50 px-4 py-2 text-sm font-medium text-clove-700 transition hover:border-terracotta-500/40 hover:text-terracotta-500 disabled:opacity-60"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-terracotta-500/30 bg-terracotta-500/5 px-4 py-3 text-sm text-terracotta-600">
            {error}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-clove-900/8 bg-cream-50 shadow-[0_20px_60px_-30px_rgba(74,32,20,0.4)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-clove-900/8 text-sm">
              <thead className="bg-cream-100/60">
                <tr className="text-left text-[11px] font-medium uppercase tracking-wider text-clove-700/70">
                  <th className="px-4 py-3">Sent</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clove-900/6">
                {data && data.rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-sm text-clove-700/60">
                      No emails sent yet — compose one from the Send email page.
                    </td>
                  </tr>
                )}
                {data?.rows.map((e) => (
                  <HistoryRow key={e.id} entry={e} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function HistoryRow({ entry }: { entry: EmailLogEntry }) {
  return (
    <tr className="align-top">
      <td className="whitespace-nowrap px-4 py-3 text-clove-700/80">
        {new Date(entry.sentAt).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-clove-900">{entry.toName}</div>
        <div className="text-xs text-clove-700/55">{entry.to}</div>
      </td>
      <td className="px-4 py-3 text-clove-700">
        <div className="max-w-xs truncate" title={entry.subject}>{entry.subject}</div>
        {entry.error && (
          <div className="mt-0.5 max-w-xs truncate text-xs text-terracotta-500" title={entry.error}>
            {entry.error}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-clove-700">
        {TEMPLATE_LABELS[entry.templateId] ?? entry.templateId}
      </td>
      <td className="px-4 py-3">
        <EmailStatusPill status={entry.status} />
      </td>
    </tr>
  );
}

function EmailStatusPill({ status }: { status: EmailLogStatus }) {
  const styles: Record<EmailLogStatus, string> = {
    sent: "bg-leaf/15 text-leaf",
    failed: "bg-terracotta-500/15 text-terracotta-600",
    "dry-run": "bg-saffron/15 text-clove-800",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider",
        styles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
