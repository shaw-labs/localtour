// Post-build: copy the legacy per-city wall.html into dist (URL preservation).
// City IMAGES are handled by scripts/optimize-images.mjs (WS7 pipeline), which
// writes responsive avif/webp/jpg variants — not the raw copy that used to live here.
import { cpSync, existsSync } from "node:fs";
import path from "node:path";
import { readdirSync } from "node:fs";
import { ROOT } from "./lib/city-data.mjs";

const citiesDir = path.join(ROOT, "cities");
for (const slug of readdirSync(citiesDir)) {
  const wall = path.join(citiesDir, slug, "wall.html");
  if (existsSync(wall)) {
    cpSync(wall, path.join(ROOT, "dist", "cities", slug, "wall.html"));
  }
}

// parity report (regenerable, gitignored) — served at /parity/ when present locally
const parity = path.join(ROOT, "parity-report");
if (existsSync(path.join(parity, "index.html"))) {
  cpSync(parity, path.join(ROOT, "dist", "parity"), { recursive: true });
  console.log("✓ parity report → dist/parity/");
}
