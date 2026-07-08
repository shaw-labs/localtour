// Provenance gate — proves cities-modular/ is exactly what scripts/migrate-legacy.mjs
// produces from the legacy cities/<slug>/data.js, plus the 26 cross-reference patches
// documented in cities-modular/MIGRATION_REPORT.md ("Cross-reference patch log").
// Any other delta means the containers were edited off the record → fail the build.
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { ROOT, SLUGS } from "./lib/city-data.mjs";

const FILES = [
  "config.json",
  "directory.json",
  "events.json",
  "deals.json",
  "concierge.json",
  "planner.json",
  "trails.json",
];

// The documented patch log, encoded. Applied to REGENERATED concierge output;
// the result must deep-equal the delivered file.
const PATCHES = {
  chicago: {
    renames: {
      "Chicago Architecture Foundation Center River Cruise": "Chicago Architecture Center River Cruise",
      "The Palmer House Hilton": "Palmer House Hilton",
    },
    removals: ["Wicker Park / Bucktown", "Randolph Street Market"],
  },
  "new-york-city": {
    renames: {
      "Julius' Bar": "Julius'",
      "David Zwirner Gallery": "David Zwirner",
      "Brooklyn Bridge Park": "Brooklyn Bridge Park Greenway",
    },
    removals: [
      "New World Mall Food Court",
      "SriPraPhai",
      "Arthur Avenue Retail Market",
      "Strand Book Store",
      "New York Public Library",
      "Westlight",
      "Bronx Zoo",
      "Wave Hill",
    ],
  },
  "smoky-mountains": {
    renames: { "Ole Smoky Moonshine Distillery": "Ole Smoky Moonshine Distillery - The Holler" },
    removals: [],
  },
};

export function verifyProvenance() {
  const failures = [];
  const regenDir = mkdtempSync(path.join(tmpdir(), "lt-regen-"));
  try {
    execFileSync(
      process.execPath,
      [path.join(ROOT, "scripts", "migrate-legacy.mjs"), "--src", ROOT, "--out", regenDir],
      { stdio: "pipe" },
    );
    for (const slug of SLUGS) {
      for (const file of FILES) {
        try {
          const regen = JSON.parse(readFileSync(path.join(regenDir, slug, file), "utf8"));
          const delivered = JSON.parse(
            readFileSync(path.join(ROOT, "cities-modular", slug, file), "utf8"),
          );
          if (file === "concierge.json" && PATCHES[slug]) {
            const { renames, removals } = PATCHES[slug];
            for (const node of regen) {
              node.businesses = node.businesses
                .filter((b) => !removals.includes(b))
                .map((b) => renames[b] ?? b);
            }
          }
          assert.deepStrictEqual(delivered, regen);
        } catch (err) {
          failures.push(`${slug}/${file}: ${String(err.message).slice(0, 200)}`);
        }
      }
    }
  } finally {
    rmSync(regenDir, { recursive: true, force: true });
  }
  if (!failures.length) {
    console.log(`✓ provenance: cities-modular == migrate-legacy(data.js) + documented patch log (${SLUGS.length}/8)`);
  }
  return failures;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const failures = verifyProvenance();
  if (failures.length) {
    console.error(`✗ provenance FAILED (${failures.length}):`);
    for (const f of failures) console.error("  " + f);
    process.exit(1);
  }
}
