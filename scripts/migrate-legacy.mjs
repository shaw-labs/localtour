#!/usr/bin/env node
/**
 * migrate-legacy.mjs — LocalTour legacy data.js → modular city packages
 *
 * Converts each cities/<slug>/data.js (CITY_META, DIRECTORY_RAW, DEALS_RAW,
 * EVENTS_RAW, CONCIERGE_NODES) into the michigan-city 6-JSON container format:
 *   config.json, directory.json, events.json, deals.json, concierge.json,
 *   planner.json  (+ trails.json placeholder for the WS8 250 Trails layer)
 *
 * Principles:
 *  - Never invent facts. Unknown fields are null. Nothing is fabricated.
 *  - Never destroy data. Unmapped legacy fields are preserved under config._legacy.
 *  - Planner pools are SEEDED from real directory records (flagged in the report
 *    as drafts for curation), never from imagination.
 *
 * Usage: node scripts/migrate-legacy.mjs [--src <repo root>] [--out <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const args = process.argv.slice(2);
const getArg = (flag, dflt) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : dflt;
};
const SRC = path.resolve(getArg('--src', '.'));
const OUT = path.resolve(getArg('--out', './cities-modular'));
const TODAY = new Date().toISOString().slice(0, 10);

const CITIES = [
  'chicago', 'houston', 'los-angeles', 'miami',
  'new-orleans', 'new-york-city', 'san-francisco', 'smoky-mountains',
];

// Stable geographic facts for the 8 legacy cities (2-decimal centroids).
// Flagged in the migration report for a founder spot-check.
const GEO = {
  'chicago':          { lat: 41.88, lng: -87.63, tz: 'America/Chicago' },
  'houston':          { lat: 29.76, lng: -95.37, tz: 'America/Chicago' },
  'los-angeles':      { lat: 34.05, lng: -118.24, tz: 'America/Los_Angeles' },
  'miami':            { lat: 25.76, lng: -80.19, tz: 'America/New_York' },
  'new-orleans':      { lat: 29.95, lng: -90.07, tz: 'America/Chicago' },
  'new-york-city':    { lat: 40.71, lng: -74.01, tz: 'America/New_York' },
  'san-francisco':    { lat: 37.77, lng: -122.42, tz: 'America/Los_Angeles' },
  'smoky-mountains':  { lat: 35.69, lng: -83.53, tz: 'America/New_York' },
};

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const firstSentence = (s, max = 110) => {
  if (!s) return null;
  const cut = String(s).split(/(?<=[.!?])\s/)[0].trim();
  return cut.length <= max ? cut : cut.slice(0, max - 1).trimEnd() + '…';
};
const has = (v, re) => re.test(String(v || '').toLowerCase());

function loadLegacy(slug) {
  const file = path.join(SRC, 'cities', slug, 'data.js');
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  return ctx;
}

// ---------------------------------------------------------------- directory
const KNOWN_BIZ_KEYS = new Set(['n', 'a', 'c', 'sc', 'p', 'r', 'd', 'mt', 'h', 'w', 'ph', 'se', 'm']);
function mapBusiness(b) {
  const out = {
    name: b.n ?? null,
    address: b.a ?? null,
    phone: b.ph ?? null,
    website: b.w ?? null,
    category: b.c ?? null,
    subcategory: b.sc ?? null,
    price: b.p ?? null,
    rating: b.r ?? null,
    description: b.d ?? null,
    must_try: b.mt ?? null,
    hours: b.h ?? null,
    seasonal: b.se || null,
    modes: Array.isArray(b.m) ? b.m : [],
    needs_verification: false, // imported as-curated; freshness handled by spot-audits
  };
  const extra = Object.keys(b).filter((k) => !KNOWN_BIZ_KEYS.has(k));
  if (extra.length) out._extra = Object.fromEntries(extra.map((k) => [k, b[k]]));
  return out;
}

// ------------------------------------------------------------------- deals
function mapDeal(d, i) {
  return {
    id: `deal-${slugify(d.bn || 'unknown')}-${i + 1}`,
    business_name: d.bn ?? null,
    category: d.c ?? null,
    offer_text: d.o ?? null,
    offer_type: null,
    redemption_type: d.rt ?? null,
    redemption_value: d.rv ?? null,
    source: 'legacy-import',
    is_exclusive: !!d.ex,
    expires: d.exp ?? null,
  };
}

// ------------------------------------------------------------------ events
function mapEvent(e, i) {
  return {
    id: `event-${slugify(e.t || 'untitled')}-${e.dt || i}`,
    title: e.t ?? null,
    date: e.dt ?? null,
    time: null,
    location: null,
    address: null,
    description: null,
    category: null,
    mode: null,
    featured: !!e.f,
    pin_ticker: false,
    admission: null,
    website: null,
  };
}

// --------------------------------------------------------------- concierge
function mapConciergeNode(n) {
  return {
    keys: Array.isArray(n.keys) ? n.keys : [],
    text: n.text ?? null,
    businesses: Array.isArray(n.businesses) ? n.businesses : [],
    chips: Array.isArray(n.chips) ? n.chips : [],
  };
}

// ------------------------------------------------------------------ config
function mapConfig(slug, M) {
  const geo = GEO[slug] || {};
  const modes = (M.modes || []).map((m) => ({
    id: m.id ?? slugify(m.label || ''),
    label: m.label ?? null,
    icon: m.icon ?? null,
    description: m.description ?? null,
    tags: Array.isArray(m.tags) ? m.tags : [],
  }));
  const side_trips = (M.side_trips || []).map((s) => ({
    name: s.name ?? null,
    distance: s.distance ?? s.dist ?? null,
    pitch: s.pitch ?? null,
    highlights: s.highlights ?? null,
  }));
  const mapped = {
    slug,
    name: M.name ?? null,
    state: M.state ?? null,
    region: M.region ?? null,
    tagline: M.tagline ?? null,
    description: M.description ?? null,
    coordinates: geo.lat != null ? { lat: geo.lat, lng: geo.lng } : null,
    timezone: geo.tz ?? null,
    population: null,
    nearest_major_city: null,
    domain_legacy: null,
    identity: {
      known_for: null,
      vibe: M.vibe ?? null,
      best_season: null,
      visitor_type: null,
    },
    hero: { summer: null, fall: null, winter: null, spring: null }, // authoring TODO (WS: seasonal heroes)
    nexus: { // monetization object — founder decision, never auto-filled
      type: null, anchor: null, anchor_url: null, radius: null,
      services: null, affiliate_density: null, description: null,
    },
    nexus_grid: Array.isArray(M.nexus) ? M.nexus : [],
    sponsors: { anchor: null, categories: null, album_sponsors: null },
    modes,
    transit: {
      from_nearest_hub: null,
      local_transport: M.local_transport ?? null,
      _legacy_transit: M.transit ?? null,
    },
    side_trips,
    concierge: {
      name: M.concierge_name ?? null,
      greeting: M.concierge_greeting ?? null,
      personality: null,
      sign_off: null,
    },
    wall: { albums: null },
    features: {
      concierge: true,
      wall: true,
      trip_planner: true,
      coupon_clipper: false, // flips true when the WS4 merchant door ships
      event_ticker: true,
      seasonal_hero: false,  // flips true when hero.{season} copy is authored
    },
    images: {
      hero: M.hero_image ?? null,
      story: M.story_images ?? [],
      wall: M.wall_images ?? [],
      categories: M.category_images ?? {},
      section_breaks: M.section_breaks ?? {},
    },
  };
  // Preserve everything not explicitly mapped.
  const consumed = new Set([
    'name', 'state', 'slug', 'tagline', 'description', 'vibe', 'region',
    'concierge_name', 'concierge_greeting', 'hero_title', 'hero_sub', 'hero_image',
    'modes', 'story_images', 'wall_images', 'category_images', 'section_breaks',
    'transit', 'local_transport', 'side_trips', 'nexus',
  ]);
  const legacyRest = Object.fromEntries(Object.keys(M).filter((k) => !consumed.has(k)).map((k) => [k, M[k]]));
  mapped._legacy = { hero_title: M.hero_title ?? null, hero_sub: M.hero_sub ?? null, ...legacyRest };
  return mapped;
}

// ----------------------------------------------------------------- planner
const POOLS = [
  'morning_starts', 'beach_lake_outdoor', 'culture_history', 'shopping_browsing',
  'casual_lunch', 'happy_hour_drinks', 'dinner_casual', 'dinner_upscale',
  'dinner_romantic', 'nightlife', 'family_activities', 'rainy_day',
];

const POOL_RULES = {
  morning_starts: (b) => b.category === 'coffee' || has(b.subcategory, /breakfast|brunch|bakery|donut|bagel|diner|beignet/),
  beach_lake_outdoor: (b) => has(b.category, /outdoor|park/) || has(b.subcategory, /beach|park|trail|garden|lake|river|hike|kayak|bike|boardwalk|nature/),
  culture_history: (b) => has(b.subcategory, /museum|gallery|historic|landmark|architecture|theater|theatre|cultural|memorial|cathedral|jazz_history/) || has(b.category, /culture|attraction/),
  shopping_browsing: (b) => has(b.category, /shopping/) || has(b.subcategory, /bookstore|market|vintage|record|boutique|antique/),
  casual_lunch: (b) => has(b.category, /dining|food/) && /^\$(\s|$|-\$\$?$)|^\$$|^\$-\$\$$/.test(String(b.price || '')),
  happy_hour_drinks: (b) => has(b.category, /bar|nightlife/) && !has(b.subcategory, /club/),
  dinner_casual: (b) => has(b.category, /dining|food/) && /\$\$(?!\$)/.test(String(b.price || '')),
  dinner_upscale: (b) => has(b.category, /dining|food/) && /\$\$\$/.test(String(b.price || '')),
  dinner_romantic: (b) => (b.modes || []).some((m) => /romantic|date/.test(String(m))) || has(b.description, /romantic|intimate|date night|candlelit/),
  nightlife: (b) => has(b.category, /bar|nightlife|entertainment/) && has(b.subcategory, /live_music|club|karaoke|comedy|lounge|speakeasy/),
  family_activities: (b) => (b.modes || []).some((m) => /family|kids/.test(String(m))) || has(b.subcategory, /zoo|aquarium|arcade|children|science|ferris|carousel/),
  rainy_day: (b) => has(b.subcategory, /museum|aquarium|arcade|bookstore|gallery|theater|theatre|spa|bowling|planetarium|conservatory/) || has(b.description, /indoor/),
};

function seedPlanner(directory) {
  const planner = {};
  const shortfalls = [];
  for (const pool of POOLS) {
    const rule = POOL_RULES[pool];
    const candidates = directory
      .filter((b) => b.name && rule(b))
      .sort((a, z) => parseFloat(z.rating || 0) - parseFloat(a.rating || 0));
    const seen = new Set();
    const items = [];
    for (const b of candidates) {
      if (seen.has(b.name)) continue;
      seen.add(b.name);
      items.push({
        title: b.name,
        note: b.must_try || firstSentence(b.description),
        business: b.name,
        website: b.website || null,
        duration: null,
      });
      if (items.length >= 8) break;
    }
    planner[pool] = items;
    if (items.length < 5) shortfalls.push(`${pool} (${items.length}/5)`);
  }
  return { planner, shortfalls };
}

// ------------------------------------------------------------ verification
function crossRefIssues(directory, concierge, planner) {
  const names = new Set(directory.map((b) => b.name));
  const issues = [];
  concierge.forEach((node, i) => {
    for (const b of node.businesses || []) {
      if (!names.has(b)) issues.push(`concierge node ${i} → unknown business "${b}"`);
    }
  });
  for (const pool of POOLS) {
    for (const item of planner[pool] || []) {
      if (item.business && !names.has(item.business)) {
        issues.push(`planner ${pool} → unknown business "${item.business}"`);
      }
    }
  }
  return issues;
}

// -------------------------------------------------------------------- main
const report = [];
report.push(`# LocalTour Legacy → Modular Migration Report`);
report.push(``);
report.push(`Generated: ${TODAY} · Source schema: legacy \`data.js\` globals · Target schema: michigan-city 6-JSON container (+ \`trails.json\` placeholder)`);
report.push(``);
report.push(`| City | Directory | Events (expired) | Deals | Concierge | Planner pools seeded | Cross-ref issues |`);
report.push(`|---|---|---|---|---|---|---|`);

const globalNotes = [];
const vocab = new Map();

for (const slug of CITIES) {
  const L = loadLegacy(slug);
  const dir = (L.DIRECTORY_RAW || []).map(mapBusiness);
  const deals = (L.DEALS_RAW || []).map(mapDeal);
  const events = (L.EVENTS_RAW || []).map(mapEvent);
  const concierge = (L.CONCIERGE_NODES || []).map(mapConciergeNode);
  const config = mapConfig(slug, L.CITY_META || {});
  const { planner, shortfalls } = seedPlanner(dir);
  const issues = crossRefIssues(dir, concierge, planner);

  for (const b of dir) {
    const key = `${b.category}`;
    vocab.set(key, (vocab.get(key) || 0) + 1);
  }

  const expired = events.filter((e) => e.date && e.date < TODAY).length;
  const outDir = path.join(OUT, slug);
  fs.mkdirSync(outDir, { recursive: true });
  const write = (name, data) => fs.writeFileSync(path.join(outDir, name), JSON.stringify(data, null, 2) + '\n');
  write('config.json', config);
  write('directory.json', dir);
  write('events.json', events);
  write('deals.json', deals);
  write('concierge.json', concierge);
  write('planner.json', planner);
  write('trails.json', []); // WS8 250 Trails — authored, never generated

  report.push(`| ${slug} | ${dir.length} | ${events.length} (${expired}) | ${deals.length} | ${concierge.length} | ${POOLS.length - shortfalls.length}/12${shortfalls.length ? ` — short: ${shortfalls.join(', ')}` : ''} | ${issues.length} |`);
  if (issues.length) globalNotes.push(`**${slug}** cross-ref issues:\n${issues.map((i) => `  - ${i}`).join('\n')}`);
}

report.push(``);
report.push(`## Category vocabulary across all cities (preserved as-is; unify deliberately, not silently)`);
report.push(``);
[...vocab.entries()].sort((a, z) => z[1] - a[1]).forEach(([k, v]) => report.push(`- \`${k}\`: ${v}`));
report.push(``);
report.push(`## Field-mapping decisions`);
report.push(``);
report.push(`- \`se\` → \`seasonal\` (confirmed semantics: "Open Mar-Nov", "MLB season Apr-Oct", "Summer only").`);
report.push(`- \`CITY_META.nexus\` (6 display tiles) → \`config.nexus_grid\`. The \`config.nexus\` monetization object (type/anchor/affiliate_density) is a founder decision and was left null — never auto-filled.`);
report.push(`- \`side_trips[].dist\` → \`distance\`.`);
report.push(`- \`hero_title\`/\`hero_sub\` preserved under \`config._legacy\`; the four \`hero.{season}\` sentences are an authoring TODO (\`features.seasonal_hero\` stays false until written).`);
report.push(`- \`needs_verification\` set to \`false\` across imports (data was hand-curated); freshness is a spot-audit concern (Prompt D), not a migration concern.`);
report.push(`- Coordinates/timezones filled from stable general knowledge (2-decimal centroids) — spot-check before shipping.`);
report.push(`- \`features.coupon_clipper\` set \`false\` everywhere until the merchant door (WS4) ships — flags tell the truth.`);
report.push(``);
report.push(`## Planner pools`);
report.push(``);
report.push(`Pools are **seeded drafts** derived from real directory records (category/mode/price heuristics, rating-ranked, max 8 per pool, \`duration\` left null). Every entry is a real business already in \`directory.json\`. Curate before treating as editorial. Shortfall pools (<5 items) are listed in the table above and are honest signals of thin coverage, not bugs.`);
report.push(``);
report.push(`## Authoring TODOs (per city, in priority order)`);
report.push(``);
report.push(`1. \`config.nexus\` — pick the monetizable cluster (batch-2 city blocks show the pattern).`);
report.push(`2. \`hero.{summer,fall,winter,spring}\` — one evocative sentence each, then flip \`features.seasonal_hero\`.`);
report.push(`3. \`identity.known_for / best_season / visitor_type\`, \`concierge.personality / sign_off\`, \`population\`, \`nearest_major_city\`.`);
report.push(`4. \`trails.json\` — the flagship 250 Trail (WS8 schema: id, title, hook, narrative, neighborhoods, stops[{biz, note}]).`);
report.push(`5. Planner pool curation pass (reorder, trim, write real \`duration\` values).`);
report.push(`6. Events enrichment — legacy events carry only title/date/featured; time, location, admission, website are null.`);
if (globalNotes.length) {
  report.push(``);
  report.push(`## Cross-reference issues found`);
  report.push(``);
  report.push(globalNotes.join('\n\n'));
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'MIGRATION_REPORT.md'), report.join('\n') + '\n');
console.log(`Migrated ${CITIES.length} cities → ${OUT}`);
console.log(`Report: ${path.join(OUT, 'MIGRATION_REPORT.md')}`);
