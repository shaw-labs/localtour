// netlify/functions/_shared/store.ts
//
// LocalTour WS3 — shared Netlify Blobs data layer.
// Canonical event schema lives in src/engine/beacon.ts; this module is the
// single owner of all blob-store access. Every other function imports from here.
//
// Stores (per contract):
//   lt-events  key: <city>/<YYYY-MM-DD>/<ts>-<rand6>   value: JSON RawEvent
//   lt-agg     key: <city>/<YYYY-MM-DD>                 value: JSON DayAgg
//   lt-tokens  key: <token>                             value: JSON TokenRecord
//   lt-redeem  key: <code>/<sid>                        value: "1"
//
// Privacy: this layer stores no PII. sid is opaque. Callers must not pass
// IPs/headers. Blob keys are sanitized to [a-z0-9-] per segment to prevent
// key injection.

import { getStore } from "@netlify/blobs";

// ---------------------------------------------------------------------------
// Contract types
// ---------------------------------------------------------------------------

export interface RawEvent {
  v: number;
  event: string;
  city: string;
  biz?: string;
  view?: string;
  ts: number;
  sid: string;
}

export interface TokenRecord {
  token: string;
  city: string;
  biz: string;
  name: string;
  created: string;
}

/** bucket (bizId | "_city") -> eventName -> count */
export type DayAgg = Record<string, Record<string, number>>;

// ---------------------------------------------------------------------------
// Store handles (lazy — getStore() reads runtime config on demand)
// ---------------------------------------------------------------------------

// Strong consistency on read-hot stores so freshly written events/tokens are
// immediately visible (the stats route reads raw events live for an instant
// demo, and redeem must see its own prior write for idempotency).
function eventsStore() {
  return getStore({ name: "lt-events", consistency: "strong" });
}
function aggStore() {
  return getStore("lt-agg");
}
function tokensStore() {
  return getStore({ name: "lt-tokens", consistency: "strong" });
}
function redeemStore() {
  return getStore({ name: "lt-redeem", consistency: "strong" });
}

// ---------------------------------------------------------------------------
// Key hygiene
// ---------------------------------------------------------------------------

const NON_KEY_SEGMENT = /[^a-z0-9-]/g;

/**
 * Sanitize a single path segment used in a blob key. Lowercases then strips
 * anything outside [a-z0-9-] so untrusted city/biz/token/code/sid values can
 * never inject "/" or other structure into the key namespace.
 * Not exported: the contract surface is the functions below.
 */
function sanitizeKeySegment(value: string): string {
  return String(value ?? "").toLowerCase().replace(NON_KEY_SEGMENT, "");
}

/** 6 random base36 chars, used to disambiguate same-millisecond events. */
function rand6(): string {
  let out = "";
  while (out.length < 6) {
    out += Math.random().toString(36).slice(2);
  }
  return out.slice(0, 6);
}

// ---------------------------------------------------------------------------
// Date helpers (all UTC)
// ---------------------------------------------------------------------------

const DAY_MS = 86_400_000;

/** YYYY-MM-DD in UTC for the given epoch-ms timestamp (default: now). */
export function isoDate(ts?: number): string {
  return new Date(ts ?? Date.now()).toISOString().slice(0, 10);
}

/** n UTC dates ending today, ascending (oldest first). n<=0 -> []. */
export function lastNDates(n: number): string[] {
  const dates: string[] = [];
  const now = Date.now();
  for (let i = n - 1; i >= 0; i--) {
    dates.push(isoDate(now - i * DAY_MS));
  }
  return dates;
}

// ---------------------------------------------------------------------------
// Raw events
// ---------------------------------------------------------------------------

/** Write one raw event: lt-events/<city>/<date>/<ts>-<rand6>. */
export async function putRawEvent(e: RawEvent): Promise<void> {
  const store = eventsStore();
  const city = sanitizeKeySegment(e.city);
  const date = isoDate(e.ts);
  const key = `${city}/${date}/${e.ts}-${rand6()}`;
  await store.set(key, JSON.stringify(e));
}

/**
 * List + get every raw event for a city across the given dates. Tolerates
 * missing/corrupt blobs (skipped). Returns a flat RawEvent[].
 */
export async function listRawRange(city: string, dates: string[]): Promise<RawEvent[]> {
  const store = eventsStore();
  const c = sanitizeKeySegment(city);
  const out: RawEvent[] = [];

  for (const date of dates) {
    const prefix = `${c}/${date}/`;
    let listed;
    try {
      listed = await store.list({ prefix });
    } catch {
      continue; // whole-day listing failed; skip this date
    }
    for (const blob of listed.blobs) {
      try {
        const raw = await store.get(blob.key);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as RawEvent;
        if (parsed && typeof parsed === "object") out.push(parsed);
      } catch {
        // missing or corrupt blob — skip
      }
    }
  }
  return out;
}

