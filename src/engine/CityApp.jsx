// LocalTour engine — per-city app shell: view toggle (persisted in localStorage per
// WS1 — sessionStorage in the legacy apps) + the Feed/Classic switch.
import { useEffect, useState, useMemo } from "react";
import { CityModelProvider, useCityModel } from "./cityModel";
import { track } from "./beacon";
import FeedView from "./views/feed/FeedView";
import ClassicView from "./views/classic/ClassicView";
import { decodePlan } from "./planShare";
import { PlanView } from "./views/classic/PlanView";
import { SaveCity } from "./SaveCity";
import { PrimaryNav } from "./PrimaryNav";
import { installImgFallback } from "./imgFallback";
import "./styles/engine.css";

// Install the broken-image fallback handlers at module init (pre-first-render,
// idempotent) — the inline apps ran this as a pre-React script.
installImgFallback();

function CityToggle({ view, setView, classic }) {
  const { CITY } = useCityModel();
  const next = view === "feed" ? "classic" : "feed";
  const current = view === "feed" ? "FEED" : "CLASSIC";
  const s = classic
    ? { bg: "rgba(12,27,42,0.85)", fg: "#f0ebe4", dim: "#94a3b8", accent: "#dc2626", border: "rgba(255,255,255,0.1)", fd: "'Playfair Display',Georgia,serif" }
    : { bg: "rgba(10,10,11,0.85)", fg: "#f5f2ec", dim: "#a09a90", accent: "#b3131f", border: "#1c1a17", fd: "'Fraunces',Georgia,serif" };
  return (
    <div
      style={{ position: "fixed", top: 14, left: classic ? 64 : 16, zIndex: 250, background: s.bg, backdropFilter: "blur(12px)", border: `1px solid ${s.border}`, padding: "7px 12px", display: "flex", alignItems: "center", gap: 10, borderRadius: 999, transition: "all .25s" }}
    >
      {/* LT logo + city name → homepage */}
      <a href="/" title="LocalTour home" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", cursor: "pointer" }}>
        <span style={{ width: 18, height: 18, borderRadius: 5, background: s.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: "#fff", fontFamily: s.fd }}>LT</span>
        <span style={{ fontFamily: s.fd, fontSize: 14, fontWeight: 600, color: s.fg, letterSpacing: "-.005em" }}>{CITY.name}</span>
      </a>
      <span style={{ width: 1, height: 14, background: s.border }} />
      {/* FEED ⇄ CLASSIC view toggle */}
      <button
        onClick={() => setView(next)}
        title={`Switch to ${next} view`}
        style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: ".18em", color: s.dim, textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 4 }}
      >
        {current}
        <span style={{ opacity: 0.6 }}>⇄</span>
      </button>
    </div>
  );
}

function CityAppInner() {
  const { slug, byName, CITY, IMG, CAT_IMAGES } = useCityModel();
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem("lt_view") || "feed";
    } catch {
      return "feed";
    }
  });
  const [activeMode, setActiveMode] = useState(null);
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // WS4 shareable itinerary: a /cities/<slug>/?plan=<token> URL renders the plan
  // read-only. Decode once on mount; null (absent/malformed/foreign city) → normal view.
  const [plan, setPlan] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search).get("plan");
      return p ? decodePlan(p, byName) : null;
    } catch {
      return null;
    }
  });

  // WS4 PWA save-a-city: a small asset list (this page + the city's category
  // images in .jpg/.avif) the service worker pins for airplane-mode use.
  const saveAssets = useMemo(() => {
    const urls = [window.location.pathname];
    for (const f of Object.values(CAT_IMAGES || {})) {
      const full = IMG(f);
      if (!full) continue;
      const base = full.replace(/\.[^.]+$/, "");
      urls.push(base + ".jpg", base + ".avif");
    }
    return [...new Set(urls)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    try {
      localStorage.setItem("lt_view", view);
    } catch {
      /* private mode */
    }
    // WS3: one pageview_city per city mount + on every view switch, tagged with
    // the ACTIVE view (feed|classic). beacon.ts self-suppresses under DNT/GPC.
    track.pageviewCity(slug, view);
    setConciergeOpen(false);
    window.scrollTo(0, 0);
  }, [view, slug]);

  // ── Primary nav handlers — every one drives an EXISTING surface ──────────
  // Plan: the trip planner lives in classic (R_TripPlanner) — switch there if
  // needed, then open it. Chat: the concierge exists in both views. Deals:
  // scroll to the existing deals surface (classic #deals / feed promoted cards).
  const navPlan = () => {
    if (view !== "classic") setView("classic");
    setConciergeOpen(false);
    setPlannerOpen(true);
  };
  const navChat = () => {
    setPlannerOpen(false); // planner replaces classic content; close it first
    setConciergeOpen(true);
  };
  const navDeals = () => {
    setConciergeOpen(false);
    setPlannerOpen(false);
    setTimeout(() => {
      const el = document.getElementById("deals") || document.querySelector("[data-deal-card]");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };
  const navToggle = () => setView(view === "classic" ? "feed" : "classic");

  // Cross-page intents: the wall page's nav sends ?open=planner|chat|deals so
  // its buttons are still one click. Consume once, then strip the param.
  useEffect(() => {
    let intent = null;
    try { intent = new URLSearchParams(window.location.search).get("open"); } catch { /* ignore */ }
    if (!intent) return;
    try { window.history.replaceState(null, "", window.location.pathname); } catch { /* ignore */ }
    if (intent === "planner") navPlan();
    else if (intent === "chat") navChat();
    else if (intent === "deals") setTimeout(navDeals, 350); // let sections mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // A shared ?plan= URL renders the itinerary read-only; "Remix" strips the param
  // and opens the live planner in classic.
  if (plan) {
    return (
      <PlanView
        prefs={plan.prefs}
        itinerary={plan.itinerary}
        cityName={CITY.name}
        onRemix={() => {
          try { window.history.replaceState(null, "", window.location.pathname); } catch { /* ignore */ }
          setPlan(null);
          setView("classic");
          setPlannerOpen(true);
        }}
      />
    );
  }

  return (
    <>
      <CityToggle view={view} setView={setView} classic={view === "classic"} />
      {view === "feed" ? (
        <FeedView
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          conciergeOpen={conciergeOpen}
          setConciergeOpen={setConciergeOpen}
        />
      ) : (
        <ClassicView
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          conciergeOpen={conciergeOpen}
          setConciergeOpen={setConciergeOpen}
          plannerOpen={plannerOpen}
          setPlannerOpen={setPlannerOpen}
          isDark={isDark}
          setIsDark={setIsDark}
        />
      )}
      {/* lifted above the primary nav bar (safe-area aware) */}
      <div style={{ position: "fixed", left: 16, bottom: "calc(84px + env(safe-area-inset-bottom, 0px))", zIndex: 40 }}>
        <SaveCity assets={saveAssets} cityName={CITY.name} dark={view === "feed"} />
      </div>
      <PrimaryNav
        slug={slug}
        view={view}
        dark={view === "feed" || (view === "classic" && isDark)}
        current={plannerOpen ? "plan" : conciergeOpen ? "chat" : null}
        onPlan={navPlan}
        onChat={navChat}
        onDeals={navDeals}
        onToggle={navToggle}
        dealsSelector={view === "classic" ? "#deals" : "[data-deal-card]"}
      />
    </>
  );
}

export default function CityApp({ model }) {
  return (
    <CityModelProvider model={model}>
      <CityAppInner />
    </CityModelProvider>
  );
}
