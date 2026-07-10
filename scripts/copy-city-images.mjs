// Post-build helper. NOTE: the legacy per-city wall.html is intentionally NOT
// copied into dist anymore — the native SPA route /cities/<slug>/wall (CityWall.tsx)
// is its replacement, and shipping wall.html would shadow that route because
// Netlify resolves /cities/<slug>/wall to the static wall.html file. Old
// /cities/<slug>/wall.html bookmarks are 301'd to /wall in netlify.toml.
// gen-walls.mjs still READS cities/<slug>/wall.html (source) to build wall.json.
// City IMAGES are handled by scripts/optimize-images.mjs (WS7 pipeline).
import { cpSync, existsSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/city-data.mjs";

// parity report (regenerable, gitignored) — served at /parity/ when present locally
const parity = path.join(ROOT, "parity-report");
if (existsSync(path.join(parity, "index.html"))) {
  cpSync(parity, path.join(ROOT, "dist", "parity"), { recursive: true });
  console.log("✓ parity report → dist/parity/");
}
