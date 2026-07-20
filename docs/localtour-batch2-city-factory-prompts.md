# LocalTour City Intelligence Factory — Batch 2 Prompt Pack

**Cities:** Phoenix · Salt Lake City · Nashville · Kansas City · Denver · Austin · Portland
**Schema source:** `shaw-labs/localtour` → `cities/michigan-city/` (canonical reference package, pulled July 2026)
**Engine:** React 19 + TS + Vite, config-driven. Each city = **7 JSON files** + images, dropped into `cities/{slug}/`.
**Pack version:** v2 (July 2026) — adds `trails.json` (the America 250 layer), the deals/coupon firewall, image budgets, and the shared repo validator. The 8 legacy cities have been migrated to this same container format (`cities-modular/` in this repo) — use any of them as additional schema examples alongside `michigan-city`.

---

## How to run

1. **One city per session.** Open a fresh Claude session (Max plan, **web search ON**). Paste **PROMPT A** + that city's **CITY BLOCK** from the bottom of this doc.
2. When the six JSONs are delivered, paste **PROMPT B** (images) in the same session.
3. Paste **PROMPT C** (validate + package). Download the zip.
4. Optionally run **PROMPT D** (freshness spot-audit) before deploying.
5. Drop `cities/{slug}/` into the engine and register the city in the CITIES array (slug, name, state, tagline) per the current production build.
6. **Authoritative gate:** run `node scripts/validate-cities.mjs <data-root> {slug}` from the repo. Prompt C's in-session check is a pre-flight; the repo validator is the contract. Nothing deploys on a FAIL.

If running in **Claude Code** instead: point it at the repo, tell it to read `cities/michigan-city/*.json` as the schema reference, and skip the schema section of Prompt A.

**Suggested build order (affiliate strength):** Nashville → Denver → Phoenix → Austin → Salt Lake City → Portland → Kansas City.

---

## PROMPT A — City Research & Data Build

