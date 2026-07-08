#!/usr/bin/env node
/**
 * validate-cities.mjs — LocalTour city-package auditor
 *
 * Validates any modular city container (legacy-migrated OR batch-2 factory
 * output) against the shared schema contract. Run it on the whole data root
 * or a single city. This is the "plug-in audit" for the data layer: drop a
 * city folder in, run this, get a verdict.
 *
 * Usage:
 *   node scripts/validate-cities.mjs <data-root> [slug]
 *
 * Exit code 0 = all PASS (warnings allowed), 1 = any FAIL.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] || './cities-modular';
const ONLY = process.argv[3] || null;
const TODAY = new Date().toISOString().slice(0, 10);

const FILES = ['config', 'directory', 'events', 'deals', 'concierge', 'planner', 'trails'];
const POOLS = [
  'morning_starts', 'beach_lake_outdoor', 'culture_history', 'shopping_browsing',
  'casual_lunch', 'happy_hour_drinks', 'dinner_casual', 'dinner_upscale',
  'dinner_romantic', 'nightlife', 'family_activities', 'rainy_day',
];
const REQ_BIZ = ['name', 'address', 'category', 'price', 'description', 'modes'];
const REQ_CONFIG = ['slug', 'name', 'state', 'tagline', 'concierge', 'modes', 'features', 'images'];

const cities = ONLY
  ? [ONLY]
  : fs.readdirSync(ROOT).filter((d) => fs.existsSync(path.join(ROOT, d, 'config.json')));

let anyFail = false;
const rows = [];

for (const slug of cities) {
  const fails = [];
  const warns = [];
  const data = {};

  for (const f of FILES) {
    const p = path.join(ROOT, slug, `${f}.json`);
    if (!fs.existsSync(p)) {
      (f === 'trails' ? warns : fails).push(`missing ${f}.json`);
      data[f] = f === 'config' || f === 'planner' ? {} : [];
      continue;
    }
    try {
      data[f] = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) {
      fails.push(`${f}.json is not valid JSON (${e.message})`);
      data[f] = f === 'config' || f === 'planner' ? {} : [];
    }
  }

  const { config, directory, events, deals, concierge, planner, trails } = data;

  // config contract
  for (const k of REQ_CONFIG) if (!(k in config)) fails.push(`config missing key "${k}"`);
  if (config.slug && config.slug !== slug) fails.push(`config.slug "${config.slug}" ≠ folder "${slug}"`);
  const heroDone = config.hero && ['summer', 'fall', 'winter', 'spring'].every((s) => config.hero[s]);
  if (config.features?.seasonal_hero && !heroDone) fails.push('features.seasonal_hero=true but hero copy incomplete');
  if (!config.features?.seasonal_hero && heroDone) warns.push('hero copy complete — flip features.seasonal_hero');

  // directory contract
  directory.forEach((b, i) => {
    const missing = REQ_BIZ.filter((k) => b[k] == null || (k === 'modes' && !Array.isArray(b.modes)));
    if (missing.length) fails.push(`directory[${i}] "${b.name || '?'}" missing ${missing.join(',')}`);
  });
  const names = new Set(directory.map((b) => b.name));
  if (names.size !== directory.length) warns.push(`directory has ${directory.length - names.size} duplicate name(s)`);
  const nv = directory.filter((b) => b.needs_verification).length;

  // cross-references: every linked name must exist in the directory
  concierge.forEach((n, i) =>
    (n.businesses || []).forEach((b) => { if (!names.has(b)) fails.push(`concierge[${i}] → unknown "${b}"`); }));
  for (const pool of POOLS) {
    if (!(pool in (planner || {}))) { fails.push(`planner missing pool "${pool}"`); continue; }
    if (planner[pool].length < 5) warns.push(`planner.${pool} has ${planner[pool].length}/5 items`);
    planner[pool].forEach((it) => { if (it.business && !names.has(it.business)) fails.push(`planner.${pool} → unknown "${it.business}"`); });
  }
  (Array.isArray(trails) ? trails : []).forEach((t, i) =>
    (t.stops || []).forEach((s) => { if (!names.has(s.biz)) fails.push(`trails[${i}] stop → unknown "${s.biz}"`); }));

  // temporal truth
  const upcoming = events.filter((e) => e.date && e.date >= TODAY).length;
  const expired = events.length - upcoming;
  if (upcoming < 3) warns.push(`only ${upcoming} upcoming events — refresh events.json`);
  const expiredDeals = deals.filter((d) => d.expires && d.expires < TODAY).length;
  if (expiredDeals) warns.push(`${expiredDeals} expired deal(s) present (renderer must filter)`);

  // concierge greeting node
  const g = concierge[0]?.keys || [];
  if (!['hello', 'hi', 'start', 'menu'].some((k) => g.includes(k))) warns.push('concierge[0] is not a greeting/menu node');

  const status = fails.length ? 'FAIL' : 'PASS';
  if (fails.length) anyFail = true;
  rows.push({ slug, status, biz: directory.length, upcoming, expired, deals: deals.length, nodes: concierge.length, trails: (trails || []).length, nv, fails, warns });
}

// report
const pad = (s, n) => String(s).padEnd(n);
console.log(pad('CITY', 18), pad('STATUS', 7), pad('BIZ', 5), pad('EV↑', 4), pad('EV✗', 4), pad('DEALS', 6), pad('NODES', 6), pad('TRAILS', 7), 'NEEDS_VERIF');
for (const r of rows) {
  console.log(pad(r.slug, 18), pad(r.status, 7), pad(r.biz, 5), pad(r.upcoming, 4), pad(r.expired, 4), pad(r.deals, 6), pad(r.nodes, 6), pad(r.trails, 7), r.nv);
  for (const f of r.fails) console.log('   ✗', f);
  for (const w of r.warns) console.log('   ⚠', w);
}
console.log(anyFail ? '\nRESULT: FAIL' : '\nRESULT: PASS (see warnings)');
process.exit(anyFail ? 1 : 0);
