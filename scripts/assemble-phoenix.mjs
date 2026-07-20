// Turn the phoenix-factory workflow output into cities-modular/phoenix/*.json.
// Reads the workflow's return JSON, strips the audit-only _source field from each
// directory record, and writes the 7 container files. Then run:
//   node scripts/validate-cities.mjs ./cities-modular phoenix
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/city-data.mjs";

const outputFile = process.argv[2];
if (!outputFile) throw new Error("usage: node scripts/assemble-phoenix.mjs <workflow-output.json>");

const parsed = JSON.parse(readFileSync(outputFile, "utf8"));
const r = parsed.result ?? parsed; // tolerate raw or wrapped
const { directory, meta } = r;
if (!Array.isArray(directory) || !meta) throw new Error("output missing directory/meta");

const dir = path.join(ROOT, "cities-modular", "phoenix");
mkdirSync(dir, { recursive: true });
const write = (name, data) =>
  writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(data, null, 2) + "\n");

// strip the audit-only _source key
const cleanDir = directory.map(({ _source, ...biz }) => biz);

write("config", meta.config);
write("directory", cleanDir);
write("events", meta.events?.items ?? []);
write("deals", meta.deals?.items ?? []);
write("concierge", meta.concierge?.items ?? []);
write("planner", meta.planner?.pools ?? {});
write("trails", meta.trails?.items ?? []);

const nv = cleanDir.filter((b) => b.needs_verification).length;
console.log(`wrote cities-modular/phoenix/ — ${cleanDir.length} businesses (${nv} need_verify), ` +
  `${(meta.events?.items ?? []).length} events, ${(meta.deals?.items ?? []).length} deals, ` +
  `${(meta.concierge?.items ?? []).length} nodes, ${Object.keys(meta.planner?.pools ?? {}).length} planner pools, ` +
  `${(meta.trails?.items ?? []).length} trail(s)`);
// category distribution + source-audit sample
const bycat = {};
for (const b of cleanDir) bycat[b.category] = (bycat[b.category] ?? 0) + 1;
console.log("categories:", JSON.stringify(bycat));
