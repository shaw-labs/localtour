// LocalTour WS3 — coupon redemption confirm  (GET /api/redeem).
//
// This is the honest "merchant confirms the coupon was used" tap: a merchant
// (or the coupon UI on their behalf) hits this endpoint when a customer redeems
// an offer. Because redemption happens in the physical world, these counts are
// MERCHANT-CONFIRMED APPROXIMATIONS, not guaranteed 1:1 with real-world usage —
// we only record what was actually tapped, and we never double-count a session.
//
// Idempotency is per (coupon code, session id): markRedeemed is the source of
// truth. The first tap for a given (code, sid) records a coupon_redeem raw event
// (so it flows into /api/stats redemptions); any repeat tap is acknowledged with
// { already: true } and contributes NOTHING further — no inflated numbers.
//
// Privacy: no PII is read or stored. sid is the opaque anonymous session id from
// beacon.ts; city/biz are slugs. We log nothing (no IPs, no headers).

import type { Context } from "@netlify/functions";
import { markRedeemed, putRawEvent } from "./_shared/store.js";

// All four params must be safe slug/code strings: lowercase alnum + hyphen only,
// bounded length, starting on an alphanumeric. This matches the system-wide
// slug charset (beacon bizId), the anonymous sid shape (lowercased UUID / base36),
// and the blob key charset [a-z0-9-/] — so a param can never inject a key
// separator ("/"), path traversal ("."), or whitespace into a blob key.
const SAFE = /^[a-z0-9][a-z0-9-]{0,127}$/;
const isSafe = (v: string | null): v is string => typeof v === "string" && SAFE.test(v);

// This endpoint is fetched from the browser coupon UI, so answer CORS preflight
// and echo permissive GET CORS on every response.
const CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type",
};

export default async (req: Request, _context: Context): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "GET") return json(405, { ok: false, error: "method_not_allowed" });

  const params = new URL(req.url).searchParams;
  const c = params.get("c"); // coupon code
  const sid = params.get("sid"); // anonymous session id
  const city = params.get("city"); // city slug
  const biz = params.get("biz"); // business slug

  // Reject anything missing or outside the safe charset. Uniform 400, no hints.
  if (!isSafe(c) || !isSafe(sid) || !isSafe(city) || !isSafe(biz)) {
    return json(400, { ok: false, error: "bad_request" });
  }

  try {
    // First confirmation for this (code, sid) → record it as a real redemption.
    // Repeat confirmations are idempotent: acknowledged, never re-counted.
    const newlyRedeemed = await markRedeemed(c, sid);
    if (newlyRedeemed) {
      await putRawEvent({ v: 1, event: "coupon_redeem", city, biz, ts: Date.now(), sid });
      return json(200, { ok: true, already: false });
    }
    return json(200, { ok: true, already: true });
  } catch {
    // Never surface store/runtime internals to the caller.
    return json(500, { ok: false, error: "store_error" });
  }
};

export const config = { path: "/api/redeem" };

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...CORS },
  });
}
