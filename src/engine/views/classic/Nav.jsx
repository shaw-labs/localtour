// Classic view — nav bar + side menu (ported verbatim; chicago index.html ~1809–1873).
import { CAT_LABELS_R } from "../../theme";
import { useCityModel } from "../../cityModel";

/* ═══ NAV + MENU ═══ */
export function R_Nav({scrolled, onMenuToggle, menuOpen}) {
  const { CITY, wallUrl } = useCityModel();
  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-left">
        <button
          className={`menu-btn ${menuOpen ? 'open' : ''}`}
          onClick={onMenuToggle}
          aria-label="Menu"
        >
          <span/><span/><span/>
        </button>
        <a href="/" className="brand">
          <span className="brand-mark">LT</span>
          <span className="brand-text">Local<span className="t">Tour</span></span>
        </a>
      </div>
      <div className="nav-right">
        <a href={wallUrl} className="nav-link">The Wall</a>
        <span className="city-badge">{CITY.name}</span>
      </div>
    </nav>
  );
}

export function R_SideMenu({open, onClose, onOpenConcierge, onOpenPlanner}) {
  const { CITY, sortedCats, wallUrl } = useCityModel();
  const items = [
    {id: 'hero', label: 'Top'},
    {id: 'story', label: 'The Story'},
    {id: 'explore', label: 'Where to Start'},
    {id: 'vibes', label: 'Filter by Vibe'},
    ...sortedCats.map(c => ({id: `dir-${c}`, label: CAT_LABELS_R[c] || c})),
    {id: 'deals', label: 'Deals'},
    {id: 'wall', label: 'The Wall'},
    {id: 'planner', label: 'Trip Planner'},
    {id: 'transit', label: 'Getting Here'}
  ];
  const scrollTo = (id) => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, 380);
  };
  return (
    <>
      <div className={`menu-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`menu-drawer ${open ? 'open' : ''}`}>
        <div className="region">{CITY.name}, {CITY.state}</div>
        <div className="tag">{CITY.tagline}</div>
        <div className="quick">
          <button onClick={() => { onClose(); onOpenPlanner(); }}>📋 Plan</button>
          <a href={wallUrl} onClick={onClose}>📸 Wall</a>
          <button onClick={() => { onClose(); onOpenConcierge(); }}>💬 {CITY.concierge_name}</button>
          <button onClick={() => scrollTo('deals')}>🎟 Deals</button>
        </div>
        <nav>
          {items.map(it => (
            <button key={it.id} onClick={() => scrollTo(it.id)}>{it.label}</button>
          ))}
        </nav>
      </aside>
    </>
  );
}
