import { promises as fs } from "node:fs";
import path from "node:path";
import { RecordId, Surreal } from "surrealdb";
import { createNodeEngines } from "@surrealdb/node";
import { dataPath } from "./paths.js";

// SurrealDB runs in-memory (mem://); this JSON snapshot in the persistent
// data volume is the durable store the DB is hydrated from on every boot.
const SNAPSHOT_PATH = dataPath("participants.json");

/**
 * Schema for the participant table. SurrealQL is the source of truth —
 * every write goes through this defined surface, so changes here propagate
 * to every service via the type definitions in `types.ts`.
 */
const SCHEMA = `
DEFINE TABLE IF NOT EXISTS participant SCHEMAFULL;

DEFINE FIELD IF NOT EXISTS fullName       ON participant TYPE string  ASSERT string::len($value) >= 2 AND string::len($value) <= 80;
DEFINE FIELD IF NOT EXISTS nationality    ON participant TYPE string;
DEFINE FIELD IF NOT EXISTS university     ON participant TYPE string;
DEFINE FIELD IF NOT EXISTS gender         ON participant TYPE string;
DEFINE FIELD IF NOT EXISTS email          ON participant TYPE string;
DEFINE FIELD IF NOT EXISTS phone          ON participant TYPE string;
DEFINE FIELD IF NOT EXISTS messenger      ON participant TYPE string;
DEFINE FIELD IF NOT EXISTS dietary        ON participant TYPE string  DEFAULT "";
DEFINE FIELD IF NOT EXISTS priorExperience ON participant TYPE string DEFAULT "";
DEFINE FIELD IF NOT EXISTS motivation     ON participant TYPE string;
DEFINE FIELD IF NOT EXISTS passportFileId ON participant TYPE option<string>;
DEFINE FIELD IF NOT EXISTS studentCardFileId ON participant TYPE option<string>;
DEFINE FIELD IF NOT EXISTS status         ON participant TYPE string  DEFAULT "pending"
                                          ASSERT $value INSIDE ["pending", "accepted", "rejected", "waitlist"];
DEFINE FIELD IF NOT EXISTS notes          ON participant TYPE string  DEFAULT "";
DEFINE FIELD IF NOT EXISTS submittedAt    ON participant TYPE datetime;
DEFINE FIELD IF NOT EXISTS updatedAt      ON participant TYPE datetime;

DEFINE INDEX IF NOT EXISTS unique_email ON participant FIELDS email UNIQUE;
DEFINE INDEX IF NOT EXISTS by_status   ON participant FIELDS status;
`;

let db: Surreal | null = null;
let writeQueue: Promise<void> = Promise.resolve();

export async function getDb(): Promise<Surreal> {
  if (db) return db;
  const instance = new Surreal({ engines: createNodeEngines() });
  await instance.connect("mem://");
  await instance.use({ namespace: "permira", database: "summercamp" });
  await instance.query(SCHEMA);
  await restoreSnapshot(instance);
  db = instance;
  return db;
}

async function restoreSnapshot(instance: Surreal) {
  try {
    const raw = await fs.readFile(SNAPSHOT_PATH, "utf8");
    const rows = JSON.parse(raw) as Record<string, unknown>[];
    if (!Array.isArray(rows) || rows.length === 0) return;

    // Coerce serialized values back into the runtime types SurrealDB
    // expects: id string → RecordId, ISO date strings → Date.
    const prepared = rows.map((row) => {
      const idStr = String(row.id ?? "");
      const idPart = idStr.startsWith("participant:") ? idStr.slice("participant:".length) : idStr;
      return {
        ...row,
        id: new RecordId("participant", idPart),
        submittedAt: row.submittedAt ? new Date(String(row.submittedAt)) : new Date(),
        updatedAt: row.updatedAt ? new Date(String(row.updatedAt)) : new Date(),
      };
    });

    await instance.query("INSERT INTO participant $rows", { rows: prepared });
    console.log(`[db] restored ${prepared.length} participant(s) from snapshot`);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn("[db] snapshot restore failed:", err);
    }
  }
}

/**
 * Serializes the entire participant table to disk. Cheap at this scale.
 * Writes are queued so two near-simultaneous calls don't trample each other.
 */
export async function snapshot(): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    const instance = await getDb();
    const [rows] = await instance.query<[unknown[]]>("SELECT * FROM participant ORDER BY submittedAt DESC");
    const serialized = JSON.stringify(rows ?? [], replacer, 2);
    await fs.mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
    await fs.writeFile(SNAPSHOT_PATH, serialized, "utf8");
  });
  await writeQueue;

  // Mirror the table to Google Sheets — best-effort, never blocks the caller or
  // throws. Dynamic import avoids a db ↔ sheets ↔ participants import cycle.
  void import("./services/sheets.js")
    .then((m) => m.mirrorParticipants())
    .catch((err) => console.error("[sheets] mirror hook failed:", err));
}

/**
 * SurrealDB returns RecordId instances and Date objects. JSON.stringify
 * mishandles RecordIds, so we coerce them to their string form on the way
 * out. INSERT happily accepts the same string back as an id.
 */
function replacer(_key: string, value: unknown): unknown {
  if (value && typeof value === "object" && "tb" in value && "id" in value) {
    const rid = value as { tb: string; id: string };
    return `${rid.tb}:${rid.id}`;
  }
  return value;
}
