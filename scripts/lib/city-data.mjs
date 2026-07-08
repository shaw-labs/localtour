// Shared helpers for the Phase 0 data scripts. Read-only over cities/<slug>/data.js.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export const SLUGS = [
  "chicago",
  "houston",
  "los-angeles",
  "miami",
  "new-orleans",
  "new-york-city",
  "san-francisco",
  "smoky-mountains",
];

// data.json key ← data.js global. Order here is the on-disk key order.
export const SHAPE = {
  meta: "CITY_META",
  directory: "DIRECTORY_RAW",
  deals: "DEALS_RAW",
  events: "EVENTS_RAW",
  concierge: "CONCIERGE_NODES",
};

/** Evaluate a city's data.js in an isolated vm context and collect its 5 globals. */
export function evalDataJs(slug) {
  const file = path.join(ROOT, "cities", slug, "data.js");
  const src = readFileSync(file, "utf8");
  const ctx = vm.createContext(Object.create(null));
  vm.runInContext(src, ctx, { filename: file, timeout: 10_000 });
  const out = {};
  for (const [key, globalName] of Object.entries(SHAPE)) {
    if (!(globalName in ctx)) throw new Error(`${slug}: global ${globalName} missing from data.js`);
    out[key] = ctx[globalName];
  }
  return out;
}

/**
 * Reject anything JSON cannot represent losslessly (undefined, NaN, Infinity,
 * functions, Dates, …). The round-trip gate is only meaningful if this passes —
 * otherwise JSON.stringify would silently coerce on BOTH sides and hide loss.
 * Note: values come from a vm realm, so plain-object checks must be cross-realm
 * (a vm object's prototype is that realm's Object.prototype, not ours).
 */
export function assertJsonSafe(value, where) {
  if (value === null) return;
  const t = typeof value;
  if (t === "string" || t === "boolean") return;
  if (t === "number") {
    if (!Number.isFinite(value)) throw new Error(`non-finite number at ${where}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => {
      if (v === undefined) throw new Error(`undefined at ${where}[${i}]`);
      assertJsonSafe(v, `${where}[${i}]`);
    });
    return;
  }
  if (t === "object") {
    const proto = Object.getPrototypeOf(value);
    // plain object in ANY realm: proto is null or a realm's Object.prototype (whose proto is null)
    if (proto !== null && Object.getPrototypeOf(proto) !== null) {
      throw new Error(`non-plain object at ${where}`);
    }
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) throw new Error(`undefined at ${where}.${k}`);
      assertJsonSafe(v, `${where}.${k}`);
    }
    return;
  }
  throw new Error(`JSON-unsafe ${t} at ${where}`);
}
