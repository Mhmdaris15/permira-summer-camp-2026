// One-off source-image optimizer. Run locally with: node scripts/optimize-images.mjs
//
// Resizes + recompresses the heavy source assets IN PLACE so the committed
// images are already web-sized. This lets us drop the build-time
// vite-plugin-image-optimizer (and its native `sharp` dependency), which was
// failing to compile on Alpine during Coolify builds.
//
// Re-runnable: skips files already under the size target.
import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const JOBS = [
  // Past-camp photos — gallery + hero. Cap at 1920px, mozjpeg q72.
  { dir: "src/assets/archives", exts: [".jpg", ".jpeg"], maxWidth: 1920, format: "jpeg", opts: { quality: 72, mozjpeg: true } },
  // Dish photos — already smallish, normalise anyway.
  { dir: "src/assets/foods", exts: [".jpg", ".jpeg", ".webp"], maxWidth: 1600, format: "jpeg", opts: { quality: 74, mozjpeg: true } },
  // Org logos/flags — shown small; cap at 600px wide.
  { dir: "src/assets/organization", exts: [".png"], maxWidth: 600, format: "png", opts: { compressionLevel: 9, palette: true } },
];

let savedTotal = 0;

for (const job of JOBS) {
  const abs = path.join(ROOT, job.dir);
  let entries;
  try {
    entries = await fs.readdir(abs);
  } catch {
    continue;
  }
  for (const name of entries) {
    if (!job.exts.includes(path.extname(name).toLowerCase())) continue;
    const file = path.join(abs, name);
    // Read fully into memory first so sharp doesn't keep a read handle open
    // on the file we're about to overwrite (Windows blocks that otherwise).
    const input = await fs.readFile(file);
    const before = input.length;

    const pipeline = sharp(input).rotate().resize({ width: job.maxWidth, withoutEnlargement: true });
    const out =
      job.format === "jpeg" ? pipeline.jpeg(job.opts) : pipeline.png(job.opts);
    const buf = await out.toBuffer();

    // Only overwrite if we actually shrank it.
    if (buf.length < before) {
      await fs.writeFile(file, buf);
      savedTotal += before - buf.length;
      console.log(`${name.padEnd(42)} ${(before / 1024).toFixed(0)}KB -> ${(buf.length / 1024).toFixed(0)}KB`);
    } else {
      console.log(`${name.padEnd(42)} kept (${(before / 1024).toFixed(0)}KB)`);
    }
  }
}

console.log(`\nTotal saved: ${(savedTotal / 1024 / 1024).toFixed(1)}MB`);
