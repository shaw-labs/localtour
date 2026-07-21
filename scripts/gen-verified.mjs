// WS7 SEO — build-time "listing verified" dates per city. For each
// cities-modular/<slug>/directory.json, reads the last git commit date that
// touched the file (`git log -1 --format=%cs`) — git history is the truth for
// listing freshness, so nothing is hand-typed (brief Principle 1). Files git
// has never seen (or a missing git) fall back to today. Writes
// src/generated/verified.json { [slug]: "YYYY-MM-DD" }, consumed by
// gen-places.mjs to stamp each static place page footer. Read-only over git.
import { writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT } from "./lib/city-data.mjs";

const modular = path.join(ROOT, "cities-modular");
const slugs = readdirSync(modular).filter((d) => existsSync(path.join(modular, d, "directory.json")));

const today = new Date().toISOString().slice(0, 10);

/** Last commit date (YYYY-MM-DD) for a ROOT-relative path, or "" if untracked / no git. */
function lastCommitDate(rel) {
  try {
    return execFileSync("git", ["log", "-1", "--format=%cs", "--", rel], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return ""; // not a repo / git unavailable — caller falls back to today
  }
}

const verified = {};
for (const slug of slugs) {
  verified[slug] = lastCommitDate(path.join("cities-modular", slug, "directory.json")) || today;
}

const outDir = path.join(ROOT, "src", "generated");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "verified.json"), JSON.stringify(verified, null, 2) + "\n");
console.log(`✓ verified: ${slugs.length} cities`);
