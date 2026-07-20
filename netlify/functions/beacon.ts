// netlify/functions/beacon.ts
//
// LocalTour WS3 — beacon ingest Function (POST /api/beacon).
// Receives a BeaconPayload (canonical schema: src/engine/beacon.ts) delivered
// by navigator.sendBeacon, validates it defensively, and persists it as a raw
// event via the shared blob store.
//
// Privacy (hard requirement): stores NO PII. Never reads or logs the request
// IP or any request headers. sid is opaque. Invalid payloads get a terse error
// with no echo of the submitted data.
//
// Netlify TS functions import sibling modules with a .js extension in ESM.

import { putRawEvent, type RawEvent } from "./_shared/store.js";

export const config = { path: "/api/beacon" };

// The 8 allowed event names (must mirror BeaconEventName in beacon.ts).
const ALLOWED_EVENTS = new Set<string>([
  "pageview_city",
  "biz_impression",
  "biz_click",
  "outbound_click",
  "coupon_reveal",
  "coupon_redeem",
  "planner_generated",
  "share_created",
  "portal_slotgenie_click", // WS6 — chosen tap-through from the Vegas portal
  "trail_view", // WS8 250 Trail opened
  "trail_stop_click", // WS8 trail stop tapped
  "trail_share", // WS8 trail share link created
]);

// view is a closed set per the canonical schema.
const ALLOWED_VIEWS = new Set<string>(["feed", "classic"]);

// Exactly these top-level keys are permitted; anything else is rejected.
const ALLOWED_KEYS = new Set<string>([
  "v",
  "event",
  "city",
  "biz",
  "view",
  "ts",
  "sid",
]);

// Slug shape for city/biz. The store layer also sanitizes keys to [a-z0-9-];
// this is defense in depth against key injection and oversized values.
const SLUG = /^[a-z0-9-]{1,64}$/;
// sid is a client-minted UUID / base36 string — charset-bounded so a caller
// can't store arbitrary bytes under an anonymous id.
const SID = /^[A-Za-z0-9-]{8,64}$/;
const DAY_MS = 86_400_000;
const MAX_BODY = 2048; // a valid payload is ~150 bytes; cap hostile bodies

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

const bad = () => json(400, { error: "invalid" });

export default async (req: Request): Promise<Response> => {
  // CORS preflight — sendBeacon may be treated as a cross-origin request.
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", Allow: "POST", ...CORS },
    });
  }

  // Reject oversized bodies before buffering/parsing (storage-abuse guard).
  if (Number(req.headers.get("content-length") || 0) > MAX_BODY) {
    return json(413, { error: "too_large" });
  }
  // sendBeacon delivers the payload as blob/text; parse tolerantly.
  let parsed: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY) return bad();
    parsed = JSON.parse(text);
  } catch {
    return bad();
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return bad();
  }
  const body = parsed as Record<string, unknown>;

  // Reject unknown / extra top-level fields.
  for (const key of Object.keys(body)) {
    if (!ALLOWED_KEYS.has(key)) return bad();
  }

  const { v, event, city, biz, view, ts, sid } = body;

  // Required fields.
  if (v !== 1) return bad();
  if (typeof event !== "string" || !ALLOWED_EVENTS.has(event)) return bad();
  if (typeof city !== "string" || !SLUG.test(city)) return bad();
  // ts must be finite AND within a sane window: guards the isoDate() partition
  // (new Date(1e300).toISOString() throws RangeError) and rejects bogus dates.
  const now = Date.now();
  if (typeof ts !== "number" || !Number.isFinite(ts) || ts < now - 2 * DAY_MS || ts > now + DAY_MS) return bad();
  if (typeof sid !== "string" || !SID.test(sid)) return bad();

  // Optional fields.
  let bizOut: string | undefined;
  if (biz !== undefined) {
    if (typeof biz !== "string" || !SLUG.test(biz)) return bad();
    bizOut = biz;
  }

  let viewOut: string | undefined;
  if (view !== undefined) {
    if (typeof view !== "string" || !ALLOWED_VIEWS.has(view)) return bad();
    viewOut = view;
  }

  // Whitelisted construction — only known-good fields reach the store.
  const record: RawEvent = { v: 1, event, city, ts, sid };
  if (bizOut !== undefined) record.biz = bizOut;
  if (viewOut !== undefined) record.view = viewOut;

  try {
    await putRawEvent(record);
  } catch {
    // Never leak internals or request PII.
    return json(500, { error: "store_error" });
  }

  return new Response(null, { status: 204, headers: CORS });
};
