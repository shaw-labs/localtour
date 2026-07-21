import { useEffect, useState } from "react";
import { bizId, track } from "./beacon";
import { mapsHref } from "./maps";
import { openStatus } from "./hours";
import { tripHas, tripToggle, onTripChange } from "./trip";
import VERIFIED from "../generated/verified.json";

// Shared, self-styled action bar for every place card (feed + classic) and the
// concierge picks. Gives each listing: open-now status, neighborhood, a link to
// the full SEO place page, Map / Directions / Call / Reserve, and Add-to-trip.
// NOTE: the dataset has no coordinates, so we show NEIGHBORHOOD (from the
// address) — never a fabricated distance/ETA.

const T = {
  light: { fg: "#4a5568", dim: "#718096", line: "#e2e8f0", red: "#b3131f", green: "#2f7d5b", chip: "#f0f4f8", card: "#fff" },
  dark: { fg: "#b7b0a4", dim: "#8a8478", line: "#2a2a2d", red: "#e0736b", green: "#5fb98d", chip: "rgba(255,255,255,.05)", card: "#141416" },
};

function neighborhood(address) {
  if (!address) return "";
  const parts = address.split(",");
  return (parts[1] || "").trim();
}

// Reserve/tickets/website label by what the place is
function siteLabel(cat) {
  if (cat === "dining" || cat === "bars_nightlife" || cat === "coffee_bakeries") return "Reserve";
  if (cat === "attractions" || cat === "entertainment" || cat === "outdoor_adventure") return "Tickets";
  if (cat === "lodging") return "Book";
  return "Website";
}

function Action({ href, onClick, label, icon, t, target }) {
  return (
    <a
      href={href}
      onClick={onClick}
      {...(target ? { target, rel: "noopener nofollow" } : {})}
      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", minHeight: 34, borderRadius: 8, border: `1px solid ${t.line}`, background: t.card, color: t.fg, fontFamily: "'DM Sans',system-ui,sans-serif", fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", cursor: "pointer" }}
    >
      <span aria-hidden="true">{icon}</span>{label}
    </a>
  );
}

export function PlaceActions({ biz, slug, dark = false, compact = false }) {
  const t = dark ? T.dark : T.light;
  const [inTrip, setInTrip] = useState(() => tripHas(slug, biz.name));
  useEffect(() => onTripChange(() => setInTrip(tripHas(slug, biz.name))), [slug, biz.name]);

  const placeUrl = `/cities/${slug}/places/${bizId(biz.name)}/`;
  const hood = neighborhood(biz.address);
  const st = openStatus(biz.hours);
  const fireOut = () => track.outboundClick(slug, biz.name, dark ? "feed" : "classic");
  const stop = (e) => e.stopPropagation();

  const statusColor = st.status === "open" ? t.green : st.status === "closed" ? t.red : t.dim;

  return (
    <div onClick={stop} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
      {/* status + neighborhood + last-verified */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontFamily: "'DM Sans',system-ui,sans-serif", fontSize: 12.5 }}>
        {st.label && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: statusColor, fontWeight: 700 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
            {st.label}
          </span>
        )}
        {hood && <span style={{ color: t.dim }}>📍 {hood}</span>}
        {biz.hours && st.status === "unknown" && <span style={{ color: t.dim }}>{biz.hours}</span>}
      </div>

      {/* action buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {biz.address && <Action t={t} target="_blank" onClick={(e) => { stop(e); fireOut(); }} href={mapsHref(biz.name, biz.address)} icon="🗺️" label="Map" />}
        {biz.address && <Action t={t} target="_blank" onClick={(e) => { stop(e); fireOut(); }} href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(biz.name + " " + biz.address)}`} icon="🧭" label="Directions" />}
        {biz.phone && <Action t={t} onClick={(e) => { stop(e); fireOut(); }} href={`tel:${String(biz.phone).replace(/[^+0-9]/g, "")}`} icon="📞" label="Call" />}
        {biz.website && <Action t={t} target="_blank" onClick={(e) => { stop(e); fireOut(); }} href={biz.website} icon="🎟️" label={siteLabel(biz.category)} />}
        <button
          onClick={(e) => { stop(e); const added = tripToggle(slug, biz.name); setInTrip(added); }}
          aria-pressed={inTrip}
          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", minHeight: 34, borderRadius: 8, border: `1px solid ${inTrip ? t.red : t.line}`, background: inTrip ? t.red : t.card, color: inTrip ? "#fff" : t.fg, fontFamily: "'DM Sans',system-ui,sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          {inTrip ? "✓ In your trip" : "＋ Add to trip"}
        </button>
      </div>

      {/* full detail page link + verified date */}
      {!compact && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", fontFamily: "'DM Sans',system-ui,sans-serif", fontSize: 11.5 }}>
          <a href={placeUrl} onClick={(e) => { stop(e); track.bizClick(slug, biz.name, dark ? "feed" : "classic"); }} style={{ color: t.red, fontWeight: 700, textDecoration: "none" }}>
            Full details, hours &amp; deals →
          </a>
          {VERIFIED[slug] && <span style={{ color: t.dim }}>Verified {VERIFIED[slug]}</span>}
        </div>
      )}
    </div>
  );
}
