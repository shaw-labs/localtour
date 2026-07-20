// Claude-vision content gate for visitor wall posts.
//
// Called inline from POST /api/wall: Claude reviews the photo + caption and
// returns approve/flag. Clean posts publish instantly; flagged posts hold for
// admin review (scripts/moderate-wall.mjs). Any failure — no ANTHROPIC_API_KEY,
// timeout, API error, unparseable reply — returns null and the caller FAILS
// CLOSED (post held for admin), so unmoderated content is never auto-published.
//
// Model: claude-opus-4-8 by default; override with WALL_MOD_MODEL (e.g.
// claude-haiku-4-5 if moderation volume ever makes cost matter — founder call).
import Anthropic from "@anthropic-ai/sdk";

export interface ModVerdict {
  verdict: "approve" | "flag";
  category?: string;
  reason?: string;
}

const MODEL = process.env.WALL_MOD_MODEL || "claude-opus-4-8";
const TIMEOUT_MS = 9000; // stay inside the function's 10s budget

const SYSTEM = `You are the content moderator for LocalTour's community photo wall — a city-guide site where travelers share trip photos with short captions.

APPROVE BY DEFAULT. Flag ONLY when the submission clearly contains one of these harm categories:
- nudity or sexual content
- graphic violence or gore
- hate symbols or slurs
- clearly illegal activity
- harassment or doxxing (a private person's face + identifying info presented to demean)
- spam or advertising (QR codes, phone numbers, promo/discount text, watermarked marketing)

Everything else is "approve": ordinary travel/city/food/people/nature shots, bars and nightlife, beach photos, street art, blurry or low-quality photos, stock-style or professional photos, AI-looking or edited images, screenshots, memes, mild profanity in captions. Aesthetic quality, authenticity, and relevance are NOT your call — a human curates the wall; you only screen for the harm categories above.

Flag only if you can NAME which harm category applies. If none clearly applies, approve.
Respond with ONLY a JSON object: {"verdict":"approve"|"flag","category":"<one-or-two-word harm category if flagged>","reason":"<one short sentence>"} — no other text.`;

type ImgMediaType = "image/jpeg" | "image/png" | "image/webp";

export async function moderatePost(
  caption: string,
  imgBase64?: string,
  mediaType?: string,
): Promise<ModVerdict | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null; // unconfigured → caller fail-safes to admin review

  try {
    const client = new Anthropic({ apiKey, timeout: TIMEOUT_MS, maxRetries: 0 });
    const content: Anthropic.ContentBlockParam[] = [];
    if (imgBase64 && mediaType) {
      content.push({
        type: "image",
        source: { type: "base64", media_type: mediaType as ImgMediaType, data: imgBase64 },
      });
    }
    content.push({
      type: "text",
      text: `Caption: ${JSON.stringify(caption || "(no caption)")}\n${imgBase64 ? "Moderate the photo and caption together." : "Text-only post — moderate the caption."}`,
    });

    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 200,
      system: SYSTEM,
      messages: [{ role: "user", content }],
    });

    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const parsed = JSON.parse(m[0]) as ModVerdict;
    if (parsed.verdict !== "approve" && parsed.verdict !== "flag") return null;
    return {
      verdict: parsed.verdict,
      category: typeof parsed.category === "string" ? parsed.category.slice(0, 60) : undefined,
      reason: typeof parsed.reason === "string" ? parsed.reason.slice(0, 200) : undefined,
    };
  } catch {
    return null; // timeout / API error / refusal → fail closed at the caller
  }
}
