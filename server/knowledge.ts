import { promises as fs } from "node:fs";
import path from "node:path";
import type { KnowledgeBase } from "./types.js";
import { dataPath, seedPath } from "./paths.js";

const DATA_PATH = dataPath("knowledge.json");
const SEED_PATH = seedPath("knowledge.json");

let cache: KnowledgeBase | null = null;
let writeQueue: Promise<void> = Promise.resolve();

export async function loadKnowledge(): Promise<KnowledgeBase> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    cache = JSON.parse(raw) as KnowledgeBase;
    return cache;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    // Fresh persistent volume — seed from the default bundled in the image,
    // then persist it so admin edits stick from here on.
    const seed = JSON.parse(await fs.readFile(SEED_PATH, "utf8")) as KnowledgeBase;
    return saveKnowledge(seed);
  }
}

export async function saveKnowledge(next: KnowledgeBase): Promise<KnowledgeBase> {
  const stamped: KnowledgeBase = { ...next, updatedAt: new Date().toISOString() };
  cache = stamped;
  // Serialize writes so concurrent PUTs don't trample each other.
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(stamped, null, 2), "utf8");
  });
  await writeQueue;
  return stamped;
}

/**
 * Compose the knowledge base into a plain-text block that fits in a
 * Claude system prompt. Sections and FAQs are interleaved with simple
 * headings so the model can quote/cite them naturally.
 */
export function composeContext(kb: KnowledgeBase): string {
  const sectionBlock = kb.sections
    .map((s) => `## ${s.title}\n${s.body.trim()}`)
    .join("\n\n");

  const faqBlock = kb.faqs
    .map((f) => `Q: ${f.question.trim()}\nA: ${f.answer.trim()}`)
    .join("\n\n");

  return [
    "# PERMIRA Summer Camp 2026 — Knowledge Base",
    sectionBlock,
    "## Frequently Asked Questions",
    faqBlock,
    `## Contact\nEmail: ${kb.contact.email}${kb.contact.telegram ? `\nTelegram: ${kb.contact.telegram}` : ""}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function validateKnowledge(input: unknown): KnowledgeBase {
  if (!input || typeof input !== "object") throw new Error("Body must be an object.");
  const k = input as Partial<KnowledgeBase>;
  if (!Array.isArray(k.sections)) throw new Error("`sections` must be an array.");
  if (!Array.isArray(k.faqs)) throw new Error("`faqs` must be an array.");
  if (!k.contact || typeof k.contact !== "object" || !k.contact.email)
    throw new Error("`contact.email` is required.");

  for (const s of k.sections) {
    if (!s || typeof s !== "object" || !s.id || !s.title || typeof s.body !== "string")
      throw new Error("Each section needs id, title, and body.");
  }
  for (const f of k.faqs) {
    if (!f || typeof f !== "object" || !f.id || !f.question || typeof f.answer !== "string")
      throw new Error("Each FAQ needs id, question, and answer.");
  }

  return {
    sections: k.sections,
    faqs: k.faqs,
    contact: k.contact,
    updatedAt: typeof k.updatedAt === "string" ? k.updatedAt : new Date().toISOString(),
  };
}
