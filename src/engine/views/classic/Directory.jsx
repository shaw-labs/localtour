// Classic view — mode filter, business card, directory section (ported verbatim;
// chicago index.html ~2070–2192).
import { useState } from "react";
import { CAT_LABELS_R } from "../../theme";
import { R_Reveal } from "./scroll";
import { useCityModel } from "../../cityModel";
import { track, bizId } from "../../beacon";
import { useImpression } from "../../useImpression";
import { PlaceActions } from "../../PlaceActions";

/* ═══ MODE FILTER ═══ */
export function R_Modes({activeMode, setActiveMode}) {
  const { directory, MODES } = useCityModel();
  return (
    <section id="vibes" className="modes">
      <R_Reveal>
        <div className="eyebrow center">Filter by vibe</div>
      </R_Reveal>
      <R_Reveal delay={0.08}>
        <h2 className="h-section">What's your <em>speed</em>?</h2>
      </R_Reveal>
      <R_Reveal delay={0.16}>
        <div className="modes-grid">
          <button
            className={`mode-chip ${!activeMode ? 'solid' : ''}`}
            onClick={() => setActiveMode(null)}
          >
            All ({directory.length})
          </button>
          {MODES.map(m => {
            const count = directory.filter(b => b.modes.includes(m.id)).length;
            const on = activeMode === m.id;
            return (
              <button
                key={m.id}
                className={`mode-chip ${on ? 'active' : ''}`}
                onClick={() => setActiveMode(on ? null : m.id)}
              >
                {m.icon} {m.label} ({count})
              </button>
            );
          })}
        </div>
      </R_Reveal>
    </section>
  );
}

/* Subtle merchant-tier badge (WS4). Renders only when biz.tier is "partner" or
   "anchor" (set upstream by the model via tierOf). Inline styles keyed to the
   classic theme CSS vars so it tracks light/dark. Understated — a quiet label. */
function R_TierBadge({tier}) {
  if (tier !== "partner" && tier !== "anchor") return null;
  const isAnchor = tier === "anchor";
  const label = isAnchor ? "Anchor" : "Partner";
  return (
    <span
      title={`${label} merchant`}
      style={{
        display: "inline-block",
        marginLeft: 8,
        verticalAlign: "middle",
        fontFamily: "var(--mono)",
        fontSize: 9,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "2px 7px",
        borderRadius: 6,
        color: isAnchor ? "var(--gold)" : "var(--text-dim)",
        border: `1px solid ${isAnchor ? "rgba(212,168,83,0.28)" : "var(--border)"}`,
        background: isAnchor ? "rgba(212,168,83,0.08)" : "transparent",
      }}
    >
      {label}
    </span>
  );
}

/* ═══ BUSINESS CARD ═══ */
export function R_BizCard({biz}) {
  const { slug } = useCityModel();
  const [open, setOpen] = useState(false);
  const impRef = useImpression(slug, biz.name, "classic");
  return (
    <div
      ref={impRef}
      className="biz"
      onClick={() => setOpen(o => {
        // biz_click = a detail open (not a close); only fire on the open edge.
        if (!o) track.bizClick(slug, biz.name, "classic");
        return !o;
      })}
    >
      <div className="biz-top">
        <div style={{flex: 1, minWidth: 0}}>
          <a
            className="biz-name"
            href={`/cities/${slug}/places/${bizId(biz.name)}/`}
            onClick={e => { e.stopPropagation(); track.bizClick(slug, biz.name, "classic"); }}
            style={{ color: "inherit", textDecoration: "none", display: "block" }}
          >{biz.name}</a>
          <div className="biz-sub">
            {(biz.subcategory || '').replace(/_/g, ' ')}
            {biz.tier && <R_TierBadge tier={biz.tier} />}
          </div>
        </div>
        <div className="biz-meta">
          {biz.price && <span className="biz-price">{biz.price}</span>}
          {biz.rating && <span className="biz-rating">★ {biz.rating}</span>}
        </div>
      </div>
      <p className="biz-desc">{biz.description}</p>
      {biz.must_try && (
        <p className="biz-try"><strong>Try:</strong> {biz.must_try}</p>
      )}
      {open && (
        <div className="biz-exp">
          {biz.address && <p style={{margin:0}}>📍 {biz.address}</p>}
          <PlaceActions biz={biz} slug={slug} />
          {biz.modes.length > 0 && (
            <div className="tags">
              {biz.modes.map(m => <span key={m} className="tag">{m}</span>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══ DIRECTORY SECTION ═══ */
export function R_DirectorySection({cat, businesses, activeMode}) {
  const { CAT_IMAGES, IMG } = useCityModel();
  const [showAll, setShowAll] = useState(false);
  const filtered = activeMode
    ? businesses.filter(b => b.modes.includes(activeMode))
    : businesses;
  if (!filtered.length) return null;
  const visible = showAll ? filtered : filtered.slice(0, 6);
  const label = CAT_LABELS_R[cat] || cat;
  const catImg = CAT_IMAGES[cat];
  return (
    <R_Reveal>
      <section id={`dir-${cat}`} className="directory">
        <div className="dir-head">
          {catImg && (
            <div className="dir-head-img">
              <img src={IMG(catImg)} alt="" loading="lazy" />
            </div>
          )}
          <div>
            <h3>{label}</h3>
            <p>{filtered.length} place{filtered.length === 1 ? '' : 's'}</p>
          </div>
        </div>
        <div className="dir-grid">
          {visible.map((b, i) => <R_BizCard key={`${b.name}-${i}`} biz={b} />)}
        </div>
        {filtered.length > 6 && !showAll && (
          <button className="show-all-btn" onClick={() => setShowAll(true)}>
            Show all {filtered.length} →
          </button>
        )}
      </section>
    </R_Reveal>
  );
}
