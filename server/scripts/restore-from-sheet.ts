import "dotenv/config";
import { readParticipantsFromSheet } from "../services/sheets.js";

/**
 * Restores participants from the Google Sheet mirror by hitting the live API's
 * admin import endpoint. Use after a redeploy wipes the DB — the Sheet is the
 * durable, human-readable copy. Preserves R2 file ids (files survive in R2), so
 * restored participants reconnect to their passport / student-card scans.
 *
 * Duplicate emails are skipped server-side, so re-running is safe.
 *
 * Env:
 *   API_BASE_URL                 API base (default http://localhost:8787)
 *   ADMIN_TOKEN                  Admin token (same value as the server)
 *   GOOGLE_SERVICE_ACCOUNT_JSON  Service-account key (raw JSON or base64)
 *   GOOGLE_SHEET_ID              Spreadsheet id
 *   GOOGLE_SHEET_TAB             Tab name (default Participants)
 *
 * Run with:
 *   npm run restore:from-sheet
 *   API_BASE_URL=https://api-summercamp2026.permiraspb.org npm run restore:from-sheet
 */

const BASE_URL = (process.env.API_BASE_URL ?? "http://localhost:8787").replace(/\/+$/, "");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

async function main() {
  if (!ADMIN_TOKEN) {
    console.error("ADMIN_TOKEN is not set. Add it to your .env (same value as the server).");
    process.exit(1);
  }

  const participants = await readParticipantsFromSheet();
  if (participants.length === 0) {
    console.error("No participant rows found in the Sheet.");
    process.exit(1);
  }
  console.log(`Restoring ${participants.length} participant(s) from Sheet -> ${BASE_URL}`);

  // 1. Exchange the admin token for a short-lived JWT.
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: ADMIN_TOKEN }),
  });
  if (!loginRes.ok) {
    console.error(`Login failed (${loginRes.status}): ${await loginRes.text()}`);
    process.exit(1);
  }
  const { token: jwt } = (await loginRes.json()) as { token: string };

  // 2. Import the batch (sheet columns already match the model field names).
  const importRes = await fetch(`${BASE_URL}/api/registrations/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ participants }),
  });
  const result = await importRes.json().catch(() => null);
  if (!importRes.ok) {
    console.error(`Import failed (${importRes.status}):`, result);
    process.exit(1);
  }

  console.log("Done:", JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error("restore:from-sheet failed:", err);
  process.exit(1);
});
