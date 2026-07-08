# LocalTour Final Cut — Development Brief

You are the lead engineer taking **localtour.directory** from a polished prototype to a marketable, monetizable product. This document is your complete brief: current-state audit, non-negotiable principles, seven workstreams, phasing with acceptance criteria, and a definition of done. Read it fully before writing code.

---

## 1. Mission

LocalTour is a config-driven city decision engine: per-city curated business graphs, a named concierge persona, deals, events, a trip planner, and a community wall, wrapped in a cinematic scroll experience. Eight cities are live; Las Vegas is deliberately not one of them — it remains an animated portal to SlotGenie.bet, LocalTour's sister property in the SH@W Labs portfolio.

The **Final Cut** means three things, in order of importance:

1. **Every claim on the site is true and generated from data.** No hand-typed statistics, no expired events, no "Now Live" badges on loading screens, no promised analytics that don't exist.
2. **All three revenue tracks on `/company/partners.html` become operational at their thinnest viable slice.** A merchant can pay, get listed, distribute a tracked coupon, and see their stats — without the founder writing code. A DMO can be pitched from the live site. A traveler can subscribe and share an itinerary.
3. **The "engine" becomes an actual engine.** One shared application, cities as pure data + config, so "we ship a city in a week" is an architectural fact rather than a marketing claim.

This is a consolidation-and-monetization release, not a feature release. When in doubt, cut scope rather than add it.

The release carries one campaign identity: the **America 250 layer** (WS8), timed to the U.S. Semiquincentennial year — the launch is framed as a celebration of 250 years of American neighborhoods, experienced like a local.

---

## 2. Current-State Audit (verified facts — do not rediscover, but do verify before relying on details)

### Architecture
- Fully static site, hosted on Netlify. No backend, no build step, no framework tooling.
- Each city page (`/cities/<slug>/index.html`) is ~3,100 lines / ~130KB containing a **complete inline copy** of the React application, compiled in-browser by **Babel standalone** (`react@18.3.1` UMD + `babel-standalone@7.26.4` from cdnjs). Eight near-identical copies exist. A bug fix currently requires eight edits.
- Each city ships **two complete UIs**: a "Feed" view (default) and a "Classic" view (a redesign labeled "from preview 4" in comments). The toggle persists via `sessionStorage` key `lt_view`. **Both views survive in the Final Cut** — this is a product decision, already made.
- Root `index.html` (landing, "City Decision Engine"), `/platform/*.html` (explore, concierge, planner, community), `/company/*.html` (about, partners, privacy, terms), `/vegas/index.html` (a "just landed / loading" teaser), and per-city `wall.html` files are separate standalone pages.
- `service-worker.js` uses a static cache name (`localtour-directory-v1`) with a cache-first strategy and no per-deploy versioning. Users can be pinned to stale data indefinitely — unacceptable for a product selling fresh deals.
- Images: ~108MB total, individual JPEGs commonly 250–550KB, no responsive variants, no modern formats.
- Zero analytics, zero forms (every CTA is a `mailto:` to `partners@ / merchants@ / creators@ / localtour@shaw-labs.com`), zero payment integration, zero `fetch()` calls to any backend.

### Data layer (the crown jewel — treat with care)
Each legacy city had `/cities/<slug>/data.js` defining five globals via `var` (since migrated to the modular containers in `cities-modular/` — kept here as the source-of-record map):

| Global | Shape |
|---|---|
| `CITY_META` | `name, state, slug, tagline, description, vibe, region, concierge_name, concierge_greeting, hero_title, hero_sub, hero_image, modes[], story_images, wall_images, category_images, section_breaks, transit, local_transport, side_trips` |
| `DIRECTORY_RAW` | Array of businesses with abbreviated keys: `n` name, `a` address, `c` category, `sc` subcategory, `p` price string, `r` rating string, `d` description, `mt` must-try, `h` hours, `w` website, `ph` phone, `se` seasonal window (confirmed; mapped to `seasonal`), `m` modes array |
| `DEALS_RAW` | `bn` business name, `c` category, `o` offer text, `rt` redemption type (e.g. `in_store`), `rv` redemption value, `ex` exclusive bool, `exp` expiry (nullable) |
| `EVENTS_RAW` | `t` title, `dt` ISO date, `f` featured bool |
| `CONCIERGE_NODES` | `keys[]` (match phrases), `text`, `chips[]` (suggested follow-ups), `businesses[]` (names to surface) |

