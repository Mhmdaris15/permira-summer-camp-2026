import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAdminToken, verifyAdminSession } from "../lib/adminAuth";
import {
  AuthError,
  listParticipants,
  type Participant,
  type ParticipantStatus,
} from "../lib/participantsApi";
import { nationalityFlag } from "../components/registration/types";
import {
  makeGroups,
  groupCountFor,
  tallyBy,
  type Group,
  type GroupConfig,
  type GroupMember,
} from "../lib/grouping";
import { AdminNav } from "../components/admin/AdminNav";

const STATUS_OPTIONS: { value: ParticipantStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "accepted", label: "Accepted" },
  { value: "pending", label: "Pending" },
  { value: "waitlist", label: "Waitlist" },
  { value: "rejected", label: "Rejected" },
];

export function AdminGroups() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<ParticipantStatus | "">("");
  const [config, setConfig] = useState<GroupConfig>({
    mode: "count",
    value: 6,
    balanceNationality: true,
    balanceGender: true,
    labelPrefix: "Team",
    naming: "number",
  });
  const [groups, setGroups] = useState<Group[] | null>(null);

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
      const res = await listParticipants({ limit: 500 });
      setParticipants(res.rows);
    } catch (err) {
      if (err instanceof AuthError) handleAuthLost();
      else setError(err instanceof Error ? err.message : "Failed to load participants.");
    } finally {
      setLoading(false);
    }
  }, [handleAuthLost]);

  useEffect(() => {
    if (!authChecked) return;
    void refresh();
  }, [authChecked, refresh]);

  const eligible: GroupMember[] = useMemo(() => {
    const rows = participants ?? [];
    return rows
      .filter((p) => !statusFilter || p.status === statusFilter)
      .map((p) => ({ id: p.id, fullName: p.fullName, nationality: p.nationality, gender: p.gender }));
  }, [participants, statusFilter]);

  function generate() {
    setGroups(makeGroups(eligible, config));
  }

  function update<K extends keyof GroupConfig>(key: K, value: GroupConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
    setGroups(null); // config changed — require a fresh generate
  }

  function exportCsv() {
    if (!groups) return;
    const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const lines = ["Group,Name,Nationality,Gender"];
    for (const g of groups) {
      for (const m of g.members) {
        lines.push([g.name, m.fullName, m.nationality, m.gender].map(esc).join(","));
      }
    }
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `permira-groups-${config.labelPrefix.toLowerCase() || "group"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!authChecked) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-100 text-clove-700/70">
        Checking session…
      </div>
    );
  }

  const previewCount = groupCountFor(eligible.length, config);

  return (
    <div className="min-h-screen bg-cream-100">
      <AdminNav current="groups" onSignOut={handleAuthLost} />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-light text-clove-900 md:text-4xl">Groups</h1>
            <p className="mt-1 max-w-2xl text-sm text-clove-700/75">
              Randomly split participants into balanced groups — teams, tents, or anything else.
              Balances nationality and gender across groups; re-roll for a new draw.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="rounded-full border border-clove-900/15 bg-cream-50 px-4 py-2 text-sm font-medium text-clove-700 transition hover:border-terracotta-500/40 hover:text-terracotta-500 disabled:opacity-60"
          >
            {loading ? "Loading…" : "Reload participants"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-terracotta-500/30 bg-terracotta-500/5 px-4 py-3 text-sm text-terracotta-600">
            {error}
          </div>
        )}

        {/* Config panel */}
        <div className="mt-8 grid grid-cols-1 gap-5 rounded-2xl border border-clove-900/8 bg-cream-50 p-6 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Group label">
            <input
              value={config.labelPrefix}
              onChange={(e) => update("labelPrefix", e.target.value)}
              placeholder="Team"
              className="w-full rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
            />
          </Field>

          <Field label="Naming">
            <select
              value={config.naming}
              onChange={(e) => update("naming", e.target.value as GroupConfig["naming"])}
              className="w-full rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
            >
              <option value="number">Numbered (Team 1, 2…)</option>
              <option value="letter">Lettered (Team A, B…)</option>
            </select>
          </Field>

          <Field label="Participants">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ParticipantStatus | "");
                setGroups(null);
              }}
              className="w-full rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Split by">
            <div className="flex gap-2">
              <select
                value={config.mode}
                onChange={(e) => update("mode", e.target.value as GroupConfig["mode"])}
                className="flex-1 rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
              >
                <option value="count">Number of groups</option>
                <option value="size">Members per group</option>
              </select>
              <input
                type="number"
                min={1}
                value={config.value}
                onChange={(e) => update("value", Math.max(1, Number(e.target.value) || 1))}
                className="w-20 rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
              />
            </div>
          </Field>

          <Field label="Balance across groups">
            <div className="flex flex-wrap gap-4 pt-1.5">
              <Check
                label="Nationality"
                checked={config.balanceNationality}
                onChange={(v) => update("balanceNationality", v)}
              />
              <Check
                label="Gender"
                checked={config.balanceGender}
                onChange={(v) => update("balanceGender", v)}
              />
            </div>
          </Field>

          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={generate}
              disabled={eligible.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-clove-900 px-5 py-2.5 text-sm font-medium text-cream-50 transition hover:bg-terracotta-500 disabled:opacity-60"
            >
              {groups ? "Re-roll" : "Generate groups"}
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={!groups}
              className="rounded-full border border-clove-900/15 bg-cream-50 px-4 py-2.5 text-sm font-medium text-clove-700 transition hover:border-terracotta-500/40 hover:text-terracotta-500 disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm text-clove-700/60">
          {eligible.length} eligible participant{eligible.length === 1 ? "" : "s"}
          {eligible.length > 0 && <> · {previewCount} group{previewCount === 1 ? "" : "s"} of ~{Math.round(eligible.length / Math.max(1, previewCount))}</>}
        </p>

        {/* Results */}
        {groups && groups.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <div key={g.name} className="rounded-2xl border border-clove-900/8 bg-cream-50 p-5">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-lg text-clove-900">{g.name}</h2>
                  <span className="text-xs text-clove-700/55">{g.members.length} members</span>
                </div>

                {/* Balance chips */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tallyBy(g.members, "nationality").map((t) => (
                    <span key={t.name} className="rounded-full bg-clove-900/[0.05] px-2 py-0.5 text-xs text-clove-700">
                      {nationalityFlag(t.name)} {t.count}
                    </span>
                  ))}
                  {tallyBy(g.members, "gender").map((t) => (
                    <span key={t.name} className="rounded-full bg-terracotta-500/10 px-2 py-0.5 text-xs text-terracotta-600">
                      {t.name}: {t.count}
                    </span>
                  ))}
                </div>

                <ul className="mt-4 space-y-1.5">
                  {g.members.map((m) => (
                    <li key={m.id} className="flex items-center gap-2 text-sm text-clove-800">
                      <span aria-hidden>{nationalityFlag(m.nationality)}</span>
                      <span className="flex-1 truncate">{m.fullName}</span>
                      <span className="text-xs text-clove-700/50">{m.gender}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {groups === null && eligible.length > 0 && (
          <p className="mt-10 text-center text-sm text-clove-700/50">
            Configure the options above, then press “Generate groups”.
          </p>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-clove-700/60">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-clove-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-clove-900/30 text-terracotta-500 focus:ring-terracotta-500/30"
      />
      {label}
    </label>
  );
}
