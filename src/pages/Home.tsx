import { useEffect, useState } from "react";
import { CITY_SLUGS, loadCity } from "../engine/data/loader";
import type { City } from "../engine/data/types";

// Work-build dev index (NOT the product): every figure below is computed at
// runtime from cities/*/data.json through the typed loader — zero hand-typed
// statistics, per brief Principle 1. The product engine lands in Phase 1 (WS1).
export default function Home() {
  const [cities, setCities] = useState<City[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all(CITY_SLUGS.map(loadCity))
      .then(setCities)
      .catch((e: unknown) => setError(String(e)));
  }, []);

  const total = (pick: (c: City) => number) =>
    cities ? cities.reduce((n, c) => n + pick(c), 0) : 0;

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 px-6 py-16 font-mono">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-red-600">
            SH@W Labs · work build — not the product
          </p>
          <h1 className="text-4xl font-bold">LocalTour — Final Cut</h1>
          <p className="text-stone-400 text-sm">
            Phase 0 complete: modular city containers adopted (final-cut pack),
            typed loader live, contract + provenance gates green. Every number on
            this page is computed from <code>cities-modular/</code> at runtime —
            nothing hand-typed.{" "}
            <a href="/work/" className="text-amber-400 underline">
              War-room board →
            </a>
          </p>
        </header>

        {error && <p className="text-red-500 text-sm">Loader error: {error}</p>}
        {!cities && !error && <p className="text-stone-500 text-sm">Loading 8 cities…</p>}

        {cities && (
          <>
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {(
                [
                  ["businesses", total((c) => c.directory.length)],
                  ["deals", total((c) => c.deals.length)],
                  ["events", total((c) => c.events.length)],
                  ["nodes", total((c) => c.concierge.length)],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="border border-stone-800 rounded p-4 bg-stone-900">
                  <div className="text-3xl font-bold text-amber-400 tabular-nums">{value}</div>
                  <div className="text-[11px] uppercase tracking-widest text-stone-500 mt-1">
                    {label}
                  </div>
                </div>
              ))}
            </section>

            <section className="flex flex-wrap gap-2">
              {cities.map((c) => (
                <a
                  key={c.slug}
                  href={`/cities/${c.slug}`}
                  className="px-3 py-1.5 border border-stone-700 rounded text-xs text-stone-300 hover:border-amber-400 hover:text-amber-400"
                >
                  {c.config.name} →
                </a>
              ))}
            </section>

            <section>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-stone-500 border-b border-stone-800">
                    <th className="py-2 pr-3">city</th>
                    <th className="py-2 pr-3 text-right">biz</th>
                    <th className="py-2 pr-3 text-right">deals</th>
                    <th className="py-2 pr-3 text-right">events</th>
                    <th className="py-2 text-right">nodes</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {cities.map((c) => (
                    <tr key={c.slug} className="border-b border-stone-900">
                      <td className="py-2 pr-3 text-stone-300">{c.slug}</td>
                      <td className="py-2 pr-3 text-right">{c.directory.length}</td>
                      <td className="py-2 pr-3 text-right">{c.deals.length}</td>
                      <td className="py-2 pr-3 text-right">{c.events.length}</td>
                      <td className="py-2 text-right">{c.concierge.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        <footer className="text-[11px] text-stone-600 space-y-1">
          <p>curated, not scraped · good answer first, revenue second</p>
          <p>production (localtour.directory) is untouched — this is the dev deploy</p>
        </footer>
      </div>
    </main>
  );
}
