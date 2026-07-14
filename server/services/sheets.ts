import { google, type sheets_v4 } from "googleapis";
import { listParticipants } from "./participants.js";
import type { Participant } from "../types.js";
import { logger } from "../logger.js";

/**
 * One-way mirror of the participant table to a Google Sheet (a second,
 * human-readable copy that survives redeploys). The DB is the source of truth;
 * `mirrorParticipants()` rewrites the whole sheet after every mutation.
 *
 * If the Google env vars are absent, everything here is a logged no-op so the
 * server still runs without Sheets configured.
 */

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const SHEET_TAB = process.env.GOOGLE_SHEET_TAB ?? "Participants";

// Fixed column order — the sheet header and the restore reader both rely on it.
export const SHEET_COLUMNS: (keyof Participant)[] = [
  "id",
  "fullName",
  "nationality",
  "university",
  "gender",
  "email",
  "phone",
  "messenger",
  "dietary",
  "priorExperience",
  "motivation",
  "status",
  "notes",
  "passportFileId",
  "studentCardFileId",
  "submittedAt",
  "updatedAt",
];

export function isSheetsConfigured(): boolean {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.GOOGLE_SHEET_ID);
}

/** Parses the service-account key from env — accepts raw JSON or base64. */
function parseServiceAccount(): { client_email: string; private_key: string } {
  const raw = (process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? "").trim();
  const text = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  const json = JSON.parse(text) as { client_email: string; private_key: string };
  if (!json.client_email || !json.private_key) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email / private_key.");
  }
  return json;
}

let _sheets: sheets_v4.Sheets | null = null;
async function sheetsClient(): Promise<sheets_v4.Sheets> {
  if (_sheets) return _sheets;
  const creds = parseServiceAccount();
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  await auth.authorize();
  _sheets = google.sheets({ version: "v4", auth });
  return _sheets;
}

// Coalesce concurrent mutations: while a mirror runs, mark dirty and re-run
// once afterwards, so a burst of writes results in one final correct rewrite.
let running = false;
let dirty = false;

/** Rewrites the whole sheet from the current participant table. Never throws. */
export async function mirrorParticipants(): Promise<void> {
  if (!isSheetsConfigured()) return;
  if (running) {
    dirty = true;
    return;
  }
  running = true;
  try {
    do {
      dirty = false;
      await writeAllRows();
    } while (dirty);
  } catch (err) {
    logger.error({ err }, "[sheets] mirror failed");
  } finally {
    running = false;
  }
}

async function writeAllRows(): Promise<void> {
  const sheets = await sheetsClient();
  const { rows } = await listParticipants({ limit: 500 });

  const header = SHEET_COLUMNS.map(String);
  const values: string[][] = [
    header,
    ...rows.map((r) => SHEET_COLUMNS.map((c) => stringifyCell(r[c]))),
  ];

  // Clear the full range first so deleted participants don't leave stale rows,
  // then write header + data from A1.
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A:Z`,
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A1`,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

/** Reads all data rows keyed by header — used by the restore-from-sheet script. */
export async function readParticipantsFromSheet(): Promise<Record<string, string>[]> {
  if (!isSheetsConfigured()) {
    throw new Error("Google Sheets is not configured (GOOGLE_SERVICE_ACCOUNT_JSON / GOOGLE_SHEET_ID).");
  }
  const sheets = await sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A:Z`,
  });
  const rows = res.data.values ?? [];
  if (rows.length < 2) return [];
  const header = rows[0].map(String);
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    header.forEach((h, i) => {
      obj[h] = row[i] != null ? String(row[i]) : "";
    });
    return obj;
  });
}

function stringifyCell(v: unknown): string {
  return v === null || v === undefined ? "" : String(v);
}
