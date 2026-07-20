import { useEffect, useRef, useState } from "react";

// Save-this-city — pins the city's hero/wall/category images, the current page, and
// the app shell into a stable offline cache via the service worker (see
// scripts/gen-sw.mjs: {type:SAVE_CITY} → {type:CITY_SAVED}|{type:SAVE_FAILED}). No
// accounts, no storage on the client beyond the SW cache. In-voice, understated.
//
// Props:
//   assets   — array of same-origin URLs to pin (hero/wall/category images + page + shell)
//   cityName — display name, e.g. "Austin"
//   dark     — optional; flips to a dark-surface palette (defaults to light)
export function SaveCity({ assets = [], cityName = "this city", dark = false }) {
  // idle | pending | saved | failed | unsupported
  const [state, setState] = useState("idle");
  const timer = useRef(null);

  const sw =
    typeof navigator !== "undefined" && navigator.serviceWorker
      ? navigator.serviceWorker
      : null;

  useEffect(() => {
    if (!sw) return undefined;
    const onMsg = (e) => {
      const type = e.data && e.data.type;
      if (type === "CITY_SAVED") {
        if (timer.current) clearTimeout(timer.current);
        setState("saved");
      } else if (type === "SAVE_FAILED") {
        if (timer.current) clearTimeout(timer.current);
        setState("failed");
      }
    };
    sw.addEventListener("message", onMsg);
    return () => {
      sw.removeEventListener("message", onMsg);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [sw]);

  const save = () => {
    // No SW at all (old browser / not yet registered / insecure context) → soft note.
    if (!sw || !sw.controller) {
      setState("unsupported");
      return;
    }
    setState("pending");
    // Safety net: if the SW never answers, fall back to a gentle retry rather than
    // spinning forever.
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("failed"), 15000);
    sw.controller.postMessage({ type: "SAVE_CITY", assets });
  };

  const p = dark
    ? { fg: "#f0ebe4", dim: "#94a3b8", accent: "#dc2626", border: "rgba(255,255,255,0.14)", bg: "rgba(255,255,255,0.04)" }
    : { fg: "#0c1b2a", dim: "#718096", accent: "#dc2626", border: "#e2e8f0", bg: "#ffffff" };
  const fb = "'DM Sans',system-ui,sans-serif";

  // Confirmation — the payoff line.
  if (state === "saved") {
    return (
      <div style={{ fontFamily: fb, fontSize: 13, color: p.dim, lineHeight: 1.5, display: "inline-flex", alignItems: "center", gap: 7 }}>
        <span aria-hidden="true" style={{ color: p.accent, fontWeight: 700 }}>✓</span>
        Saved — {cityName} works in airplane mode now.
      </div>
    );
  }

  // No service worker → honest, non-blocking note.
  if (state === "unsupported") {
    return (
      <div style={{ fontFamily: fb, fontSize: 13, color: p.dim, lineHeight: 1.5, maxWidth: 320 }}>
        Offline save needs a modern browser — you can still browse {cityName} online.
      </div>
    );
  }

  const busy = state === "pending";
  const failed = state === "failed";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
      <button
        type="button"
        onClick={save}
        disabled={busy}
        aria-live="polite"
        style={{
          background: p.bg,
          color: p.fg,
          border: `1px solid ${p.border}`,
          borderRadius: 999,
          padding: "9px 16px",
          fontFamily: fb,
          fontSize: 13,
          fontWeight: 600,
          cursor: busy ? "default" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          opacity: busy ? 0.7 : 1,
          transition: "opacity .2s, border-color .2s",
          whiteSpace: "nowrap",
        }}
      >
        <span aria-hidden="true" style={{ color: p.accent, fontSize: 14, lineHeight: 1 }}>⤓</span>
        {busy ? `Saving ${cityName}…` : failed ? `Retry saving ${cityName}` : `Save ${cityName} for the trip`}
      </button>
      {failed && (
        <div style={{ fontFamily: fb, fontSize: 12, color: p.dim, lineHeight: 1.5, maxWidth: 320 }}>
          Couldn&rsquo;t stash it just now — check your connection and give it another tap.
        </div>
      )}
    </div>
  );
}

export default SaveCity;
