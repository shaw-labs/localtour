import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

// LocalTour — Merchant stats page (WS3). Route: /partners/stats?k=<token>
// Reads a merchant's 24-char token from the URL, fetches GET /api/stats?k=<token>,
// and renders their honest last-30-day dashboard. No external chart lib — the
// sparkline is hand-drawn SVG. Self-contained, no new deps. Light brand theme
// mirrored from CityWall.tsx (bg #faf8f4, terra #dc2626, Playfair + DM Sans).

const T = {
  bg: "#faf8f4", card: "#ffffff", fog: "#718096", text: "#0c1b2a", terra: "#dc2626",
  gold: "#b8860b", dim: "#a0aec0", border: "#e2e8f0", slate: "#f0f4f8", glow: "rgba(220,38,38,0.08)",
  fd: "'Playfair Display',Georgia,serif", fb: "'DM Sans',sans-serif",
};

// ---- Contract types (mirror the /api/stats response shape exactly) ----
type MetricKey = "impressions" | "detail_opens" | "click_outs" | "coupon_reveals" | "redemptions";

interface DailyRow {
  date: string;
  impressions: number;
  detail_opens: number;
  click_outs: number;
  coupon_reveals: number;
  redemptions: number;
}

interface StatsResponse {
  merchant: { city: string; biz: string; name: string };
  window_days: number;
  totals: {
    impressions: number;
    detail_opens: number;
    click_outs: number;
    coupon_reveals: number;
    redemptions: number;
  };
  daily: DailyRow[];
}

interface MetricDef {
  key: MetricKey;
  label: string;
  note?: string;
}

const METRICS: MetricDef[] = [
  { key: "impressions", label: "Listing views", note: "estimated" },
  { key: "detail_opens", label: "Detail opens" },
  { key: "click_outs", label: "Click-outs" },
  { key: "coupon_reveals", label: "Coupon reveals" },
  { key: "redemptions", label: "Redemptions", note: "merchant-confirmed" },
];

const METRIC_LABEL: Record<MetricKey, string> = {
  impressions: "Listing views",
  detail_opens: "Detail opens",
  click_outs: "Click-outs",
  coupon_reveals: "Coupon reveals",
  redemptions: "Redemptions",
};

const ERR_MSG = "This link isn't valid — check with LocalTour for a fresh one.";

function fmt(n: number): string {
  return (Number.isFinite(n) ? n : 0).toLocaleString("en-US");
}

// "2026-07-03" -> "Jul 3" (parsed as UTC so the label matches the server's date bucket)
function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

