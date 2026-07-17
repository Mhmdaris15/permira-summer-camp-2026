import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { chatRouter } from "./routes/chat.js";
import { knowledgeRouter } from "./routes/knowledge.js";
import { authRouter } from "./routes/auth.js";
import { registrationsRouter } from "./routes/registrations.js";
import { filesRouter } from "./routes/files.js";
import { emailRouter } from "./routes/email.js";
import { analyticsRouter } from "./routes/analytics.js";
import { requireAdmin } from "./auth.js";
import { getDb } from "./db.js";
import { ensureRuntimeDirs } from "./paths.js";
import { logger } from "./logger.js";

const PORT = Number(process.env.PORT ?? 8787);
const NODE_ENV = process.env.NODE_ENV ?? "development";

const app = express();

// Behind Coolify/Traefik — trust the first proxy hop so X-Forwarded-* and
// rate-limit IPs resolve correctly (don't trust everything blindly).
app.set("trust proxy", 1);

// Structured request logging.
app.use(
  pinoHttp({
    logger,
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  }),
);

// Security headers. Disable CSP at this layer — the frontend is served by
// a separate nginx container with its own CSP, and the API only returns JSON.
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS allowlist via env. ALLOWED_ORIGINS=https://a.com,https://b.com
// Empty in dev = reflect any origin. Always set explicitly in production.
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsMw = cors({
  origin: allowedOrigins.length === 0 ? true : allowedOrigins,
  credentials: false,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type", "X-Requested-With"],
  exposedHeaders: ["Content-Disposition"], // so the admin can read original file names
  maxAge: 86400,                            // cache preflight for 24h
});
app.use(corsMw);
// Express 5 needs an explicit OPTIONS catch-all for path-pattern preflights.
app.options(/.*/, corsMw);

app.use(express.json({ limit: "256kb" }));

// Global rate limit: 300 req / 15 min / IP — generous for normal use,
// stops casual scripted abuse before the LLM/DB layers see it.
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_GLOBAL ?? 300),
    standardHeaders: "draft-7",
    legacyHeaders: false,
    // Don't count health probes or CORS preflights against the budget.
    skip: (req) => req.path === "/health" || req.method === "OPTIONS",
  }),
);

// Per-route caps for the most-abused surfaces.
const tightLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_TIGHT ?? 10),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, env: NODE_ENV, ts: new Date().toISOString() });
});

app.use("/api/auth", tightLimiter, authRouter);
app.use("/api/chat", tightLimiter, chatRouter);
app.use("/api/registrations", registrationsRouter);
app.use("/api/knowledge", knowledgeRouter);
app.use("/api/files", filesRouter);
app.use("/api/email", requireAdmin, emailRouter);
app.use("/api/analytics", requireAdmin, analyticsRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found." });
});

// Last-resort error handler. Logs the full error, returns a clean shape.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  req.log?.error({ err }, "unhandled error");
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error." });
});

// --- Boot ---
async function bootDb(retries = 5): Promise<void> {
  // Ensure the persistent data/uploads dirs exist before the DB hydrates.
  await ensureRuntimeDirs();
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await getDb();
      logger.info("[db] ready");
      return;
    } catch (err) {
      const wait = Math.min(1000 * 2 ** (attempt - 1), 10000);
      logger.warn({ err, attempt, retries }, `[db] init failed, retrying in ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  logger.fatal("[db] failed to initialize after retries — exiting");
  process.exit(1);
}

void bootDb();

const server = app.listen(PORT, () => {
  logger.info({ port: PORT, env: NODE_ENV }, "[permira-server] listening");
});

// --- Graceful shutdown ---
let shuttingDown = false;
function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "shutting down");
  server.close((err) => {
    if (err) {
      logger.error({ err }, "server close failed");
      process.exit(1);
    }
    logger.info("bye");
    process.exit(0);
  });
  // Force-exit if we hang for too long.
  setTimeout(() => {
    logger.warn("forced exit after 10s");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => logger.error({ reason }, "unhandledRejection"));
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "uncaughtException");
  shutdown("uncaughtException");
});
