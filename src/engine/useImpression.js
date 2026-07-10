import { useEffect, useRef } from "react";
import { track } from "./beacon";

// Fire a single biz_impression when a business card first scrolls into view.
// The beacon itself samples impressions (0.25) and honors DNT/GPC, so this hook
// stays dumb: observe once, emit once, disconnect. Returns a ref to attach to
// the card's root element. Works identically in Feed and Classic (Principle 4).
export function useImpression(city, biz, view) {
  const ref = useRef(null);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !city || !biz || fired.current) return;
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !fired.current) {
            fired.current = true;
            track.bizImpression(city, biz, view);
            io.disconnect();
            return;
          }
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [city, biz, view]);
  return ref;
}
