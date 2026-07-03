import { promises as fs, createReadStream } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import type { StoredFile } from "../types.js";
import { UPLOADS_DIR } from "../paths.js";

// Uploaded files + their metadata live in the persistent uploads volume.
const UPLOAD_DIR = UPLOADS_DIR;
const META_DIR = path.join(UPLOADS_DIR, ".meta");

await fs.mkdir(UPLOAD_DIR, { recursive: true });
await fs.mkdir(META_DIR, { recursive: true });

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/** Multer middleware factory — disk storage, uuid filenames, mime gating. */
export const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().slice(0, 8) || "";
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: MAX_BYTES, files: 4 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
    else cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

/**
 * Persists metadata for a multer-uploaded file and returns its stored
 * descriptor. Multer already wrote the bytes; we just record the mapping
 * id → path so files can be served with their original filename later.
 */
export async function recordFile(file: Express.Multer.File): Promise<StoredFile> {
  const id = path.basename(file.filename, path.extname(file.filename));
  const meta: StoredFile = {
    id,
    originalName: file.originalname,
    mime: file.mimetype,
    size: file.size,
    path: file.path,
  };
  await fs.writeFile(path.join(META_DIR, `${id}.json`), JSON.stringify(meta), "utf8");
  return meta;
}

export async function getFile(id: string): Promise<StoredFile | null> {
  if (!/^[a-f0-9-]{36}$/.test(id)) return null; // hardens against path traversal
  try {
    const raw = await fs.readFile(path.join(META_DIR, `${id}.json`), "utf8");
    return JSON.parse(raw) as StoredFile;
  } catch {
    return null;
  }
}

export async function deleteFile(id: string): Promise<void> {
  const meta = await getFile(id);
  if (!meta) return;
  await Promise.all([
    fs.unlink(meta.path).catch(() => undefined),
    fs.unlink(path.join(META_DIR, `${id}.json`)).catch(() => undefined),
  ]);
}

export function streamFile(meta: StoredFile) {
  return createReadStream(meta.path);
}
