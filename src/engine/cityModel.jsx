// LocalTour engine — the city model: everything a view component may consume.
// adaptCity() maps a modular container (loader City) + optional editorial module
// into the flat model the inline apps used at module scope; components access it
// via useCityModel(). See docs/WS1_PORT_CONTRACTS.md.
import { createContext, useContext } from "react";
import { CAT_KICKERS, CAT_ORDER_ENGINE, buildBreakSchedule } from "./theme";

const CityModelContext = createContext(null);

export function CityModelProvider({ model, children }) {
  return <CityModelContext.Provider value={model}>{children}</CityModelContext.Provider>;
}

export function useCityModel() {
  const model = useContext(CityModelContext);
  if (!model) throw new Error("useCityModel outside <CityModelProvider>");
  return model;
}

function groupBy(a, fn) {
  return a.reduce((r, i) => {
    const k = fn(i);
    (r[k] = r[k] || []).push(i);
    return r;
  }, {});
}

const ratingNum = (b) => {
  const n = Number.parseFloat(b.rating ?? "");
  return Number.isFinite(n) ? n : 0;
};

/** No editorial module: derive picks honestly from data (top-rated, category-spread). */
function defaultPicks(directory, sortedCats, grouped) {
  const picks = [];
  for (const cat of sortedCats) {
    const top = [...grouped[cat]].sort((a, b) => ratingNum(b) - ratingNum(a)).slice(0, 3);
    picks.push(...top);
  }
  return picks.slice(0, 20);
}

/** No editorial module: a data-only storyboard — greeting, picks, deals, one event.
 *  No fabricated copy, no games, no BlackBook, no cross-promos (Principle 2). */
function defaultStoryboard(pickCount) {
  const items = [{ t: "line", text: null }]; // null text → FeedView renders concierge greeting
  for (let i = 0; i < pickCount; i++) {
    items.push({ t: "pick", i, kicker: null, imageKey: null }); // null kicker → CAT_KICKERS[category]
    if (i === 5) items.push({ t: "deal", i: 0 });
    if (i === 11) items.push({ t: "event", i: 0 });
    if (i === 14) items.push({ t: "deal", i: 1 });
  }
  return items;
}

export function adaptCity(city, editorial) {
  const { config, slug } = city;
  const IMG = (f) => (f ? `/cities/${slug}/images/${f}` : null);

  // Absolute per-city wall URL. The inline apps used a relative "wall.html"
  // (resolved against /cities/<slug>/index.html); under the engine's
  // /cities/:slug route a relative link breaks, so links come from here.
  const wallUrl = `/cities/${slug}/wall.html`;

  const CITY = {
    name: config.name,
    state: config.state,
    region: config.region ?? config.state,
    slug,
    tagline: config.tagline,
    description: config.description,
    vibe: config.identity?.vibe ?? "",
    concierge_name: config.concierge?.name ?? "",
    concierge_greeting: config.concierge?.greeting ?? "",
    hero_title: config._legacy?.hero_title ?? config.tagline,
    hero_sub: config._legacy?.hero_sub ?? config.description,
  };

  const images = config.images ?? {};
  const HERO = { title: CITY.hero_title, sub: CITY.hero_sub, image: images.hero ?? null };
  const STORY_IMAGES = images.story ?? [];
  const WALL_IMAGES = images.wall ?? [];
  const CAT_IMAGES = images.categories ?? {};
  const BREAKS = images.section_breaks ?? {};
  const NEXUS = config.nexus_grid ?? [];
  const MODES = config.modes ?? [];
  const TRANSIT = config.transit?._legacy_transit ?? [];
  const LOCAL_TRANSPORT = config.transit?.local_transport ?? null;
  // legacy components read t.dist — keep both spellings
  const SIDE_TRIPS = (config.side_trips ?? []).map((t) => ({ ...t, dist: t.distance }));

  const directory = city.directory;
  const deals = city.deals;
  const events = city.events;
  const nodes = city.concierge;

  const byName = Object.fromEntries(directory.map((b) => [b.name, b]));
  const grouped = groupBy(directory, (b) => b.category);
  const sortedCats = Object.keys(grouped).sort((a, b) => {
    const ai = CAT_ORDER_ENGINE.indexOf(a),
      bi = CAT_ORDER_ENGINE.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const picks = editorial?.picks
    ? editorial.picks.map((n) => byName[n]).filter(Boolean)
    : defaultPicks(directory, sortedCats, grouped);
  const storyboard = editorial?.storyboard ?? defaultStoryboard(picks.length);

  // The raw flat break-image list (what the inline apps called breakImgsR) — kept
  // alongside the schedule because buildBreakSchedule can drop a trailing image.
  const breakImgsFlat = [
    ...Object.values(BREAKS),
    ...STORY_IMAGES,
    ...Object.values(CAT_IMAGES),
  ].filter(Boolean);
  const breakSchedule = buildBreakSchedule(breakImgsFlat);

  // City literals the Feed falls back to — data-derived when no editorial module
  // exists, so factory cities never render another city's literals.
  const fmtCoords = (c) =>
    c && typeof c.lat === "number" && typeof c.lng === "number"
      ? `${Math.abs(c.lat).toFixed(4)}°${c.lat >= 0 ? "N" : "S"} · ${Math.abs(c.lng).toFixed(4)}°${c.lng >= 0 ? "E" : "W"}`
      : null;
  const defaults = {
    author:
      editorial?.defaults?.author ??
      ((config.concierge?.name ?? "").toLowerCase() || "the concierge"),
    neighborhood: editorial?.defaults?.neighborhood ?? null,
    coords: editorial?.defaults?.coords ?? fmtCoords(config.coordinates),
  };

  return {
    slug,
    CITY,
    wallUrl,
    IMG,
    HERO,
    STORY_IMAGES,
    WALL_IMAGES,
    CAT_IMAGES,
    BREAKS,
    NEXUS,
    MODES,
    TRANSIT,
    LOCAL_TRANSPORT,
    SIDE_TRIPS,
    directory,
    deals,
    events,
    nodes,
    byName,
    grouped,
    sortedCats,
    picks,
    storyboard,
    breakSchedule,
    breakImgsFlat,
    defaults,
    editorial: editorial ?? null,
    CAT_KICKERS,
    planner: city.planner,
    trails: city.trails,
    features: config.features ?? {},
  };
}
