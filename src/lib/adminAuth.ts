import { apiUrl } from "./apiBase";

const STORAGE_KEY = "permira:admin-jwt";

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string) {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // localStorage disabled — admin will need to re-auth each tab.
  }
}

export function clearAdminToken() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    // Also clear the legacy key from the previous bearer-token approach.
    localStorage.removeItem("permira:admin-token");
  } catch {
    // ignore
  }
}

export function adminHeaders(): HeadersInit {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type LoginResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

/**
 * Exchanges an ADMIN_TOKEN for a signed JWT. The JWT is what gets sent
 * on every subsequent admin request — the raw shared secret never leaves
 * this function after the initial login.
 */
export async function loginWithAdminToken(adminToken: string): Promise<LoginResult> {
  try {
    const res = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: adminToken }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      token?: string;
      error?: string;
    };
    if (!res.ok || !body.token) {
      return { ok: false, error: body.error ?? `Login failed (${res.status}).` };
    }
    return { ok: true, token: body.token };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error." };
  }
}

/** Asks the backend to confirm the stored JWT is still valid. */
export async function verifyAdminSession(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;
  try {
    const res = await fetch(apiUrl("/api/auth/me"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
