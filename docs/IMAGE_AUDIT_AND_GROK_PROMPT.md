# LocalTour — Image Audit & Grok Generation Prompt

## Audit summary (2026-07-09)

| Surface | Status |
|---|---|
| Legacy 8 cities (Chicago, Houston, LA, Miami, New Orleans, NYC, SF, Smoky Mtns) | ✅ fully imaged — no new images needed |
| Vegas portal hero (`hero-strip-night.jpg`) + all landing card heroes | ✅ present |
| 7 factory cities — **hero / seasonal / a few themed** shots | ✅ delivered (previous zip) |
| **7 factory cities — per-category business-card images** | ❌ **MISSING → this prompt** |

**Why it matters:** every business card (both Feed and Classic views) pulls one
representative photo per *category* (`config.images.categories[<category>]`). The
factory cities have that map empty, so all ~700 cards render color-gradient
placeholders. Filling the category images gives every card a real photo.

**What's needed:** 67 category images — one per category present in each city.
- Phoenix, Salt Lake City, Nashville, Denver → 10 each (all categories)
- Kansas City, Austin, Portland → 9 each (no wellness_spa)

---

## FOR GROK — read this whole block

Generate the images below as a set. **Deliver them zipped in this exact folder
structure and with these exact filenames** (same layout as the last batch, so they
drop straight into the site):

```
cities/
  phoenix/images/dir-dining.jpg
  phoenix/images/dir-bars_nightlife.jpg
  … (one per category listed under each city)
  salt-lake-city/images/dir-dining.jpg
  … etc.
```

### Art direction (apply to EVERY image)
- **Editorial travel photography**, documentary realism — like a great city guide or
  a Condé Nast Traveler spread. NOT illustration, NOT 3D render, NOT obviously AI.
- **Mood:** cinematic, warm, atmospheric, natural light (golden hour, blue hour, or
  soft interior light). These sit on a **near-black UI**, so images should have rich
  shadows and a focal glow — avoid flat, evenly-lit, or washed-out frames.
- **Content:** the scene/place/food itself is the subject. **No prominent human
  faces** (hands, silhouettes, distant/blurred people are fine). **No legible text,
  signage, logos, watermarks, or brand names.** No borders, no collage, no captions.
- **Authenticity:** each image must read as *that specific city* — use the local
  cues in each shot description. A Nashville dining shot is hot chicken, not generic
  plates; a Portland one is a cart pod, not a white-tablecloth room.
- **Consistency:** treat all 67 as one cohesive set — same grade, same photographic
  language, so a city's page feels art-directed, not stock-scraped.

### Technical specs
- **Aspect ratio 4:5 portrait** (e.g. **1280 × 1600 px**). Cards are portrait; the
  engine center-crops, so keep the subject centered with a little headroom.
- **Format:** JPG, high quality, target ≤ 400 KB each (matches the existing set).
- Filenames lowercase, exactly as listed (underscores preserved:
  `dir-bars_nightlife.jpg`, `dir-coffee_bakeries.jpg`, `dir-outdoor_adventure.jpg`,
  `dir-wellness_spa.jpg`).

### Category shot intent (baseline meaning of each `dir-*`)
- `dir-dining` — the city's defining sit-down food scene
- `dir-bars_nightlife` — a bar / cocktail / brewery / nightlife moment
- `dir-coffee_bakeries` — a café, roaster, or bakery counter
- `dir-attractions` — a signature museum / garden / landmark / arts district
- `dir-entertainment` — live music / theater / stadium / performance
- `dir-outdoor_adventure` — the local landscape / trail / water
- `dir-shopping` — an independent shop / market / retail district
- `dir-lodging` — a characterful hotel / resort exterior or lobby
- `dir-wellness_spa` — a spa / wellness / pool-deck calm
- `dir-services` — a useful-visitor service (bike rental, outfitter) — utilitarian but styled

---

## The shot list (67 images)

