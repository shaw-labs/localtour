// Classic view — deals, wall mosaic, planner CTA, transit, side trips, footer
// (ported verbatim; chicago index.html ~2194–2323 and ~2617–2635).
import { R_Reveal } from "./scroll";
import { useCityModel } from "../../cityModel";

/* ═══ DEALS ═══ */
export function R_Deals() {
  const { CITY, deals } = useCityModel();
  if (!deals.length) return null;
  return (
    <section id="deals" className="deals">
      <div className="deals-inner">
        <R_Reveal>
          <div className="deals-head">
            <div className="eyebrow center">Coupon Clipper</div>
            <h2 className="h-section">Unlock {CITY.name} <em className="gold">deals</em></h2>
          </div>
        </R_Reveal>
        <div className="deals-grid">
          {deals.map((d, i) => (
            <R_Reveal key={i} delay={i * 0.04}>
              <div className="deal-card">
                {d.is_exclusive && <span className="deal-exclusive">Exclusive</span>}
                <div className="deal-biz">{d.business_name}</div>
                <div className="deal-offer">{d.offer_text}</div>
              </div>
            </R_Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ WALL MOSAIC ═══ */
export function R_WallMosaic() {
  const { CITY, WALL_IMAGES, IMG } = useCityModel();
  if (!WALL_IMAGES.length) return null;
  return (
    <section id="wall" className="wall-m">
      <R_Reveal>
        <div className="wall-m-head">
          <div className="eyebrow center">The Wall</div>
          <h2 className="h-section">Seen in <em>{CITY.name}</em></h2>
        </div>
      </R_Reveal>
      <div className="wall-m-grid">
        {WALL_IMAGES.map((img, i) => (
          <R_Reveal key={i} delay={(i % 6) * 0.04} className="rv-scale">
            <div className="wall-m-item">
              <img src={IMG(img)} alt="" loading="lazy" />
            </div>
          </R_Reveal>
        ))}
      </div>
    </section>
  );
}

/* ═══ PLANNER CTA ═══ */
export function R_PlannerCTA({onOpen}) {
  const { CITY } = useCityModel();
  return (
    <section id="planner" className="planner-cta">
      <div className="planner-cta-inner">
        <R_Reveal>
          <div className="eyebrow center">Trip Planner</div>
          <h2 className="h-section">Plan your <em>{CITY.name}</em> trip</h2>
          <p>Tell us what you're into. We'll build the weekend. Swap anything you don't like.</p>
          <button className="btn btn-primary" onClick={onOpen}>
            Start planning
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </R_Reveal>
      </div>
    </section>
  );
}

/* ═══ TRANSIT + SIDE TRIPS ═══ */
export function R_Transit() {
  const { CITY, TRANSIT } = useCityModel();
  if (!TRANSIT.length) return null;
  return (
    <section id="transit" className="transit">
      <R_Reveal>
        <div className="transit-head">
          <div className="eyebrow center">Getting here</div>
          <h2 className="h-section">Arriving in <em>{CITY.name}</em></h2>
        </div>
      </R_Reveal>
      <div className="transit-grid">
        {TRANSIT.map((t, i) => (
          <R_Reveal key={t.label} delay={i * 0.08}>
            <div className="transit-card">
              <div className="icn">{t.icon}</div>
              <h3>{t.label}</h3>
              <p>{t.text}</p>
            </div>
          </R_Reveal>
        ))}
      </div>
    </section>
  );
}

export function R_SideTrips() {
  const { SIDE_TRIPS } = useCityModel();
  if (!SIDE_TRIPS.length) return null;
  return (
    <section id="sidetrips" className="sidetrips">
      <div className="sidetrips-inner">
        <R_Reveal>
          <div className="sidetrips-head">
            <div className="eyebrow center">Worth the drive</div>
            <h2 className="h-section">Beyond the <em>city</em></h2>
          </div>
        </R_Reveal>
        {SIDE_TRIPS.map((trip, i) => (
          <R_Reveal key={trip.name} delay={i * 0.08}>
            <div className="sidetrip">
              <div className="sidetrip-top">
                <h3>{trip.name}</h3>
                <span className="dist">{trip.dist}</span>
              </div>
              <p>{trip.pitch}</p>
              {trip.hl && trip.hl.length > 0 && (
                <div className="tags">
                  {trip.hl.map(h => <span key={h} className="tag">{h}</span>)}
                </div>
              )}
            </div>
          </R_Reveal>
        ))}
      </div>
    </section>
  );
}

/* ═══ FOOTER ═══ */
export function R_Footer() {
  const { CITY, directory, wallUrl } = useCityModel();
  return (
    <footer>
      <a href="/" className="footer-brand">
        <span className="brand-mark">LT</span>
        <span className="brand-text">Local<span className="t">Tour</span></span>
      </a>
      <p>{CITY.name} — {directory.length} curated places</p>
      <div className="footer-links">
        <a href="/">All cities</a>
        <span>·</span>
        <a href={wallUrl}>The Wall</a>
        <span>·</span>
        <a href="https://shaw-labs.com">SH@W Labs</a>
      </div>
    </footer>
  );
}
