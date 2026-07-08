# WS1 Port Contracts

The rules every porter follows. Source of truth being ported: the inline app in
`/Users/aaronshaw/Desktop/3ok 3/localtour.directory/cities/chicago/index.html`
(3,143 lines; audit-verified 94–97% identical across all 8 cities — chicago is the
reference; per-city differences are editorial content, extracted separately).

## File ownership (disjoint — porters never touch each other's files)

| Owner | Writes |
|---|---|
| css-extract | `src/engine/styles/engine.css` (replaces placeholder), `src/engine/imgFallback.js` |
| feed-port | `src/engine/views/feed/*.jsx` (replaces stub `FeedView.jsx`) |
| classic-port | `src/engine/views/classic/*.jsx` (replaces stub `ClassicView.jsx`) |
| editorial-\<slug\> ×8 | `src/engine/editorial/<slug>.jsx` |
| assembler (main session) | everything else; runs builds — **porters never run npm** |

## Foundation (already written — import, don't redefine)

- `src/engine/theme.js` — `DARK, LIGHT, FT, CAT_LABELS, CAT_LABELS_PLAIN, CAT_LABELS_R, CAT_KICKERS, CAT_ORDER_ENGINE, buildBreakSchedule`
- `src/engine/hooks.jsx` — `useScrollReveal, useScrollProgress, useParallax, Reveal`
- `src/engine/cityModel.jsx` — `useCityModel()` returns the model (below); `adaptCity`
- `src/engine/CityApp.jsx` — toggle + view switch (owns `lt_view` in localStorage), renders `FeedView` / `ClassicView` with the legacy props

## The model (`useCityModel()`)

`slug, CITY {name,state,slug,tagline,description,vibe,concierge_name,concierge_greeting,hero_title,hero_sub},
IMG(f)→"/cities/<slug>/images/<f>", HERO {title,sub,image}, STORY_IMAGES, WALL_IMAGES,
CAT_IMAGES, BREAKS, NEXUS (ex-CITY_META.nexus → config.nexus_grid), MODES, TRANSIT
(ex _legacy_transit: [{icon,label,text}]), LOCAL_TRANSPORT, SIDE_TRIPS (each has BOTH
.distance and legacy .dist), directory, deals, events, nodes, byName, grouped,
sortedCats, picks (resolved Business[]), storyboard, breakSchedule, editorial|null,
CAT_KICKERS, planner, trails, features`

Directory/deals/events records use the modular full-name fields, which match what the
inline adapter produced (`name,address,category,subcategory,price,rating,description,
must_try,hours,website,phone,seasonal,modes`; deals `business_name,category,offer_text,
redemption_type,redemption_value,is_exclusive,expires`; events `title,date,featured` + nullable extras).

## Porting rules

1. **Transplant, don't rewrite.** Copy the JSX verbatim as `.jsx` (brief §4 allows JSX-first).
   Change ONLY: (a) module-scope data references → `const { CITY, byName, grouped, … } = useCityModel()`
   at the top of each component; (b) `React.useState` destructures → `import { useState, useEffect, useRef, useMemo } from "react"`;
   (c) theme/hook references → imports from `../../theme` and `../../hooks`; (d) `IMG(...)` comes from the model.
2. **Preserve every string of copy, every inline style, every class name.** Voice is the moat (Principle 5).
3. **No fabrication.** Never invent copy, venues, or numbers. If something is unclear, note it in your return.
4. **One export per file where natural**; `FeedView.jsx` / `ClassicView.jsx` remain the default-export entry points with the exact prop signatures the stubs have.
5. **Never run npm / never build** — the assembler does. Your deliverable is files + a structured report.
6. React 19: no `React.` global — import hooks. `ReactDOM`/`createRoot` never appears (CityApp owns mounting).

## FeedView must render the storyboard (not a hardcoded sequence)

`model.storyboard` is an ordered array of items; render each:

| item | render |
|---|---|
| `{t:"line", text}` | `FeedConciergeLine` — `text ?? CITY.concierge_greeting` |
| `{t:"pick", i, kicker, imageKey, override?}` | `FeedBusinessCard` with `biz=picks[i]` (skip if missing); `kicker ?? CAT_KICKERS[biz.category]` |
| `{t:"game"}` | `FeedGameCard` with `editorial.game.card` + `editorial.game.Game` (skip whole item if no editorial) |
| `{t:"game2"}` | coming-soon `FeedGameCard` (`editorial.game.comingSoon`, `GameComponent={null}`) |
| `{t:"blackbook", variant, name, neighborhood, preview?, venueFromPick?, venueFallback?, date?}` | `FeedBlackBookCard`; `venue = picks[venueFromPick]?.name ?? venueFallback` |
| `{t:"shaw", property, tagline, age, body, cta}` | `FeedShawCard` |
| `{t:"deal", i}` | `FeedPromotedCard` with `topDeals[i]` (skip if missing) |
| `{t:"event", i}` | `FeedEventCard` with `upcomingEvents[i]` (skip if missing) |

`topDeals = deals.filter(d => byName[d.business_name]).slice(0,3)`;
`upcomingEvents = events.filter(e => e.featured).slice(0,3)` — exactly as the inline app.
After the storyboard: wall, directory header, `FeedDirectorySection` per cat, transit,
side trips, footer, FAB + concierge modal — verbatim from the inline `FeedView`.

## Editorial module shape (`src/engine/editorial/<slug>.jsx`)

```jsx
import { FT } from "../theme";           // if the Game art needs tokens
// verbatim per-city game component, renamed Game (was DeepDishDash / TacoTruckRush / …)
function Game({ onClose }) { /* transplanted exactly */ }
export default {
  slug: "chicago",
  picks: ["Alinea", /* …exact PICKS names from this city's index.html… */],
  game: { card: { title: "Deep Dish Dash", tagline: "Twenty seconds. Tap fast. A palate cleanser." },
          Game,
          comingSoon: { title: "El Platform", tagline: "Dodge the doors. Catch the train. Thirty seconds." } },
  defaults: { neighborhood: "Loop", author: "the dispatcher" },  // city literals found inline
  storyboard: [ /* the city's exact FeedView sequence, transcribed item by item */ ],
};
```

Transcribe the storyboard EXACTLY from that city's `FeedView` (order, kickers,
imageKeys, override bodies, BlackBook/Shaw copy, deal/event slot positions). The
copy must be byte-faithful — it is editorial voice.

## Known cross-city divergences (audit)

- houston + new-york-city lack the `rdProbeBackgrounds` pre-boot block — the engine
  standardizes ON (css-extract ports it once for everyone, as `imgFallback.js` with
  `installImgFallback()` invoked by the app shell).
- Legacy category aliases (`bars, coffee, outdoor, wellness`, miami/SF `boating_water`)
  appear in `sortedCats` — CAT_* maps already cover both vocabularies. Do not normalize.
- The Feed's `imageKey` values are per-city photo-seed strings — transcribe as found.
