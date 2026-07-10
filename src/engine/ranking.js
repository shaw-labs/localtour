// LocalTour engine — merchant tier ranking (WS4).
//
// Principle 6: promotions earn a *small, bounded* nudge inside a category — never
// a takeover. A merchant who pays for placement can float up among items of equal
// or lower organic quality, but a genuinely better-rated (strictly higher) place
// can never be pushed out of the top slot by money. Trust first, revenue second.
//
// Tiers: "anchor" (marquee sponsor) outranks "partner" (paid placement) outranks
// null (organic). Assignments live in data/promotions.json, keyed by citySlug ->
// exact business name -> tier string.

/**
 * tierOf(citySlug, bizName, promotions) -> "partner" | "anchor" | null
 * Looks up a single business's paid tier. Defensive against missing city maps,
 * missing names, and malformed values (anything not "partner"/"anchor" -> null).
 */
export function tierOf(citySlug, bizName, promotions) {
  if (!citySlug || !bizName || !promotions || typeof promotions !== "object") return null;
  const city = promotions[citySlug];
  if (!city || typeof city !== "object") return null;
  const tier = city[bizName];
  return tier === "partner" || tier === "anchor" ? tier : null;
}

// Numeric weight for a tier: anchor beats partner beats organic. Ratings still
// win first; this only ever breaks ties between equally-rated items.
function tierWeight(tier) {
  return tier === "anchor" ? 2 : tier === "partner" ? 1 : 0;
}

// Coerce a possibly-missing/garbage rating to a number; missing -> 0.
function ratingOf(biz) {
  const r = Number(biz && biz.rating);
  return Number.isFinite(r) ? r : 0;
}

/**
 * applyTierBoost(businesses, citySlug, promotions) -> new reordered array
 *
 * Pure: never mutates the input array or its business objects. Returns a NEW
 * array of the same object references in a new order, for a single category.
 *
 * Rules (Principle 6 — bounded nudge):
 *  1. Slot 1 is pinned to the organically best-rated item (tier-blind; on a
 *     rating tie the earliest item in input order keeps it). Because slot 1 is
 *     the rating maximum, an item with a strictly higher organic rating can
 *     NEVER be displaced from slot 1 by a promotion.
 *  2. Among the remaining items: sort by organic rating (descending) FIRST, so a
 *     promoted item can never leapfrog a strictly higher-rated one. Only when
 *     ratings are equal does the paid tier break the tie — promoted ahead of
 *     non-promoted, anchor ahead of partner. Otherwise original order is kept
 *     (stable), so the reorder stays a small nudge, not a reshuffle.
 *
 *  Missing ratings are treated as 0 (so an all-unrated category still lets
 *  promoted items float above equally-unrated organic ones without displacing
 *  the organic incumbent in slot 1).
 */
export function applyTierBoost(businesses, citySlug, promotions) {
  if (!Array.isArray(businesses)) return [];
  if (businesses.length <= 1) return businesses.slice();

  // Decorate once: original index (for stable ordering), rating, tier weight.
  const items = businesses.map((biz, i) => ({
    biz,
    i,
    rating: ratingOf(biz),
    weight: tierWeight(tierOf(citySlug, biz && biz.name, promotions)),
  }));

  // Slot 1 = organically best-rated item; earliest index wins a rating tie.
  let bestIdx = 0;
  for (let k = 1; k < items.length; k++) {
    if (items[k].rating > items[bestIdx].rating) bestIdx = k;
  }
  const slot1 = items[bestIdx];
  const rest = items.filter((_, k) => k !== bestIdx);

  rest.sort((a, b) => {
    // 1) Higher organic rating first — protects strictly better places.
    if (b.rating !== a.rating) return b.rating - a.rating;
    // 2) Equal rating: promoted ahead of non-promoted; anchor ahead of partner.
    if (b.weight !== a.weight) return b.weight - a.weight;
    // 3) Stable: keep original relative order.
    return a.i - b.i;
  });

  return [slot1, ...rest].map((it) => it.biz);
}
