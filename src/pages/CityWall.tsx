import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { loadCity } from "../engine/data/loader";
import type { City } from "../engine/data/types";
import "../engine/styles/engine.css";

// Native city wall — a curated travel-photo gallery for every city (replaces the
// legacy per-city Babel wall.html). The homepage combined wall links here; the
// engine's in-page "Wall" links point here too (config-driven wallUrl).
const FT = {
  bg: "#0a0a0b", surf: "#111113", line: "#1c1a17", ink: "#f5f2ec",
  inkMid: "#a09a90", inkDim: "#5a554d", red: "#b3131f", gold: "#c89b3c",
  fd: "'Fraunces',Georgia,serif", fb: "'DM Sans',sans-serif", fm: "'IBM Plex Mono',monospace",
};

export default function CityWall() {
  const { slug = "" } = useParams();
  const [city, setCity] = useState<City | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadCity(slug).then((c) => alive && setCity(c)).catch((e) => alive && setError(String(e)));
    document.body.style.background = FT.bg;
    document.body.style.color = FT.ink;
    window.scrollTo(0, 0);
    return () => { alive = false; document.body.style.background = ""; document.body.style.color = ""; };
  }, [slug]);

  useEffect(() => {
    document.title = city ? `The Wall — ${city.config.name} · LocalTour` : "The Wall · LocalTour";
  }, [city]);

  const photos = useMemo(() => {
    if (!city) return [];
    const img = (city.config.images ?? {}) as Record<string, unknown>;
    const files = [
      img.hero as string,
      ...((img.wall as string[]) ?? []),
      ...((img.story as string[]) ?? []),
      ...Object.values((img.categories as Record<string, string>) ?? {}),
    ].filter(Boolean);
    return [...new Set(files)].map((f) => `/cities/${slug}/images/${f}`);
  }, [city, slug]);

  if (error) return <main style={{ minHeight: "100vh", background: FT.bg }} />;
  if (!city) return <main style={{ minHeight: "100vh", background: FT.bg }} />;

  return (
    <main style={{ minHeight: "100vh", background: FT.bg, color: FT.ink, fontFamily: FT.fb, paddingBottom: 64 }}>
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(10,10,11,.86)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${FT.line}`, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* LT logo → homepage */}
        <Link to="/" title="LocalTour home" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ width: 22, height: 22, background: FT.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: FT.ink, fontFamily: FT.fd }}>LT</span>
          <span style={{ fontFamily: FT.fm, fontSize: 10, letterSpacing: ".22em", color: FT.inkMid, textTransform: "uppercase" }}>The Wall</span>
        </Link>
        <Link to={`/cities/${slug}`} style={{ fontFamily: FT.fm, fontSize: 10, letterSpacing: ".2em", color: FT.inkMid, textTransform: "uppercase", textDecoration: "none" }}>
          ← {city.config.name}
        </Link>
      </header>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 24px" }}>
        <div style={{ fontFamily: FT.fm, fontSize: 10, letterSpacing: ".3em", color: FT.red, textTransform: "uppercase", marginBottom: 10 }}>Community Wall</div>
        <h1 style={{ fontFamily: FT.fd, fontSize: "clamp(34px,7vw,52px)", fontWeight: 600, lineHeight: 1, margin: 0 }}>
          {city.config.name}, in the wild
        </h1>
        <p style={{ color: FT.inkMid, fontSize: 14, lineHeight: 1.6, marginTop: 12, maxWidth: "60ch" }}>
          Travel photos from the road — the moments a directory can't hold. Curated for now; yours soon.
        </p>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px", columns: "3 240px", columnGap: 12 }}>
        {photos.map((src, i) => (
          <div key={src} style={{ breakInside: "avoid", marginBottom: 12, background: FT.surf, border: `1px solid ${FT.line}`, overflow: "hidden" }}>
            <img
              src={src}
              alt={`${city.config.name} travel photo ${i + 1}`}
              loading="lazy"
              style={{ width: "100%", display: "block" }}
              onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
            />
          </div>
        ))}
      </section>

      <footer style={{ textAlign: "center", marginTop: 40, fontFamily: FT.fm, fontSize: 9, letterSpacing: ".24em", color: FT.inkDim, textTransform: "uppercase" }}>
        <Link to="/" style={{ color: FT.inkDim, textDecoration: "none" }}>All Cities</Link>
        <span style={{ opacity: 0.3, margin: "0 12px" }}>·</span>
        <span>A SH@W Labs Product</span>
      </footer>
    </main>
  );
}
