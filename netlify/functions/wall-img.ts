// LocalTour — serve a visitor-uploaded wall photo (GET /api/wall-img?k=<key>).
// Blobs aren't public URLs, so this streams the stored image. Keys are
// namespace-validated in the store layer (img/<city>/<id> only). Uploaded
// content is immutable → long cache.
import type { Context } from "@netlify/functions";
import { getWallImage } from "./_shared/store.js";

export const config = { path: "/api/wall-img" };

export default async (req: Request, _context: Context): Promise<Response> => {
  if (req.method !== "GET") return new Response(null, { status: 405 });
  const key = new URL(req.url).searchParams.get("k") ?? "";
  const img = await getWallImage(key);
  if (!img) return new Response(null, { status: 404 });
  return new Response(img.bytes, {
    status: 200,
    headers: {
      "content-type": img.contentType,
      "cache-control": "public, max-age=31536000, immutable",
      "access-control-allow-origin": "*",
    },
  });
};
