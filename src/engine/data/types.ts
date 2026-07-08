// LocalTour engine — typed data layer.
// Each city is a modular container of seven JSON files (the data contract,
// enforced by scripts/validate-cities.mjs in CI): config, directory, events,
// deals, concierge, planner, trails. Legacy and factory-built cities are
// indistinguishable to the engine (pack README, 2026-07-07).

export interface Business {
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  /** on-disk category vocabulary is preserved as-is — unify via canonicalCategory() */
  category: string;
  subcategory: string;
  price: string | null;
  /** rating as stored (string, e.g. "4.8") */
  rating: string | null;
  description: string;
  must_try: string | null;
  hours: string | null;
  /** seasonal-operation note ("Open Mar-Nov"); null when year-round */
  seasonal: string | null;
  modes: string[];
  /** legacy imports: false (hand-curated); factory output uses this liberally */
  needs_verification: boolean;
}

export interface Deal {
  id: string;
  business_name: string;
  category: string;
  offer_text: string;
  offer_type: string | null;
  /** "in_store" | "link" | "app" (+ one legacy "code" outlier) */
  redemption_type: string;
  /** empty until the merchant door (WS4) issues real codes — codeless by contract */
  redemption_value: string;
  /** "legacy-import" | factory provenance */
  source: string;
  is_exclusive: boolean;
  expires: string | null;
}

export interface EventItem {
  id: string;
  title: string;
  /** ISO date, ISO range ("A to B"), or "recurring: …" free text — WS2 parses + expires */
  date: string;
  time: string | null;
  location: string | null;
  address: string | null;
  description: string | null;
  category: string | null;
  mode: string | null;
  featured: boolean;
  pin_ticker: boolean;
  admission: string | null;
  website: string | null;
}

export interface ConciergeNode {
  keys: string[];
  text: string;
  /** exact directory names (cross-refs patched per MIGRATION_REPORT patch log) */
  businesses: string[];
  chips: string[];
}

export interface PlannerItem {
  title: string;
  note: string;
  /** exact directory name — pools are seeded drafts from real records only */
  business: string;
  website: string | null;
  duration: string | null;
}
export type PlannerPools = Record<string, PlannerItem[]>;

export interface TrailStop {
  /** exact directory name — verify fails the build if it doesn't resolve (WS8) */
  biz: string;
  note: string;
}
export interface Trail {
  id: string;
  title: string;
  hook: string;
  narrative: string;
  neighborhoods: string[];
  stops: TrailStop[];
}

export interface CityConfig {
  slug: string;
  name: string;
  state: string;
  region: string;
  tagline: string;
  description: string;
  coordinates: { lat: number; lng: number };
  timezone: string;
  population: number | null;
  nearest_major_city: string | null;
  modes: string[];
  /** honest flags — e.g. coupon_clipper stays false until WS4 ships */
  features: Record<string, boolean>;
  // identity, hero, nexus, nexus_grid, sponsors, transit, side_trips, concierge,
  // wall, images, _legacy — typed precisely as WS1 ports the consuming components.
  [key: string]: unknown;
}

export interface City {
  slug: string;
  config: CityConfig;
  directory: Business[];
  deals: Deal[];
  events: EventItem[];
  concierge: ConciergeNode[];
  planner: PlannerPools;
  trails: Trail[];
}