### cities/phoenix/images/  — Sonoran desert, Mexican food heritage, resort-golf corridor
- `dir-dining.jpg` — a Sonoran-Mexican plate (carne asada / street tacos) on a sunlit patio, saguaro-desert warmth
- `dir-bars_nightlife.jpg` — a dim craft-cocktail bar with desert-modern décor, amber glow
- `dir-coffee_bakeries.jpg` — an airy Phoenix café, concha/pan dulce on the counter, morning light
- `dir-attractions.jpg` — the Desert Botanical Garden / saguaro sculpture-garden at golden hour
- `dir-entertainment.jpg` — a downtown Phoenix music venue marquee glow at dusk (no legible text)
- `dir-outdoor_adventure.jpg` — Camelback Mountain trail at sunrise, red rock and desert
- `dir-shopping.jpg` — a Roosevelt Row / Melrose district independent storefront, mural-adjacent
- `dir-lodging.jpg` — a desert resort pool deck ringed by palms and mountains at dusk
- `dir-wellness_spa.jpg` — a serene desert spa courtyard, water feature, warm stone
- `dir-services.jpg` — a bike-rental / outfitter rack against desert-modern architecture

### cities/salt-lake-city/images/  — Wasatch canyons, global immigrant food, pioneer heritage
- `dir-dining.jpg` — a globally-inflected small-plates spread (immigrant-kitchen State Street energy), warm room
- `dir-bars_nightlife.jpg` — a moody SLC craft-cocktail bar, mountain-town intimacy
- `dir-coffee_bakeries.jpg` — a bright specialty coffee roaster, pour-over, pastry case
- `dir-attractions.jpg` — Temple Square / downtown SLC architecture with the Wasatch behind
- `dir-entertainment.jpg` — a historic SLC theater interior or marquee at night
- `dir-outdoor_adventure.jpg` — a Cottonwood Canyon aspen-and-granite trail (or fresh powder line)
- `dir-shopping.jpg` — a Sugar House / 9th & 9th independent boutique, mountain light
- `dir-lodging.jpg` — a canyon-adjacent lodge or downtown boutique hotel, alpine warmth
- `dir-wellness_spa.jpg` — a mountain spa with a soaking pool and pine views
- `dir-services.jpg` — a ski/bike gear-rental shop wall, boards and rentals racked

### cities/nashville/images/  — hot chicken, honky-tonk neon, songwriter tradition
- `dir-dining.jpg` — a plate of Nashville hot chicken with pickles on white bread, cast-iron warmth
- `dir-bars_nightlife.jpg` — a Lower Broadway honky-tonk interior glowing with neon (no legible signage)
- `dir-coffee_bakeries.jpg` — an East Nashville café, biscuits or pastries, morning light
- `dir-attractions.jpg` — the Ryman-style historic hall or the pedestrian riverfront skyline
- `dir-entertainment.jpg` — a dim music-club stage, guitar and a single spotlight, writers'-round mood
- `dir-outdoor_adventure.jpg` — a green Tennessee riverside greenway / Percy Warner overlook
- `dir-shopping.jpg` — a 12South / Hillsboro Village independent boutique or record shop
- `dir-lodging.jpg` — a characterful Nashville boutique-hotel lobby with Southern warmth
- `dir-wellness_spa.jpg` — a calm Southern spa treatment room, soft neutral tones
- `dir-services.jpg` — a bike-share / rental rack along the Cumberland riverfront

### cities/kansas-city/images/  — BBQ smoke, 18th & Vine jazz, fountains
- `dir-dining.jpg` — a KC burnt-ends BBQ tray, smoke ring and sauce, butcher-paper realism
- `dir-bars_nightlife.jpg` — a warm KC jazz-bar or speakeasy, low light, brass glow
- `dir-coffee_bakeries.jpg` — a Crossroads-district roaster, exposed brick, latte and pastry
- `dir-attractions.jpg` — the Nelson-Atkins shuttlecocks lawn or the WWI Museum tower at dusk
- `dir-entertainment.jpg` — an 18th & Vine jazz-club stage, upright bass in blue light
- `dir-outdoor_adventure.jpg` — a KC riverfront / Loose Park green-and-fountains scene
- `dir-shopping.jpg` — a City Market / River Market stall or Crossroads boutique
- `dir-lodging.jpg` — a restored downtown KC boutique hotel exterior, historic brick at blue hour
- `dir-services.jpg` — a bike-rental rack against a Crossroads mural wall

