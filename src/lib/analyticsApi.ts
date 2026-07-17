import { apiUrl } from "./apiBase";
import { adminHeaders, clearAdminToken } from "./adminAuth";
import { AuthError } from "./participantsApi";

export type CountItem = { name: string; count: number };

export type Stats = {
  total: number;
  byStatus: Record<string, number>;
  byNationality: CountItem[];
  byGender: CountItem[];
  topUniversities: CountItem[];
  byDate: { date: string; count: number }[];
  dietary: { withNeeds: number; none: number };
  documents: { passport: number; studentCard: number };
  generatedAt: string;
};

export type Insights = {
  cohortOverview: string;
  themes: { title: string; detail: string }[];
  notable: { name: string; reason: string }[];
  generatedAt: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: { ...adminHeaders(), ...(init?.headers ?? {}) },
  });
  if (res.status === 401) {
    clearAdminToken();
    throw new AuthError("Session expired. Please sign in again.");
  }
  const body = await res.json().catch(() => ({ error: "Invalid response." }));
  if (!res.ok) {
    throw new Error((body as { error?: string }).error ?? `Server returned ${res.status}.`);
  }
  return body as T;
}

export function getStats(): Promise<Stats> {
  return request<Stats>("/api/analytics");
}

export function getInsights(): Promise<Insights> {
  return request<Insights>("/api/analytics/insights", { method: "POST" });
}
