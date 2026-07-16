// Open a place in the platform's default maps app rather than forcing Google
// Maps web. There is no true "default maps" web API, so this uses the accepted
// platform handoffs:
//   • iOS / iPadOS / macOS → maps.apple.com (opens the Maps app; iOS forwards
//     to the user's chosen default nav app where configured)
//   • Android → a geo: URI, which opens the system default maps app chooser
//   • everything else (desktop non-Apple) → Google Maps web
export function mapsHref(name, address) {
  const q = encodeURIComponent([name, address].filter(Boolean).join(" "));
  const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
  const apple = /iPhone|iPad|iPod|Macintosh/.test(ua);
  const android = /Android/.test(ua);
  if (apple) return `https://maps.apple.com/?q=${q}`;
  if (android) return `geo:0,0?q=${q}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
