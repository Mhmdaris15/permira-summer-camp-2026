import { apiUrl } from "./apiBase";
import { adminHeaders, clearAdminToken } from "./adminAuth";
import { AuthError, type ParticipantStatus } from "./participantsApi";

export type EmailTemplateId =
  | "registrationReceived"
  | "pending"
  | "accepted"
  | "rejected"
  | "custom";

export type EmailAudience = "individual" | "all" | ParticipantStatus;

export type EmailLogStatus = "sent" | "failed" | "dry-run";

export type EmailTemplateMeta = {
  id: EmailTemplateId;
  label: string;
  description: string;
  requiresContent: boolean;
};

export type TemplatesResponse = {
  templates: EmailTemplateMeta[];
  configured: boolean;
  dryRun: boolean;
};

export type SendEmailRequest = {
  audience: EmailAudience;
  templateId: EmailTemplateId;
  participantId?: string;
  subject?: string;
  message?: string;
  heading?: string;
};

export type EmailLogEntry = {
  id: string;
  to: string;
  toName: string;
  subject: string;
  templateId: EmailTemplateId;
  audience: EmailAudience;
  status: EmailLogStatus;
  providerId?: string;
  error?: string;
  participantId?: string;
  batchId: string;
  sentAt: string;
  sentBy?: string;
};

export type SendEmailResult = {
  batchId: string;
  total: number;
  sent: number;
  failed: number;
  dryRun: number;
  entries: EmailLogEntry[];
};

export type EmailHistoryResponse = { rows: EmailLogEntry[]; total: number };

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
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

export async function listEmailTemplates(): Promise<TemplatesResponse> {
  return request<TemplatesResponse>(apiUrl("/api/email/templates"));
}

export async function previewEmail(body: {
  templateId: EmailTemplateId;
  name?: string;
  subject?: string;
  heading?: string;
  message?: string;
}): Promise<{ subject: string; html: string }> {
  return request(apiUrl("/api/email/preview"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function sendEmail(req: SendEmailRequest): Promise<SendEmailResult> {
  return request<SendEmailResult>(apiUrl("/api/email/send"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
}

export async function listEmailHistory(query: {
  status?: EmailLogStatus;
  limit?: number;
  offset?: number;
} = {}): Promise<EmailHistoryResponse> {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.limit) params.set("limit", String(query.limit));
  if (query.offset) params.set("offset", String(query.offset));
  const qs = params.toString();
  return request<EmailHistoryResponse>(apiUrl(`/api/email/history${qs ? `?${qs}` : ""}`));
}
