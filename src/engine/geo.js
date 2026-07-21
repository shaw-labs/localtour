// Distance-from-visitor for place cards. Coordinates are build-geocoded
// (src/generated/coords.json); the origin is the visitor's device location,
// requested ONCE per session and shared across every card. Degrades cleanly:
// no permission / not near the city → cards just show neighborhood.

const R_KM = 6371;
const toRad = (x) => (x * Math.PI) / 180;

/** haversine great-circle distance in km. a,b = [lat, lng]. */
export function distKm(a, b) {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.sqrt(s));
}

/** km → friendly miles ("0.4 mi", "steps away", "12 mi"). */
export function fmtMiles(km) {
  const mi = km * 0.621371;
  if (mi < 0.08) return "right here";
  if (mi < 0.15) return "steps away";
  if (mi < 10) return `${mi.toFixed(1)} mi away`;
  return `${Math.round(mi)} mi away`;
}

// Single shared geolocation request. Success/denial cached for the session so
// we never re-prompt. Auto-prompts once (a travel site asking where you are on
// a city page is expected UX); if denied or unavailable, resolves null forever.
let _loc;
export function getUserLoc() {
  if (_loc) return _loc;
  _loc = new Promise((resolve) => {
    try {
      const raw = sessionStorage.getItem("lt_loc");
      if (raw === "no") return resolve(null);
      if (raw) {
        const [t, la, ln] = JSON.parse(raw);
        if (Date.now() - t < 30 * 60000) return resolve([la, ln]);
      }
    } catch { /* storage blocked */ }
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = [pos.coords.latitude, pos.coords.longitude];
        try { sessionStorage.setItem("lt_loc", JSON.stringify([Date.now(), c[0], c[1]])); } catch { /* ignore */ }
        resolve(c);
      },
      () => { try { sessionStorage.setItem("lt_loc", "no"); } catch { /* ignore */ } resolve(null); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
    );
  });
  return _loc;
}
