// Turn a batch2-factory workflow output into cities-modular/<slug>/*.json for every
// city it produced. Strips the audit-only _source field, unwraps planner {pools:...}
// (the metadata agent wraps it; the validator wants pools at top level), and writes
// the 7 container files per city. Then:  node scripts/validate-cities.mjs ./cities-modular
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/city-data.mjs";

const outputFile = process.argv[2];
if (!outputFile) throw new Error("usage: node scripts/assemble-cities.mjs <workflow-output.json>");

const parsed = JSON.parse(readFileSync(outputFile, "utf8"));
const r = parsed.result ?? parsed;
const cities = r.cities ?? (r.slug ? [r] : []);
if (!Array.isArray(cities) || !cities.length) throw new Error("no cities in output");

const unwrapPlanner = (p) => (p && typeof p === "object" && p.pools && typeof p.pools === "object" ? p.pools : p ?? {});

for (const city of cities) {
  const { slug, directory, meta } = city;
  if (!slug || !Array.isArray(directory) || !meta) {
    console.log(`⚠ skipping malformed city entry: ${slug ?? "?"}`);
    continue;
  }
  const dir = path.join(ROOT, "cities-modular", slug);
  mkdirSync(dir, { recursive: true });
  const write = (name, data) => writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(data, null, 2) + "\n");
  const cleanDir = directory.map(({ _source, ...b }) => b);

  write("config", meta.config);
  write("directory", cleanDir);
  write("events", meta.events?.items ?? []);
  write("deals", meta.deals?.items ?? []);
  write("concierge", meta.concierge?.items ?? []);
  write("planner", unwrapPlanner(meta.planner));
  write("trails", meta.trails?.items ?? []);

  const nv = cleanDir.filter((b) => b.needs_verification).length;
  const pools = Object.keys(unwrapPlanner(meta.planner)).length;
  console.log(`${slug}: ${cleanDir.length} biz (${nv} nv) · ${(meta.events?.items ?? []).length} ev · ${(meta.deals?.items ?? []).length} deals · ${(meta.concierge?.items ?? []).length} nodes · ${pools} pools · ${(meta.trails?.items ?? []).length} trail`);
}
console.log(`\nwrote ${cities.length} cities → cities-modular/`);
