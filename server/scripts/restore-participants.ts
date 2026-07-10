import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Restores participant registrations from a JSON backup by hitting the live API
 * (the admin bulk-import endpoint). Use after a redeploy wipes the data volume.
 *
 * It maps the legacy backup schema (telegram, dietaryRestrictions, age) onto
 * the current participant model, exchanges the admin token for a JWT, then
 * POSTs the batch to /api/registrations/import. Duplicate emails are skipped
 * server-side, so re-running is safe.
 *
 * Env:
 *   API_BASE_URL   Base URL of the API (default http://localhost:8787)
 *   ADMIN_TOKEN    Admin token — same value set in the server .env
 *
 * Run with:
 *   npm run restore:participants
 *   API_BASE_URL=https://api-summercamp2026.permiraspb.org npm run restore:participants
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_PATH = path.resolve(__dirname, "../../src/assets/participants-backup.json");
const BASE_URL = (process.env.API_BASE_URL ?? "http://localhost:8787").replace(/\/+$/, "");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

type BackupRow = Record<string, unknown>;

/** Maps one legacy backup row onto the current participant model. */
function mapRow(row: BackupRow) {
  const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
  return {
    fullName: str(row.fullName),
    nationality: str(row.nationality),
    university: str(row.university),
    gender: str(row.gender),
    email: str(row.email),
    phone: str(row.phone),
    // legacy `telegram` → `messenger`
    messenger: str(row.telegram) || str(row.messenger),
    // legacy `dietaryRestrictions` → `dietary`
    dietary: str(row.dietaryRestrictions) || str(row.dietary),
    priorExperience: str(row.priorExperience),
    motivation: str(row.motivation),
    status: str(row.status) || "pending",
    notes: "",
    submittedAt: str(row.submittedAt),
    // `age` is intentionally dropped — no longer part of the model.
  };
}

async function main() {
  if (!ADMIN_TOKEN) {
    console.error("ADMIN_TOKEN is not set. Add it to your .env (same value as the server).");
    process.exit(1);
  }

  const raw = await readFile(BACKUP_PATH, "utf8");
  const rows = JSON.parse(raw) as BackupRow[];
  if (!Array.isArray(rows) || rows.length === 0) {
    console.error(`No participants found in ${BACKUP_PATH}`);
    process.exit(1);
  }
  const participants = rows.map(mapRow);
  console.log(`Restoring ${participants.length} participant(s) -> ${BASE_URL}`);

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

  // 2. Import the batch.
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
  console.error("restore:participants failed:", err);
  process.exit(1);
});
