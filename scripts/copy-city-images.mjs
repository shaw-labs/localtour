// Post-build: copy raw city images (gitignored until the WS7 pipeline) into dist/
// so CLI deploys serve them at /cities/<slug>/images/…. No-ops when a city has no
// local images (e.g. CI checkouts) — the engine's ImgOrVisual fallback covers that.
import { cpSync, existsSync } from "node:fs";
import path from "node:path";
import { readdirSync } from "node:fs";
import { ROOT } from "./lib/city-data.mjs";

const citiesDir = path.join(ROOT, "cities");
let copied = 0;
for (const slug of readdirSync(citiesDir)) {
  const src = path.join(citiesDir, slug, "images");
  if (existsSync(src)) {
    cpSync(src, path.join(ROOT, "dist", "cities", slug, "images"), { recursive: true });
    copied += 1;
  }
  // legacy per-city wall page — URLs must keep resolving (brief Principle 3);
  // ported into the engine later in Phase 1
  const wall = path.join(citiesDir, slug, "wall.html");
  if (existsSync(wall)) {
    cpSync(wall, path.join(ROOT, "dist", "cities", slug, "wall.html"));
  }
}
console.log(copied ? `✓ copied images for ${copied} cities into dist/` : "no local city images — skipped (fallback art will render)");
