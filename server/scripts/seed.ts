import "dotenv/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "../logger.js";

/**
 * One-shot seed for the knowledge base. Idempotent — re-running with the
 * same payload is a no-op. Participants are not seeded; they're created
 * via the public registration endpoint.
 *
 * Run via: npm run seed
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_PATH = path.join(__dirname, "..", "data", "knowledge.json");

const SEED = {
  sections: [
    {
      id: "overview",
      title: "Event Overview",
      body: "PERMIRA Summer Camp 2026 — Taste of Nusantara. Three-day cultural exchange between Indonesian and Russian students, July 17–19, 2026, Saint Petersburg.",
    },
  ],
  faqs: [
    {
      id: "faq-cost",
      question: "How much does it cost?",
      answer: "Programme participation, meals, and accommodation are free for selected participants. Travel is at your own expense.",
    },
  ],
  contact: { email: "info@permiraspb.org", telegram: "@permiraspb" },
  updatedAt: new Date().toISOString(),
};

async function main() {
  await fs.mkdir(path.dirname(KB_PATH), { recursive: true });
  try {
    await fs.access(KB_PATH);
    logger.info({ path: KB_PATH }, "knowledge.json already exists — skipping seed");
    return;
  } catch {
    /* fall through */
  }
  await fs.writeFile(KB_PATH, JSON.stringify(SEED, null, 2), "utf8");
  logger.info({ path: KB_PATH }, "seeded knowledge.json");
}

main().catch((err) => {
  logger.fatal({ err }, "seed failed");
  process.exit(1);
});
