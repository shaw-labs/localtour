// LocalTour beacon — the self-owned, merchant-facing event stream (WS3).
// ~1KB of client code. Fires anonymous, no-PII events via navigator.sendBeacon
// to the ingest Function. This is the product merchants pay for, so it is owned
// here (not delegated to Plausible, which mirrors only the top-level events).
//
// Privacy contract (must hold — audited):
//   • No PII, ever. The only identifier is a random per-session id (not derived
//     from anything about the user — not fingerprinted).
//   • Respect Do-Not-Track and Global Privacy Control: if set, emit NOTHING.
//   • Session id lives in sessionStorage (cleared when the tab closes) — no
//     durable cross-visit or cross-site identifier.
//
// This module is the canonical event SCHEMA. The ingest Function re-validates
// the same shape defensively; keep the two in sync (SCHEMA_VERSION bumps both).

export const SCHEMA_VERSION = 1;

export type BeaconEventName =
  | "pageview_city"
  | "biz_impression" // viewport-observed, sampled
  | "biz_click" // detail open
  | "outbound_click" // website / phone tap
  | "coupon_reveal"
  | "coupon_redeem"
  | "planner_generated"
  | "share_created"
  | "portal_slotgenie_click"; // WS6 Vegas portal → SlotGenie handoff

export type ViewName = "feed" | "classic";

export interface BeaconPayload {
  v: number; // SCHEMA_VERSION
  event: BeaconEventName;
  city: string; // slug
  biz?: string; // slugified business name (business-scoped events only)
  view?: ViewName;
  ts: number; // client epoch ms
  sid: string; // anonymous random session id
}

const ENDPOINT = "/api/beacon";
const SID_KEY = "lt_sid";
const IMPRESSION_SAMPLE = 0.25; // sample biz_impression to keep volume sane

// slugify a business name → stable id used across events and the stats rollup.
export function bizId(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Honor DNT (navigator.doNotTrack / window.doNotTrack / msDoNotTrack === "1")
// and GPC (navigator.globalPrivacyControl === true). When either is set we go
// completely silent — no session id minted, no request sent.
let optedOut: boolean | null = null;
function isOptedOut(): boolean {
  if (optedOut !== null) return optedOut;
  if (typeof navigator === "undefined") return (optedOut = true);
  const nav = navigator as Navigator & {
    doNotTrack?: string;
    msDoNotTrack?: string;
    globalPrivacyControl?: boolean;
  };
  const dnt =
    nav.doNotTrack === "1" ||
    nav.msDoNotTrack === "1" ||
    (typeof window !== "undefined" && (window as unknown as { doNotTrack?: string }).doNotTrack === "1");
  const gpc = nav.globalPrivacyControl === true;
  return (optedOut = Boolean(dnt || gpc));
}

function sessionId(): string {
  try {
    let sid = sessionStorage.getItem(SID_KEY);
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    // storage blocked (private mode / embedded) — ephemeral id, still anonymous
    return "nostore";
  }
}

interface EmitOpts {
  biz?: string; // pass a raw business NAME; it is slugified here
  view?: ViewName;
}

// Fire-and-forget. Never throws, never blocks render.
export function emit(event: BeaconEventName, city: string, opts: EmitOpts = {}): void {
  if (isOptedOut() || typeof navigator === "undefined" || !city) return;
  if (event === "biz_impression" && Math.random() > IMPRESSION_SAMPLE) return;
  const payload: BeaconPayload = {
    v: SCHEMA_VERSION,
    event,
    city,
    ts: Date.now(),
    sid: sessionId(),
  };
  if (opts.biz) payload.biz = bizId(opts.biz);
  if (opts.view) payload.view = opts.view;
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
    } else {
      // sendBeacon unavailable — best-effort keepalive fetch
      void fetch(ENDPOINT, { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
    }
  } catch {
    /* never let telemetry break the page */
  }
}

// Convenience wrappers for the wired call sites (both views use these).
export const track = {
  pageviewCity: (city: string, view?: ViewName) => emit("pageview_city", city, { view }),
  bizImpression: (city: string, biz: string, view?: ViewName) => emit("biz_impression", city, { biz, view }),
  bizClick: (city: string, biz: string, view?: ViewName) => emit("biz_click", city, { biz, view }),
  outboundClick: (city: string, biz: string, view?: ViewName) => emit("outbound_click", city, { biz, view }),
  couponReveal: (city: string, biz: string, view?: ViewName) => emit("coupon_reveal", city, { biz, view }),
  couponRedeem: (city: string, biz: string, view?: ViewName) => emit("coupon_redeem", city, { biz, view }),
  plannerGenerated: (city: string, view?: ViewName) => emit("planner_generated", city, { view }),
  shareCreated: (city: string, view?: ViewName) => emit("share_created", city, { view }),
};
