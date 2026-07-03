/**
 * Central resolver for runtime-writable paths.
 *
 * WHY THIS EXISTS
 * ---------------
 * Every data module used to derive its path from `__dirname`. In production
 * the compiled code runs from `/app/server/dist/**`, so those paths resolved
 * to `/app/server/dist/data` and `/app/server/dist/uploads` — INSIDE the
 * container's ephemeral layer. The Docker volumes are mounted at
 * `/app/server/data` and `/app/server/uploads`, which the app never touched,
 * so all data was lost on every redeploy.
 *
 * Now every writable path comes from here:
 *   • DATA_DIR / UPLOADS_DIR — overridable via env (set to the volume mounts
 *     in Docker), defaulting to `<cwd>/server/{data,uploads}` for local dev
 *     (identical to the previous dev behaviour, since dev runs from repo root).
 *   • SEED_DIR — bundled read-only defaults shipped in the image, used to seed
 *     a fresh volume on first boot (see knowledge.ts).
 */
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

const cwd = process.cwd();

/** Persistent data directory. In Docker: the mounted volume `/app/server/data`. */
export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(cwd, "server", "data");

/** Persistent uploads directory. In Docker: the mounted volume `/app/server/uploads`. */
export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve(cwd, "server", "uploads");

/** Read-only defaults shipped inside the image (next to the compiled code). */
export const SEED_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "seed");

/** A file inside the persistent data dir. */
export const dataPath = (name: string): string => path.join(DATA_DIR, name);

/** A path inside the persistent uploads dir. */
export const uploadsPath = (name = ""): string => path.join(UPLOADS_DIR, name);

/** A bundled seed file inside the image. */
export const seedPath = (name: string): string => path.join(SEED_DIR, name);

/**
 * Make sure the persistent directories exist before anything reads/writes.
 * Safe to call repeatedly; called once at server startup.
 */
export async function ensureRuntimeDirs(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(path.join(UPLOADS_DIR, ".meta"), { recursive: true });
}
