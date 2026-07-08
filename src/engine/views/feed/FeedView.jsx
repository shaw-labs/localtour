// FeedView — STUB (WS1 port in progress; replaced by the feed porter).
// Renders honestly from the model so /cities/<slug>/ works end-to-end today:
// hero, greeting, picks storyboard skeleton, full directory. No fabricated copy.
import { useEffect } from "react";
import { FT, CAT_LABELS_PLAIN } from "../../theme";
import { useCityModel } from "../../cityModel";

export default function FeedView() {
  const m = useCityModel();
  useEffect(() => {
    document.body.style.background = FT.bg;
    document.body.style.color = FT.ink;
  }, []);
  return (
    <div className="view-enter" style={{ position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 560, margin: "0 auto", background: FT.bg, minHeight: "100vh", padding: "72px 24px 64px", fontFamily: FT.fb }}>
        <div style={{ fontFamily: FT.fm, fontSize: 9, letterSpacing: ".3em", color: FT.red, textTransform: "uppercase", marginBottom: 8 }}>
          LocalTour · engine port in progress
        </div>
        <h1 style={{ fontFamily: FT.fd, fontSize: 40, fontWeight: 600, color: FT.ink, lineHeight: 1.05, margin: 0 }}>{m.HERO.title}</h1>
        <p style={{ color: FT.inkMid, fontSize: 15, lineHeight: 1.6, marginTop: 12 }}>{m.HERO.sub}</p>
        <p style={{ color: FT.inkMid, fontSize: 14, lineHeight: 1.6, marginTop: 20, borderLeft: `2px solid ${FT.red}`, paddingLeft: 12, fontStyle: "italic" }}>
          {m.CITY.concierge_greeting}
        </p>
        <div style={{ marginTop: 36 }}>
          {m.sortedCats.map((cat) => (
            <section key={cat} style={{ borderTop: `1px solid ${FT.line}`, padding: "18px 0" }}>
              <h2 style={{ fontFamily: FT.fd, fontSize: 20, color: FT.ink, margin: 0 }}>
                {CAT_LABELS_PLAIN[cat] ?? cat}{" "}
                <span style={{ color: FT.inkDim, fontSize: 13, fontFamily: FT.fm }}>({m.grouped[cat].length})</span>
              </h2>
              <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
                {m.grouped[cat].slice(0, 3).map((b) => (
                  <li key={b.name} style={{ color: FT.inkMid, fontSize: 14 }}>
                    <span style={{ color: FT.ink, fontWeight: 600 }}>{b.name}</span>
                    {b.rating ? <span style={{ color: FT.gold, marginLeft: 8, fontFamily: FT.fm, fontSize: 12 }}>★ {b.rating}</span> : null}
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{b.description}</div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
