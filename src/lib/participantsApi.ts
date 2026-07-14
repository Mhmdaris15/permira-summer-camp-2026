import { apiUrl } from "./apiBase";
import { adminHeaders, clearAdminToken } from "./adminAuth";

export type ParticipantStatus = "pending" | "accepted" | "rejected" | "waitlist";

export type Participant = {
  id: string;
  fullName: string;
  nationality: string;
  university: string;
  gender: string;
  email: string;
  phone: string;
  messenger: string;
  dietary: string;
  priorExperience: string;
  motivation: string;
  passportFileId: string | null;
  studentCardFileId: string | null;
  status: ParticipantStatus;
  notes: string;
  submittedAt: string;
  updatedAt: string;
};

export type ListResponse = { rows: Participant[]; total: number };

export type ListQuery = {
  status?: ParticipantStatus;
  search?: string;
  limit?: number;
  offset?: number;
};

export type ParticipantPatch = Partial<
  Pick<
    Participant,
    | "fullName"
    | "nationality"
    | "university"
    | "gender"
    | "email"
    | "phone"
    | "messenger"
    | "dietary"
    | "priorExperience"
    | "motivation"
    | "status"
    | "notes"
  >
>;

class AuthError extends Error {}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { ...adminHeaders(), ...(init?.headers ?? {}) },
  });
  if (res.status === 401) {
    clearAdminToken();
    throw new AuthError("Session expired. Please sign in again.");
  }
  const body = await res
    .json()
    .catch(() => (res.status === 204 ? {} : { error: "Invalid response." }));
  if (!res.ok) {
    const message = (body as { error?: string }).error ?? `Server returned ${res.status}.`;
    throw new Error(message);
  }
  return body as T;
}

export async function listParticipants(query: ListQuery = {}): Promise<ListResponse> {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.search) params.set("search", query.search);
  if (query.limit) params.set("limit", String(query.limit));
  if (query.offset) params.set("offset", String(query.offset));
  const qs = params.toString();
  return request<ListResponse>(apiUrl(`/api/registrations${qs ? `?${qs}` : ""}`));
}

export async function patchParticipant(
  id: string,
  patch: ParticipantPatch,
): Promise<Participant> {
  return request<Participant>(apiUrl(`/api/registrations/${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

export async function deleteParticipant(id: string): Promise<void> {
  await request<void>(apiUrl(`/api/registrations/${encodeURIComponent(id)}`), {
    method: "DELETE",
  });
}

/**
 * Endpoint that mints a presigned R2 URL for a stored file. Requires an admin
 * JWT; returns JSON `{ url, originalName, mime }`.
 */
export function fileEndpoint(id: string): string {
  return apiUrl(`/api/files/${encodeURIComponent(id)}`);
}

/**
 * Fetches a short-lived presigned URL for a stored file. The URL points at R2
 * (custom domain) and can be used directly in <img>/<object>/<a> — no auth
 * header needed on the URL itself, since the signature authorizes it.
 */
export async function getFileUrl(id: string): Promise<string> {
  const res = await fetch(fileEndpoint(id), { headers: adminHeaders() });
  if (res.status === 401) {
    clearAdminToken();
    throw new AuthError("Session expired. Please sign in again.");
  }
  if (!res.ok) throw new Error(`File URL fetch failed (${res.status}).`);
  const body = (await res.json()) as { url: string };
  return body.url;
}

export { AuthError };
