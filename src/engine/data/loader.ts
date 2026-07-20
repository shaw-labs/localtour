/// <reference types="vite/client" />
// LocalTour engine — data loader.
// Consumes the modular city containers in cities-modular/ directly (the data
// contract). No transformation happens on load; category unification is an
// explicit, deliberate display-side helper (canonicalCategory), per the
// migration report: "preserved as-is; unify deliberately, not silently."
import type {
  Business,
  City,
  CityConfig,
  ConciergeNode,
  Deal,
  EventItem,
  PlannerPools,
  Trail,
} from "./types";

/** Legacy → canonical category map (migration report vocabulary table). */
export const CATEGORY_CANONICAL: Partial<Record<string, string>> = {
  bars: "bars_nightlife",
  coffee: "coffee_bakeries",
  outdoor: "outdoor_adventure",
  wellness: "wellness_spa",
  boating: "boating_water",
};

/** Canonical display order — the inline engines' CAT_ORDER with legacy aliases collapsed. */
export const CAT_ORDER: readonly string[] = [
  "dining",
  "bars_nightlife",
  "coffee_bakeries",
  "entertainment",
  "attractions",
  "outdoor_adventure",
  "boating_water",
  "shopping",
  "lodging",
  "wellness_spa",
  "services",
  "side_trip",
];

export function canonicalCategory(category: string): string {
  return CATEGORY_CANONICAL[category] ?? category;
}

/* ── City loading (Vite) ─────────────────────────────────────────────────── */

const files = import.meta.glob<unknown>("../../../cities-modular/*/*.json", {
  import: "default",
});

const fileKey = (slug: string, name: string) => `../../../cities-modular/${slug}/${name}.json`;

/** Slugs discovered from disk (cities/michigan-city stays a schema fixture — different tree). */
export const CITY_SLUGS: string[] = [
  ...new Set(
    Object.keys(files)
      .map((k) => k.split("/").slice(-2, -1)[0] ?? "")
      .filter(Boolean),
  ),
].sort();

async function load<T>(slug: string, name: string): Promise<T> {
  const mod = files[fileKey(slug, name)];
  if (!mod) throw new Error(`cities-modular/${slug}/${name}.json missing`);
  return (await mod()) as T;
}

export async function loadCity(slug: string): Promise<City> {
  const [config, directory, deals, events, concierge, planner, trails] = await Promise.all([
    load<CityConfig>(slug, "config"),
    load<Business[]>(slug, "directory"),
    load<Deal[]>(slug, "deals"),
    load<EventItem[]>(slug, "events"),
    load<ConciergeNode[]>(slug, "concierge"),
    load<PlannerPools>(slug, "planner"),
    load<Trail[]>(slug, "trails"),
  ]);
  return { slug, config, directory, deals, events, concierge, planner, trails };
}

/* ── Selectors (ported from the inline engines' adapter layer) ───────────── */

/** The engine's key selector: resolve editorial name references to records. */
export function byName(city: City): Record<string, Business> {
  return Object.fromEntries(city.directory.map((b) => [b.name, b]));
}

/** Group by CANONICAL category (deliberate unification point). */
export function grouped(city: City): Map<string, Business[]> {
  const out = new Map<string, Business[]>();
  for (const b of city.directory) {
    const cat = canonicalCategory(b.category);
    const bucket = out.get(cat);
    if (bucket) bucket.push(b);
    else out.set(cat, [b]);
  }
  return out;
}

export function sortedCats(city: City, order: readonly string[] = CAT_ORDER): string[] {
  const present = grouped(city);
  const inOrder = order.filter((c) => present.has(c));
  const stragglers = [...present.keys()].filter((c) => !order.includes(c));
  return [...inOrder, ...stragglers];
}

export function filterByMode(businesses: readonly Business[], mode: string): Business[] {
  return businesses.filter((b) => b.modes.includes(mode));
}
