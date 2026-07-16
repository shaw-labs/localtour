import { useEffect, useState } from "react";
import { useCityModel } from "./cityModel";
import { track } from "./beacon";
import { planParam } from "./planShare";
import { activeCampaign } from "./campaign";

// WS8 — the America 250 layer ("Like a Local"). One component mounted by BOTH
// views (Principle 4 parity by construction): a campaign rail on the city page
// plus the trail detail experience — narrative header, ordered stops with
// notes, and a share CTA that emits the same ?plan= link as the planner (a
// trail IS a pre-built itinerary). Branding comes from activeCampaign(), which
// sunsets to "Heritage Trails" past window_end with no rebuild.
//
// Beacons: trail_view (detail open), trail_stop_click (stop tap, biz-scoped),
// trail_share (share link created). Stops carry NO paid placement (Principle 6).

const THEMES = {
  dark: {
    bg: "#0a0a0b", card: "#111113", ink: "#e8e3d9", mid: "#a49c8e", dim: "#6b6458",
    line: "#1e1e21", red: "#b3131f", gold: "#c89b3c", chipBg: "rgba(200,155,60,.1)",
    fd: "'Playfair Display',Georgia,serif", fb: "'DM Sans',sans-serif", fm: "'IBM Plex Mono',monospace",
  },
  light: {
    bg: "#faf8f4", card: "#ffffff", ink: "#0c1b2a", mid: "#4a5568", dim: "#a0aec0",
    line: "#e2e8f0", red: "#b3131f", gold: "#a8791f", chipBg: "rgba(168,121,31,.08)",
    fd: "'Playfair Display',Georgia,serif", fb: "'DM Sans',sans-serif", fm: "'IBM Plex Mono',monospace",
  },
};

function Chip({ t, children }) {
  return (
    <span style={{ display: "inline-block", padding: "4px 12px", border: `1px solid ${t.gold}`, background: t.chipBg, color: t.gold, fontFamily: t.fm, fontSize: 9, letterSpacing: ".24em", textTransform: "uppercase", borderRadius: 2 }}>
      {children}
    </span>
  );
}

