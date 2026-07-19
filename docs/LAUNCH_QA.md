# Launch QA — Final Cut (Phase 7 gate)

Run 2026-07-19 against **production (localtour.directory)**. Every check live, headless-verified.

## Launch matrix — 21/21 PASS

| Check | Mobile (390px) | Desktop (1280px) |
|---|---|---|
| Chicago — feed / classic | ✓ / ✓ | ✓ / ✓ |
| Phoenix — feed / classic | ✓ / ✓ | ✓ / ✓ |
| Miami — feed / classic | ✓ / ✓ | ✓ / ✓ |
| Salt Lake City — feed / classic | ✓ / ✓ | ✓ / ✓ |

Per cell: content renders, primary nav present, zero horizontal overflow, zero page errors.

| Cross-cutting | Result |
|---|---|
| Vegas portal (button present, console clean) | ✓ |
| Static place page renders (chicago/kasama) | ✓ |
| 404 page (in-voice, not blank) | ✓ |
| `?plan=` share round-trip (read-only + hydrated) | ✓ |
| **Offline reload via service worker** | ✓ |

Earlier full-surface audit (wf_670241f7): 207 checks · APIs (identical 401s, zero pending-post leak, payload rejection), trails + sunset override, content truth — all pass.

## Lighthouse (mobile emulation, production)

| Page | Perf | A11y | Best-practices | SEO |
|---|---|---|---|---|
| Landing `/` | 82 | 90 | 100 | 100 |
| City `/cities/phoenix/` | 69 (was 40 pre-preload) | 89 | 100 | 100 |
| Place `/cities/chicago/places/kasama/` | 74 | 85 | 100 | 100 |

City page: LCP 4.8s / TBT 150ms / FCP 4.2s after adding per-city hero AVIF preload.

## Budgets (build-enforced, every deploy)

- ✓ Every delivered image ≤ 120KB (hard build failure on regression)
- ✓ Verify gates green: data contract, provenance, computed-stat truth, ranking slot-1 invariant
- ✓ Single asset generation per deploy; missing assets 404; hashed bundles immutable-cached 1y

## WS7 SEO layer (shipped this phase)

- 2,171 static business pages `/cities/<slug>/places/<biz-slug>/` — LocalBusiness JSON-LD (typed per category), canonical, OG, deals, related-places crawl mesh, "open the full experience" CTA
- 30 prerendered city + wall shells (per-city title/meta/OG/canonical + TouristDestination JSON-LD + hero preload) — SPA boots identically
- robots.txt + 2,208-URL generated sitemap

## Open items (founder / post-launch)

- [ ] City-page perf 69: next levers are font loading (display=swap / self-host) and critical-CSS inlining — diminishing returns, not launch-blocking
- [ ] Live Stripe Payment Links → `public/pricing.json` (buttons read "Coming soon" until then)
- [ ] Affiliate IDs (booking/kayak/expedia/uber links carry REPLACE_WITH_YOUR_ID placeholders)
- [ ] Plausible domain (site-wide script deferred; self-owned beacon is live)
- [ ] Founder sign-off recorded for the 8 authored 250 Trails (production push 2026-07-16 stands as approval; TRAILS_REVIEW.md retained)

**Launch checklist status: signed off by build (all automated gates green). Founder countersign: ______**
