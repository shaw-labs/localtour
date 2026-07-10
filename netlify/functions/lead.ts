// LocalTour WS4 — lead capture (POST /api/lead).
//
// The three money-door forms (merchant intake, DMO city inquiry, traveler
// newsletter) submit here instead of Netlify Forms (auto HTML-form detection is
// deprecated on this site). Leads land in the lt-leads Blobs store, owned +
// exportable via scripts/export-leads.mjs. Accepts x-www-form-urlencoded (the
// static pages) or JSON.
import type { Context } from "@netlify/functions";
import { putLead } from "./_shared/store.js";

export const config = { path: "/api/lead" };

const FORMS = new Set(["newsletter", "merchant-intake", "city-inquiry"]);
const MAX_BODY = 8192; // generous for a contact form, still bounded
const MAX_FIELDS = 20;
const MAX_LEN = 2000;

const CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...CORS } });
}

export default async (req: Request, _context: Context): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false, error: "method_not_allowed" });
  if (Number(req.headers.get("content-length") || 0) > MAX_BODY) return json(413, { ok: false, error: "too_large" });

  const text = await req.text();
  if (text.length > MAX_BODY) return json(413, { ok: false, error: "too_large" });

  // Parse either JSON or urlencoded form bodies.
  let raw: Record<string, unknown> = {};
  const ctype = req.headers.get("content-type") || "";
  try {
    if (ctype.includes("application/json")) {
      raw = JSON.parse(text) as Record<string, unknown>;
    } else {
      for (const [k, v] of new URLSearchParams(text)) raw[k] = v;
    }
  } catch {
    return json(400, { ok: false, error: "bad_body" });
  }

  const form = String(raw.form ?? raw["form-name"] ?? "");
  if (!FORMS.has(form)) return json(400, { ok: false, error: "unknown_form" });

  // Honeypot: a filled bot-field means a bot — accept silently, store nothing.
  if (typeof raw["bot-field"] === "string" && raw["bot-field"].trim() !== "") {
    return json(200, { ok: true });
  }

  // Whitelist to string fields, drop control keys, bound count + length.
  const fields: Record<string, string> = {};
  let n = 0;
  for (const [k, v] of Object.entries(raw)) {
    if (k === "form" || k === "form-name" || k === "bot-field") continue;
    if (typeof v !== "string") continue;
    if (n++ >= MAX_FIELDS) break;
    fields[k.slice(0, 60)] = v.slice(0, MAX_LEN);
  }
  if (Object.keys(fields).length === 0) return json(400, { ok: false, error: "empty" });

  try {
    await putLead({ form, ts: Date.now(), fields });
  } catch {
    return json(500, { ok: false, error: "store_error" });
  }
  return json(200, { ok: true });
};