// ---- Hand-drawn SVG bar sparkline for one metric across the daily series ----
function Sparkline({ daily, metric, label }: { daily: DailyRow[]; metric: MetricKey; label: string }) {
  const W = 640, H = 168, padL = 10, padR = 10, padT = 16, padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const n = daily.length;

  if (n === 0) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", fontFamily: T.fb, fontSize: 14, color: T.dim }}>
        No daily activity in this window yet.
      </div>
    );
  }

  const points = daily.map((d) => ({ date: d.date, v: Math.max(0, d[metric] || 0) }));
  const max = Math.max(1, ...points.map((p) => p.v));
  const slot = plotW / n;
  const barW = Math.max(2, slot * 0.66);
  const baseY = padT + plotH;

  // sparse x-axis ticks: first, middle, last
  const tickSet = new Set<number>(n === 1 ? [0] : [0, Math.floor((n - 1) / 2), n - 1]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      role="img"
      aria-label={`${label} per day over the last ${n} days. Peak ${fmt(max)}.`}
      style={{ display: "block", overflow: "visible" }}
    >
      {/* peak reference line + label */}
      <line x1={padL} y1={padT} x2={W - padR} y2={padT} stroke={T.border} strokeWidth={1} strokeDasharray="3 4" />
      <text x={padL} y={padT - 5} fontFamily={T.fb} fontSize={11} fill={T.dim}>{fmt(max)}</text>
      {/* baseline */}
      <line x1={padL} y1={baseY} x2={W - padR} y2={baseY} stroke={T.border} strokeWidth={1} />
      {points.map((p, i) => {
        const h = (p.v / max) * plotH;
        const cx = padL + i * slot + slot / 2;
        const x = cx - barW / 2;
        const y = baseY - h;
        const anchor = i === 0 ? "start" : i === n - 1 ? "end" : "middle";
        return (
          <g key={`${p.date}-${i}`}>
            <rect x={x} y={y} width={barW} height={Math.max(p.v > 0 ? 1.5 : 0, h)} rx={2} fill={T.terra} opacity={0.85}>
              <title>{`${shortDate(p.date)} · ${fmt(p.v)} ${label.toLowerCase()}`}</title>
            </rect>
            {tickSet.has(i) ? (
              <text x={cx} y={H - 8} fontFamily={T.fb} fontSize={11} fill={T.fog} textAnchor={anchor}>
                {shortDate(p.date)}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function MetricCard({ def, value }: { def: MetricDef; value: number }) {
  const isEst = def.key === "impressions";
  return (
    <div
      style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 18px 16px",
        boxShadow: "0 1px 3px rgba(0,0,0,.04)", display: "flex", flexDirection: "column", gap: 4, minWidth: 0,
      }}
    >
      <div style={{ fontFamily: T.fb, fontSize: 12.5, fontWeight: 600, color: T.fog, letterSpacing: 0.2 }}>
        {def.label}{isEst ? " (est.)" : ""}
      </div>
      <div style={{ fontFamily: T.fd, fontSize: "clamp(26px,5vw,34px)", fontWeight: 700, lineHeight: 1.05, color: T.text }}>
        {fmt(value)}
      </div>
      {def.note ? (
        <div style={{ fontFamily: T.fb, fontSize: 11, color: def.key === "redemptions" ? T.gold : T.dim }}>
          {def.note}
        </div>
      ) : (
        <div style={{ fontFamily: T.fb, fontSize: 11, color: T.dim }}>precise</div>
      )}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.fb }}>
      <header
        style={{
          position: "sticky", top: 0, zIndex: 20, background: "rgba(250,248,244,.9)", backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${T.border}`, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Link to="/" title="LocalTour home" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ width: 24, height: 24, borderRadius: 6, background: T.terra, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: T.fd }}>LT</span>
          <span style={{ fontFamily: T.fd, fontSize: 17, fontWeight: 700, color: T.text }}>Partner Stats</span>
        </Link>
        <Link to="/" style={{ fontFamily: T.fb, fontSize: 13, fontWeight: 600, color: T.fog, textDecoration: "none" }}>← LocalTour</Link>
      </header>
      {children}
      <footer style={{ textAlign: "center", padding: "28px 16px 48px", fontFamily: T.fb, fontSize: 12, color: T.dim }}>
        <Link to="/" style={{ color: T.fog, textDecoration: "none", fontWeight: 600 }}>localtour.us</Link>
        <span style={{ opacity: 0.4, margin: "0 12px" }}>·</span>
        <span>A SH@W Labs Product</span>
      </footer>
    </main>
  );
}

export default function PartnersStats() {
  const [params] = useSearchParams();
  const token = (params.get("k") || "").trim();

  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<MetricKey>("impressions");

  useEffect(() => {
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
    window.scrollTo(0, 0);
    return () => { document.body.style.background = ""; document.body.style.color = ""; };
  }, []);

  useEffect(() => {
    document.title = data ? `${data.merchant.name} — Partner Stats · LocalTour` : "Partner Stats · LocalTour";
  }, [data]);

  useEffect(() => {
    if (!token) { setError(ERR_MSG); setLoading(false); return; }
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);
    fetch(`/api/stats?k=${encodeURIComponent(token)}`, { signal: ctrl.signal, headers: { accept: "application/json" } })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as StatsResponse;
        if (!json || !json.merchant || !json.totals || !Array.isArray(json.daily)) throw new Error("shape");
        setData(json);
      })
      .catch((e: unknown) => {
        if ((e as { name?: string }).name === "AbortError") return;
        setError(ERR_MSG);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [token]);

  const daily = data?.daily ?? [];

  function downloadCsv() {
    if (!data) return;
    const cols: MetricKey[] = ["impressions", "detail_opens", "click_outs", "coupon_reveals", "redemptions"];
    const header = ["date", "listing_views_est", "detail_opens", "click_outs", "coupon_reveals", "redemptions"];
    const lines = [header.join(",")];
    for (const row of data.daily) {
      lines.push([row.date, ...cols.map((c) => String(row[c] ?? 0))].join(","));
    }
    // totals footer row for convenience
    lines.push(["TOTAL", ...cols.map((c) => String(data.totals[c] ?? 0))].join(","));
    const csv = lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `localtour-${data.merchant.biz || "merchant"}-30d.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  // ---- Loading ----
  if (loading) {
    return (
      <Shell>
        <section style={{ maxWidth: 860, margin: "0 auto", padding: "48px 16px" }}>
          <div style={{ height: 22, width: 220, background: T.slate, borderRadius: 8, marginBottom: 12 }} />
          <div style={{ height: 14, width: 140, background: T.slate, borderRadius: 8, marginBottom: 28 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: 96, background: T.card, border: `1px solid ${T.border}`, borderRadius: 16 }} />
            ))}
          </div>
          <p style={{ marginTop: 24, fontFamily: T.fb, fontSize: 13, color: T.dim }}>Loading your numbers…</p>
        </section>
      </Shell>
    );
  }

  // ---- Error (missing / invalid token) ----
  if (error || !data) {
    return (
      <Shell>
        <section style={{ maxWidth: 560, margin: "0 auto", padding: "72px 20px", textAlign: "center" }}>
          <span style={{ fontSize: 40, display: "block", marginBottom: 14 }}>🔑</span>
          <h1 style={{ fontFamily: T.fd, fontSize: "clamp(24px,5vw,30px)", fontWeight: 700, margin: "0 0 10px", color: T.text }}>
            Can't open this dashboard
          </h1>
          <p style={{ fontFamily: T.fb, fontSize: 15, lineHeight: 1.6, color: T.fog, margin: "0 auto", maxWidth: 380 }}>
            {ERR_MSG}
          </p>
          <Link
            to="/"
            style={{ display: "inline-block", marginTop: 26, padding: "12px 22px", borderRadius: 12, background: T.terra, color: "#fff", fontFamily: T.fb, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: `0 4px 16px ${T.glow}` }}
          >
            Back to LocalTour
          </Link>
        </section>
      </Shell>
    );
  }

  // ---- Loaded ----
  const { merchant, totals } = data;
  return (
    <Shell>
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "36px 16px 8px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: T.fb, fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: T.terra }}>
              Partner Dashboard
            </div>
            <h1 style={{ fontFamily: T.fd, fontSize: "clamp(30px,6vw,46px)", fontWeight: 700, lineHeight: 1.02, margin: "6px 0 0", color: T.text, wordBreak: "break-word" }}>
              {merchant.name}
            </h1>
            <p style={{ fontFamily: T.fb, fontSize: 14, color: T.fog, margin: "8px 0 0" }}>
              {merchant.city} · Last {data.window_days ?? 30} days
            </p>
          </div>
          <button
            onClick={downloadCsv}
            style={{ padding: "11px 18px", borderRadius: 12, background: T.card, color: T.text, fontFamily: T.fb, fontSize: 13.5, fontWeight: 700, border: `1px solid ${T.border}`, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}
          >
            ↓ Download CSV
          </button>
        </div>
      </section>

      {/* Metric cards */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "20px 16px 8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
          {METRICS.map((m) => <MetricCard key={m.key} def={m} value={totals[m.key] ?? 0} />)}
        </div>
      </section>

      {/* Sparkline + metric selector */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "20px 16px 8px" }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: "18px 18px 8px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: T.fd, fontSize: 18, fontWeight: 700, color: T.text, marginRight: "auto" }}>Daily trend</span>
            {METRICS.map((m) => {
              const on = m.key === metric;
              return (
                <button
                  key={m.key}
                  onClick={() => setMetric(m.key)}
                  aria-pressed={on}
                  style={{ padding: "6px 12px", borderRadius: 999, fontFamily: T.fb, fontSize: 12, fontWeight: on ? 700 : 500, background: on ? T.terra : T.slate, color: on ? "#fff" : T.fog, border: on ? "none" : `1px solid ${T.border}`, cursor: "pointer" }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
          <Sparkline daily={daily} metric={metric} label={METRIC_LABEL[metric]} />
        </div>
      </section>

      {/* Honest footnote */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "16px 16px 8px" }}>
        <p style={{ fontFamily: T.fb, fontSize: 12.5, lineHeight: 1.6, color: T.fog, margin: 0, borderLeft: `3px solid ${T.gold}`, paddingLeft: 12 }}>
          Listing views are sampled estimates. Redemptions are merchant-confirmed. Everything else is precise.
        </p>
      </section>
    </Shell>
  );
}
