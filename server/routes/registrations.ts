import { Router, type Request, type Response, type NextFunction } from "express";
import { requireAdmin } from "../auth.js";
import { recordFile, upload, deleteFile } from "../services/files.js";
import {
  createParticipant,
  deleteParticipant,
  getParticipant,
  listParticipants,
  updateParticipant,
} from "../services/participants.js";
import type { ParticipantInput, ParticipantPatch, ParticipantStatus } from "../types.js";

export const registrationsRouter: Router = Router();

const NATIONALITIES = new Set(["Indonesia", "Russia"]);
const STATUSES: ParticipantStatus[] = ["pending", "accepted", "rejected", "waitlist"];

/**
 * Public endpoint: a prospective participant submits their registration
 * with passport + consent file uploads as `multipart/form-data`.
 */
registrationsRouter.post(
  "/",
  upload.fields([
    { name: "passport", maxCount: 1 },
    { name: "consent", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const body = req.body as Record<string, string>;

      // Honeypot: silently 200 without writing anything.
      if (body.website && body.website.trim()) {
        res.status(200).json({ id: "ok" });
        return;
      }

      const files = req.files as
        | { passport?: Express.Multer.File[]; consent?: Express.Multer.File[] }
        | undefined;
      const passport = files?.passport?.[0];
      const consent = files?.consent?.[0];

      if (!passport) throw new Error("Passport file is required.");
      if (!consent) throw new Error("Signed consent file is required.");

      const input: ParticipantInput = {
        fullName: requireString(body.fullName, "fullName", { min: 2, max: 80 }),
        nationality: requireEnum(body.nationality, "nationality", NATIONALITIES) as
          | "Indonesia"
          | "Russia",
        university: requireString(body.university, "university", { min: 1, max: 120 }),
        age: requireInt(body.age, "age", 16, 35),
        gender: requireString(body.gender, "gender", { min: 1, max: 30 }),
        email: requireEmail(body.email, "email"),
        phone: requireString(body.phone, "phone", { min: 6, max: 30 }),
        messenger: requireString(body.messenger, "messenger", { min: 1, max: 60 }),
        dietary: optionalString(body.dietary, 240),
        priorExperience: optionalString(body.priorExperience, 600),
        motivation: requireString(body.motivation, "motivation", { min: 40, max: 800 }),
        passportFileId: (await recordFile(passport)).id,
        consentFileId: (await recordFile(consent)).id,
      };

      const created = await createParticipant(input);
      res.status(201).json({ id: created.id });
    } catch (err) {
      // If validation/DB failed AFTER files were saved, clean them up.
      const files = req.files as
        | { passport?: Express.Multer.File[]; consent?: Express.Multer.File[] }
        | undefined;
      for (const f of [...(files?.passport ?? []), ...(files?.consent ?? [])]) {
        const id = f.filename.replace(/\.[^.]+$/, "");
        void deleteFile(id);
      }
      handleError(err, res);
    }
  },
);

// Multer's errors (file too big, wrong type) are thrown synchronously —
// catch them at the route level so the client gets a clean 400.
registrationsRouter.use(
  (err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);
    handleError(err, res);
  },
);

// --- Admin endpoints ---

registrationsRouter.get("/", requireAdmin, async (req, res) => {
  const { status, search, limit, offset } = req.query;
  const result = await listParticipants({
    status: typeof status === "string" && STATUSES.includes(status as ParticipantStatus)
      ? (status as ParticipantStatus)
      : undefined,
    search: typeof search === "string" ? search : undefined,
    limit: typeof limit === "string" ? Number(limit) : undefined,
    offset: typeof offset === "string" ? Number(offset) : undefined,
  });
  res.json(result);
});

registrationsRouter.get("/:id", requireAdmin, async (req, res) => {
  const p = await getParticipant(decodeURIComponent(req.params.id as string));
  if (!p) {
    res.status(404).json({ error: "Not found." });
    return;
  }
  res.json(p);
});

registrationsRouter.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const patch = req.body as ParticipantPatch;
    if (!patch || typeof patch !== "object") throw new Error("Body must be a JSON object.");
    if (
      patch.status !== undefined &&
      !STATUSES.includes(patch.status)
    ) {
      throw new Error(`status must be one of: ${STATUSES.join(", ")}`);
    }
    if (patch.email !== undefined) requireEmail(patch.email, "email");
    if (patch.age !== undefined) requireInt(String(patch.age), "age", 16, 35);
    if (
      patch.nationality !== undefined &&
      !NATIONALITIES.has(patch.nationality)
    ) {
      throw new Error("nationality must be Indonesia or Russia.");
    }

    const updated = await updateParticipant(decodeURIComponent(req.params.id as string), patch);
    if (!updated) {
      res.status(404).json({ error: "Not found." });
      return;
    }
    res.json(updated);
  } catch (err) {
    handleError(err, res);
  }
});

registrationsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const ok = await deleteParticipant(decodeURIComponent(req.params.id as string));
  if (!ok) {
    res.status(404).json({ error: "Not found." });
    return;
  }
  res.status(204).end();
});

// --- helpers ---

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function requireString(v: unknown, name: string, { min = 1, max = 1000 }: { min?: number; max?: number }) {
  if (typeof v !== "string" || !v.trim()) throw new Error(`${name} is required.`);
  if (v.length < min) throw new Error(`${name} must be at least ${min} characters.`);
  if (v.length > max) throw new Error(`${name} must be at most ${max} characters.`);
  return v.trim();
}
function optionalString(v: unknown, max: number) {
  if (v === undefined || v === null || v === "") return "";
  if (typeof v !== "string") throw new Error("Expected string.");
  if (v.length > max) throw new Error(`Field exceeds ${max} characters.`);
  return v.trim();
}
function requireInt(v: unknown, name: string, min: number, max: number) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isInteger(n)) throw new Error(`${name} must be an integer.`);
  if (n < min || n > max) throw new Error(`${name} must be between ${min} and ${max}.`);
  return n;
}
function requireEnum(v: unknown, name: string, set: Set<string>) {
  if (typeof v !== "string" || !set.has(v))
    throw new Error(`${name} must be one of: ${[...set].join(", ")}`);
  return v;
}
function requireEmail(v: unknown, name: string) {
  if (typeof v !== "string" || !EMAIL_RE.test(v.trim()))
    throw new Error(`${name} must be a valid email.`);
  return v.trim();
}

function handleError(err: unknown, res: Response) {
  const message = err instanceof Error ? err.message : "Unknown error.";
  // SurrealDB ASSERT failures and unique-index conflicts surface here.
  if (/already exists/i.test(message) || /unique/i.test(message)) {
    res.status(409).json({ error: "A participant with that email already exists." });
    return;
  }
  if (/file too large/i.test(message)) {
    res.status(413).json({ error: "File too large. 10 MB max per file." });
    return;
  }
  res.status(400).json({ error: message });
}
