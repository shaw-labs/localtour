# LocalTour Legacy → Modular Migration Report

Generated: 2026-07-07 · Source schema: legacy `data.js` globals · Target schema: michigan-city 6-JSON container (+ `trails.json` placeholder)

| City | Directory | Events (expired) | Deals | Concierge | Planner pools seeded | Cross-ref issues |
|---|---|---|---|---|---|---|
| chicago | 181 | 29 (11) | 17 | 20 | 12/12 | 6 |
| houston | 212 | 25 (3) | 16 | 28 | 12/12 | 0 |
| los-angeles | 154 | 21 (10) | 12 | 27 | 12/12 | 0 |
| miami | 251 | 26 (1) | 15 | 32 | 12/12 | 0 |
| new-orleans | 176 | 32 (8) | 17 | 29 | 12/12 | 0 |
| new-york-city | 190 | 28 (12) | 18 | 27 | 12/12 | 13 |
| san-francisco | 152 | 26 (8) | 15 | 20 | 12/12 | 0 |
| smoky-mountains | 155 | 25 (4) | 18 | 31 | 11/12 — short: nightlife (3/5) | 7 |

## Category vocabulary across all cities (preserved as-is; unify deliberately, not silently)

- `dining`: 511
- `bars_nightlife`: 214
- `attractions`: 159
- `lodging`: 117
- `outdoor_adventure`: 87
- `coffee_bakeries`: 79
- `shopping`: 72
- `entertainment`: 71
- `services`: 56
- `bars`: 35
- `wellness_spa`: 29
- `boating_water`: 15
- `wellness`: 11
- `coffee`: 8
- `outdoor`: 7

## Field-mapping decisions

- `se` → `seasonal` (confirmed semantics: "Open Mar-Nov", "MLB season Apr-Oct", "Summer only").
- `CITY_META.nexus` (6 display tiles) → `config.nexus_grid`. The `config.nexus` monetization object (type/anchor/affiliate_density) is a founder decision and was left null — never auto-filled.
- `side_trips[].dist` → `distance`.
- `hero_title`/`hero_sub` preserved under `config._legacy`; the four `hero.{season}` sentences are an authoring TODO (`features.seasonal_hero` stays false until written).
- `needs_verification` set to `false` across imports (data was hand-curated); freshness is a spot-audit concern (Prompt D), not a migration concern.
- Coordinates/timezones filled from stable general knowledge (2-decimal centroids) — spot-check before shipping.
- `features.coupon_clipper` set `false` everywhere until the merchant door (WS4) ships — flags tell the truth.

## Planner pools

Pools are **seeded drafts** derived from real directory records (category/mode/price heuristics, rating-ranked, max 8 per pool, `duration` left null). Every entry is a real business already in `directory.json`. Curate before treating as editorial. Shortfall pools (<5 items) are listed in the table above and are honest signals of thin coverage, not bugs.

## Authoring TODOs (per city, in priority order)

1. `config.nexus` — pick the monetizable cluster (batch-2 city blocks show the pattern).
2. `hero.{summer,fall,winter,spring}` — one evocative sentence each, then flip `features.seasonal_hero`.
3. `identity.known_for / best_season / visitor_type`, `concierge.personality / sign_off`, `population`, `nearest_major_city`.
4. `trails.json` — the flagship 250 Trail (WS8 schema: id, title, hook, narrative, neighborhoods, stops[{biz, note}]).
5. Planner pool curation pass (reorder, trim, write real `duration` values).
6. Events enrichment — legacy events carry only title/date/featured; time, location, admission, website are null.

## Cross-reference issues found

**chicago** cross-ref issues:
  - concierge node 6 → unknown business "Chicago Architecture Foundation Center River Cruise"
  - concierge node 8 → unknown business "Chicago Architecture Foundation Center River Cruise"
  - concierge node 11 → unknown business "The Palmer House Hilton"
  - concierge node 15 → unknown business "Wicker Park / Bucktown"
  - concierge node 15 → unknown business "Randolph Street Market"
  - concierge node 17 → unknown business "Chicago Architecture Foundation Center River Cruise"

