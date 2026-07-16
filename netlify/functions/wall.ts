// LocalTour — community wall "Share a moment" (GET/POST /api/wall).
//
// GET  /api/wall?city=<slug>  → that city's visitor posts (newest first)
// POST /api/wall              → create a post: JSON { city, sig?, caption, img? }
//   img is a data URL (image/jpeg|png|webp) already downscaled client-side.
//
// Honest v1: posts are public once stored; the founder moderates out-of-band
// with scripts/moderate-wall.mjs (list/delete). Validation here is defensive:
// slug-checked city, length-capped text, magic-byte-sniffed images, hard size
// caps. No PII beyond what the visitor chooses to type as their name.
import type { Context } from "@netlify/functions";
import { listWallPosts, putWallImage, putWallPost, wallId, type WallPost } from "./_shared/store.js";

export const config = { path: "/api/wall" };

const SLUG = /^[a-z0-9-]{1,64}$/;
const MAX_BODY = 4_500_000; // ~4.5MB JSON — a 1440px JPEG data URL is ~300-600KB
const MAX_IMG_BYTES = 3_000_000;
const MAX_CAPTION = 500;
const MAX_SIG = 40;

const CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...CORS } });
}

// Magic-byte sniff — never trust the data-URL's declared MIME.
function sniff(bytes: Uint8Array): string | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length > 7 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length > 11 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  return null;
}

export default async (req: Request, _context: Context): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  if (req.method === "GET") {
    const city = new URL(req.url).searchParams.get("city") ?? "";
    if (!SLUG.test(city)) return json(400, { error: "bad_city" });
    const posts = await listWallPosts(city);
    return new Response(
      JSON.stringify({
        posts: posts.map((p) => ({
          id: p.id,
          sig: p.sig,
          ts: p.ts,
          caption: p.caption,
          img: p.imgKey ? `/api/wall-img?k=${encodeURIComponent(p.imgKey)}` : "",
        })),
      }),
      { status: 200, headers: { "content-type": "application/json", "cache-control": "no-store", ...CORS } },
    );
  }

  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  if (Number(req.headers.get("content-length") || 0) > MAX_BODY) return json(413, { error: "too_large" });

  const text = await req.text();
  if (text.length > MAX_BODY) return json(413, { error: "too_large" });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return json(400, { error: "bad_body" });
  }

  const city = typeof body.city === "string" ? body.city : "";
  const caption = (typeof body.caption === "string" ? body.caption : "").trim().slice(0, MAX_CAPTION);
  const sig = (typeof body.sig === "string" ? body.sig : "").trim().slice(0, MAX_SIG);
  const img = typeof body.img === "string" ? body.img : "";
  if (!SLUG.test(city)) return json(400, { error: "bad_city" });
  if (!caption && !img) return json(400, { error: "empty" }); // a moment needs a photo or words

  const ts = Date.now();
  const id = wallId(ts);
  const post: WallPost = { id, sig, caption, ts };

  if (img) {
    const m = img.match(/^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
    if (!m) return json(400, { error: "bad_image" });
    let bytes: Uint8Array;
    try {
      const bin = atob(m[1] as string);
      bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    } catch {
      return json(400, { error: "bad_image" });
    }
    if (bytes.byteLength > MAX_IMG_BYTES) return json(413, { error: "image_too_large" });
    const realType = sniff(bytes);
    if (!realType) return json(400, { error: "bad_image" }); // declared image, isn't one
    try {
      post.imgKey = await putWallImage(city, id, bytes.buffer as ArrayBuffer, realType);
      post.contentType = realType;
    } catch {
      return json(500, { error: "store_error" });
    }
  }

  try {
    await putWallPost(city, post);
  } catch {
    return json(500, { error: "store_error" });
  }
  return json(200, {
    ok: true,
    post: { id, sig, ts, caption, img: post.imgKey ? `/api/wall-img?k=${encodeURIComponent(post.imgKey)}` : "" },
  });
};
