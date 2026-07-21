// Geocode every business address → coordinates, so place cards can show real
// distance from the visitor. Uses the US Census batch geocoder (free, no key,
// US-only — every LocalTour city is US). Results are cached in a COMMITTED
// file (data/geocache.json), so this hits the network exactly once per new
// address; CI and rebuilds run fully offline from the cache. Emits
// src/generated/coords.json { _centers:{slug:[lat,lng]}, cities:{slug:{name:[lat,lng]}} }.
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/city-data.mjs";

const modular = path.join(ROOT, "cities-modular");
const cachePath = path.join(ROOT, "data", "geocache.json");
const outPath = path.join(ROOT, "src", "generated", "coords.json");
const slugs = readdirSync(modular).filter((d) => existsSync(path.join(modular, d, "directory.json")));

let cache = {};
try { cache = JSON.parse(readFileSync(cachePath, "utf8")); } catch { /* first run */ }

// "3930 E. Camelback Rd, Phoenix, AZ 85018" → {street, city, state, zip}
function parse(addr) {
  const parts = addr.split(",").map((s) => s.trim());
  if (parts.length < 3) return null;
  const street = parts[0];
  if (!/\d/.test(street)) return null; // no house number → not a point address
  const city = parts[parts.length - 2];
  const sz = parts[parts.length - 1].split(/\s+/);
  const state = (sz[0] || "").toUpperCase();
  const zip = (sz[1] || "").replace(/[^0-9]/g, "");
  if (!/^[A-Z]{2}$/.test(state)) return null;
  return { street, city, state, zip };
}

// collect addresses needing geocoding
const toGeo = [];
for (const slug of slugs) {
  for (const b of JSON.parse(readFileSync(path.join(modular, slug, "directory.json"), "utf8"))) {
    if (!b.address || b.address in cache) continue;
    const p = parse(b.address);
    if (p) toGeo.push({ addr: b.address, p });
    else cache[b.address] = null; // unparseable → city-center fallback later
  }
}

async function geocodeBatch(items) {
  const csv = items.map((it, i) => `${i},"${it.p.street}","${it.p.city}","${it.p.state}","${it.p.zip}"`).join("\n");
  const fd = new FormData();
  fd.append("benchmark", "Public_AR_Current");
  fd.append("addressFile", new Blob([csv], { type: "text/csv" }), "a.csv");
  const res = await fetch("https://geocoding.geo.census.gov/geocoder/locations/addressbatch", { method: "POST", body: fd });
  const text = await res.text();
  for (const line of text.split("\n")) {
    const idm = line.match(/^"(\d+)"/);
    if (!idm) continue;
    const it = items[Number(idm[1])];
    if (!it) continue;
    const c = /,"Match",/.test(line) ? line.match(/"(-?\d+\.\d+),(-?\d+\.\d+)"/) : null;
    cache[it.addr] = c ? [Number(c[2]), Number(c[1])] : null; // store [lat, lng]
  }
}

if (toGeo.length) {
  console.log(`geocoding ${toGeo.length} new addresses via US Census (network)…`);
  const CHUNK = 700;
  for (let i = 0; i < toGeo.length; i += CHUNK) {
    try {
      await geocodeBatch(toGeo.slice(i, i + CHUNK));
    } catch (e) {
      console.error(`  batch ${i} failed (${e.message}) — those stay uncached (city-center fallback)`);
    }
    process.stdout.write(`  ${Math.min(i + CHUNK, toGeo.length)}/${toGeo.length}\n`);
  }
  mkdirSync(path.dirname(cachePath), { recursive: true });
  // stable key order → clean git diffs for the committed cache
  const sorted = {};
  for (const k of Object.keys(cache).sort()) sorted[k] = cache[k];
  writeFileSync(cachePath, JSON.stringify(sorted) + "\n");
}

// assemble coords.json from the cache (+ city centers)
const centers = {};
const cities = {};
let matched = 0, fallback = 0;
for (const slug of slugs) {
  const cfg = JSON.parse(readFileSync(path.join(modular, slug, "config.json"), "utf8"));
  centers[slug] = cfg.coordinates ? [cfg.coordinates.lat, cfg.coordinates.lng] : null;
  cities[slug] = {};
  for (const b of JSON.parse(readFileSync(path.join(modular, slug, "directory.json"), "utf8"))) {
    const c = b.address ? cache[b.address] : null;
    if (c) { cities[slug][b.name] = c; matched++; } else fallback++;
  }
}
mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify({ _centers: centers, cities }) + "\n");
console.log(`✓ coords: ${matched} geocoded, ${fallback} neighborhood-only → src/generated/coords.json`);
