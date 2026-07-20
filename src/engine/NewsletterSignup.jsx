import { useState } from "react";

// Traveler email capture → /api/lead (Netlify Function → lt-leads Blobs store).
// No accounts, no storage on the client. Founder exports via export-leads.mjs.
export async function subscribeNewsletter(email) {
  await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ form: "newsletter", email }),
  });
}

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Compact capture used in the city footers (feed + classic). Colors via props so
// it blends into either footer; behavior is identical in both (Principle 4).
export function NewsletterSignup({
  accent = "#dc2626",
  fg = "#0c1b2a",
  muted = "#718096",
  border = "#e2e8f0",
  bg = "#ffffff",
  label = "New city drops + the weekly deal sheet.",
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const fb = "'DM Sans',system-ui,sans-serif";

  const submit = async (e) => {
    e.preventDefault();
    if (busy || !EMAIL_RE.test(email)) return;
    setBusy(true);
    try {
      await subscribeNewsletter(email);
    } catch {
      /* Netlify captured or offline — confirm optimistically, never block */
    }
    setDone(true);
  };

  if (done) {
    return (
      <div style={{ fontFamily: fb, fontSize: 13, color: muted, lineHeight: 1.5 }}>
        You&rsquo;re on the list. {label}
      </div>
    );
  }
  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 380 }}>
      <div style={{ fontFamily: fb, fontSize: 13, color: muted }}>{label}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label="Email address"
          style={{ flex: 1, background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "9px 12px", fontFamily: fb, fontSize: 13, color: fg, outline: "none" }}
        />
        <button
          type="submit"
          disabled={busy}
          style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "0 16px", fontFamily: fb, fontSize: 13, fontWeight: 600, cursor: busy ? "default" : "pointer", whiteSpace: "nowrap" }}
        >
          {busy ? "…" : "Subscribe"}
        </button>
      </div>
    </form>
  );
}
