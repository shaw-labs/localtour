import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Persistent primary navigation — a surgical addition, no feature rebuilt:
// Plan opens the existing Trip Planner, Chat the existing concierge, Wall the
// native wall route (SPA link), Deals scrolls to the existing deals surface,
// and the elevated center button is the existing Classic⇄Feed switch (it shows
// its DESTINATION: in classic you see "Feed", in feed you see "Classic").
//
// Mobile: fixed full-width bottom bar. Desktop (≥768px): centered floating
// dock. Same DOM, restyled via the injected media queries. Context-free on
// purpose — CityApp mounts it with live handlers; the Wall page mounts it with
// navigate-back intents. Bottom spacer + safe-area insets keep content clear.

const PAL = {
  dark: { bg: "rgba(17,17,19,.96)", ink: "#e8e3d9", dim: "#a49c8e", line: "#26262a", red: "#b3131f", redInk: "#f5efe2" },
  light: { bg: "rgba(250,248,244,.96)", ink: "#0c1b2a", dim: "#718096", line: "#e2e8f0", red: "#b3131f", redInk: "#ffffff" },
};

const I = {
  plan: <path d="M19 5a2 2 0 1 0-2-2 2 2 0 0 0 2 2zM5 21a2 2 0 1 0-2-2 2 2 0 0 0 2 2zm2-2h8a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  chat: <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.6A8 8 0 1 1 21 12z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  classic: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  feed: <path d="M4 5h16M4 10h16M4 15h10M4 20h13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  wall: <path d="M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M9 9.5a1 1 0 1 0 0-.01" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  deals: <path d="M12 3h7v7L9.5 20.5a2.1 2.1 0 0 1-3 0l-4-4a2.1 2.1 0 0 1 0-3zM16 8a1 1 0 1 0 0-.01" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
};

function Icon({ name, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {I[name]}
    </svg>
  );
}

const CSS = `
.ltpn,.ltpn *{box-sizing:border-box}
.ltpn{position:fixed;left:0;right:0;bottom:0;z-index:260;display:flex;align-items:stretch;justify-content:space-between;
  width:100%;max-width:100%;overflow:hidden;
  padding:6px max(6px, env(safe-area-inset-left,0px)) calc(6px + env(safe-area-inset-bottom,0px)) max(6px, env(safe-area-inset-right,0px));
  border-top:1px solid var(--ltpn-line);
  background:var(--ltpn-bg);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.ltpn-item{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
  flex:1 1 0;min-width:44px;min-height:48px;padding:4px 2px;border:none;background:none;cursor:pointer;
  color:var(--ltpn-dim);text-decoration:none;border-radius:12px;font-family:'DM Sans',sans-serif}
.ltpn-item .ltpn-lbl{font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;line-height:1;
  max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ltpn-item[aria-current="true"]{color:var(--ltpn-red)}
.ltpn-item:focus-visible{outline:2px solid var(--ltpn-red);outline-offset:2px}
.ltpn-mid{position:relative;top:-14px;width:56px;height:56px;min-width:56px;min-height:56px;flex:0 0 56px;
  border-radius:50%;background:var(--ltpn-red);color:var(--ltpn-redink);border:none;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
  box-shadow:0 6px 20px rgba(179,19,31,.42),0 0 0 4px var(--ltpn-bg);font-family:'DM Sans',sans-serif}
.ltpn-mid .ltpn-lbl{font-size:8.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;line-height:1}
.ltpn-mid:focus-visible{outline:2px solid var(--ltpn-ink);outline-offset:3px}
.ltpn-spacer{height:calc(76px + env(safe-area-inset-bottom,0px))}
@media(min-width:768px){
  .ltpn{left:50%;right:auto;transform:translateX(-50%);bottom:18px;width:auto;max-width:calc(100vw - 24px);gap:6px;
    padding:8px 14px;border:1px solid var(--ltpn-line);border-radius:999px;overflow:visible;
    box-shadow:0 12px 40px rgba(0,0,0,.22)}
  .ltpn-item{flex:0 0 auto;flex-direction:row;gap:8px;min-height:44px;padding:6px 14px;border-radius:999px}
  .ltpn-item .ltpn-lbl{font-size:11px}
  .ltpn-mid{top:0;width:52px;height:52px;min-width:52px;min-height:52px;flex-basis:52px;margin:0 6px;box-shadow:0 6px 20px rgba(179,19,31,.42)}
  .ltpn-spacer{height:96px}
}
@media(prefers-reduced-motion:no-preference){.ltpn-item,.ltpn-mid{transition:color .15s,transform .15s}.ltpn-mid:hover{transform:scale(1.05)}}
`;

/**
 * @param {{ slug: string, view: string, dark?: boolean,
 *   current?: "plan"|"chat"|"wall"|"deals"|null,
 *   onPlan: () => void, onChat: () => void, onDeals: () => void, onToggle: () => void,
 *   dealsSelector?: string|null }} props
 */
export function PrimaryNav({ slug, view, dark = false, current = null, onPlan, onChat, onDeals, onToggle, dealsSelector = null }) {
  const p = PAL[dark ? "dark" : "light"];
  const toFeed = view === "classic"; // center button shows its destination
  const [dealsActive, setDealsActive] = useState(false);

  // Scroll-spy: Deals highlights while any deal surface is on screen.
  useEffect(() => {
    if (!dealsSelector || typeof IntersectionObserver === "undefined") return;
    const els = document.querySelectorAll(dealsSelector);
    if (!els.length) return;
    const on = new Set();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? on.add(e.target) : on.delete(e.target);
      setDealsActive(on.size > 0);
    }, { threshold: 0.2 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dealsSelector, view]);

  const vars = {
    "--ltpn-bg": p.bg, "--ltpn-ink": p.ink, "--ltpn-dim": p.dim,
    "--ltpn-line": p.line, "--ltpn-red": p.red, "--ltpn-redink": p.redInk,
  };

  const item = (key, label, aria, onClick, active) => (
    <button key={key} type="button" className="ltpn-item" aria-label={aria} aria-current={active ? "true" : undefined} onClick={onClick}>
      <Icon name={key} />
      <span className="ltpn-lbl">{label}</span>
    </button>
  );

  return (
    <>
      <div className="ltpn-spacer" aria-hidden="true" />
      <nav className="ltpn" aria-label="Primary" style={vars}>
        <style>{CSS}</style>
        {item("plan", "Plan", "Open the trip planner", onPlan, current === "plan")}
        {item("chat", "Chat", "Ask the concierge", onChat, current === "chat")}
        <button
          type="button"
          className="ltpn-mid"
          aria-label={`Switch to ${toFeed ? "Feed" : "Classic"} view`}
          onClick={onToggle}
        >
          <Icon name={toFeed ? "feed" : "classic"} size={20} />
          <span className="ltpn-lbl">{toFeed ? "Feed" : "Classic"}</span>
        </button>
        {current === "wall" ? (
          item("wall", "Wall", "Community wall", () => {}, true)
        ) : (
          <Link to={`/cities/${slug}/wall`} className="ltpn-item" aria-label="Community wall">
            <Icon name="wall" />
            <span className="ltpn-lbl">Wall</span>
          </Link>
        )}
        {item("deals", "Deals", "Jump to deals", onDeals, current === "deals" || dealsActive)}
      </nav>
    </>
  );
}
