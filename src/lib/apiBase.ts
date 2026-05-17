/**
 * Resolves the base URL for backend calls.
 *
 * - In dev, we leave it empty and rely on Vite's `/api` proxy to reach
 *   the local Node server. So a request to `apiUrl("/api/chat")` becomes
 *   a same-origin `/api/chat` and the proxy handles it.
 * - In production, set `VITE_API_URL` to the deployed backend origin
 *   (e.g. https://api.permira.example.com). Calls become absolute.
 */
export function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
