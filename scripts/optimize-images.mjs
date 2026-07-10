// WS7 image pipeline. Turns the raw city JPEGs (200–600KB each) into modern,
// responsive, budget-compliant variants in dist/cities/<slug>/images/:
//   <name>.jpg       — optimized fallback, ≤1440w  (also serves Classic CSS backgrounds)
//   <name>.webp      — 1440w   ·  <name>-sm.webp — 720w
//   <name>.avif      — 1440w   ·  <name>-sm.avif — 720w
// The card component picks avif→webp→jpg via <picture>; browsers download one
// format at one size. Target: no delivered image > 120KB at its breakpoint.
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ROOT } from "./lib/city-data.mjs";

const citiesDir = path.join(ROOT, "cities");
const distCities = path.join(ROOT, "dist", "cities");
if (!existsSync(path.join(ROOT, "dist"))) throw new Error("run after vite build (dist/ missing)");

const LARGE = 1440, SMALL = 720, BUDGET_KB = 120;
const isImg = (f) => /\.(jpe?g|png)$/i.test(f);

// gather every source image
const jobs = [];
for (const slug of readdirSync(citiesDir)) {
  const src = path.join(citiesDir, slug, "images");
  if (!existsSync(src)) continue;
  const out = path.join(distCities, slug, "images");
  mkdirSync(out, { recursive: true });
  for (const f of readdirSync(src)) if (isImg(f)) jobs.push({ src: path.join(src, f), out, base: f.replace(/\.[^.]+$/, "") });
}

import { writeFileSync as wf } from "node:fs";

// Encode `resized` as `fmt`, dropping quality until the result is ≤ budgetKB
// (or the quality floor). Guarantees no delivered image exceeds the budget.
async function encodeUnderBudget(resized, fmt, startQ, budgetKB = BUDGET_KB, floorQ = 30) {
  let q = startQ;
  for (;;) {
    const opts = fmt === "jpeg" ? { quality: q, mozjpeg: true } : { quality: q };
    const buf = await resized.clone()[fmt](opts).toBuffer();
    if (buf.length / 1024 <= budgetKB || q <= floorQ) return buf;
    q -= 8;
  }
}

async function one({ src, out, base }) {
  const pipe = sharp(src, { failOn: "none" }).rotate();
  const large = pipe.clone().resize({ width: LARGE, withoutEnlargement: true });
  const small = pipe.clone().resize({ width: SMALL, withoutEnlargement: true });
  const [lj, lw, la, sw, sa] = await Promise.all([
    encodeUnderBudget(large, "jpeg", 70),
    encodeUnderBudget(large, "webp", 72),
    encodeUnderBudget(large, "avif", 52),
    encodeUnderBudget(small, "webp", 72),
    encodeUnderBudget(small, "avif", 52),
  ]);
  wf(path.join(out, `${base}.jpg`), lj);
  wf(path.join(out, `${base}.webp`), lw);
  wf(path.join(out, `${base}.avif`), la);
  wf(path.join(out, `${base}-sm.webp`), sw);
  wf(path.join(out, `${base}-sm.avif`), sa);
}

// bounded concurrency
const CONC = 8;
let i = 0, done = 0, over = [];
async function worker() {
  while (i < jobs.length) {
    const job = jobs[i++];
    try { await one(job); } catch (e) { console.error(`  ✗ ${job.base}: ${e.message}`); }
    done++;
  }
}
await Promise.all(Array.from({ length: CONC }, worker));

// budget report
let total = 0, count = 0;
for (const slug of readdirSync(distCities)) {
  const d = path.join(distCities, slug, "images");
  if (!existsSync(d)) continue;
  for (const f of readdirSync(d)) {
    const kb = statSync(path.join(d, f)).size / 1024;
    total += kb; count++;
    if (kb > BUDGET_KB) over.push(`${slug}/${f} ${Math.round(kb)}KB`);
  }
}
console.log(`✓ optimized ${done} source images → ${count} variants, ${(total / 1024).toFixed(1)}MB total in dist`);
if (over.length) {
  // Hard gate: a delivered image over budget fails the build so a heavy new
  // photo can't silently regress LCP. Fix = re-shoot smaller or lower the source.
  console.error(`✗ ${over.length} variant(s) over ${BUDGET_KB}KB: ${over.slice(0, 8).join(", ")}${over.length > 8 ? "…" : ""}`);
  process.exit(1);
}
console.log(`✓ every delivered image ≤ ${BUDGET_KB}KB`);
