# Design — Durable storage: Cloudflare R2 + Google Sheets mirror

**Date:** 2026-07-10
**Status:** Approved for planning
**Scope:** Two independent storage backends added behind existing seams, so participant files and data survive Coolify redeploys and live in more than one place.

## Problem

Coolify redeploys wipe the container's data and uploads volumes. Both the
SurrealDB JSON snapshot (`DATA_DIR/participants.json`) and uploaded files
(`UPLOADS_DIR`) are lost on every deploy. The `.env`-based configuration
survives redeploys; mounted volumes do not.

Goal: move durable state off the ephemeral filesystem and into services whose
config is env-driven, and keep a second, human-readable copy of the data.

- **#2 — Files → Cloudflare R2** (S3-compatible object storage), served via
  short-lived **presigned URLs**.
- **#3 — Data → Google Sheets**, a **one-way mirror** (DB is source of truth)
  plus a **restore-from-Sheet** command for redundancy.

Out of scope: fixing the Coolify volume itself (redundancy is the chosen
approach), two-way Sheet sync, migrating the SurrealDB store off `mem://`.

## Shared principles

1. **Config in env, not volumes.** Every credential is an env var, set
   identically in production and dev (the project already mirrors prod → dev).
2. **Graceful degradation.** If a backend's env is absent, it fails loudly at
   the right moment (R2) or becomes a logged no-op (Sheets) — the app still
   boots and the rest of the API works.
3. **Additive, behind existing seams.** `files.ts` already wraps all file I/O;
   `snapshot()` already runs after every DB mutation. We change those bodies /
   add one hook rather than restructuring routes and services.

---

## #2 — Cloudflare R2 object storage

### Dependencies
- `@aws-sdk/client-s3`
- `@aws-sdk/s3-request-presigner`

