// Repair dangling cross-references in a factory city: trim whitespace on every
// businesses[]/planner.business/stops.biz value; if the trimmed value resolves to
// a real directory name keep it (rewritten trimmed), else DROP the link. This mirrors
// the legacy migration's patch log (real places missing from the directory get their
// links removed until the venue is added — the enrichment backlog).
// Usage: node scripts/repair-crossrefs.mjs <slug> [slug...]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/city-data.mjs";

for (const slug of process.argv.slice(2)) {
  const dir = path.join(ROOT, "cities-modular", slug);
  const rd = (f) => JSON.parse(readFileSync(path.join(dir, `${f}.json`), "utf8"));
  const wr = (f, d) => writeFileSync(path.join(dir, `${f}.json`), JSON.stringify(d, null, 2) + "\n");
  const names = new Set(rd("directory").map((b) => b.name));
  const dropped = [];
  const fix = (v) => {
    const t = typeof v === "string" ? v.trim() : v;
    return names.has(t) ? t : null;
  };

  const concierge = rd("concierge");
  for (const n of concierge) {
    n.businesses = (n.businesses || []).map((b) => { const f = fix(b); if (f === null) dropped.push(`concierge:${b}`); return f; }).filter(Boolean);
  }
  wr("concierge", concierge);

  let planner = rd("planner");
  if (planner.pools && typeof planner.pools === "object") planner = planner.pools; // unwrap {pools:{...}}
  for (const pool of Object.keys(planner)) {
    if (!Array.isArray(planner[pool])) continue;
    planner[pool] = planner[pool].filter((it) => {
      if (!it.business) return true;
      const f = fix(it.business);
      if (f === null) { dropped.push(`planner.${pool}:${it.business}`); return false; }
      it.business = f; it.title = fix(it.title) ?? f;
      return true;
    });
  }
  wr("planner", planner);

  if (existsSync(path.join(dir, "trails.json"))) {
    const trails = rd("trails");
    for (const t of trails) t.stops = (t.stops || []).filter((s) => { const f = fix(s.biz); if (f === null) { dropped.push(`trail:${s.biz}`); return false; } s.biz = f; return true; });
    wr("trails", trails);
  }
  console.log(`${slug}: repaired ${dropped.length} dangling ref(s)${dropped.length ? " → " + dropped.slice(0, 8).join(", ") : ""}`);
}
