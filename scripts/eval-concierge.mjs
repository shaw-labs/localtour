// WS5 acceptance gate: 25 queries × every city against a live /api/concierge —
// passes only with ZERO hallucinated venues (every AI pick must exist in that
// city's directory; reply text is scanned for suspect venue-like names).
//
//   node scripts/eval-concierge.mjs --base https://localtour-work.netlify.app
//   node scripts/eval-concierge.mjs --base ... --city phoenix --limit 5   # cheap smoke
//
// NOTE: each AI answer spends one call of the CONCIERGE_DAILY_CAP (default 300).
// A full 15-city × 25-query run = 375 calls — raise the cap for eval day or run
// in batches. The script prints the cap math up front.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/city-data.mjs";

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const k = argv[i].slice(2), v = argv[i + 1];
    if (v === undefined || v.startsWith("--")) a[k] = true; else { a[k] = v; i++; }
  }
  return a;
}
const args = parseArgs(process.argv.slice(2));
const BASE = typeof args.base === "string" ? args.base.replace(/\/$/, "") : null;
if (!BASE) { console.error("Usage: node scripts/eval-concierge.mjs --base <url> [--city slug] [--limit N]"); process.exit(1); }

const QUERIES = [
  "where should we go for a dinner date night",
  "cheap eats that locals love",
  "best coffee shop to work from",
  "live music tonight",
  "rainy day activities with kids",
  "most romantic evening you can plan",
  "rooftop drinks with a view",
  "late night food after midnight",
  "we only have 3 hours, first time here",
  "classic local breakfast spot",
  "good vegetarian dinner",
  "outdoor adventure for a saturday",
  "where to shop for something local",
  "which museum is actually worth it",
  "best happy hour deal",
  "fun with a 7 year old",
  "where do locals actually eat",
  "hidden gems tourists miss",
  "best dessert in town",
  "sports bar for the game",
  "brunch with friends",
  "a walkable afternoon itinerary",
  "splurge-worthy fancy dinner",
  "quick lunch downtown",
  "what is the 250 trail",
];

const modular = path.join(ROOT, "cities-modular");
let slugs = readdirSync(modular).filter((d) => existsSync(path.join(modular, d, "directory.json")));
if (typeof args.city === "string") slugs = slugs.filter((s) => s === args.city);
const queries = QUERIES.slice(0, args.limit ? Number(args.limit) : QUERIES.length);

console.log(`eval: ${slugs.length} cities × ${queries.length} queries = ${slugs.length * queries.length} calls (daily cap default 300 — mind the math)`);

const GENERIC = new Set(["The", "A", "If", "You", "Try", "Ask", "Start", "Then", "For", "Grab", "Head", "Order", "Locals", "Visit", "Walk", "Check", "Also", "And", "But", "Its", "It's", "That", "This", "What", "When", "Where", "My", "Our", "Their", "One", "Two", "Both", "Either"]);

let hardFails = 0, aiCount = 0, fbCount = 0, budgetCount = 0, total = 0;
const suspects = [];

for (const slug of slugs) {
  const dir = JSON.parse(readFileSync(path.join(modular, slug, "directory.json"), "utf8"));
  const cfg = JSON.parse(readFileSync(path.join(modular, slug, "config.json"), "utf8"));
  const trails = JSON.parse(readFileSync(path.join(modular, slug, "trails.json"), "utf8"));
  const known = new Set(dir.map((b) => b.name));
  const knownBlob = [
    ...dir.map((b) => b.name),
    cfg.name, cfg.state, cfg.concierge?.name || "",
    ...(trails[0] ? [trails[0].title, ...trails[0].stops.map((s) => s.biz)] : []),
    ...(cfg.side_trips || []).map((t) => t.name),
  ].join(" || ").toLowerCase();

  let cityFail = 0, cityAi = 0;
  for (const q of queries) {
    total++;
    let res, data;
    try {
      res = await fetch(`${BASE}/api/concierge`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ city: slug, q }),
      });
      data = await res.json();
    } catch (e) {
      console.error(`  ✗ ${slug} · "${q}" — network/${e.message}`); hardFails++; cityFail++; continue;
    }
    if (res.status !== 200 || data?.ok !== true) {
      console.error(`  ✗ ${slug} · "${q}" — HTTP ${res.status} ${JSON.stringify(data).slice(0, 80)}`); hardFails++; cityFail++; continue;
    }
    if (data.source === "budget") { budgetCount++; continue; }
    if (data.source !== "ai") { fbCount++; continue; }
    aiCount++; cityAi++;

    // (a) every pick must be a real directory name
    for (const p of data.picks || []) {
      if (!known.has(p.name)) {
        console.error(`  ✗ HALLUCINATED PICK ${slug} · "${q}" → "${p.name}"`); hardFails++; cityFail++;
      }
    }
    if (!data.picks?.length || data.picks.length > 3) {
      console.error(`  ⚠ pick count ${data.picks?.length ?? 0} — ${slug} · "${q}"`);
    }
    // (b) word budget (soft)
    const words = data.text.trim().split(/\s+/).length;
    if (words > 140) console.error(`  ⚠ ${words} words — ${slug} · "${q}"`);
    // (c) suspect proper-noun scan of the free text
    const cand = data.text.match(/(?:[A-Z][A-Za-z&'’-]+ ){1,4}[A-Z][A-Za-z&'’-]+/g) || [];
    for (const c of cand) {
      const first = c.split(" ")[0];
      if (GENERIC.has(first)) continue;
      if (knownBlob.includes(c.toLowerCase())) continue;
      // partial containment against any known name (e.g. "the Bean" of "Cloud Gate (The Bean)")
      let contained = false;
      for (const n of known) if (n.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(n.toLowerCase())) { contained = true; break; }
      if (!contained) suspects.push({ city: slug, q, str: c });
    }
    await new Promise((r) => setTimeout(r, 350));
  }
  console.log(`${cityFail ? "✗" : "✓"} ${slug}: ${queries.length} queries · ai=${cityAi} · hard fails=${cityFail}`);
}

console.log(`\nTOTALS: ${total} calls · ai=${aiCount} fallback=${fbCount} budget=${budgetCount} · HARD FAILS=${hardFails}`);
if (suspects.length) {
  console.log(`SUSPECT strings (human judgment — not auto-fails):`);
  for (const s of suspects.slice(0, 20)) console.log(`  ? ${s.city} · "${s.q}" → "${s.str}"`);
  if (suspects.length > 20) console.log(`  …and ${suspects.length - 20} more`);
} else if (aiCount) console.log("No suspect venue strings in any AI reply.");
process.exit(hardFails ? 1 : 0);
