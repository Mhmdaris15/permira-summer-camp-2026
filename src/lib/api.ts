import type { RegistrationData } from "../components/registration/types";
import { apiUrl } from "./apiBase";

export type SubmitResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Submits a registration as multipart/form-data to the backend. Files
 * are sent under `passport` and `consent`; everything else is plain text.
 * Honeypot is checked client-side for instant drop, and again on the server.
 */
export async function submitRegistration(data: RegistrationData): Promise<SubmitResult> {
  if (data.website.trim()) {
    // Honeypot tripped — pretend success.
    return { ok: true, id: "ok" };
  }
  if (!data.passport || !data.consent) {
    return { ok: false, error: "Passport and consent files are required." };
  }

  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    if (key === "passport" || key === "consent") {
      fd.append(key, value as File);
    } else {
      fd.append(key, String(value));
    }
  }

  try {
    const res = await fetch(apiUrl("/api/registrations"), {
      method: "POST",
      body: fd,
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
    if (!res.ok || !body.id) {
      return { ok: false, error: body.error ?? `Server returned ${res.status}.` };
    }
    return { ok: true, id: body.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error." };
  }
}
