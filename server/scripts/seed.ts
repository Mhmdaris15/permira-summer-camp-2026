import "dotenv/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import { logger } from "../logger.js";
import { dataPath } from "../paths.js";

/**
 * One-shot seed for the knowledge base. Idempotent — re-running with the
 * same payload is a no-op. Participants are not seeded; they're created
 * via the public registration endpoint.
 *
 * Run via: npm run seed
 */

const KB_PATH = dataPath("knowledge.json");

const SEED = {
  sections: [
    {
      id: "overview",
      title: "Event Overview",
      body: "PERMIRA Summer Camp 2026 — Cuisine of Nusantara: Lessons of Nature and Friendship of Peoples. Three-day cultural exchange between Indonesian and Russian students, July 19–21, 2026, Leningrad Oblast.",
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