Verified per-city counts (businesses / deals / events / nodes):

```
chicago          181 / 17 / 29 / 20
houston          212 / 16 / 25 / 28
los-angeles      154 / 12 / 21 / 27
miami            251 / 15 / 26 / 32
new-orleans      176 / 17 / 32 / 29
new-york-city    190 / 18 / 28 / 27
san-francisco    152 / 15 / 26 / 20
smoky-mountains  155 / 18 / 25 / 31
TOTAL          1,471 businesses · 214 concierge nodes
```

### Known defects to fix (the "truth debt")
1. **Per-city stats on `/platform/explore.html` are wrong** — e.g. NYC displayed as 312 (actual 190), SF as 187 (actual 152), Miami as 198 (actual 251). Notably, the *aggregate* claims (1,471 businesses, 214 nodes) are exactly correct — per-city figures were hand-typed and drifted. All displayed statistics must be computed from data at build time.
2. **Expired events render.** LA's events lead with FIFA World Cup matches dated 2026-06-12; the site does no date filtering. Events must auto-expire.
3. **Las Vegas is badged "Now Live · #9"** while `/vegas/index.html` is an animated teaser and `/cities/las-vegas/` contains a single hero image. Founder direction: the animated-portal format is **intentional and stays** — Vegas routes to SlotGenie.bet (sister SH@W Labs property) instead of becoming a native city. The defect is framing only: it currently reads as an unfinished city rather than a deliberate handoff. Workstream 6 fixes the framing, not the format.
4. **The partners page promises "conversion analytics baked in"** for the coupon clipper. Nothing exists behind that claim. Workstream 3 makes it true.
5. **Concierge is naive keyword matching**: `nodes.find(n => n.keys.some(k => lowercasedInput.includes(k)))`, first match wins, falls back to node 0. Workstream 5 upgrades it.
6. **SEO is effectively zero**: all content is client-rendered through in-browser Babel; crawlers see empty shells. For a local-discovery product this forfeits the primary free acquisition channel.

