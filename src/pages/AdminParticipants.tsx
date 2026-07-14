import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { clearAdminToken, verifyAdminSession } from "../lib/adminAuth";
import {
  AuthError,
  deleteParticipant,
  exportParticipantFiles,
  listParticipants,
  type ListResponse,
  type Participant,
  type ParticipantStatus,
} from "../lib/participantsApi";
import { StatusPill } from "../components/admin/StatusPill";
import { ConfirmDialog } from "../components/admin/ConfirmDialog";
import { ParticipantDetail } from "../components/admin/ParticipantDetail";
import { cn } from "../lib/cn";
import { nationalityFlag } from "../components/registration/types";
import LogoPermira from "../assets/organization/permira-logo-small.png";

const STATUS_OPTIONS: { value: ParticipantStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "waitlist", label: "Waitlist" },
];

export function AdminParticipants() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<ParticipantStatus | "">("");
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Participant | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Participant | null>(null);
  const [deleteWorking, setDeleteWorking] = useState(false);

  // Auth gate.
  useEffect(() => {
    void (async () => {
      const ok = await verifyAdminSession();
      if (!ok) {
        clearAdminToken();
        navigate("/admin", { replace: true });
        return;
      }
      setAuthChecked(true);
    })();
  }, [navigate]);

  // Debounce search input.
  const debounceRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(debounceRef.current);
  }, [search]);

  const handleAuthLost = useCallback(() => {
    clearAdminToken();
    navigate("/admin", { replace: true });
  }, [navigate]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listParticipants({
        search: debouncedSearch || undefined,
        status: status || undefined,
      });
      setData(res);
    } catch (err) {
      if (err instanceof AuthError) handleAuthLost();
      else setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, handleAuthLost]);

  useEffect(() => {
    if (!authChecked) return;
    void refresh();
  }, [authChecked, refresh]);

  async function handleDeleteConfirm() {
    if (!pendingDelete) return;
    setDeleteWorking(true);
    try {
      await deleteParticipant(pendingDelete.id);
      setData((prev) =>
        prev
          ? { rows: prev.rows.filter((r) => r.id !== pendingDelete.id), total: Math.max(0, prev.total - 1) }
          : prev,
      );
      setPendingDelete(null);
    } catch (err) {
      if (err instanceof AuthError) handleAuthLost();
      else setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeleteWorking(false);
    }
  }

  const [exporting, setExporting] = useState(false);

  // Bulk export: pull every participant (ignoring the current view filters) and
  // download a CSV. Runs client-side from the admin API so no new endpoint.
  async function exportCsv() {
    setExporting(true);
    setError(null);
    try {
      const all = await listParticipants({ limit: 500 });
      const cols: { key: keyof Participant; label: string }[] = [
        { key: "fullName", label: "Full name" },
        { key: "nationality", label: "Nationality" },
        { key: "university", label: "University" },
        { key: "gender", label: "Gender" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "messenger", label: "Messenger" },
        { key: "dietary", label: "Dietary" },
        { key: "priorExperience", label: "Prior experience" },
        { key: "motivation", label: "Motivation" },
        { key: "status", label: "Status" },
        { key: "notes", label: "Notes" },
        { key: "submittedAt", label: "Submitted at" },
      ];
      const esc = (v: unknown) => {
        const s = v === null || v === undefined ? "" : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const header = cols.map((c) => c.label).join(",");
      const lines = all.rows.map((r) => cols.map((c) => esc(r[c.key])).join(","));
      // BOM so Excel reads UTF-8 (Cyrillic/Indonesian names) correctly.
      const csv = "﻿" + [header, ...lines].join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `permira-participants-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof AuthError) handleAuthLost();
      else setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  const [exportingFiles, setExportingFiles] = useState(false);

  // Bulk export of uploaded documents — the server streams a ZIP straight from
  // R2 (passport + student card per participant), which we download as a blob.
  async function exportFiles() {
    setExportingFiles(true);
    setError(null);
    try {
      const blob = await exportParticipantFiles();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `permira-files-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof AuthError) handleAuthLost();
      else setError(err instanceof Error ? err.message : "File export failed.");
    } finally {
      setExportingFiles(false);
    }
  }

  const counts = useMemo(() => {
    if (!data) return null;
    const out: Record<ParticipantStatus, number> = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      waitlist: 0,
    };
    for (const r of data.rows) out[r.status]++;
    return out;
  }, [data]);

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="border-b border-clove-900/8 bg-cream-50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2.5">
          <img src={LogoPermira} alt="Permira logo" className="h-12" />
          <span className="font-display text-lg font-semibold text-clove-900">
            Permira SPB<span className="text-terracotta-500"> · </span>Admin
          </span>
            </Link>
            <span className="text-clove-700/40">/</span>
            <span className="font-display text-base text-clove-700">Participants</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="rounded-full bg-cream-100 px-4 py-1.5 text-sm font-medium text-clove-700 transition hover:bg-terracotta-500/10 hover:text-terracotta-500"
            >
              ← Knowledge base
            </Link>
            <Link
              to="/admin/email"
              className="rounded-full bg-cream-100 px-4 py-1.5 text-sm font-medium text-clove-700 transition hover:bg-terracotta-500/10 hover:text-terracotta-500"
            >
              Send email →
            </Link>
            <button
              type="button"
              onClick={handleAuthLost}
              className="rounded-full border border-clove-900/15 bg-cream-50 px-4 py-1.5 text-sm font-medium text-clove-700 transition hover:border-terracotta-500/40 hover:text-terracotta-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-light text-clove-900 md:text-4xl">
            Participants
          </h1>
          <p className="max-w-2xl text-sm text-clove-700/75">
            Track and manage every registration. Search by name, email, or
            university; filter by status; click a row to review documents and
            update details.
          </p>
        </div>

        {/* Stat strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard label="Total" value={data?.total ?? "…"} />
          <StatCard label="Pending" value={counts?.pending ?? "…"} accent="text-clove-700" />
          <StatCard label="Accepted" value={counts?.accepted ?? "…"} accent="text-leaf" />
          <StatCard label="Waitlist" value={counts?.waitlist ?? "…"} accent="text-saffron" />
          <StatCard label="Rejected" value={counts?.rejected ?? "…"} accent="text-terracotta-500" />
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-clove-900/8 bg-cream-50 p-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clove-700/55" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4-4" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, university…"
                className="w-full rounded-xl border border-clove-900/12 bg-cream-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ParticipantStatus | "")}
              className="rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="rounded-full border border-clove-900/15 bg-cream-50 px-4 py-2 text-sm font-medium text-clove-700 transition hover:border-terracotta-500/40 hover:text-terracotta-500 disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={() => void exportCsv()}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-full bg-clove-900 px-4 py-2 text-sm font-medium text-cream-50 transition hover:bg-terracotta-500 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
            </svg>
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
          <button
            type="button"
            onClick={() => void exportFiles()}
            disabled={exportingFiles}
            className="inline-flex items-center gap-2 rounded-full border border-clove-900/15 bg-cream-50 px-4 py-2 text-sm font-medium text-clove-700 transition hover:border-terracotta-500/40 hover:text-terracotta-500 disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            {exportingFiles ? "Exporting…" : "Export files"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-terracotta-500/30 bg-terracotta-500/5 px-4 py-3 text-sm text-terracotta-600">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-clove-900/8 bg-cream-50 shadow-[0_20px_60px_-30px_rgba(74,32,20,0.4)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-clove-900/8 text-sm">
              <thead className="bg-cream-100/60">
                <tr className="text-left text-[11px] font-medium uppercase tracking-wider text-clove-700/70">
                  <th className="px-4 py-3">Participant</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">University</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-clove-900/6">
                {!data && loading && (
                  <SkeletonRows rows={5} />
                )}
                {data && data.rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-sm text-clove-700/60">
                      {debouncedSearch || status
                        ? "No participants match those filters."
                        : "No registrations yet — when one arrives, it'll appear here."}
                    </td>
                  </tr>
                )}
                {data?.rows.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-cream-100/60",
                      "focus-within:bg-cream-100/60",
                    )}
                    onClick={() => setActive(p)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-clove-900">{p.fullName}</div>
                      <div className="text-xs text-clove-700/55">{p.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-clove-700">
                        {nationalityFlag(p.nationality)} {p.nationality}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-clove-700">{p.university}</td>
                    <td className="px-4 py-3">
                      <div className="text-clove-700">{p.phone}</div>
                      <div className="text-xs text-clove-700/55">{p.messenger}</div>
                    </td>
                    <td className="px-4 py-3 text-clove-700/80">
                      {new Date(p.submittedAt).toLocaleDateString(undefined, {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDelete(p);
                        }}
                        className="rounded-full p-2 text-clove-700/50 transition hover:bg-terracotta-500/10 hover:text-terracotta-500"
                        aria-label={`Delete ${p.fullName}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ParticipantDetail
        open={Boolean(active)}
        participant={active}
        onClose={() => setActive(null)}
        onUpdated={(updated) => {
          setData((prev) =>
            prev
              ? { ...prev, rows: prev.rows.map((r) => (r.id === updated.id ? updated : r)) }
              : prev,
          );
          setActive(updated);
        }}
        onAuthLost={handleAuthLost}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        destructive
        title="Delete this participant?"
        body={
          pendingDelete
            ? `${pendingDelete.fullName} will be permanently removed, including their uploaded passport and student-card scans. This can't be undone.`
            : ""
        }
        confirmLabel="Delete permanently"
        loading={deleteWorking}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = "text-clove-900",
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-clove-900/8 bg-cream-50 p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-clove-700/60">
        {label}
      </div>
      <div className={cn("mt-1 font-display text-2xl font-medium md:text-3xl", accent)}>
        {value}
      </div>
    </div>
  );
}

function SkeletonRows({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: 7 }).map((__, j) => (
            <td key={j} className="px-4 py-4">
              <div className="h-3 w-3/4 rounded bg-clove-900/8" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
