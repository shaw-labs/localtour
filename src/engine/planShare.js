// LocalTour engine — plan sharing (WS4). Encodes a classic Trip Planner itinerary
// into a compact, URL-safe token so a plan can travel as `?plan=…`, and decodes it
// back by re-hydrating each business from the city's byName map. Pure functions, no
// React, no DOM. decodePlan NEVER throws — it returns null on anything malformed so
// the caller can safely fall back to the normal view.

const MAX_INPUT = 8000; // hard cap on decode input length (defensive)

// UTF-8-safe base64url encode. TextEncoder → binary string → btoa → URL-safe.
function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

// Reverse of toBase64Url. Re-pads, atob → bytes → TextDecoder. Returns null on failure.
function fromBase64Url(token) {
  try {
    let b64 = String(token).replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4 !== 0) b64 += "=";
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Encode planner prefs + itinerary into a compact base64url token.
 * Minimal shape: { d: days, c: crew, v: vibes, i: [ [ {t, b} … ] … ] }
 * where each slot keeps only its time (t) and business name (b).
 */
export function encodePlan(prefs, itinerary) {
  const p = prefs || {};
  const minimal = {
    d: p.days,
    c: p.crew,
    v: Array.isArray(p.vibes) ? p.vibes : [],
    i: (Array.isArray(itinerary) ? itinerary : []).map((day) =>
      (day && Array.isArray(day.slots) ? day.slots : []).map((slot) => ({
        t: slot && slot.time,
        b: slot && slot.biz && slot.biz.name,
      })),
    ),
  };
  return toBase64Url(JSON.stringify(minimal));
}

/**
 * Decode a token back into { prefs, itinerary }, re-hydrating each slot's business
 * from byName. Slots whose business is missing from byName are DROPPED. Returns null
 * on anything malformed (bad token, oversized input, bad JSON) or when nothing
 * hydrates (no surviving slots for this city). Never throws.
 */
export function decodePlan(str, byName) {
  try {
    if (typeof str !== "string" || str.length === 0 || str.length > MAX_INPUT) return null;
    const json = fromBase64Url(str);
    if (json == null) return null;
    const data = JSON.parse(json);
    if (!data || typeof data !== "object") return null;

    const map = byName || {};
    const days = Array.isArray(data.i) ? data.i : [];
    const nDays = days.length;

    let total = 0;
    const itinerary = days.map((rawSlots, idx) => {
      const list = Array.isArray(rawSlots) ? rawSlots : [];
      const slots = [];
      for (const s of list) {
        if (!s || typeof s !== "object") continue;
        const name = typeof s.b === "string" ? s.b : null;
        // own-property guard: a hostile token with b:"__proto__"/"constructor"
        // must not resolve to an Object.prototype member (byName is a plain object).
        const biz = name && Object.prototype.hasOwnProperty.call(map, name) ? map[name] : null;
        if (!biz) continue; // drop slots whose business no longer resolves
        slots.push({ time: typeof s.t === "string" ? s.t : "", biz });
      }
      total += slots.length;
      const day = idx + 1;
      return {
        day,
        label: nDays === 1 ? "Your Day" : `Day ${day}`,
        slots,
      };
    });

    if (total === 0) return null; // nothing hydrated → treat as no valid plan

    const prefs = {
      days: typeof data.d === "number" ? data.d : nDays,
      crew: typeof data.c === "string" ? data.c : "couple",
      vibes: Array.isArray(data.v) ? data.v.filter((v) => typeof v === "string") : [],
    };

    return { prefs, itinerary };
  } catch {
    return null;
  }
}

/** Query-string fragment for a shareable plan: "?plan=<token>". */
export function planParam(prefs, itinerary) {
  return "?plan=" + encodePlan(prefs, itinerary);
}
