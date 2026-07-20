// Classic view — hero + events ticker (ported verbatim; chicago index.html ~1875–1916).
import { useCityModel } from "../../cityModel";

/* ═══ HERO ═══ */
export function R_Hero() {
  const { CITY, HERO, IMG } = useCityModel();
  return (
    <section id="hero" className="hero">
      <div
        className="hero-img"
        style={{backgroundImage: `url(${IMG(HERO.image)})`}}
      />
      <div className="hero-content">
        <div className="eyebrow">{CITY.region || `${CITY.state}`}</div>
        <h1>
          {CITY.name.split(' ').map((w, i) => (
            <span key={i}>{i === CITY.name.split(' ').length - 1 ? <em>{w}</em> : w + ' '}</span>
          ))}
        </h1>
        <p className="hero-sub-title">{HERO.title}</p>
        <p className="hero-sub">{HERO.sub}</p>
      </div>
      <div className="hero-scroll-hint">Scroll to explore</div>
    </section>
  );
}

/* ═══ TICKER ═══ */
export function R_Ticker() {
  const { events } = useCityModel();
  const featured = events.filter(e => e.featured).slice(0, 8);
  const items = [...featured, ...featured];
  if (!items.length) return null;
  return (
    <div className="ticker">
      <div className="ticker-track">
        {items.map((e, i) => (
          <span className="ticker-item" key={i}>
            <span className="dot" />
            <span>{e.title}</span>
            <span className="d">· {e.date}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
