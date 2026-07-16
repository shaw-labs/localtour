// Classic view — read-only shared itinerary. Renders a decoded plan (from ?plan=)
// day-by-day with the same planner-result styling as the live Trip Planner, minus
// every edit control. Business names/categories render as TEXT (JSX children), never
// innerHTML, so a hostile ?plan= token can't inject markup. The single write action
// is "Remix this plan" (onRemix, opens the live planner); "Copy link" re-shares the URL.
import { useState } from "react";
import { CAT_LABELS_R } from "../../theme";

export function PlanView({ prefs, itinerary, cityName, onRemix }) {
  const [copied, setCopied] = useState(false);
  const days = Array.isArray(itinerary) ? itinerary : [];
  const nDays = (prefs && typeof prefs.days === "number" ? prefs.days : days.length) || days.length;

  function copyLink() {
    try {
      // writeText rejects ASYNC on permission denial — swallow the promise too
      navigator.clipboard?.writeText(window.location.href).catch(() => {});
    } catch {
      /* no clipboard API — silent, non-fatal */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="planner-overlay">
      <div className="planner-bar">
        <div className="planner-bar-inner">
          <button className="planner-back" onClick={onRemix}>← Plan your own</button>
          <div className="planner-title">Shared <em>itinerary</em></div>
          <div style={{ width: 60 }} />
        </div>
      </div>
      <div className="planner-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 16 }}>
          <h3 style={{ marginBottom: 0 }}>A plan for {cityName}</h3>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={onRemix}>Remix this plan</button>
            <button className="btn btn-ghost" onClick={copyLink}>{copied ? "Copied" : "Copy link"}</button>
          </div>
        </div>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 32 }}>
          Someone shared this itinerary with you — {nDays} day{nDays === 1 ? "" : "s"}
          {prefs && prefs.crew ? ` for a ${prefs.crew}` : ""}. Remix it to make it your own.
        </p>
        {days.map((day) => (
          <div key={day.day} className="planner-day">
            <h4>{day.label}</h4>
            {(Array.isArray(day.slots) ? day.slots : []).map((slot, i) => (
              <div key={i} className="planner-slot">
                <div className="time">{slot.time}</div>
                <h5>{slot.biz.name}</h5>
                <p>{CAT_LABELS_R[slot.biz.category] || slot.biz.category}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlanView;