```
You are the LocalTour City Intelligence Factory. Your job: research one US city and produce a complete, deploy-ready data package for the LocalTour engine — six JSON files matching the exact schema below. LocalTour is a curated city decision engine (SH@W Labs): business directory, keyword-tree AI concierge, events, deals, and a trip planner.

CITY ASSIGNMENT:
{{PASTE CITY BLOCK HERE}}

== NON-NEGOTIABLE RULES ==
1. REAL DATA ONLY. Use web search extensively. Every business, event, and deal must be a real, currently operating entity you verified in 2026. Real addresses, real phone numbers, real websites (prefer official sites). Never invent or approximate. If you cannot confirm a detail, set "needs_verification": true and leave the field null — never guess.
2. THRESHOLDS (hard minimums): ≥80 directory businesses · ≥10 events · ≥8 deals · ≥20 concierge nodes · ≥5 items in every planner pool · all 4 seasonal hero descriptions.
3. NEXUS DOCTRINE:
   - The nexus (the city's primary monetizable cluster, defined in the city block) is NEVER named in the tagline or page identity. The city is always the brand.
   - Nexus-related content stays between 15–25% of total content.
   - No single business brand may dominate ("brand contamination") — spread nexus coverage across ≥6 distinct businesses.
   - Free anchors must interleave with paid/affiliate touchpoints at ≥1:1 ratio.
   - Affiliate-leaning copy uses soft language ("Check rates", "See availability"), never hard sells.
4. VOICE: All descriptions are written in the concierge persona's voice — a knowing local, specific and warm, never brochure-speak. "must_try" fields name actual dishes/experiences.
5. CATEGORY SPREAD (directory guidance): ~35% dining, ~15% bars/coffee, ~25% activities/attractions, ~10% shopping, ~10% lodging, ~5% services/other. Use lowercase category values consistent with the reference (e.g. "dining", "nightlife", "outdoors", "shopping", "lodging", "attraction", "coffee").
6. CROSS-REFERENCES: Every name in a concierge node's "businesses" array and every planner "business" field MUST exactly match a "name" in directory.json. Deals reference real, publicly advertised offers only (source: "aggregated"); never fabricate exclusives.
   FIREWALL: factory deals ship CODELESS — never emit "code" or "merchant_id" fields. Trackable LT-coded coupons exist only through the merchant door, where a business has actually signed up and agreed to honor the offer.
7. EVENTS: Real events dated within the next 6 months where possible, plus recurring series (weekly markets, concert series). ISO dates. Mark 2–3 as "featured": true.
8. OUTPUT: Seven separate fenced JSON blocks in this order — config, directory, events, deals, concierge, planner, trails. Strictly valid JSON (no trailing commas, no comments). ASCII-safe strings.

== EXACT SCHEMA (mirror precisely — same keys, same types) ==

config.json — single object:
{
  "slug", "name", "state", "region", "tagline", "description",
  "coordinates": {"lat", "lng"}, "timezone", "population", "nearest_major_city",
  "domain_legacy",
  "identity": {"known_for", "vibe", "best_season", "visitor_type"},
  "hero": {"summer", "fall", "winter", "spring"},        // one evocative sentence each
  "nexus": {"type", "anchor", "anchor_url", "radius", "services", "affiliate_density", "description"},
  "nexus_grid": [6 × {"id", "title", "icon", "description"}],
  "sponsors": {"anchor", "categories", "album_sponsors"},
  "modes": [7 × {"id", "label", "icon", "description", "tags"}],   // include "chill", "foodie", "romantic" + 4 city-appropriate
  "transit": {"from_nearest_hub", "local_transport"},
  "side_trips": [{"name", "distance", "pitch", "highlights"}],
  "concierge": {"name", "greeting", "personality", "sign_off"},
  "wall": {"albums"},
  "features": {"concierge": true, "wall": true, "trip_planner": true, "coupon_clipper": true, "event_ticker": true, "seasonal_hero": true},
  "images": {}   // leave empty; filled by the image pass
}

directory.json — array of ≥80 objects:
{"name", "address", "phone", "website", "category", "subcategory", "price",
 "rating", "description", "must_try", "hours", "seasonal", "modes": [], "needs_verification": false}

events.json — array of ≥10 objects:
{"id", "title", "date", "time", "location", "address", "description",
 "category", "mode", "featured", "pin_ticker", "admission", "website"}

deals.json — array of ≥8 objects:
{"id", "business_name", "category", "offer_text", "offer_type",
 "redemption_type", "redemption_value", "source", "is_exclusive", "expires"}

concierge.json — array of ≥20 objects:
{"keys": [], "text", "businesses": [], "chips": []}
- Node 1 MUST be the greeting/menu node: keys include ["hello","hi","hey","start","help","menu"], businesses empty, chips = the 8 main menu options.
- Cover at minimum: where to eat (by vibe + budget), coffee, bars/nightlife, the nexus experience, top free things, outdoors, family, rainy/hot-day fallback, where to stay, each major side trip, getting around, seasonal question, and a graceful fallback node.

planner.json — single object with EXACTLY these 12 pool keys (do not rename them; adapt the CONTENT to the city — e.g. for a desert city, "beach_lake_outdoor" holds pools, rivers, and trail mornings):
morning_starts, beach_lake_outdoor, culture_history, shopping_browsing, casual_lunch,
happy_hour_drinks, dinner_casual, dinner_upscale, dinner_romantic, nightlife,
family_activities, rainy_day
— each pool: ≥5 × {"title", "note", "business", "website", "duration"}

trails.json — array with EXACTLY ONE flagship trail this batch (framework supports more later):
{"id": "250-trail-{slug}", "title", "hook",            // one-line hook
 "narrative",                                            // 150–250 words, persona voice
 "neighborhoods": [], "stops": [6–9 × {"biz", "note"}]}
- This is the America 250 layer: a walkable/drivable arc through the city's cultural DNA — the neighborhoods, foodways, music, and communities that built it. Start from the trail_seed in the city block.
- Every "biz" MUST exactly match a "name" in directory.json (add the venue to the directory first if it belongs).
- Every historical claim in the narrative must be verifiable via your research; when uncertain, say less. Proud, warm, specific — zero clip-art patriotism, zero politics, zero cynicism.

== PROCESS ==
Step 1: Research pass — search broadly (best-of lists, local press, official tourism sites, recent 2025–2026 sources). Build the business long-list, then verify each keeper is open.
Step 2: Draft config.json and get the persona voice locked.
Step 3: Produce directory → events → deals → concierge → planner → trails, in that order, cross-referencing as you go (author the trail last, once the directory is final).
Step 4: Self-check against every rule and threshold above, then output the six JSON blocks.
```

---

## PROMPT B — Image Set (same session)

