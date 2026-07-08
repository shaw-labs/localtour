// LocalTour engine — theme tokens + category vocabulary (ported verbatim from the
// inline apps; see docs/WS1_PORT_CONTRACTS.md). FT = Feed tokens, DARK/LIGHT = Classic.

export const DARK = {
  navy: "#0c1b2a", bg: "#0c1b2a", navyLight: "#152a3e", bgCard: "#152a3e",
  slate: "#1e3a52", fog: "#94a3b8", sand: "#f0ebe4", terra: "#dc2626",
  terraLight: "#ef4444", gold: "#d4a853", textDim: "#5a7080",
  accentGlow: "rgba(220,38,38,0.15)", border: "rgba(220,38,38,0.1)",
  cardBorder: "rgba(255,255,255,0.06)", r: 24, rl: 32, rp: 999,
  fd: "'Playfair Display',Georgia,serif", fb: "'DM Sans',sans-serif",
};

export const LIGHT = {
  navy: "#faf8f4", bg: "#faf8f4", navyLight: "#ffffff", bgCard: "#ffffff",
  slate: "#f0f4f8", fog: "#718096", sand: "#0c1b2a", terra: "#dc2626",
  terraLight: "#b91c1c", gold: "#b8860b", textDim: "#a0aec0",
  accentGlow: "rgba(220,38,38,0.08)", border: "#e2e8f0", cardBorder: "#e2e8f0",
  r: 24, rl: 32, rp: 999,
  fd: "'Playfair Display',Georgia,serif", fb: "'DM Sans',sans-serif",
};

export const FT = {
  bg: "#0a0a0b", surf: "#111113", line: "#1c1a17", ink: "#f5f2ec",
  inkMid: "#a09a90", inkDim: "#5a554d", inkFaint: "#3a342d",
  red: "#b3131f", redLight: "#e54b3c", gold: "#c89b3c", teal: "#00e5cc",
  leather: "#2a1a0c", leatherMid: "#3d2817", leatherInk: "#e8dfd0",
  leatherGold: "#c9a878", green: "#4ade80",
  fd: "'Fraunces',Georgia,serif", fb: "'DM Sans',sans-serif",
  fm: "'IBM Plex Mono',monospace",
};

export const CAT_LABELS = {
  dining: "🍽️ Dining", bars_nightlife: "🍸 Bars & Nightlife", bars: "🍸 Bars",
  coffee_bakeries: "☕ Coffee & Bakeries", coffee: "☕ Coffee",
  attractions: "🏛️ Attractions", outdoor_adventure: "🌿 Outdoor", outdoor: "🌿 Outdoor",
  entertainment: "🎭 Entertainment", shopping: "🛍️ Shopping", lodging: "🏨 Where to Stay",
  wellness_spa: "💆 Wellness", wellness: "💆 Wellness", services: "📍 Services",
  boating_water: "⛵ Boating", boating: "⛵ Boating", side_trip: "🚗 Side Trips",
};

export const CAT_LABELS_PLAIN = {
  dining: "Dining", bars_nightlife: "Bars & Nightlife", bars: "Bars & Nightlife",
  coffee_bakeries: "Coffee & Bakeries", coffee: "Coffee & Bakeries",
  attractions: "Attractions", outdoor_adventure: "Outdoor & Lakefront",
  outdoor: "Outdoor & Lakefront", entertainment: "Entertainment", shopping: "Shopping",
  lodging: "Where to Stay", wellness_spa: "Wellness", wellness: "Wellness",
  services: "Services", boating_water: "Boating", boating: "Boating",
  side_trip: "Side Trips",
};

// Classic view's plain label set (CAT_LABELS_R in the inline apps).
export const CAT_LABELS_R = {
  dining: "Dining", bars_nightlife: "Bars & Nightlife", bars: "Bars",
  coffee_bakeries: "Coffee & Bakeries", coffee: "Coffee",
  attractions: "Attractions", outdoor_adventure: "Outdoor", outdoor: "Outdoor",
  entertainment: "Entertainment", shopping: "Shopping", lodging: "Where to Stay",
  wellness_spa: "Wellness", wellness: "Wellness", services: "Services",
  boating_water: "Boating", boating: "Boating", side_trip: "Side Trips",
};

export const CAT_KICKERS = {
  dining: "Dining", bars: "Nightlife", bars_nightlife: "Nightlife",
  coffee: "Morning", coffee_bakeries: "Morning", attractions: "See",
  outdoor: "Lakefront", outdoor_adventure: "Lakefront", entertainment: "Do",
  shopping: "Browse", lodging: "Stay", wellness: "Reset", wellness_spa: "Reset",
  services: "Essentials",
};

// Engine display order — includes legacy aliases (on-disk vocabulary is preserved).
export const CAT_ORDER_ENGINE = [
  "dining", "bars_nightlife", "bars", "coffee_bakeries", "coffee",
  "entertainment", "attractions", "outdoor_adventure", "outdoor",
  "boating_water", "boating", "shopping", "lodging",
  "wellness_spa", "wellness", "services", "side_trip",
];

/** Classic view's cinematic-break rotation (ported verbatim). */
export function buildBreakSchedule(allBreakImgs) {
  const breakTypes = ["parallax", "wipe", "offset", "cinematic"];
  return allBreakImgs.reduce((acc, img, i) => {
    const t = breakTypes[i % 4];
    if (t === "parallax" && allBreakImgs[i + 1]) {
      acc.push({ t, imgs: [img, allBreakImgs[(i + 1) % allBreakImgs.length]] });
    } else if (t === "wipe") {
      acc.push({ t, img, d: i % 2 ? "right" : "left" });
    } else if (t === "offset") {
      acc.push({ t, img, cap: "", s: i % 2 ? "left" : "right" });
    } else {
      acc.push({ t: "cinematic", img, cap: "" });
    }
    return acc;
  }, []);
}
