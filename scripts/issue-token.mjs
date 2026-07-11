// LocalTour WS3 — founder CLI to mint a merchant "magic token".
//
// A merchant's stats dashboard is gated by an unguessable token (24-char
// base62). This script mints one, persists the TokenRecord to the Netlify
// Blobs store "lt-tokens", and prints the merchant's magic URL.
//
// Usage:
//   node scripts/issue-token.mjs --city los-angeles --biz "Some Name" [--name "Display Name"]
//
// Because this runs OUTSIDE the Netlify runtime, @netlify/blobs cannot infer
// the site context — it must be handed a siteID + API token explicitly. Set:
//   export NETLIFY_SITE_ID=<your site id>
//   export NETLIFY_API_TOKEN=<a personal access token>
//
// No external deps — argv parsing and base62 are hand-rolled.

import { randomBytes } from "node:crypto";
import { getStore } from "@netlify/blobs";

// ── slugify ────────────────────────────────────────────────────────────────
// Replicated verbatim from src/engine/beacon.ts `bizId` so the token's biz id
// matches the biz id carried by every beacon event (stats join on it).
function bizId(name) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritical marks
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── argv parsing (no deps) ───────────────────────────────────────────────────
// Supports `--key value` and `--key=value`. Bare `--flag` (no value) => true.
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const eq = a.indexOf("=");
    if (eq !== -1) {
      args[a.slice(2, eq)] = a.slice(eq + 1);
      continue;
    }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

// ── base62 token ─────────────────────────────────────────────────────────────
const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// 24 chars of unbiased base62. Rejection-sample bytes >= 248 (= 4*62) so the
// modulo mapping is uniform (no bias toward the first 8 alphabet symbols).
function base62Token(len = 24) {
  const out = [];
  const limit = 256 - (256 % 62); // 248
  while (out.length < len) {
    const buf = randomBytes(len * 2); // over-provision to minimize redraws
    for (let i = 0; i < buf.length && out.length < len; i++) {
      const b = buf[i];
      if (b < limit) out.push(BASE62[b % 62]);
    }
  }
  return out.join("");
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

// ── main ─────────────────────────────────────────────────────────────────────
const args = parseArgs(process.argv.slice(2));

const USAGE =
  'Usage: node scripts/issue-token.mjs --city <city-slug> --biz "Business Name" [--name "Display Name"]';

const cityRaw = typeof args.city === "string" ? args.city : "";
const bizRaw = typeof args.biz === "string" ? args.biz : "";
const nameRaw = typeof args.name === "string" ? args.name : "";

if (!cityRaw || !bizRaw) {
  fail(`Missing required flag(s).\n${USAGE}`);
}

const city = bizId(cityRaw); // slugify defensively so the blob key is [a-z0-9-] safe
const biz = bizId(bizRaw);
const name = nameRaw || bizRaw; // display name falls back to the raw --biz value

if (!city) fail(`--city "${cityRaw}" slugifies to an empty string.\n${USAGE}`);
if (!biz) fail(`--biz "${bizRaw}" slugifies to an empty string.\n${USAGE}`);

// Netlify credentials are required when running outside the Netlify runtime.
const siteID = process.env.NETLIFY_SITE_ID;
const apiToken = process.env.NETLIFY_API_TOKEN;
if (!siteID || !apiToken) {
  fail(
    "Netlify credentials missing. This CLI runs outside the Netlify runtime, so\n" +
      "@netlify/blobs needs an explicit site id and API token. Set both, then re-run:\n\n" +
      "  export NETLIFY_SITE_ID=<your Netlify site id>\n" +
      "  export NETLIFY_API_TOKEN=<a Netlify personal access token>\n"
  );
}

const token = base62Token(24);

const rec = {
  token,
  city,
  biz,
  name,
  created: new Date().toISOString(),
};

const store = getStore({ name: "lt-tokens", siteID, token: apiToken });
await store.set(token, JSON.stringify(rec));

// Public site base for the magic link. Defaults to production; override with
// LT_SITE_URL=https://localtour-work.netlify.app when issuing against the work site.
const siteUrl = process.env.LT_SITE_URL || "https://localtour.directory";
const url = `${siteUrl}/partners/stats?k=${token}`;

console.log("Merchant token issued.");
console.log(`  city:   ${rec.city}`);
console.log(`  biz:    ${rec.biz}`);
console.log(`  name:   ${rec.name}`);
console.log(`  token:  ${token}`);
console.log("");
console.log(`Magic URL (send to the merchant):`);
console.log(`  ${url}`);