**new-york-city** cross-ref issues:
  - concierge node 19 → unknown business "New World Mall Food Court"
  - concierge node 19 → unknown business "SriPraPhai"
  - concierge node 19 → unknown business "Arthur Avenue Retail Market"
  - concierge node 20 → unknown business "Strand Book Store"
  - concierge node 20 → unknown business "New York Public Library"
  - concierge node 21 → unknown business "Julius' Bar"
  - concierge node 23 → unknown business "Westlight"
  - concierge node 24 → unknown business "David Zwirner Gallery"
  - concierge node 25 → unknown business "Arthur Avenue Retail Market"
  - concierge node 25 → unknown business "Bronx Zoo"
  - concierge node 25 → unknown business "Wave Hill"
  - concierge node 25 → unknown business "SriPraPhai"
  - concierge node 26 → unknown business "Brooklyn Bridge Park"

**smoky-mountains** cross-ref issues:
  - concierge node 4 → unknown business "Ole Smoky Moonshine Distillery"
  - concierge node 5 → unknown business "Ole Smoky Moonshine Distillery"
  - concierge node 15 → unknown business "Ole Smoky Moonshine Distillery"
  - concierge node 18 → unknown business "Ole Smoky Moonshine Distillery"
  - concierge node 23 → unknown business "Ole Smoky Moonshine Distillery"
  - concierge node 25 → unknown business "Ole Smoky Moonshine Distillery"
  - concierge node 26 → unknown business "Ole Smoky Moonshine Distillery"

## Cross-reference patch log (2026-07-07)

### Renamed to canonical directory names (same entity, name variant):

- chicago node 6: "Chicago Architecture Foundation Center River Cruise" → "Chicago Architecture Center River Cruise"
- chicago node 8: "Chicago Architecture Foundation Center River Cruise" → "Chicago Architecture Center River Cruise"
- chicago node 11: "The Palmer House Hilton" → "Palmer House Hilton"
- chicago node 17: "Chicago Architecture Foundation Center River Cruise" → "Chicago Architecture Center River Cruise"
- new-york-city node 21: "Julius' Bar" → "Julius'"
- new-york-city node 24: "David Zwirner Gallery" → "David Zwirner"
- new-york-city node 26: "Brooklyn Bridge Park" → "Brooklyn Bridge Park Greenway"
- smoky-mountains node 4: "Ole Smoky Moonshine Distillery" → "Ole Smoky Moonshine Distillery - The Holler"
- smoky-mountains node 5: "Ole Smoky Moonshine Distillery" → "Ole Smoky Moonshine Distillery - The Holler"
- smoky-mountains node 15: "Ole Smoky Moonshine Distillery" → "Ole Smoky Moonshine Distillery - The Holler"
- smoky-mountains node 18: "Ole Smoky Moonshine Distillery" → "Ole Smoky Moonshine Distillery - The Holler"
- smoky-mountains node 23: "Ole Smoky Moonshine Distillery" → "Ole Smoky Moonshine Distillery - The Holler"
- smoky-mountains node 25: "Ole Smoky Moonshine Distillery" → "Ole Smoky Moonshine Distillery - The Holler"
- smoky-mountains node 26: "Ole Smoky Moonshine Distillery" → "Ole Smoky Moonshine Distillery - The Holler"

### Removed from node link arrays — real places missing from the directory (enrichment backlog):

- chicago node 15: "Wicker Park / Bucktown" *(neighborhood reference — consider a neighborhoods concept or drop)*
- chicago node 15: "Randolph Street Market" — add a verified directory record, then restore the link
- new-york-city node 19: "New World Mall Food Court" — add a verified directory record, then restore the link
- new-york-city node 19: "SriPraPhai" — add a verified directory record, then restore the link
- new-york-city node 19: "Arthur Avenue Retail Market" — add a verified directory record, then restore the link
- new-york-city node 20: "Strand Book Store" — add a verified directory record, then restore the link
- new-york-city node 20: "New York Public Library" — add a verified directory record, then restore the link
- new-york-city node 23: "Westlight" — add a verified directory record, then restore the link
- new-york-city node 25: "Arthur Avenue Retail Market" — add a verified directory record, then restore the link
- new-york-city node 25: "Bronx Zoo" — add a verified directory record, then restore the link
- new-york-city node 25: "Wave Hill" — add a verified directory record, then restore the link
- new-york-city node 25: "SriPraPhai" — add a verified directory record, then restore the link
