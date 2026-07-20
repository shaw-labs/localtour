# LocalTour — Final Cut Pack (Claude Code)

One bundle, two workstreams, one data contract. Read this file first, then the two documents it points to. Everything in here has been reconciled — if you find a contradiction between documents, this README's precedence order resolves it: **README → final-cut brief → batch-2 pack → migration report**.

## What's in this pack

| Path | What it is |
|---|---|
| `localtour-final-cut-prompt.md` | The engineering brief: audit, principles, workstreams WS1–WS8, phasing with gates, definition of done. This is your primary instruction set. |
| `localtour-batch2-city-factory-prompts.md` | The City Intelligence Factory pack (v2) for producing 7 new cities: Phoenix, SLC, Nashville, KC, Denver, Austin, Portland. Data production, not engineering. |
| `cities-modular/` | The 8 legacy cities (Chicago, Houston, LA, Miami, New Orleans, NYC, SF, Smoky Mountains) **already migrated** to the modular container format. 1,471 businesses, validated PASS. |
| `cities-modular/MIGRATION_REPORT.md` | Every migration decision, the cross-reference patch log, the 12-place directory backlog, and per-city authoring TODOs. |
| `scripts/migrate-legacy.mjs` | The converter that produced `cities-modular/` from the legacy `data.js` files. Rerunnable; keep for provenance. |
| `scripts/validate-cities.mjs` | **The data contract.** Validates any city container — legacy or factory-built. Extend it into the CI verify script (Phase 0); it must pass on every deploy. |

## The data contract (applies to every city, no exceptions)

Each city is a folder of **seven JSON files**: `config, directory, events, deals, concierge, planner, trails`. Legacy and new cities are indistinguishable to the engine. Run the contract:

```
node scripts/validate-cities.mjs ./cities-modular            # all cities
node scripts/validate-cities.mjs ./cities-modular chicago    # one city
```

Current state: all 8 legacy cities PASS. Known warnings are honest: a few expired deals (the renderer must filter by date), and the Smokies' nightlife pool is thin because that's true of a national park region.

## Execution order

1. **Phases 0–7 of the final-cut brief, in order.** Phase 0 adopts `cities-modular/` and builds the typed loader — the data migration is already done; do not redo it.
2. **Batch-2 city production runs as separate factory sessions** per the batch-2 pack's own "How to run" — it is data work, not engine work, and can proceed in parallel once Phase 1 (engine consolidation) proves a container renders end-to-end. Every factory drop-in must pass `validate-cities.mjs` before registration in the CITIES array.
3. **Vegas is never built as a city.** It is an animated portal to SlotGenie.bet (sister SH@W Labs property) — see WS6. End state: 15 native cities + the Vegas portal.

## Non-negotiables (full versions in the brief — these are the ones people break)

- **Never fabricate business facts.** Real venues, verified where possible, `needs_verification: true` + null fields where not. The migration set legacy imports to `false` (hand-curated data); factory output uses the flag liberally.
- **Factory deals are codeless.** `code`/`merchant_id` exist only through the merchant door (WS4), where a real business signed up. The validator enforces this.
- **Every displayed number is computed from the containers.** No hand-typed statistics anywhere, ever. Events and deals auto-expire by date.
- **Both views (Feed + Classic) ship every feature.** If it works in one view, it isn't done.
- **Trails are authored, never generated-and-shipped.** One flagship "250 Trail" per city (WS8 / batch-2 trails schema), every stop resolving to a directory name, every historical claim verifiable, founder-reviewed before deploy.
- **Preserve the voice.** Port copy verbatim unless factually wrong; new copy matches the register.

## Authoring queue (data work the founder feeds in; engine work never blocks on it)

From `MIGRATION_REPORT.md`, per legacy city, in priority order: `config.nexus` (the monetizable cluster — batch-2 city blocks show the pattern), the four `hero.{season}` sentences (then flip `features.seasonal_hero`), identity/concierge personality fields, the 250 Trail, planner-pool curation, events enrichment, and the 12-place directory backlog (Strand Book Store, Bronx Zoo, Wave Hill, SriPraPhai, Arthur Avenue Retail Market, et al. — referenced by concierge nodes, never added to the directory).

## Definition of done

The brief's Section 9, verbatim. Short form: a merchant can pay, run a tracked coupon, and read stats without founder code; a DMO can be pitched from one URL; a traveler can subscribe, share an itinerary, and save a city offline; the concierge never invents a venue; every claim on the site is generated from data; and the partners page contains no promise the product doesn't keep.