```
Now produce the image plan and images for this city package. Rules:

1. ORIGINAL IMAGES ONLY. Generate every image — never scrape, reproduce, or imitate photographs, logos, or copyrighted works. Stylized/painterly city imagery, no readable brand marks, no recognizable people.
2. Required set (filenames exactly):
   - hero-aerial.jpg — signature establishing view
   - seasonal-summer.jpg, seasonal-fall.jpg, seasonal-winter.jpg, seasonal-spring.jpg
   - 3+ atmosphere shots keyed to the city's identity (e.g. history-*, district-*, texture-*)
   - Optional: one card image per nexus_grid tile (nexus-{id}.jpg)
3. First output a TIER LIST: for each filename, a one-line art direction (subject, light, mood, season). Wait for my approval or proceed if I say "go".
4. BUDGET: images will pass through the engine's optimization pipeline (AVIF/WebP + srcset), but do not import problems — keep each source file reasonable (≤400KB) and expect a delivered budget of ≤120KB at the largest breakpoint. No 2MB heroes.
5. After generating, output the final config "images" object mapping every filename, ready to paste into config.json.
```

---

## PROMPT C — Validate & Package (same session)

```
Run this validation against the seven JSONs you produced. Fix every failure and re-run until PASS, then package cities/{slug}/ (seven JSONs + images/ folder) as a downloadable zip. Final authority after drop-in: `node scripts/validate-cities.mjs <data-root> {slug}` in the repo.

import json, sys
slug = "{{SLUG}}"; base = f"cities/{slug}"; errs = []
load = lambda n: json.load(open(f"{base}/{n}.json"))
cfg, dr, ev, de, cz, pl, tr = [load(n) for n in ["config","directory","events","deals","concierge","planner","trails"]]
if len(dr) < 80: errs.append(f"directory {len(dr)}<80")
if len(ev) < 10: errs.append(f"events {len(ev)}<10")
if len(de) < 8:  errs.append(f"deals {len(de)}<8")
if len(cz) < 20: errs.append(f"concierge {len(cz)}<20")
POOLS = ["morning_starts","beach_lake_outdoor","culture_history","shopping_browsing",
         "casual_lunch","happy_hour_drinks","dinner_casual","dinner_upscale",
         "dinner_romantic","nightlife","family_activities","rainy_day"]
for p in POOLS:
    if p not in pl: errs.append(f"planner missing pool {p}")
    elif len(pl[p]) < 5: errs.append(f"planner {p} {len(pl[p])}<5")
for k in ["summer","fall","winter","spring"]:
    if k not in cfg.get("hero", {}): errs.append(f"hero missing {k}")
names = {b["name"] for b in dr}
for node in cz:
    for b in node.get("businesses", []):
        if b not in names: errs.append(f"concierge refs unknown business: {b}")
for pool in POOLS:
    for item in pl.get(pool, []):
        if item.get("business") and item["business"] not in names:
            errs.append(f"planner refs unknown business: {item['business']}")
if len(tr) != 1: errs.append(f"trails {len(tr)}!=1 (exactly one flagship 250 Trail this batch)")
for t_ in tr:
    if not (6 <= len(t_.get("stops", [])) <= 9): errs.append(f"trail {t_.get('id','?')} stops out of range 6-9")
    for s in t_.get("stops", []):
        if s.get("biz") not in names: errs.append(f"trail refs unknown business: {s.get('biz')}")
    w = len((t_.get("narrative") or "").split())
    if not (150 <= w <= 250): errs.append(f"trail narrative {w} words (need 150-250)")
    for d_ in de:
        if "code" in d_ or "merchant_id" in d_: errs.append("deal carries code/merchant_id — factory deals must be codeless")
g = cz[0]["keys"]
if not any(k in g for k in ["hello","hi","start","menu"]): errs.append("node 1 is not the greeting/menu node")
req = {"name","address","category","price","description","modes"}
for b in dr:
    if req - set(b): errs.append(f"{b.get('name','?')} missing {req - set(b)}"); break
nexus_ct = sum(1 for b in dr if cfg["nexus"]["type"].split("-")[0] in (b.get("subcategory") or "") or b.get("needs_verification") is None)
print("PASS" if not errs else "FAIL"); [print(" -", e) for e in errs]

Also report: category distribution %, count of needs_verification=true entries, and estimated nexus content ratio (target 15–25%).
```

---

## PROMPT D — Freshness Spot-Audit (optional, before deploy)

```
Take the attached directory.json for {{CITY}}. Randomly sample 15 businesses. For each, web-search current status (open/closed/moved, hours changed) using 2026 sources. Output a table: name | status | evidence URL | action (keep / update / remove / flag). If >2 of 15 fail, recommend a full-directory verification pass.
```

---

# CITY BLOCKS

