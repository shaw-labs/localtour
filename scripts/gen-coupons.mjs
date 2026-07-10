// WS4 coupon clipper — build-time code overlay.
//
// The deal containers are "codeless by contract" (see types.ts: redemption_value
// stays empty in source) AND the 8 legacy cities are provenance-gated, so we must
// NOT write codes into cities-modular/*/deals.json. Instead we generate a
// deterministic code per in-store deal into src/generated/coupons.json, which
// adaptCity() overlays onto deals at load time (deal.code) and uses to switch the
// clipper on. Deterministic input→output so rebuilds are stable (redemption
// idempotency keys on the code) and provenance stays byte-exact.
//
//   coupons.json = { "<city>": { "<deal.id>": "LT-PHX-VINCE1" } }
//
// link/app deals are outbound (open a URL) — they get no code.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/city-data.mjs";

const modular = path.join(ROOT, "cities-modular");
const OUT = path.join(ROOT, "src", "generated", "coupons.json");
const slugs = readdirSync(modular).filter((d) => existsSync(path.join(modular, d, "deals.json")));

// City code: initials for multi-word slugs (salt-lake-city→SLC, new-orleans→NO),
// first three letters otherwise (phoenix→PHO, chicago→CHI).
function cityCode(slug) {
  const parts = slug.split("-").filter(Boolean);
  if (parts.length > 1) return parts.map((p) => p[0]).join("").toUpperCase().slice(0, 4);
  return slug.slice(0, 3).toUpperCase();
}

// Business token: first meaningful word (skip leading articles), A–Z0–9, ≤5 chars.
const STOP = /^(the|a|an|el|la|los|las|le)$/i;
function bizToken(name) {
  const words = String(name).match(/[A-Za-z0-9]+/g) || ["OFFER"];
  const first = words.find((w) => !STOP.test(w)) || words[0];
  return first.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) || "OFFER";
}

const isOutbound = (rt) => rt === "link" || rt === "app";

const out = {};
let total = 0;
for (const slug of slugs) {
  const deals = JSON.parse(readFileSync(path.join(modular, slug, "deals.json"), "utf8"));
  const cc = cityCode(slug);
  const codes = {};
  const seen = new Set();
  let seq = 0;
  for (const d of deals) {
    if (isOutbound(d.redemption_type)) continue; // outbound: no code
    seq += 1;
    let code = `LT-${cc}-${bizToken(d.business_name)}${seq}`;
    while (seen.has(code)) code = `LT-${cc}-${bizToken(d.business_name)}${++seq}`;
    seen.add(code);
    codes[d.id] = code;
    total += 1;
  }
  if (Object.keys(codes).length) out[slug] = codes;
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`✓ coupons: ${total} codes across ${Object.keys(out).length} cities → src/generated/coupons.json`);
