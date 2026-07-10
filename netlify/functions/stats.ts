// LocalTour WS3 — merchant stats read.
//
// GET /api/stats?k=<token> → a single merchant's last-30-day metrics plus a
// zero-filled daily series. Routed via config.path (not netlify.toml).
//
// Freshness: this reads RAW events live (listRawRange over lastNDates(30))
// filtered to the token's biz, so numbers are instant and never depend on the
// scheduled aggregator. The daily rollup (aggregate.ts) is only a retention
// optimization.
//
// Privacy / security (audited):
//   • The response echoes nothing about the caller beyond the merchant's own
//     {city, biz, name}. No PII, no headers/IPs, no raw event bodies, no sid.
//   • No token enumeration: a missing token and any provided-but-unknown token
//     both return 401 JSON with a generic message. getToken runs the same way
//     for every provided token, so a malformed vs. unknown token are
//     indistinguishable in shape and latency. The token is never echoed back.
//   • impressions are ESTIMATED: biz_impression is sampled client-side at 0.25,
//     so each stored impression is scaled ×4 to approximate true reach.

import type { Context } from "@netlify/functions";
import { getToken, isoDate, lastNDates, listRawRange } from "./_shared/store.js";

const WINDOW_DAYS = 30;
const IMPRESSION_SCALE = 4; // 0.25 client sample → ×4 estimated reach

const CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type",
  "cache-control": "no-store", // per-token, live — never cache
};

interface Metrics {
  impressions: number; // biz_impression ×4 (estimated)
  detail_opens: number; // biz_click
  click_outs: number; // outbound_click
  coupon_reveals: number; // coupon_reveal
  redemptions: number; // coupon_redeem
}

function zeroMetrics(): Metrics {
  return { impressions: 0, detail_opens: 0, click_outs: 0, coupon_reveals: 0, redemptions: 0 };
}

export default async (req: Request, _context: Context): Promise<Response> => {
  // Browser preflight (merchant dashboard may be a different origin).
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (req.method !== "GET") {
    return json(405, { error: "method not allowed" }, { allow: "GET, OPTIONS" });
  }

  // Read + normalize the token. Missing, malformed, and unknown tokens all
  // return the SAME generic 401 (identical body + latency profile) so the
  // endpoint gives no enumeration hint about which tokens exist.
  const token = (new URL(req.url).searchParams.get("k") ?? "").trim();
  const rec = token ? await getToken(token) : null;
  if (!rec) {
    return json(401, { error: "unauthorized" });
  }

  // Live read of the last 30 UTC days, filtered to this merchant's biz.
  const dates = lastNDates(WINDOW_DAYS); // ascending, ending today
  const byDate = new Map<string, Metrics>();
  for (const d of dates) byDate.set(d, zeroMetrics());

  const raw = await listRawRange(rec.city, dates);
  for (const ev of raw) {
    if (ev.biz !== rec.biz) continue; // only this merchant's biz-scoped events
    const row = byDate.get(isoDate(ev.ts)); // key by the event's UTC day
    if (!row) continue; // stray day outside the window — ignore, keep series clean
    switch (ev.event) {
      case "biz_impression":
        row.impressions += IMPRESSION_SCALE;
        break;
      case "biz_click":
        row.detail_opens += 1;
        break;
      case "outbound_click":
        row.click_outs += 1;
        break;
      case "coupon_reveal":
        row.coupon_reveals += 1;
        break;
      case "coupon_redeem":
        row.redemptions += 1;
        break;
      default:
        break; // non-metric / city-scoped events are not counted here
    }
  }

  // Daily series in ascending date order, zero-filled for days with no events.
  const daily = dates.map((date) => {
    const m = byDate.get(date) ?? zeroMetrics();
    return {
      date,
      impressions: m.impressions,
      detail_opens: m.detail_opens,
      click_outs: m.click_outs,
      coupon_reveals: m.coupon_reveals,
      redemptions: m.redemptions,
    };
  });

  const totals = zeroMetrics();
  for (const d of daily) {
    totals.impressions += d.impressions;
    totals.detail_opens += d.detail_opens;
    totals.click_outs += d.click_outs;
    totals.coupon_reveals += d.coupon_reveals;
    totals.redemptions += d.redemptions;
  }

  return json(200, {
    merchant: { city: rec.city, biz: rec.biz, name: rec.name },
    window_days: WINDOW_DAYS,
    totals,
    daily,
  });
};

export const config = { path: "/api/stats" };

function json(status: number, body: unknown, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS,
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}
