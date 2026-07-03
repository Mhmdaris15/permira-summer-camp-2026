/**
 * Email history store — a small JSON-backed log of every message the admin
 * sends, so the Email History page can show recipient, subject, template and
 * delivery status. Mirrors the append-only, write-queued pattern used by
 * `knowledge.ts`; kept separate from SurrealDB because history is flat and
 * only ever filtered/paginated, never joined.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { EmailLogEntry, EmailLogStatus } from "../types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// services/ -> ../data/email-log.json  (sits next to participants.json)
const DATA_PATH = path.join(__dirname, "..", "data", "email-log.json");

type Store = { entries: EmailLogEntry[] };

let cache: Store | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function load(): Promise<Store> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as Store;
    cache = { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    // Missing/corrupt file → start fresh (created on first write).
    cache = { entries: [] };
  }
  return cache;
}

function persist(store: Store): Promise<void> {
  writeQueue = writeQueue.then(() =>
    fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), "utf8").catch(() => {
      /* best-effort: never let a log write break a send */
    }),
  );
  return writeQueue;
}

/** Append entries (newest kept first in the file) and flush to disk. */
export async function appendEmailLogs(entries: EmailLogEntry[]): Promise<void> {
  if (entries.length === 0) return;
  const store = await load();
  store.entries.unshift(...entries);
  await persist(store);
}

export type EmailLogQuery = {
  status?: EmailLogStatus;
  limit?: number;
  offset?: number;
};

export async function listEmailLogs(
  query: EmailLogQuery = {},
): Promise<{ rows: EmailLogEntry[]; total: number }> {
  const store = await load();
  let rows = store.entries;
  if (query.status) rows = rows.filter((e) => e.status === query.status);

  const total = rows.length;
  const offset = Math.max(query.offset ?? 0, 0);
  const limit = Math.min(query.limit ?? 100, 500);
  return { rows: rows.slice(offset, offset + limit), total };
}