function TrailStop({ t, i, stop, biz, slug, view }) {
  const [open, setOpen] = useState(false);
  const tap = () => {
    if (!open) track.trailStopClick(slug, stop.biz, view);
    setOpen((o) => !o);
  };
  return (
    <li onClick={tap} style={{ listStyle: "none", borderBottom: `1px solid ${t.line}`, padding: "16px 0", cursor: "pointer" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
        <span style={{ fontFamily: t.fm, fontSize: 11, color: t.gold, minWidth: 24 }}>{String(i + 1).padStart(2, "0")}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
            <span style={{ fontFamily: t.fd, fontSize: 19, fontWeight: 500, color: t.ink, letterSpacing: "-.01em" }}>{stop.biz}</span>
            {biz?.category && <span style={{ fontFamily: t.fm, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: t.dim, whiteSpace: "nowrap" }}>{biz.category.replace(/_/g, " ")}</span>}
          </div>
          <p style={{ fontFamily: t.fb, fontSize: 13.5, color: t.mid, lineHeight: 1.55, margin: "6px 0 0" }}>{stop.note}</p>
          {open && biz && (
            <div style={{ marginTop: 10, fontFamily: t.fb, fontSize: 12.5, color: t.dim, display: "flex", flexDirection: "column", gap: 4 }}>
              {biz.address && <span>📍 {biz.address}</span>}
              {biz.must_try && <span>Try: {biz.must_try}</span>}
              {(biz.rating || biz.price) && <span>{biz.rating ? `★ ${biz.rating}` : ""}{biz.rating && biz.price ? " · " : ""}{biz.price || ""}</span>}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function TrailExperience({ t, trail, slug, view, cityName, byName, onClose }) {
  const [shared, setShared] = useState(false);
  const camp = activeCampaign();

  useEffect(() => {
    track.trailView(slug, view);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const share = () => {
    // a trail is a pre-built one-day itinerary — same ?plan= link as the planner
    const itinerary = [{
      day: 1,
      label: trail.title,
      slots: trail.stops.map((s, i) => ({ time: `Stop ${i + 1}`, biz: byName[s.biz] })).filter((s) => s.biz),
    }];
    const url = window.location.origin + window.location.pathname.replace(/\/$/, "") + planParam({ days: 1, crew: "trail", vibes: [] }, itinerary);
    // writeText rejects ASYNC (permissions) — swallow the promise, not just the call
    try { navigator.clipboard?.writeText(url).catch(() => {}); } catch { /* no clipboard API */ }
    track.trailShare(slug, view);
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, background: t.bg, overflowY: "auto" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 5, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: t.bg, borderBottom: `1px solid ${t.line}` }}>
        <Chip t={t}>{camp.name}</Chip>
        <button onClick={onClose} style={{ background: "none", border: `1px solid ${t.line}`, color: t.mid, fontFamily: t.fm, fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", padding: "8px 14px", cursor: "pointer" }}>Close ✕</button>
      </div>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 22px 90px" }}>
        <h1 style={{ fontFamily: t.fd, fontSize: "clamp(28px,6vw,42px)", fontWeight: 600, color: t.ink, lineHeight: 1.1, letterSpacing: "-.02em", margin: "0 0 12px" }}>{trail.title}</h1>
        {trail.neighborhoods?.length > 0 && (
          <div style={{ fontFamily: t.fm, fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: t.gold, marginBottom: 18 }}>{trail.neighborhoods.join(" · ")}</div>
        )}
        <p style={{ fontFamily: t.fd, fontSize: 17, fontStyle: "italic", color: t.mid, lineHeight: 1.5, margin: "0 0 22px" }}>{trail.hook}</p>
        <p style={{ fontFamily: t.fb, fontSize: 15, color: t.ink === "#0c1b2a" ? "#2d3748" : "#cfc8bb", lineHeight: 1.75, margin: "0 0 34px", whiteSpace: "pre-line" }}>{trail.narrative}</p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `2px solid ${t.gold}`, paddingBottom: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: t.fm, fontSize: 10, letterSpacing: ".24em", textTransform: "uppercase", color: t.mid }}>The stops · walk it in order</span>
          <span style={{ fontFamily: t.fm, fontSize: 10, color: t.dim }}>{trail.stops.length}</span>
        </div>
        <ol style={{ margin: 0, padding: 0 }}>
          {trail.stops.map((s, i) => (
            <TrailStop key={i} t={t} i={i} stop={s} biz={byName[s.biz]} slug={slug} view={view} />
          ))}
        </ol>

        <button onClick={share} style={{ marginTop: 30, width: "100%", padding: "16px", background: t.red, color: "#fff", border: "none", fontFamily: t.fm, fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", cursor: "pointer" }}>
          {shared ? "Link copied — opens as a ready-made itinerary" : `Share the trail — send ${cityName} like a local`}
        </button>
        <p style={{ fontFamily: t.fb, fontSize: 11.5, color: t.dim, textAlign: "center", marginTop: 12 }}>
          No stop on this trail is paid placement. Curated only.
        </p>
      </div>
    </div>
  );
}

export function TrailRail({ dark = false }) {
  const { slug, CITY, trails, byName } = useCityModel();
  const [open, setOpen] = useState(false);
  const t = THEMES[dark ? "dark" : "light"];
  const view = dark ? "feed" : "classic";
  const trail = trails && trails[0];
  if (!trail) return null;
  const camp = activeCampaign();

  return (
    <>
      <section id="trail" style={{ background: t.card, borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}`, padding: "34px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <Chip t={t}>{camp.name} · Like a Local</Chip>
          <h2 style={{ fontFamily: t.fd, fontSize: "clamp(22px,5vw,30px)", fontWeight: 600, color: t.ink, letterSpacing: "-.015em", lineHeight: 1.15, margin: "14px 0 10px" }}>{trail.title}</h2>
          <p style={{ fontFamily: t.fb, fontSize: 14, color: t.mid, lineHeight: 1.6, margin: "0 0 16px" }}>{trail.hook}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <button onClick={() => setOpen(true)} style={{ padding: "12px 22px", background: t.ink, color: t.bg, border: "none", fontFamily: t.fm, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", cursor: "pointer" }}>
              Walk the trail →
            </button>
            <span style={{ fontFamily: t.fm, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: t.dim }}>
              {trail.stops.length} stops{trail.neighborhoods?.length ? ` · ${trail.neighborhoods.slice(0, 2).join(" · ")}` : ""}
            </span>
          </div>
        </div>
      </section>
      {open && (
        <TrailExperience t={t} trail={trail} slug={slug} view={view} cityName={CITY.name} byName={byName} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
