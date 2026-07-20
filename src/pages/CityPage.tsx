import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { loadCity } from "../engine/data/loader";
import CityApp from "../engine/CityApp";
import { adaptCity } from "../engine/cityModel";

// Per-city editorial modules are OPTIONAL (factory cities won't have one yet) —
// the model falls back to a data-derived storyboard when absent.
const editorialModules = import.meta.glob("../engine/editorial/*.jsx", { import: "default" });

export default function CityPage() {
  const { slug = "" } = useParams();
  const [model, setModel] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setModel(null);
    setError(null);
    (async () => {
      try {
        const city = await loadCity(slug);
        const key = `../engine/editorial/${slug}.jsx`;
        const editorial = editorialModules[key] ? await editorialModules[key]() : null;
        if (alive) setModel(adaptCity(city, editorial));
      } catch (e: unknown) {
        if (alive) setError(String(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    document.title = model ? `${slug.replace(/-/g, " ")} — LocalTour` : "LocalTour";
  }, [model, slug]);

  if (error)
    return (
      <main style={{ minHeight: "100vh", background: "#0a0a0b", color: "#f5f2ec", display: "grid", placeItems: "center", fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ maxWidth: 480, padding: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: ".3em", color: "#b3131f", textTransform: "uppercase", marginBottom: 12 }}>Load error</div>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: 28, margin: "0 0 12px" }}>Couldn't load “{slug}”</h1>
          <p style={{ color: "#a09a90" }}>{error}</p>
        </div>
      </main>
    );
  if (!model) return <main style={{ minHeight: "100vh", background: "#0a0a0b" }} />;
  return <CityApp model={model} />;
}