### Voice and brand (preserve at all costs)
The editorial voice is the moat: opinionated, local-first, anti-tourist-trap ("a Tuesday lunch in a strip mall can be the best meal of your life"; concierge greetings like "Yo. Welcome to the actual LA."). Design language: dark (#0a0a0a family), Playfair Display / Fraunces / DM Sans / IBM Plex Mono, red accent `#dc2626`, gold `#d4a853`. Positioning promises to honor in code: **"curated, not scraped"** and **"good answer first, revenue second"** (partner status must never outrank a better recommendation).

---

## 3. Non-Negotiable Principles

1. **Data is the single source of truth.** Any number, count, badge, or date shown anywhere must be derived from data files at build time. If it can drift, it must be computed.
2. **Never fabricate business facts.** When creating or editing directory data: research real venues, verify against official sources where possible, and leave fields empty/`null` when unverified rather than inventing hours, phones, prices, or addresses. Flag every new or uncertain record for founder review before it ships. A fake listing is a trust-destroying liability in a product whose pitch is curation.
3. **Do not break URLs.** `/cities/<slug>/`, `/platform/*`, `/company/*`, `/vegas/` must keep resolving. Additive routes only; redirects where structure genuinely must change.
4. **Both views ship.** Feed and Classic both move into the shared bundle. Every new capability (tracking, coupons, deals, share links) must function identically in both. If a feature only works in one view, it isn't done.
5. **Preserve the voice.** Port copy verbatim unless it's factually wrong. New copy (the Vegas portal, pitch page, forms) must match the established register. No corporate-speak, no exclamation-point enthusiasm.
6. **Revenue never degrades recommendations.** Promoted placement is labeled, bounded, and never displaces a better organic answer. This is stated policy on the partners page; enforce it in ranking code and document the enforcement.
7. **Cut, don't add.** No new product surfaces beyond this brief. Park ideas in `IDEAS.md`.

---

## 4. Target Stack

- **Build:** Vite 5, multi-page app, React 18.3 (already in use). TypeScript for all new engine code; existing JSX components may be ported as `.jsx` first and typed opportunistically. Output: fully static `dist/` deployable to Netlify unchanged.
- **Data:** each city is a modular container matching the michigan-city 6-JSON schema — `config.json, directory.json, events.json, deals.json, concierge.json, planner.json` (+ `trails.json` for WS8). The legacy 8 have already been migrated to this format (see `cities-modular/` + `scripts/migrate-legacy.mjs`); the engine's typed loader consumes these files directly. `scripts/validate-cities.mjs` is the plug-in audit for any city package, legacy or factory-built, and runs in CI.
- **Serverless:** Netlify Functions (beacon ingest, stats read, concierge AI, redemption confirm). Netlify Blobs for event storage. Netlify Forms for intake/email capture.
- **Payments:** Stripe Payment Links (no code for checkout; optional webhook → Netlify Function to log purchases to Blobs).
- **Analytics:** Plausible (subscription approved) for site-level traffic, **plus** a self-owned beacon for merchant-facing events — the merchant data is a product being sold and must be owned, queryable, and exportable.
- **Images:** build-time pipeline (`sharp`) → AVIF/WebP with JPEG fallback, responsive `srcset` (480/960/1440), lazy-loading below the fold. Budget: no delivered image over 120KB at largest breakpoint; total shipped media under 30MB.
- **CI:** a `verify` script (run in Netlify build) that fails the deploy on: stat drift (displayed vs computed), schema violations, expired featured events, broken internal links, missing alt text, images over budget.

---

## 5. Workstreams

### WS1 — Engine Consolidation
Collapse the eight inline app copies (plus platform pages) into one shared application.

- `src/engine/` — components, both views, router, data loader, selectors (e.g. `byName`, mode filters), theme tokens.
- `src/cities/<slug>/` → thin entry that imports the engine and the city's modular container (`config/directory/events/deals/concierge/planner/trails` JSONs).
- Feed and Classic become sibling view modules consuming identical selectors. View toggle moves from `sessionStorage` to `localStorage` (persist across sessions), same `lt_view` key.
- Platform pages become engine routes/pages in the same build; company pages may remain static HTML but move into the build pipeline for shared header/footer and the verify script.
- The taco-tap minigame and all existing delights are ported, not cut.

**Acceptance:** visual parity screenshots (both views × 8 cities × mobile/desktop) with only intentional diffs; one shared bundle served to all cities; a demonstrated single-file bug fix propagating to all cities; Babel standalone and UMD script tags gone.

### WS2 — Truth Pass
- Build-time stats module: every count on explore/landing/about computed from the city JSON containers. Delete all hand-typed figures.
- Events: filter `dt < today` out at render; featured ticker only shows future events; verify script fails if a city has fewer than 3 upcoming events (signals stale data needing a refresh, not a silent empty section).
- Deals: respect `exp`; expired deals hidden; `ex` (exclusive) rendered as a labeled badge.
- Vegas is presented as the SlotGenie portal (WS6), never as "city #9": explore-page copy counts "8 cities + the Vegas portal," and Vegas is excluded from businesses-indexed statistics.
- Copy audit: remove/repair every claim not yet true. "Conversion analytics baked in" stays **only after** WS3 lands.
- Service worker: cache name includes build hash; network-first for HTML and city JSON files, cache-first for hashed assets/images; stale-while-revalidate acceptable for images.

**Acceptance:** verify script green; zero hand-typed statistics remain (grep-proven); a deploy visibly updates data for a previously-visited client within one navigation.

### WS3 — Instrumentation (the product merchants pay for)
- **Beacon:** ~1KB client module, `navigator.sendBeacon` to a Netlify Function. Events (typed, versioned schema): `pageview_city`, `biz_impression` (viewport-observed, sampled), `biz_click` (detail open), `outbound_click` (website/phone), `coupon_reveal`, `coupon_redeem`, `planner_generated`, `share_created`. Payload: event, city, business id (slugified name), view (`feed|classic`), ts, anonymous session id (random, not fingerprinted). **No PII.** Respect DNT/GPC.
- **Storage:** Netlify Blobs, append-only JSONL partitioned by `city/date`; a scheduled function rolls daily aggregates per business.
- **Merchant stats page:** `/partners/stats/?k=<magic-token>` → Function validates token → renders that merchant's last-30-day views, click-outs, coupon reveals, redemptions, with CSV export. Tokens are per-merchant records in Blobs, founder-issuable via a tiny CLI script (`npm run issue-token -- --city los-angeles --biz "Name"`).
- **Plausible** wired site-wide with custom events mirroring the beacon's top-level events (redundancy + instant dashboards).
- Privacy policy updated to describe exactly this (anonymous, no cross-site tracking, no sale of data).

**Acceptance:** end-to-end demo — click a coupon in each view, see it in the merchant stats page within the aggregation window; both views emit identically; privacy page updated.

### WS4 — Three Money Doors (thinnest viable slice each)

**Merchant door**
- Replace merchant `mailto:` with a Netlify Form: business name, city, category, contact, hours, website, offer (optional), tier interest. Confirmation copy in-voice.
- Three listing tiers as Stripe Payment Links (founder supplies final pricing; scaffold with placeholders and a single `pricing.json` consumed by the partners page so prices are data, not copy): e.g. *Curated* (free, earned), *Partner*, *Anchor*. Tier badges render on listings — subtle, labeled, never reordering above a better organic result (Principle 6; encode as: promoted items get a bounded boost within their category section only, and an automated test asserts an organic higher-rated item is never displaced from slot 1).
- **Coupon clipper v1:** deals gain `code` (unique short code per campaign, e.g. `LT-LA-TACO7`) and `merchant_id`. Traveler flow: reveal → code + "show at counter" screen (`coupon_reveal` fires). Redemption: the reveal screen includes a "merchant confirms" tap hitting `/api/redeem?c=CODE` (Function logs `coupon_redeem`, idempotent per session). Honest v1: reveals and click-outs are precise; redemptions are merchant-confirmed approximations. Say exactly that on the partners page.

**DMO door**
- `/partners/cities/` pitch page: the pipeline visualized (Intelligence → Graph → Persona → Ship), live computed stats, embedded walkthrough of a flagship city, economics summary (from existing partners copy), and a Netlify Form for city inquiries.
- One-page PDF (`/partners/localtour-city-onepager.pdf`) generated at build from the same data — never drifts from the site.

**Traveler door**
- Email capture (Netlify Form → founder exports; note Buttondown as the upgrade path when the list earns it): "New city drops + the weekly deal sheet." Placed on landing, city footers, and post-planner.
- **Shareable itineraries:** serialize planner output to a compact URL param (`/cities/<slug>/?plan=<base64url>`); opening it re-renders the itinerary read-only with a "remix this plan" CTA. No accounts, no storage.
- PWA: per-city offline caching of the current city's shell + data + visible images ("save this city for the trip" prompt); works in airplane mode for a saved city.

**Acceptance:** a stranger can — pay for a tier via Stripe link, submit a listing, reveal and redeem a tracked coupon, receive a stats magic link, be pitched as a DMO from `/partners/cities/`, subscribe an email, and open a shared itinerary on a second device. Each demonstrated.

### WS5 — Concierge Hybrid Brain
- **Layer 1 (free, instant): improved node matching.** Tokenize input; score nodes by weighted key overlap instead of first-`includes` match; return best-above-threshold with its chips and businesses.
- **Layer 2 (AI fallback):** below threshold, POST to a Netlify Function calling the Anthropic API (small fast model) with a strict system prompt: persona = `concierge_name` + greeting register; grounding = the city's business graph (compact serialized subset relevant to the query — pre-filter by category/mode keywords to keep tokens small) plus the city's 250 Trail (WS8); rules = recommend only businesses in the graph, never invent venues/hours/prices, keep answers under ~120 words, always return 1–3 concrete picks with the *why*, match the persona's voice, disclose nothing about being an AI system unless asked directly (if asked, answer honestly).
- Guardrails: per-IP rate limit (e.g. 10 AI answers/hour), daily budget cap via env var with graceful degrade to Layer 1 + "ask me something simpler" copy, 3s timeout falling back to Layer 1, no user text stored beyond transient logs.
- Both views' concierge UIs call the same module. Partner "concierge weight" applies only as a tiebreaker between comparably-rated options and is documented in code.

**Acceptance:** scripted eval of 25 queries per city — Layer 1 handles the mapped ones; Layer 2 answers the long tail with in-graph picks only; zero hallucinated venues across the eval; cost log shows per-answer cost within budget.

### WS6 — Vegas Portal (the SlotGenie handoff)
Vegas is deliberately **not** a LocalTour city. It is SlotGenie's turf — the dedicated Vegas concierge in the SH@W Labs portfolio — and LocalTour's job is to hand travelers over with style. The existing animated teaser at `/vegas/` is the correct format; the work is making it read as *intentional* instead of unfinished.

- Keep the animation language and register already there ("what happens here, stays here … 🧞") and the `hero-strip-night.jpg` asset; evolve the page from "loading a city" into a cinematic portal: Vegas doesn't get a guide, it gets a genie. Copy stays in-voice and makes the sister-property relationship explicit (a founder-approved "from the SH@W Labs family" line or equivalent).
- Prominent animated tap-through to SlotGenie.bet carrying UTM parameters for cross-property attribution. No auto-redirect — the traveler chooses. Fire beacon event `portal_slotgenie_click` (plus a Plausible custom event) on tap.
- Explore page: Vegas renders as a ninth tile with a visually distinct portal treatment (badge like "Served by SlotGenie ↗"), excluded from businesses-indexed counts, with copy reading "8 cities + the Vegas portal."
- `/vegas/` remains the canonical URL; the `cities/las-vegas/` stub is removed or repurposed as the portal's asset folder. All existing links keep resolving (Principle 3).
- The portal lives inside the engine build (shared header/footer, beacon, verify script coverage) — no orphaned hand-edited HTML.

**Acceptance:** a stranger reads the portal as deliberate, not unfinished; the tap-through is tracked end to end; explore stats remain computed-true with Vegas excluded from graph counts; SlotGenie receives UTM-tagged traffic.

### WS7 — SEO & Performance
- Build-time static pages per business: `/cities/<slug>/places/<biz-slug>/` — server-rendered HTML (name, description, must-try, hours, address, deals) + `LocalBusiness` JSON-LD + canonical + OG tags, with a "open in the full experience" link into the app view. These are additive routes (Principle 3).
- Per-city and landing meta/OG/Twitter cards rendered at build; `sitemap.xml` + `robots.txt` generated.
- Performance budget: city page LCP < 2.5s on simulated mid-tier mobile, JS < 250KB gzipped shared bundle, Lighthouse ≥ 90 performance / ≥ 95 SEO on city pages and place pages.

**Acceptance:** Lighthouse CI in verify script; place pages render full content with JS disabled; sitemap validates.

### WS8 — America 250 Layer ("Like a Local" campaign)
July 4, 2026 is the United States Semiquincentennial. LocalTour's thesis — America's genius lives in its neighborhoods, and the best way to see the country is through a local's eyes — *is* a 250 story. This layer celebrates it without inventing a new product surface: trails are curated, narrated, shareable itineraries built entirely from the existing business graph.

- **Data:** per-city `trails.json` (already scaffolded as an empty array by the migration): `id, title, hook` (one line), `narrative` (150–250 words, in-voice), `neighborhoods[]`, `stops[]` where each stop = `{ biz: <exact directory.json name>, note: <why this stop, 1–2 sentences> }`. The verify script fails the build if any stop does not resolve to a real directory listing.
- **Thin slice: exactly one flagship trail per city** — "The 250 Trail: <City>" — 6–9 stops tracing the city's cultural DNA. Seeds: Houston's global foodways; New Orleans' Creole and Cajun lineage; Chicago's neighborhood mosaic; LA's east-side corridors; Miami's Little Havana–Little Haiti axis; SF's Chinatown-to-Mission arc; NYC's immigrant main streets; the Smokies' Appalachian craft and music heritage. The framework supports more trails later; this release ships eight.
- **UI (both views):** a campaign rail on city pages plus a trail detail experience — narrative header, ordered stops with notes, and a share CTA emitting the same `?plan=` link as the planner (WS4): a trail *is* a pre-built itinerary. Beacon events: `trail_view`, `trail_stop_click`, `trail_share`.
- **Landing + explore:** a 250 hero moment on the landing page (register: "250 years in, the best way to see America is still through a local's eyes") and an "America 250 Collection" band on explore — all counts computed, per Principle 1.
- **Voice and integrity:** proud, warm, specific. Celebrate places, foodways, music, languages, and the people who built them. Zero clip-art patriotism, zero politics, zero cynicism. Every historical claim must be verifiable; when uncertain, say less. The founder reviews all eight narratives and stop lists before ship (single batch review doc).
- **Sunset by design:** campaign branding driven by `campaign.json` (`name, window_start, window_end, fallback_name: "Heritage Trails"`). When the window closes, the layer automatically re-skins to its evergreen identity — no truth debt in 2027. Test with a clock override.
- **Monetization hooks (no new mechanics):** trails are the email-capture magnet ("new trail drops") and the DMO wedge — semiquincentennial tourism budgets exist through 2026, and "we'll build your city's 250 Trail in a week" goes straight into the `/partners/cities/` pitch. Trail stops carry **no paid placement** in this release; Principle 6 stays clean.
- The Vegas portal sits the campaign out (one-line nod from the genie at most).

**Acceptance:** eight trails live in both views; every stop resolves; a shared trail opens read-only on a second device; branding flips to fallback automatically past `window_end` (clock-override tested); founder sign-off on all eight narratives.

---

## 6. Phasing & Order of Operations

| Phase | Scope | Gate to next phase |
|---|---|---|
| 0 | Repo bootstrap: Vite, TS config; adopt the delivered `cities-modular/` packages + build the typed loader; extend `scripts/validate-cities.mjs` into the CI verify script; screenshot baseline of current site | Baseline screenshots archived; loader output deep-equals the legacy globals through the documented field map; validator green |
| 1 | WS1 engine consolidation (both views, all 8 cities, platform pages) | Parity screenshots approved; single-fix-propagates demo |
| 2 | WS2 truth pass + service worker + WS7 image pipeline | Verify script fully green; media budget met |
| 3 | WS3 instrumentation + merchant stats page | End-to-end coupon→stats demo in both views |
| 4 | WS4 money doors (forms, Stripe, coupons, pitch page, email, share links, PWA save-a-city) | The "stranger can…" acceptance list demonstrated |
| 5 | WS5 concierge hybrid | 25-query eval per city passed, zero hallucinated venues |
| 6 | WS6 Vegas portal polish + explore treatment; WS8 America 250 layer | Portal reads as intentional and tap-through is tracked; eight founder-approved trails live in both views with working share links; verify green |
| 7 | WS7 SEO static pages + Lighthouse budgets + launch QA matrix (both views × 8 cities + portal × mobile/desktop × offline) | All budgets met; launch checklist signed |

Work strictly in phase order; within a phase, commit small and keep the site deployable at every commit (Netlify deploy previews per PR).

---

## 7. Founder-Supplied Inputs (block early, ask once, batch the asks)

1. Final tier names and prices for the merchant door (scaffold with `pricing.json` placeholders meanwhile).
2. Stripe account + Payment Links (provide setup instructions if not yet created).
3. Plausible account + domain (or approval to defer to Phase 3).
4. Anthropic API key for the concierge function (env var `ANTHROPIC_API_KEY`), plus daily budget cap value.
5. The exact SlotGenie destination URL and preferred UTM scheme for cross-property attribution, plus approval of the portal's sister-property copy line.
6. Batch review and sign-off of the eight 250 Trail narratives and stop lists (WS8).
7. ~~Confirmation of `se` field meaning~~ — resolved: `se` = `seasonal` ("Open Mar-Nov", "MLB season Apr-Oct"); already mapped in the migration.

---

## 8. Out of Scope (park in IDEAS.md, do not build)

User accounts and auth. Native apps. A CMS or admin UI beyond the token-issuing CLI. Real-time community posting (the wall stays curated/static this release). New cities. Building Las Vegas as a native LocalTour city — Vegas is SlotGenie's turf; LocalTour ships only the portal. Additional trails beyond one per city (the framework supports them; this release ships eight). Booking/reservations integrations. Multi-language. Any redesign of either view beyond consolidation-driven cleanup.

---

## 9. Definition of Done

The Final Cut ships when all of the following are simultaneously true on production:

1. One engine, eight cities plus the Vegas portal, both views, zero inline app duplication, no in-browser Babel.
2. Every displayed statistic, badge, and date is computed from data; the verify script enforces it on every deploy.
3. A merchant can pay via Stripe, submit intake, run a tracked coupon, and read their 30-day stats from a magic link — founder writes no code in that loop.
4. A DMO prospect can be sent one URL (`/partners/cities/`) and a PDF that cannot drift from the site.
5. A traveler can subscribe, generate an itinerary, share it to another device, and save a city for offline use.
6. The concierge answers off-script questions with real in-graph picks, within budget, with zero fabricated venues in the eval suite.
7. The Vegas portal ships as a deliberate, tracked, in-voice handoff to SlotGenie — no stranger would mistake it for an unfinished city.
8. Lighthouse ≥ 90 perf / ≥ 95 SEO on city and place pages; shipped media < 30MB; place pages indexable without JS.
9. Privacy policy, coupon terms, and creator/affiliate disclosure accurately describe the shipped system.
10. The partners page contains no promise the product doesn't keep.
11. The America 250 layer is live: eight founder-approved trails, every stop resolving to a real listing, shareable from both views, with automatic post-campaign fallback branding proven by test.
