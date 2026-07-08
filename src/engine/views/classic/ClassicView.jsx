// ClassicView — STUB (WS1 port in progress; replaced by the classic porter).
import { useEffect } from "react";
import { DARK } from "../../theme";
import { useCityModel } from "../../cityModel";

export default function ClassicView() {
  const m = useCityModel();
  useEffect(() => {
    document.body.style.background = DARK.bg;
    document.body.style.color = DARK.sand;
  }, []);
  return (
    <div className="view-enter" style={{ minHeight: "100vh", background: DARK.bg, color: DARK.sand, padding: "96px 32px", fontFamily: DARK.fb }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ fontSize: 10, letterSpacing: ".3em", color: DARK.terra, textTransform: "uppercase", marginBottom: 12 }}>
          Classic view · engine port in progress
        </div>
        <h1 style={{ fontFamily: DARK.fd, fontSize: 52, lineHeight: 1.05, margin: 0 }}>{m.HERO.title}</h1>
        <p style={{ color: DARK.fog, fontSize: 16, lineHeight: 1.65, marginTop: 16, maxWidth: 640 }}>{m.HERO.sub}</p>
        <p style={{ color: DARK.fog, fontSize: 14, marginTop: 28, fontFamily: "'IBM Plex Mono',monospace" }}>
          {m.directory.length} places · {m.sortedCats.length} categories · {m.nodes.length} concierge nodes
        </p>
      </div>
    </div>
  );
}