### Env vars
| Var | Meaning |
| --- | --- |
| `R2_ACCOUNT_ID` | Cloudflare account id |
| `R2_ENDPOINT` | `https://<account_id>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | R2 S3 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 S3 API token secret |
| `R2_BUCKET` | Bucket name |

If any required R2 var is missing, `getDb`-style boot logs a fatal-level
message and file endpoints return a clear 500 ("file storage not configured").
The rest of the API stays up. (R2-only: no disk fallback.)

### `server/services/files.ts` (reimplemented, same public surface)
A single module-level S3 client configured for R2 (`region: "auto"`, the
endpoint above, path-style not required for R2).

- `upload` — multer switches from `diskStorage` to **`memoryStorage`** so the
  bytes are available as `file.buffer`. Same limits (10 MB, 4 files) and same
  MIME allowlist (`image/jpeg|png|webp`, `application/pdf`).
- `recordFile(file)` — `PutObjectCommand`:
  - `Key` = `${randomUUID()}${ext}` (ext derived from original name, ≤ 8 chars)
  - `Body` = `file.buffer`, `ContentType` = `file.mimetype`
  - `Metadata` = `{ originalname: <encoded original name> }`
  - returns `StoredFile { id, originalName, mime, size, path: key }`
- `getFile(id)` — validates the id shape, `HeadObjectCommand`; maps
  `ContentType → mime`, `ContentLength → size`, `Metadata.originalname →
  originalName`. Returns `null` on `NotFound`.
- `deleteFile(id)` — `DeleteObjectCommand` (best-effort, swallows NotFound).
- **`getSignedFileUrl(id)`** (new) — `getSignedUrl(GetObjectCommand, { expiresIn: 300 })`
  with `ResponseContentDisposition: inline; filename="<safe name>"` and
  `ResponseContentType`. Returns `{ url, originalName, mime, expiresAt }` or
  `null` if the object is missing.
- `streamFile` — **removed** (no longer streaming through the API).

`StoredFile.path` now holds the R2 object key. The id format check in
`getFile` widens from the 36-char UUID regex to `uuid + optional short ext`.

### Route — `server/routes/files.ts`
`GET /api/files/:id` (still `requireAdmin`) returns JSON:
```json
{ "url": "https://…r2…?X-Amz-Signature=…", "originalName": "passport.pdf", "mime": "application/pdf" }
```
404 `{ error: "File not found." }` when the object is absent. No byte streaming.

### Frontend
- `src/lib/participantsApi.ts` — replace `fetchFileAsBlobUrl(id)` with
  `getFileUrl(id): Promise<string>` that GETs `/api/files/:id` with admin
  headers and returns `body.url`. `fileEndpoint` stays.
- `src/components/admin/ParticipantDetail.tsx` — `docs` state holds presigned
  URLs (remote, not blob). Load them via `getFileUrl`; **remove** the
  `URL.revokeObjectURL` effects (nothing to revoke). `DocCard` is unchanged —
  it already renders `<object>` / `<img>` / `<a>` from a URL string.

### CSP (critical)
The admin dashboard is served by the **frontend** nginx, which sets its own
Content-Security-Policy (the API sets `contentSecurityPolicy: false`).
Presigned URLs are cross-origin to `*.r2.cloudflarestorage.com`, so the nginx
CSP must allow that host in **`img-src`**, **`object-src`**, and
**`frame-src`** (the `<object data=…>` PDF preview needs object/frame). Locate
the CSP (nginx conf / Docker asset in the repo) and add the R2 host. Without
this, previews are silently blocked.

### Verification (#2)
Against the real dev R2 bucket: register/import → upload a passport →
`GET /api/files/:id` returns a presigned URL → the URL opens the file →
delete participant removes the object (`HeadObject` → 404). Server typecheck +
frontend build clean.

---

## #3 — Google Sheets one-way mirror + restore

### Dependency
- `googleapis` (service-account JWT auth, `sheets` v4).

### Env vars
| Var | Meaning |
| --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Service-account key, raw JSON or base64 (single env var — no file mount) |
| `GOOGLE_SHEET_ID` | Target spreadsheet id |
| `GOOGLE_SHEET_TAB` | Tab name (default `Participants`) |

The target Sheet must already be shared with the service account's
`client_email` (done during provisioning). If Google env is absent,
`mirrorParticipants` and the restore command are logged no-ops.

### `server/services/sheets.ts`
- Lazy, memoized auth client built from `GOOGLE_SERVICE_ACCOUNT_JSON`
  (parse raw or base64-decode then parse).
- **Columns** (header row, fixed order): `id, fullName, nationality,
  university, gender, email, phone, messenger, dietary, priorExperience,
  motivation, status, notes, passportFileId, studentCardFileId, submittedAt,
  updatedAt`.
- `mirrorParticipants()`:
  1. `listParticipants({ limit: 500 })`.
  2. Build `[header, ...rows]`.
  3. `spreadsheets.values.clear` the data range, then
     `spreadsheets.values.update` (`valueInputOption: "RAW"`).
  - **In-flight guard**: if a mirror is already running, mark "dirty" and
    re-run once after it finishes (coalesces bursts). Errors are caught and
    logged; never thrown.
- Rationale: full rewrite (not row diffing) is trivial and correct at camp
  scale (tens of rows); avoids tracking sheet row ids.

### Hook
In `server/db.ts`, after `snapshot()` writes the file, call
`void mirrorParticipants()` (fire-and-forget). This single seam covers
create, update, delete, and the #1 bulk import. `snapshot()` stays synchronous
for the caller; the mirror runs detached.

### Restore from Sheet — `server/scripts/restore-from-sheet.ts`
- Reads all rows from the tab via `spreadsheets.values.get`.
- Maps each row (by header) to `ImportParticipantInput`.
- Reuses **`importParticipant`** from #1 (dup-safe by email).
- `npm run restore:from-sheet`. Prints imported / skipped / errors.

This gives two independent one-command restores: from the JSON backup
(`restore:participants`) and from the live Sheet (`restore:from-sheet`).

### Verification (#3)
Against the real Sheet: create a participant via the API → the row appears
with all columns → edit status → the row updates → delete → the row
disappears → wipe local DB → `npm run restore:from-sheet` repopulates it.

---

## Build order

1. **Phase A — R2.** Deps, `files.ts` rewrite, files route, frontend
   (`getFileUrl` + `ParticipantDetail`), nginx CSP, `.env.example` additions.
   Verify end-to-end.
2. **Phase B — Sheets.** Dep, `sheets.ts`, `db.ts` hook,
   `restore-from-sheet.ts` + npm script, `.env.example` additions. Verify
   end-to-end.

Each phase is independently shippable and independently verifiable.

## Risks / notes

- **CSP** is the most likely thing to silently break previews — verify in a
  real browser, not just typecheck.
- **Sheets API quota**: full-rewrite-per-write is fine at this scale; the
  in-flight guard prevents write storms. If volume ever grows, switch to a
  debounced batch.
- **Service-account JSON in env**: base64 is recommended to avoid newline/quote
  escaping issues in the Coolify env editor.
- The `.env` used by scripts must carry the same R2 + Google vars as the server.