/** Distinct top-level city prefixes present in the lt-events store, sorted. */
export async function listEventCities(): Promise<string[]> {
  const store = eventsStore();
  const cities = new Set<string>();

  try {
    const listed = await store.list({ directories: true });
    for (const dir of listed.directories ?? []) {
      const seg = sanitizeKeySegment(dir.split("/")[0] ?? "");
      if (seg) cities.add(seg);
    }
    // Fallback: some backends may not surface directory prefixes — derive the
    // first path segment from the full key list instead.
    if (cities.size === 0) {
      const all = await store.list();
      for (const blob of all.blobs) {
        const seg = sanitizeKeySegment(blob.key.split("/")[0] ?? "");
        if (seg) cities.add(seg);
      }
    }
  } catch {
    // store unavailable — return whatever (possibly none) we gathered
  }
  return [...cities].sort();
}

// ---------------------------------------------------------------------------
// Aggregates
// ---------------------------------------------------------------------------

function aggKey(city: string, date: string): string {
  return `${sanitizeKeySegment(city)}/${sanitizeKeySegment(date)}`;
}

export async function readAgg(city: string, date: string): Promise<DayAgg | null> {
  const store = aggStore();
  try {
    const raw = await store.get(aggKey(city, date));
    if (!raw) return null;
    return JSON.parse(raw) as DayAgg;
  } catch {
    return null;
  }
}

export async function writeAgg(city: string, date: string, agg: DayAgg): Promise<void> {
  const store = aggStore();
  await store.set(aggKey(city, date), JSON.stringify(agg));
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

// Tokens are opaque high-entropy secrets (base62 from a CSPRNG), so unlike the
// city/biz/code path segments they are matched EXACTLY — never lowercased or
// stripped. Case-folding them would (a) shrink the keyspace and (b) desync from
// the issue-token CLI, which writes the raw token. base62 is already blob-key
// safe; this guard rejects anything else (blocks key injection + enumeration).
const SAFE_TOKEN = /^[A-Za-z0-9]{16,64}$/;

export async function getToken(token: string): Promise<TokenRecord | null> {
  if (!SAFE_TOKEN.test(token ?? "")) return null; // malformed == miss, no hints
  const store = tokensStore();
  try {
    const raw = await store.get(token);
    if (!raw) return null;
    return JSON.parse(raw) as TokenRecord;
  } catch {
    return null;
  }
}

export async function putToken(rec: TokenRecord): Promise<void> {
  if (!SAFE_TOKEN.test(rec.token ?? "")) throw new Error("invalid token format");
  const store = tokensStore();
  await store.set(rec.token, JSON.stringify(rec));
}

// ---------------------------------------------------------------------------
// Coupon redemption (idempotent per code+sid)
// ---------------------------------------------------------------------------

/**
 * Mark (code, sid) redeemed. Returns true if this call performed the redeem,
 * false if it was already redeemed. Idempotent per pair.
 */
export async function markRedeemed(code: string, sid: string): Promise<boolean> {
  const store = redeemStore();
  const key = `${sanitizeKeySegment(code)}/${sanitizeKeySegment(sid)}`;
  const existing = await store.get(key);
  if (existing) return false;
  await store.set(key, "1");
  return true;
}

// ---------------------------------------------------------------------------
// Leads (merchant intake, DMO city inquiries, newsletter). UNLIKE events, leads
// INTENTIONALLY hold contact info (the whole point of an opt-in form) — separate
// store, founder-exportable via scripts/export-leads.mjs.
// ---------------------------------------------------------------------------

export interface Lead {
  form: string;
  ts: number;
  fields: Record<string, string>;
}

function leadsStore() {
  return getStore({ name: "lt-leads", consistency: "strong" });
}

/** Persist one lead: lt-leads/<form>/<date>/<ts>-<rand6>. */
export async function putLead(l: Lead): Promise<void> {
  const store = leadsStore();
  const form = sanitizeKeySegment(l.form);
  const date = isoDate(l.ts);
  await store.set(`${form}/${date}/${l.ts}-${rand6()}`, JSON.stringify(l));
}

/** All leads for a form name (founder export). */
export async function listLeads(form: string): Promise<Lead[]> {
  const store = leadsStore();
  const out: Lead[] = [];
  try {
    const listed = await store.list({ prefix: `${sanitizeKeySegment(form)}/` });
    for (const blob of listed.blobs) {
      try {
        const raw = await store.get(blob.key);
        if (raw) out.push(JSON.parse(raw) as Lead);
      } catch {
        /* skip corrupt */
      }
    }
  } catch {
    /* store unavailable */
  }
  return out.sort((a, b) => a.ts - b.ts);
}
