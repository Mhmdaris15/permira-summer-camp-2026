import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Readable } from "node:stream";
import multer from "multer";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StoredFile } from "../types.js";

/**
 * File storage backed by Cloudflare R2 (S3-compatible). Uploaded bytes live in
 * the R2 bucket — nothing touches the container filesystem, so files survive
 * redeploys. Objects are private; the browser gets short-lived presigned URLs.
 *
 * Two S3 clients:
 *  • the management client talks to the account S3 endpoint (PUT/HEAD/DELETE).
 *  • the presign client (when R2_PUBLIC_HOST is set) signs GET URLs against the
 *    public custom domain, so browser-facing URLs are https://<host>/<key>.
 */

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const SIGNED_URL_TTL_SECONDS = 300; // 5 min

const R2_BUCKET = process.env.R2_BUCKET ?? "";

/** True when the required R2 vars are present. */
export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.R2_ENDPOINT &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET,
  );
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set — R2 object storage is not configured.`);
  return v;
}

function credentials() {
  return {
    accessKeyId: required("R2_ACCESS_KEY_ID"),
    secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
  };
}

let _client: S3Client | null = null;
function client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: required("R2_ENDPOINT"),
      credentials: credentials(),
    });
  }
  return _client;
}

let _presignClient: S3Client | null = null;
function presignClient(): S3Client {
  if (!_presignClient) {
    // Sign against the account S3 endpoint with path-style addressing, so the
    // URL host is exactly <account>.r2.cloudflarestorage.com (single label —
    // matches the CSP allowlist) and the key sits in the path. R2 custom-domain
    // presigning (bucketEndpoint) proved unreliable and 500'd, so we don't use
    // R2_PUBLIC_HOST for signed URLs.
    _presignClient = new S3Client({
      region: "auto",
      endpoint: required("R2_ENDPOINT"),
      forcePathStyle: true,
      credentials: credentials(),
    });
  }
  return _presignClient;
}

/** Multer middleware — in-memory storage so bytes are available for R2 upload. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 4 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
    else cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

// A stored key is a uuid plus an optional short extension. Guards getFile /
// deleteFile against arbitrary keys.
const KEY_RE = /^[a-f0-9-]{36}(\.[a-z0-9]{1,8})?$/i;

/** Uploads a multer (memory) file to R2 and returns its descriptor. */
export async function recordFile(file: Express.Multer.File): Promise<StoredFile> {
  const ext = path.extname(file.originalname).toLowerCase().slice(0, 8) || "";
  const key = `${randomUUID()}${ext}`;
  await client().send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
      // Original name preserved for later download; encoded so non-ASCII names
      // (Cyrillic passports) are valid HTTP header metadata.
      Metadata: { originalname: encodeURIComponent(file.originalname) },
    }),
  );
  return {
    id: key,
    originalName: file.originalname,
    mime: file.mimetype,
    size: file.size,
    path: key,
  };
}

export async function getFile(id: string): Promise<StoredFile | null> {
  if (!KEY_RE.test(id)) return null;
  try {
    const head = await client().send(
      new HeadObjectCommand({ Bucket: R2_BUCKET, Key: id }),
    );
    const originalName = head.Metadata?.originalname
      ? decodeURIComponent(head.Metadata.originalname)
      : id;
    return {
      id,
      originalName,
      mime: head.ContentType ?? "application/octet-stream",
      size: head.ContentLength ?? 0,
      path: id,
    };
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

export async function deleteFile(id: string): Promise<void> {
  if (!KEY_RE.test(id)) return;
  try {
    await client().send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: id }));
  } catch (err) {
    if (!isNotFound(err)) console.error("[files] delete failed:", err);
  }
}

/** Short-lived presigned GET URL for browser-side preview/download. */
export async function getSignedFileUrl(id: string): Promise<{
  url: string;
  originalName: string;
  mime: string;
  expiresAt: string;
} | null> {
  const meta = await getFile(id);
  if (!meta) return null;
  const safeName = meta.originalName.replace(/[^\w.\-+ ]/g, "_");
  const url = await getSignedUrl(
    presignClient(),
    new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: id,
      ResponseContentDisposition: `inline; filename="${safeName}"`,
      ResponseContentType: meta.mime,
    }),
    { expiresIn: SIGNED_URL_TTL_SECONDS },
  );
  return {
    url,
    originalName: meta.originalName,
    mime: meta.mime,
    expiresAt: new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000).toISOString(),
  };
}

/**
 * Streams an object's bytes straight from R2 — used for server-side bulk export
 * (zipping uploaded documents). Returns the body as a Node Readable plus the
 * original name, mime, and file extension (from the key).
 */
export async function getFileObject(id: string): Promise<{
  body: Readable;
  originalName: string;
  mime: string;
  ext: string;
} | null> {
  if (!KEY_RE.test(id)) return null;
  try {
    const res = await client().send(
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: id }),
    );
    if (!res.Body) return null;
    const originalName = res.Metadata?.originalname
      ? decodeURIComponent(res.Metadata.originalname)
      : id;
    return {
      body: res.Body as Readable,
      originalName,
      mime: res.ContentType ?? "application/octet-stream",
      ext: path.extname(id) || extFromMime(res.ContentType),
    };
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

function extFromMime(mime?: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "application/pdf":
      return ".pdf";
    default:
      return "";
  }
}

function isNotFound(err: unknown): boolean {
  const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
  return e?.name === "NotFound" || e?.$metadata?.httpStatusCode === 404;
}
