// LocalTour engine — per-city app shell: view toggle (persisted in localStorage per
// WS1 — sessionStorage in the legacy apps) + the Feed/Classic switch.
import { useEffect, useState } from "react";
import { CityModelProvider, useCityModel } from "./cityModel";
import FeedView from "./views/feed/FeedView";
import ClassicView from "./views/classic/ClassicView";
import "./styles/engine.css";

function CityToggle({ view, setView, classic }) {
  const { CITY } = useCityModel();
  const next = view === "feed" ? "classic" : "feed";
  const current = view === "feed" ? "FEED" : "CLASSIC";
  const s = classic
    ? { bg: "rgba(12,27,42,0.85)", fg: "#f0ebe4", dim: "#94a3b8", accent: "#dc2626", border: "rgba(255,255,255,0.1)", fd: "'Playfair Display',Georgia,serif" }
    : { bg: "rgba(10,10,11,0.85)", fg: "#f5f2ec", dim: "#a09a90", accent: "#b3131f", border: "#1c1a17", fd: "'Fraunces',Georgia,serif" };
  return (
    <button
      onClick={() => setView(next)}
      title={`Switch to ${next} view`}
      style={{ position: "fixed", top: 14, left: classic ? 64 : 16, zIndex: 250, background: s.bg, backdropFilter: "blur(12px)", border: `1px solid ${s.border}`, padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, borderRadius: 999, transition: "all .25s" }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 18, height: 18, borderRadius: 5, background: s.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: "#fff", fontFamily: s.fd }}>LT</span>
        <span style={{ fontFamily: s.fd, fontSize: 14, fontWeight: 600, color: s.fg, letterSpacing: "-.005em" }}>{CITY.name}</span>
      </span>
      <span style={{ width: 1, height: 14, background: s.border }} />
      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: ".18em", color: s.dim, textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 4 }}>
        {current}
        <span style={{ opacity: 0.6 }}>⇄</span>
      </span>
    </button>
  );
}

function CityAppInner() {
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

  useEffect(() => {
    try {
      localStorage.setItem("lt_view", view);
    } catch {
      /* private mode */
    }
    setConciergeOpen(false);
    window.scrollTo(0, 0);
  }, [view]);

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