Paste one block into Prompt A per session. Persona names are proposals — override at will.

---

## 1 · PHOENIX
```
slug: phoenix | name: Phoenix | state: Arizona | region: Desert Southwest
persona: "The Saguaro" — dry desert wit, decades in the Valley, gives sun-safety asides like a local dad.
nexus: type "resort-golf-cluster" — the Camelback Corridor / Biltmore resort-spa-golf belt (Scottsdale edge). High affiliate density: resort bookings, tee times, spa days.
orbits: Roosevelt Row arts district · Desert Botanical Garden & Papago Park · Camelback + South Mountain trails · Suns/Diamondbacks · the Mexican food scene (Barrio Café lineage).
side_trips: Sedona (2 hr) · Grand Canyon South Rim (3.5 hr) — both are affiliate day-tour goldmines.
seasonal: Winter/spring = peak (snowbirds; Cactus League spring training Feb–Mar is an events goldmine). Summer = flip the script: sunrise hikes, pool culture, indoor escapes; the concierge should own the heat honestly.
watch-outs: No single resort brand owns the page. Distinguish Phoenix proper from Scottsdale in copy.
trail_seed: "Calle 16 y La Mesa" — the 16th Street mural corridor and the Barrio Café lineage; Phoenix's Mexican-American food and art heritage from the barrios to the James Beard lists. Anchor stops in the murals, the classic taquerías, and the modern torchbearers.
```

## 2 · SALT LAKE CITY
```
slug: salt-lake-city | name: Salt Lake City | state: Utah | region: Mountain West
persona: "The Powder Hound" — first-chair energy, knows canyon traffic patterns by heart, gentle about altitude.
nexus: type "ski-canyon-cluster" — the Cottonwood Canyons (Snowbird, Alta, Brighton, Solitude). Affiliates: lift tickets, rentals, canyon lodging, ski shuttles.
orbits: Temple Square & downtown · Sugar House · craft dining/coffee scene · Antelope Island · University district.
side_trips: Park City (40 min) · Bonneville Salt Flats (1.5 hr).
seasonal: Winter = ski peak. Summer = canyon hiking, festivals, Antelope Island bison. Shoulder seasons get honest framing.
watch-outs: Balance all four canyon resorts — no single-resort contamination. Handle Utah liquor-law quirks accurately in bar/dining copy (locals will notice).
trail_seed: "Crossroads of the West" — the pioneer-to-present arc: Temple Square and This Is the Place heritage into today's surprisingly global State Street food scene (refugee- and immigrant-owned kitchens). The story is arrival, in every era.
```

## 3 · NASHVILLE
```
slug: nashville | name: Nashville | state: Tennessee | region: South
persona: "The Songwriter" — been playing writers' rounds for 20 years, warm, steers you past the tourist traps without snobbery.
nexus: type "music-district" — Lower Broadway honky-tonk district. Affiliates: show tickets, pedal taverns/party buses, hotels, studio tours.
orbits: East Nashville · The Gulch & 12South · Ryman + Grand Ole Opry · the hot chicken trail · Music Row.
side_trips: Franklin (30 min) · Leiper's Fork (45 min).
seasonal: CMA Fest (June) and summer = peak. Fall = songwriter festival season. December = Opryland lights.
watch-outs: District-level nexus — no single honky-tonk dominates. Serve the bachelorette economy without letting it define the city's identity; give locals' Nashville equal weight.
trail_seed: "Jefferson Street & the Writers' Rooms" — the historically Black R&B corridor (Jefferson Street's club legacy, the National Museum of African American Music) threaded with the songwriter tradition. Two Nashvilles, one trail.
```

## 4 · KANSAS CITY
```
slug: kansas-city | name: Kansas City | state: Missouri | region: Midwest
persona: "The Pitmaster" — talks in low-and-slow metaphors, fiercely evenhanded about burnt-end allegiances.
nexus: type "bbq-trail" — the BBQ circuit as an experience cluster (Joe's KC, Arthur Bryant's, Gates, Q39, LC's, Slap's) with Power & Light / Crossroads adjacency. Affiliates: BBQ & food tours, game tickets, hotels.
orbits: 18th & Vine jazz district · Nelson-Atkins Museum · National WWI Museum · City Market / River Market · Chiefs, Royals, Sporting KC.
side_trips: Lawrence KS (45 min) · Weston MO (40 min).
seasonal: Fall = Chiefs season energy. Summer = Boulevardia, ballpark nights. Spring = baseball + patio season.
watch-outs: Spread BBQ coverage across ≥6 joints — the fastest brand-contamination trap in the whole batch. Cover both the Missouri and Kansas sides.
trail_seed: "18th & Vine to the Pit" — the jazz district (American Jazz Museum, Negro Leagues Baseball Museum, the Mutual Musicians Foundation if verifiable) into the BBQ lineage born of the same neighborhoods. Smoke and swing, one story.
```

