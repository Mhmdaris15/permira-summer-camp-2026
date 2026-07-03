import { getDb, snapshot } from "../db.js";
import type {
  Participant,
  ParticipantInput,
  ParticipantPatch,
  ParticipantStatus,
} from "../types.js";
import { deleteFile } from "./files.js";

/**
 * Service layer between the routes and SurrealDB. Every method returns
 * the same `Participant` shape — the SurrealDB row id is normalised to a
 * plain string so the wire format stays JSON-friendly.
 */

export type ListOptions = {
  status?: ParticipantStatus;
  search?: string; // matches name, email, university (case-insensitive)
  limit?: number;
  offset?: number;
};

type SurrealRow = Omit<Participant, "id"> & { id: unknown };

/**
 * SurrealDB returns `id` as a `RecordId` instance (private fields, no plain
 * `tb`/`id` props). Its `toString()` produces the canonical "table:id" form
 * which is what we want on the wire.
 */
function rowToParticipant(row: SurrealRow): Participant {
  const id = String(row.id);
  return { ...(row as unknown as Participant), id };
}

export async function createParticipant(input: ParticipantInput): Promise<Participant> {
  const db = await getDb();
  const now = new Date().toISOString();

  const [rows] = await db.query<[SurrealRow[]]>(
    `CREATE participant CONTENT {
       fullName: $fullName,
       nationality: $nationality,
       university: $university,
       age: $age,
       gender: $gender,
       email: $email,
       phone: $phone,
       messenger: $messenger,
       dietary: $dietary,
       priorExperience: $priorExperience,
       motivation: $motivation,
       passportFileId: $passportFileId,
       status: "pending",
       notes: "",
       submittedAt: <datetime> $now,
       updatedAt: <datetime> $now
     } RETURN AFTER`,
    { ...input, now },
  );

  if (!rows || rows.length === 0) {
    throw new Error("Failed to create participant.");
  }
  const created = rowToParticipant(rows[0]);
  await snapshot();
  return created;
}

export async function listParticipants(opts: ListOptions = {}): Promise<{
  rows: Participant[];
  total: number;
}> {
  const db = await getDb();
  const where: string[] = [];
  const vars: Record<string, unknown> = {};

  if (opts.status) {
    where.push("status = $status");
    vars.status = opts.status;
  }
  if (opts.search) {
    where.push(
      "(string::lowercase(fullName) CONTAINS $q OR string::lowercase(email) CONTAINS $q OR string::lowercase(university) CONTAINS $q)",
    );
    vars.q = opts.search.toLowerCase();
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const limit = Math.min(opts.limit ?? 100, 500);
  const offset = Math.max(opts.offset ?? 0, 0);

  const sql = `
    SELECT * FROM participant ${whereClause} ORDER BY submittedAt DESC LIMIT ${limit} START ${offset};
    SELECT count() FROM participant ${whereClause} GROUP ALL;
  `;
  const [rows, countRows] = await db.query<[SurrealRow[], { count: number }[]]>(sql, vars);
  const total = countRows && countRows[0] ? countRows[0].count : 0;
  return { rows: (rows ?? []).map(rowToParticipant), total };
}

export async function getParticipant(id: string): Promise<Participant | null> {
  if (!id.startsWith("participant:")) return null;
  const db = await getDb();
  const [rows] = await db.query<[SurrealRow[]]>(`SELECT * FROM type::record("${id}")`);
  if (!rows || rows.length === 0) return null;
  return rowToParticipant(rows[0]);
}

export async function updateParticipant(
  id: string,
  patch: ParticipantPatch,
): Promise<Participant | null> {
  if (!id.startsWith("participant:")) return null;
  const db = await getDb();

  const fields = Object.keys(patch);
  if (fields.length === 0) {
    return getParticipant(id);
  }
  // Build a parameterized MERGE — every field shows up as $patch.field.
  const setClauses = fields.map((f) => `${f} = $patch.${f}`).join(", ");
  const sql = `UPDATE type::record("${id}") SET ${setClauses}, updatedAt = <datetime> $now RETURN AFTER`;
  const [rows] = await db.query<[SurrealRow[]]>(sql, {
    patch,
    now: new Date().toISOString(),
  });
  if (!rows || rows.length === 0) return null;
  await snapshot();
  return rowToParticipant(rows[0]);
}

export async function deleteParticipant(id: string): Promise<boolean> {
  if (!id.startsWith("participant:")) return false;
  const existing = await getParticipant(id);
  if (!existing) return false;

  const db = await getDb();
  await db.query(`DELETE type::record("${id}")`);

  // Clean up the associated file — best-effort, doesn't block the response.
  if (existing.passportFileId) void deleteFile(existing.passportFileId);

  await snapshot();
  return true;
}
