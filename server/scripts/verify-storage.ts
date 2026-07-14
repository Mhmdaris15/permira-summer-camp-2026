import "dotenv/config";
import {
  recordFile,
  getFile,
  getSignedFileUrl,
  deleteFile,
  isStorageConfigured,
} from "../services/files.js";
import {
  mirrorParticipants,
  readParticipantsFromSheet,
  isSheetsConfigured,
} from "../services/sheets.js";

/**
 * End-to-end health check for the two storage backends. Safe to run anytime:
 * it uploads then deletes one throwaway R2 object, and mirrors the current DB
 * to the Sheet (idempotent). Run: npm run verify:storage
 */

async function verifyR2() {
  console.log("\n=== Cloudflare R2 ===");
  if (!isStorageConfigured()) {
    console.log("SKIP: R2 env not set.");
    return;
  }
  const buf = Buffer.from(`permira r2 verify ${new Date().toISOString()}`);
  const fakeFile = {
    originalname: "verify.txt",
    mimetype: "text/plain",
    size: buf.length,
    buffer: buf,
  } as Express.Multer.File;

  const stored = await recordFile(fakeFile);
  console.log("PUT     ->", stored.id);

  const signed = await getSignedFileUrl(stored.id);
  if (!signed) throw new Error("getSignedFileUrl returned null");
  console.log("PRESIGN ->", signed.url.slice(0, 90) + "...");

  const res = await fetch(signed.url);
  const text = await res.text();
  console.log(
    "GET url ->",
    res.status,
    text === buf.toString() ? "CONTENT MATCH ✓" : `MISMATCH: ${text.slice(0, 60)}`,
  );

  await deleteFile(stored.id);
  const after = await getFile(stored.id);
  console.log("DELETE  ->", after === null ? "gone ✓" : "STILL EXISTS ✗");
}

async function verifySheets() {
  console.log("\n=== Google Sheets ===");
  if (!isSheetsConfigured()) {
    console.log("SKIP: Google env not set.");
    return;
  }
  await mirrorParticipants();
  const rows = await readParticipantsFromSheet();
  console.log("MIRROR + READBACK ->", rows.length, "row(s)");
  console.log("emails:", rows.map((r) => r.email).join(", ") || "(none)");
}

async function main() {
  await verifyR2();
  await verifySheets();
  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error("verify:storage failed:", err);
  process.exit(1);
});