## 5 · DENVER
```
slug: denver | name: Denver | state: Colorado | region: Mountain West
persona: "The Trailhead" — basecamp energy, always knows the weather window, drops altitude-acclimation tips naturally.
nexus: type "excursion-gateway" — Red Rocks + front-range excursion cluster (mountain day tours, RMNP, ski shuttles). Affiliates: day tours, shuttles, concert-adjacent lodging, brewery tours.
orbits: RiNo street art & breweries · Union Station / LoDo · museums (DAM, Nature & Science) · Wash Park · Golden.
side_trips: Rocky Mountain NP / Estes Park (1.5 hr) · Idaho Springs (45 min).
seasonal: Summer = Red Rocks season (event ticker feast). Winter = ski-gateway framing. 300-days-of-sun is the through-line.
watch-outs: Denver is the basecamp, not just a waiting room — city content must equal or exceed mountain content or you're building a Colorado app, not a Denver one.
trail_seed: "Five Points: Harlem of the West" — Welton Street's jazz history and the neighborhood's living Black-owned businesses, arcing into RiNo's mural economy next door. Heritage and its newest chapter, four blocks apart.
```

## 6 · AUSTIN
```
slug: austin | name: Austin | state: Texas | region: Texas Hill Country
persona: "The Armadillo" — named for the Armadillo World Headquarters; keep-it-weird warmth, food-truck-line patience, zero pretension.
nexus: type "music-food-corridor" — the SoCo–Rainey–Red River live-music-and-food corridor. Affiliates: hotels, show tickets, paddle/boat rentals, food & Hill Country tours.
orbits: Barton Springs & Lady Bird Lake · the BBQ tier (Franklin, la Barbecue, Micklethwait) · Congress Bridge bats (the great free anchor) · East Austin murals & bars · Hill Country wineries.
side_trips: Lockhart BBQ pilgrimage (35 min) · Fredericksburg (1.5 hr).
seasonal: SXSW (March) and ACL (October) anchor the calendar. Summer = water-first framing (springs, lake, heat honesty).
watch-outs: The bats and Barton Springs are your free anchors — use them to hold the 1:1 free/paid interleave. Don't let the corridor read as Sixth Street party-bus content.
trail_seed: "East Side Standards" — East 11th/12th Street's Black and Mexican-American heritage (the Victory Grill's Chitlin' Circuit legacy if verifiable) into the Armadillo inheritance and today's East Austin. Keep-it-weird has roots.
```

## 7 · PORTLAND
```
slug: portland | name: Portland | state: Oregon | region: Pacific Northwest
persona: "The Regular" — has a counter seat at three cart pods, knows which roaster changed hands, dry PNW humor.
nexus: type "culinary-cluster" — food-cart pods + the brewery/coffee circuit. Affiliates: food tours, brewery tours, Willamette wine tours, Columbia Gorge tours, hotels.
orbits: Powell's & downtown · Forest Park + Japanese Garden · Hawthorne & Alberta arts districts · Portland Saturday Market · Willamette Valley wine country.
side_trips: Columbia Gorge / Multnomah Falls (45 min) · Cannon Beach (1.5 hr).
seasonal: Summer = the glorious dry season, peak everything. June = Rose Festival. The rainy_day planner pool is genuinely load-bearing here — make it the best one in the whole platform.
watch-outs: Cart pods churn fast — verify every single cart is currently operating (set needs_verification liberally). No single-roaster or single-brewery contamination.
trail_seed: "Pods & Portals" — Old Town Chinatown (Lan Su Chinese Garden, the Portland Chinatown Museum) into the immigrant foodways of the cart pods; the city's global kitchens, oldest to newest.
```

---

## After all 7 pass validation

- Register each city in the production engine's CITIES array (slug · name · state · tagline).
- Run PROMPT D freshness audit on any city built more than 2 weeks before deploy.
- Portfolio state after this batch: **15 native cities** + the Las Vegas → SlotGenie portal.
- Every native city — legacy 8 and batch-2 7 — lives in the identical 7-file container and answers to the same validator. That symmetry is the whole point.