### cities/denver/images/  — Mountain West, RiNo murals & breweries, Red Rocks
- `dir-dining.jpg` — a Mountain-West New American plate (green-chile warmth) in a bright RiNo room
- `dir-bars_nightlife.jpg` — a RiNo brewery taproom, copper tanks and warm evening crowd-glow
- `dir-coffee_bakeries.jpg` — a Denver third-wave café, big windows, mountain daylight
- `dir-attractions.jpg` — Union Station's grand hall or the Denver Art Museum angles at dusk
- `dir-entertainment.jpg` — Red Rocks Amphitheatre at blue hour, stage-lit sandstone
- `dir-outdoor_adventure.jpg` — a Front Range foothills trail with the Rockies and 300-day sun
- `dir-shopping.jpg` — a RiNo / Larimer independent shop with a mural backdrop
- `dir-lodging.jpg` — a stylish LoDo boutique hotel exterior, brick and mountain light
- `dir-wellness_spa.jpg` — a mountain-modern spa, soaking tub, aspen calm
- `dir-services.jpg` — a ski/bike gear-rental shop, racks and racks of rentals

### cities/austin/images/  — BBQ, live music, Barton Springs, bats
- `dir-dining.jpg` — a Central Texas brisket board with butcher paper and pickles, smoke haze
- `dir-bars_nightlife.jpg` — a Rainey Street / East Austin bar patio strung with lights at dusk
- `dir-coffee_bakeries.jpg` — an East Austin café or kolache bakery, sunny and casual
- `dir-attractions.jpg` — the Congress Avenue bats emerging at dusk, or the Capitol through oaks
- `dir-entertainment.jpg` — a Red River live-music club stage, warm haze and one spotlight
- `dir-outdoor_adventure.jpg` — Barton Springs / Lady Bird Lake green water and cypress at golden hour
- `dir-shopping.jpg` — a SoCo / East Austin independent boutique or vintage shop, muralled
- `dir-lodging.jpg` — a design-forward Austin boutique hotel pool or exterior at dusk
- `dir-services.jpg` — a paddleboard / kayak rental dock on Lady Bird Lake

### cities/portland/images/  — cart pods, coffee & brewery circuit, Forest Park, PNW
- `dir-dining.jpg` — a Portland food-cart pod at blue hour, string lights and steam, PNW cozy
- `dir-bars_nightlife.jpg` — a Portland brewery / dive taproom, warm wood and taps
- `dir-coffee_bakeries.jpg` — a moody Portland third-wave roaster, pour-over ritual, rain-soft light
- `dir-attractions.jpg` — Lan Su Chinese Garden or the Japanese Garden in green mist
- `dir-entertainment.jpg` — a Portland music-venue interior, indie-club glow
- `dir-outdoor_adventure.jpg` — a Forest Park fern-and-fir trail in soft rain light (or Columbia Gorge falls)
- `dir-shopping.jpg` — a Hawthorne / Alberta indie shop or Powell's-style bookstore stack
- `dir-lodging.jpg` — a characterful Portland boutique hotel lobby, PNW plant-and-wood warmth
- `dir-services.jpg` — a bike shop / rental wall (very Portland), bikes racked

---

## When you bring the zip back
Drop it in and I'll: unzip into `cities/<slug>/images/`, extend `wire-images.mjs`
to map `config.images.categories = { dining: "dir-dining.jpg", … }` per city,
rebuild, and deploy. Every business card across the 7 factory cities goes from
gradient → real photo.

### Nice-to-have (optional, not blocking)
If you want the **Classic view's cinematic section-breaks** to also use photos in
the factory cities, add 3–4 wide landscape shots per city named
`break-<theme>.jpg` (16:9, ~1920×1080) — e.g. a skyline, a signature landscape,
a food-scene wide. Without them the breaks reuse the hero/story/seasonal images,
which already works.
