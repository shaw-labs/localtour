// LocalTour verify — fails the build on truth violations (brief §4: "a verify script
// that fails the deploy"). Runs inside `npm run build`, so CI and Netlify both gate on it.
//
// Phase 0 enforces:
//   1. the data contract      — scripts/validate-cities.mjs over cities-modular/ (pack README)
//   2. counts                 — audit-verified totals pinned in scripts/expected-counts.json
//   3. provenance             — cities-modular == migrate-legacy(data.js) + documented patches
// Warn-only stubs (enforced in their phase): stat drift, expired events, links, alt text, media budget.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { ROOT, SLUGS } from "./lib/city-data.mjs";
import { verifyProvenance } from "./verify-provenance.mjs";

const failures = [];

// 1 — the data contract
try {
  execFileSync(
    process.execPath,
    [path.join(ROOT, "scripts", "validate-cities.mjs"), path.join(ROOT, "cities-modular")],
    { stdio: "pipe" },
  );
  console.log("✓ data contract: validate-cities.mjs PASS (8/8 cities)");
} catch (err) {
  failures.push("validate-cities.mjs FAILED:\n" + String(err.stdout ?? err.message).slice(-800));
}

// 2 — counts pinned to the audit-verified table
const expected = JSON.parse(readFileSync(path.join(ROOT, "scripts", "expected-counts.json"), "utf8"));
for (const slug of SLUGS) {
  const dir = path.join(ROOT, "cities-modular", slug);
  const counts = {
    businesses: JSON.parse(readFileSync(path.join(dir, "directory.json"), "utf8")).length,
    deals: JSON.parse(readFileSync(path.join(dir, "deals.json"), "utf8")).length,
    events: JSON.parse(readFileSync(path.join(dir, "events.json"), "utf8")).length,
    nodes: JSON.parse(readFileSync(path.join(dir, "concierge.json"), "utf8")).length,
  };
  for (const [k, want] of Object.entries(expected[slug])) {
    if (counts[k] !== want) failures.push(`${slug}: ${k} = ${counts[k]}, expected ${want}`);
  }
}
if (!failures.length) console.log(`✓ counts: ${SLUGS.length}/8 cities match the audit-verified table`);

// 3 — provenance
failures.push(...verifyProvenance());

const STUBS = [
  "stat drift (displayed vs computed) — enforced Phase 2 (WS2)",
  "expired featured events / <3 upcoming per city — enforced Phase 2 (WS2)",
  "broken internal links — enforced Phase 1/7",
  "missing alt text — enforced Phase 7 (WS7)",
  "image >120KB / total shipped media >30MB — enforced Phase 2/7 (WS7)",
];
for (const s of STUBS) console.log(`⚠ stub (warn-only): ${s}`);

if (failures.length) {
  console.error(`✗ VERIFY FAILED (${failures.length}):`);
  for (const f of failures) console.error("  " + f);
  process.exit(1);
}
console.log("VERIFY GREEN — every enforced truth check passed.");
