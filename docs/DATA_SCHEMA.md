# LocalTour Data Schema

The crown jewel: 1,471 businesses · 128 deals · 212 events · 214 concierge nodes across
8 cities — now shipped as **modular city containers** (final-cut pack, adopted 2026-07-07).

## The container format (the data contract)

Each city is a folder of **seven JSON files** in `cities-modular/<slug>/`. Legacy and
factory-built cities are indistinguishable to the engine.

| File | Contents |
|---|---|
| `config.json` | Identity, coordinates/timezone, hero, nexus (+`nexus_grid` display tiles), sponsors, modes, transit, side_trips, concierge persona, wall, honest `features` flags, `_legacy` (preserved unmapped legacy fields) |
| `directory.json` | Businesses — full field names incl. `seasonal` (ex-`se`) and `needs_verification` (false on legacy imports; factory output uses it liberally) |
| `events.json` | Events — enriched shape (`time`/`location`/`admission`/`website` are null on legacy imports; authoring TODO) |
| `deals.json` | Deals — **codeless by contract**: `code`/`merchant_id` only ever come through the merchant door (WS4) |
| `concierge.json` | Nodes: `keys/text/businesses/chips`; every `businesses[]` entry resolves to a directory name (cross-refs patched — see provenance) |
| `planner.json` | 12 pools of seeded drafts — every entry a real directory record; curate before treating as editorial |
| `trails.json` | `[]` placeholder until the founder-reviewed 250 Trail lands (WS8) |

The contract is enforced by `scripts/validate-cities.mjs` (from the pack) — run standalone:

```
node scripts/validate-cities.mjs ./cities-modular            # all cities
node scripts/validate-cities.mjs ./cities-modular chicago    # one city
```

## Provenance chain (why this data can be trusted)

```
cities/<slug>/data.js  ──migrate-legacy.mjs──►  converter output
        (legacy globals, read-only)                   │
                                                      ▼  + 26 documented cross-ref patches
                                              cities-modular/<slug>/
```

- `scripts/migrate-legacy.mjs` is the converter that produced the containers (kept, rerunnable).
- The **only** hand edits on top of converter output are the 26 concierge cross-reference
  patches logged in `cities-modular/MIGRATION_REPORT.md` (renames to canonical directory
  names + removals of places missing from the directory — the 12-place enrichment backlog).
- `scripts/verify-provenance.mjs` re-runs the converter against `data.js` on every build and
  deep-equals the result (+ the encoded patch log) against `cities-modular/`. Any
  off-the-record edit fails the deploy. Verified clean 2026-07-07: 8/8 cities, all 7 files.
- Counts are additionally pinned to the audit-verified table in `scripts/expected-counts.json`
  (independently re-derived from `data.js` on 2026-07-04, matched the brief exactly).

## Key field decisions (from the migration report)

- `se` → `seasonal` — semantics confirmed ("Open Mar–Nov", "MLB season Apr–Oct").
- **Category vocabulary preserved as-is on disk** — legacy values (`bars` 35, `wellness` 11,
  `coffee` 8, `outdoor` 7) coexist with canonical ones. Unification is deliberate and
  display-side: `canonicalCategory()` in `src/engine/data/loader.ts` (bars→bars_nightlife,
  coffee→coffee_bakeries, outdoor→outdoor_adventure, wellness→wellness_spa, boating→boating_water).
- `config.nexus` (monetization cluster) left **null** — founder decision, never auto-filled.
  `nexus_grid` carries the legacy 6-tile display data.
- `hero_title`/`hero_sub` preserved under `config._legacy`; seasonal hero sentences are an
  authoring TODO (`features.seasonal_hero` stays false until written).
- Coordinates/timezones are 2-decimal centroids from stable general knowledge — founder spot-check queued.
- `features.coupon_clipper` is false everywhere until WS4 ships — flags tell the truth.
- Ratings remain strings ("4.8"). Event `date` still has three formats (ISO / range /
  `recurring:` text) — WS2 parses and auto-expires.

## Engine consumption

`src/engine/data/loader.ts` glob-imports `cities-modular/*/‍*.json` (code-split per file),
assembles the typed `City` (`types.ts`), and exposes the engine selectors: `byName`
(the join key — deals `business_name`, concierge `businesses[]`, planner `business`, and
trail `stops[].biz` all resolve by exact directory name), `grouped` (by canonical category),
`sortedCats` (CAT_ORDER), `filterByMode`.

`cities/michigan-city/` remains in the repo as the original schema exemplar only — it is
not registered, not shipped ("No new cities", brief §8).

## Authoring queue (founder data work; engine never blocks on it)

Per city, in priority order (details in `cities-modular/MIGRATION_REPORT.md`):
`config.nexus` → `hero.{season}` ×4 → identity/concierge personality → the 250 Trail →
planner-pool curation → events enrichment → the 12-place directory backlog (Strand Book
Store, Bronx Zoo, SriPraPhai, Arthur Avenue Retail Market, …).

## Verification (runs inside `npm run build`; CI + Netlify gate on it)

1. **Data contract** — `validate-cities.mjs` PASS on every city
2. **Counts** — pinned to `scripts/expected-counts.json`
3. **Provenance** — converter + patch log reproduces `cities-modular/` exactly
4. Warn-only stubs for later phases: stat drift, expired events, links, alt text, media budget
