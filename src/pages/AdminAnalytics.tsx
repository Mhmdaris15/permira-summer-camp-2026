import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAdminToken, verifyAdminSession } from "../lib/adminAuth";
import { AuthError } from "../lib/participantsApi";
import {
  getStats,
  getInsights,
  type CountItem,
  type Stats,
  type Insights,
} from "../lib/analyticsApi";
import { AdminNav } from "../components/admin/AdminNav";
import { cn } from "../lib/cn";

// Status → accent + human label. Colour is paired with a text label everywhere,
// never used alone to convey the status.
const STATUS_META: Record<string, { label: string; dot: string; text: string }> = {
  accepted: { label: "Accepted", dot: "bg-leaf", text: "text-leaf" },
  pending: { label: "Pending", dot: "bg-saffron", text: "text-saffron" },
  waitlist: { label: "Waitlist", dot: "bg-river", text: "text-river" },
  rejected: { label: "Rejected", dot: "bg-terracotta-500", text: "text-terracotta-500" },
};
const STATUS_ORDER = ["pending", "accepted", "waitlist", "rejected"];

export function AdminAnalytics() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [insights, setInsights] = useState<Insights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

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
      setStats(await getStats());
    } catch (err) {
      if (err instanceof AuthError) handleAuthLost();
      else setError(err instanceof Error ? err.message : "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, [handleAuthLost]);

  useEffect(() => {
    if (!authChecked) return;
    void refresh();
  }, [authChecked, refresh]);

  async function runInsights() {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      setInsights(await getInsights());
    } catch (err) {
      if (err instanceof AuthError) handleAuthLost();
      else setInsightsError(err instanceof Error ? err.message : "Could not generate insights.");
    } finally {
      setInsightsLoading(false);
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
      <AdminNav current="analytics" onSignOut={handleAuthLost} />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-light text-clove-900 md:text-4xl">
              Analytics
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-clove-700/75">
              Registrant breakdown across status, country, university, and sign-up timing,
              plus an AI cohort analysis.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="rounded-full border border-clove-900/15 bg-cream-50 px-4 py-2 text-sm font-medium text-clove-700 transition hover:border-terracotta-500/40 hover:text-terracotta-500 disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-terracotta-500/30 bg-terracotta-500/5 px-4 py-3 text-sm text-terracotta-600">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Status tiles */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <StatTile label="Total registrants" value={stats.total} emphasis />
              {STATUS_ORDER.map((s) => (
                <StatTile
                  key={s}
                  label={STATUS_META[s]?.label ?? s}
                  value={stats.byStatus[s] ?? 0}
                  dot={STATUS_META[s]?.dot}
                />
              ))}
            </div>

            {/* Chart grid */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card title="By country">
                <BarList items={stats.byNationality} total={stats.total} />
              </Card>
              <Card title="By gender">
                <BarList items={stats.byGender} total={stats.total} />
              </Card>
              <Card title="Top universities">
                <BarList items={stats.topUniversities} total={stats.total} />
              </Card>
              <Card title="Registrations over time">
                <TrendBars data={stats.byDate} />
              </Card>
              <Card title="Dietary needs">
                <BarList
                  items={[
                    { name: "Has dietary needs", count: stats.dietary.withNeeds },
                    { name: "None specified", count: stats.dietary.none },
                  ]}
                  total={stats.total}
                />
              </Card>
              <Card title="Documents uploaded">
                <BarList
                  items={[
                    { name: "Passport", count: stats.documents.passport },
                    { name: "Student card", count: stats.documents.studentCard },
                  ]}
                  total={stats.total}
                />
              </Card>
            </div>

            {/* AI insights */}
            <div className="mt-8 rounded-2xl border border-clove-900/8 bg-cream-50 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-light text-clove-900">
                    AI cohort analysis
                  </h2>
                  <p className="mt-1 text-sm text-clove-700/70">
                    Gemini reads the registrations and summarises themes and notable applicants.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void runInsights()}
                  disabled={insightsLoading}
                  className="inline-flex items-center gap-2 rounded-full bg-clove-900 px-4 py-2 text-sm font-medium text-cream-50 transition hover:bg-terracotta-500 disabled:opacity-60"
                >
                  {insightsLoading ? "Analysing…" : insights ? "Regenerate" : "Generate AI insights"}
                </button>
              </div>

              {insightsError && (
                <div className="mt-4 rounded-xl border border-terracotta-500/30 bg-terracotta-500/5 px-4 py-3 text-sm text-terracotta-600">
                  {insightsError}
                </div>
              )}

              {insights && (
                <div className="mt-6 space-y-6">
                  <p className="text-pretty leading-relaxed text-clove-800">
                    {insights.cohortOverview}
                  </p>

                  {insights.themes.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-clove-700/60">
                        Recurring themes
                      </h3>
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {insights.themes.map((th, i) => (
                          <div key={i} className="rounded-xl border border-clove-900/8 bg-cream-100 p-4">
                            <div className="font-display text-clove-900">{th.title}</div>
                            <div className="mt-1 text-sm leading-relaxed text-clove-700/80">{th.detail}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {insights.notable.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-clove-700/60">
                        Notable applicants
                      </h3>
                      <ul className="mt-3 space-y-2">
                        {insights.notable.map((n, i) => (
                          <li key={i} className="flex flex-col gap-0.5 border-b border-clove-900/5 pb-2 last:border-0 sm:flex-row sm:items-baseline sm:gap-3">
                            <span className="font-medium text-clove-900">{n.name}</span>
                            <span className="text-sm text-clove-700/75">{n.reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-clove-700/50">
                    AI-generated from registration data — review before acting on it.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatTile({
  label,
  value,
  emphasis,
  dot,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
  dot?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        emphasis
          ? "border-terracotta-500/30 bg-terracotta-500/[0.06]"
          : "border-clove-900/8 bg-cream-50",
      )}
    >
      <div className="flex items-center gap-2">
        {dot && <span className={cn("h-2 w-2 rounded-full", dot)} />}
        <span className="text-xs uppercase tracking-wider text-clove-700/60">{label}</span>
      </div>
      <div className="mt-2 font-display text-3xl font-light tabular-nums text-clove-900">
        {value}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-clove-900/8 bg-cream-50 p-6">
      <h2 className="font-display text-lg font-light text-clove-900">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

// Single-series magnitude bars — one hue, length encodes count, value shown
// directly at the end of each row (no legend needed for one series).
function BarList({ items, total }: { items: CountItem[]; total: number }) {
  if (items.length === 0) return <p className="text-sm text-clove-700/50">No data yet.</p>;
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.name} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3">
          <span className="truncate text-sm text-clove-800" title={item.name}>
            {item.name}
          </span>
          <span className="h-2.5 rounded-full bg-clove-900/[0.06]">
            <span
              className="block h-2.5 rounded-full bg-terracotta-500"
              style={{ width: `${Math.round((item.count / max) * 100)}%` }}
            />
          </span>
          <span className="tabular-nums text-sm font-medium text-clove-900">
            {item.count}
            {total > 0 && (
              <span className="ml-1 text-xs font-normal text-clove-700/50">
                {Math.round((item.count / total) * 100)}%
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

// Registration trend — one vertical bar per day, value-labelled on hover.
function TrendBars({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) return <p className="text-sm text-clove-700/50">No data yet.</p>;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex h-40 items-end gap-1.5 overflow-x-auto">
      {data.map((d) => (
        <div key={d.date} className="flex min-w-[1.5rem] flex-1 flex-col items-center gap-1.5">
          <span className="text-[10px] tabular-nums text-clove-700/60">{d.count}</span>
          <div
            className="w-full rounded-t bg-saffron"
            style={{ height: `${Math.max(4, Math.round((d.count / max) * 120))}px` }}
            title={`${d.date}: ${d.count}`}
          />
          <span className="text-[9px] text-clove-700/50">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}
