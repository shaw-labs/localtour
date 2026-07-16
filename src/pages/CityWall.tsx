import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PrimaryNav } from "../engine/PrimaryNav";

// Native community wall — the same social-photo format the legacy cities shipped
// (light theme, posts with author / caption / likes / comments / album tabs /
// compose), now engine-native for all 15 cities. Posts come from cities-modular/
// <slug>/wall.json (legacy posts extracted, factory posts generated).
const wallModules = import.meta.glob<Post[]>("../../cities-modular/*/wall.json", { import: "default" });
const configModules = import.meta.glob<{ name: string }>("../../cities-modular/*/config.json", { import: "default" });

const T = {
  bg: "#faf8f4", card: "#ffffff", fog: "#718096", text: "#0c1b2a", terra: "#dc2626",
  gold: "#b8860b", dim: "#a0aec0", border: "#e2e8f0", slate: "#f0f4f8", glow: "rgba(220,38,38,0.08)",
  fd: "'Playfair Display',Georgia,serif", fb: "'DM Sans',sans-serif", rp: 999,
};

interface Comment { sig: string; text: string }
interface Post { id: number | string; sig: string; time: string; caption: string; likes: number; img: string; album?: string; comments: Comment[] }

const AV_COLORS = ["#dc2626", "#b8860b", "#0c1b2a", "#2d6a4f", "#6b2d5c", "#1e4d6b"];
function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initial = (name || "V").trim().charAt(0).toUpperCase();
  const c = AV_COLORS[(initial.charCodeAt(0) || 0) % AV_COLORS.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.fb, fontWeight: 700, fontSize: size * 0.42, flexShrink: 0 }}>{initial}</div>
  );
}

function WallImg({ src, alt }: { src: string; alt: string }) {
  // Visitor uploads are served by the wall function (no build-time variants) —
  // render them as a plain <img>. Curated photos keep the <picture> variants.
  if (src.startsWith("/api/") || src.startsWith("data:")) {
    return <img src={src} alt={alt} loading="lazy" style={{ width: "100%", display: "block", maxHeight: 720, objectFit: "cover" }} onError={(e) => { (e.currentTarget.closest("article") as HTMLElement).style.display = "none"; }} />;
  }
  const base = src.replace(/\.[^.]+$/, "");
  return (
    <picture>
      <source type="image/avif" srcSet={`${base}-sm.avif 720w, ${base}.avif 1440w`} sizes="(max-width:640px) 100vw, 600px" />
      <source type="image/webp" srcSet={`${base}-sm.webp 720w, ${base}.webp 1440w`} sizes="(max-width:640px) 100vw, 600px" />
      <img src={`${base}.jpg`} alt={alt} loading="lazy" style={{ width: "100%", display: "block", aspectRatio: "4/5", objectFit: "cover" }} onError={(e) => { (e.currentTarget.closest("article") as HTMLElement).style.display = "none"; }} />
    </picture>
  );
}

// Relative time for visitor posts (curated posts carry their own time strings).
function relTime(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 2) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return h === 1 ? "1 hour ago" : `${h} hours ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Downscale a picked photo on-device (max 1440px, JPEG). The canvas re-encode
// also strips EXIF — no GPS or device metadata ever leaves the phone.
function downscale(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1440 / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const g = c.getContext("2d");
      if (!g) { URL.revokeObjectURL(url); reject(new Error("no canvas")); return; }
      g.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
    img.src = url;
  });
}

function PostCard({ post, cityName }: { post: Post; cityName: string }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(post.likes);
  const [showC, setShowC] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [nc, setNc] = useState("");
  const [shared, setShared] = useState(false);

  const toggleLike = () => { setLiked((v) => !v); setCount((c) => c + (liked ? -1 : 1)); };
  const addComment = () => { if (!nc.trim()) return; setComments((c) => c.concat([{ sig: "", text: nc.trim() }])); setNc(""); };
  const share = async () => {
    try { await (navigator as any).share({ title: `${post.sig || "Visitor"} — ${cityName}`, text: post.caption }); }
    catch { setShared(true); setTimeout(() => setShared(false), 2000); }
  };

  return (
    <article style={{ background: T.card, borderRadius: 18, border: `1px solid ${T.border}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px" }}>
        <Avatar name={post.sig} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: T.fb, fontSize: 14, fontWeight: 600, color: post.sig ? T.text : T.dim }}>{post.sig || "Visitor"}</div>
          <div style={{ fontFamily: T.fb, fontSize: 12, color: T.dim }}>{post.time} · {cityName}</div>
        </div>
      </div>
      {post.img ? <WallImg src={post.img} alt={post.caption} /> : null}
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 16px 8px" }}>
        <button onClick={toggleLike} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: T.fb, fontSize: 14, color: liked ? T.terra : T.fog }}>
          <span style={{ fontSize: 18 }}>{liked ? "♥" : "♡"}</span>{count}
        </button>
        <button onClick={() => setShowC((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: T.fb, fontSize: 14, color: T.fog }}>
          <span style={{ fontSize: 16 }}>💬</span>{comments.length}
        </button>
        <button onClick={share} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "auto", fontFamily: T.fb, fontSize: 13, color: shared ? T.terra : T.fog }}>{shared ? "Copied ✓" : "↗ Share"}</button>
      </div>
      <div style={{ padding: "0 16px 14px" }}>
        <p style={{ fontFamily: T.fb, fontSize: 14, color: T.text, lineHeight: 1.5, margin: 0 }}>
          {post.sig ? <span style={{ fontWeight: 600 }}>{post.sig} </span> : null}{post.caption}
        </p>
      </div>
      {showC && (
        <div style={{ borderTop: `1px solid ${T.border}`, padding: "12px 16px", background: "#fbfaf8" }}>
          {comments.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <Avatar name={c.sig} size={28} />
              <div style={{ flex: 1, background: T.slate, borderRadius: 12, padding: "8px 12px" }}>
                <span style={{ fontFamily: T.fb, fontSize: 12, fontWeight: 600, color: c.sig ? T.text : T.dim }}>{c.sig || "Visitor"}</span>
                <p style={{ fontFamily: T.fb, fontSize: 13, color: T.fog, margin: "2px 0 0" }}>{c.text}</p>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <input value={nc} onChange={(e) => setNc(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addComment(); }} placeholder="Comment…" style={{ flex: 1, background: "#fff", border: `1px solid ${T.border}`, borderRadius: 999, padding: "8px 14px", fontFamily: T.fb, fontSize: 13, color: T.text, outline: "none" }} />
            {nc.trim() ? <button onClick={addComment} style={{ background: T.terra, color: "#fff", border: "none", borderRadius: "50%", width: 32, height: 32, fontSize: 15, cursor: "pointer" }}>↑</button> : null}
          </div>
        </div>
      )}
    </article>
  );
}

export default function CityWall() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [cityName, setCityName] = useState(slug);
  const [album, setAlbum] = useState("All");
  const [sortPopular, setSortPopular] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftImg, setDraftImg] = useState<string | null>(null); // downscaled data URL
  const [posting, setPosting] = useState(false);
  const [postErr, setPostErr] = useState("");

  useEffect(() => {
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
    window.scrollTo(0, 0);
    const wk = `../../cities-modular/${slug}/wall.json`;
    const ck = `../../cities-modular/${slug}/config.json`;
    // curated posts (bundled) + visitor posts (wall function) merge: visitors first
    const curated: Promise<Post[]> = wallModules[wk] ? wallModules[wk]().then((p) => p as Post[]).catch(() => []) : Promise.resolve([]);
    const visitor: Promise<Post[]> = fetch(`/api/wall?city=${slug}`)
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((d: { posts: { id: string; sig: string; ts: number; caption: string; img: string }[] }) =>
        (d.posts ?? []).map((p) => ({ id: p.id, sig: p.sig, time: relTime(p.ts), caption: p.caption, likes: 0, img: p.img, album: "Photos", comments: [] as Comment[] })))
      .catch(() => [] as Post[]);
    Promise.all([curated, visitor]).then(([c, v]) => setPosts([...v, ...c]));
    if (configModules[ck]) configModules[ck]().then((c: any) => setCityName(c.name)).catch(() => {});
    return () => { document.body.style.background = ""; document.body.style.color = ""; };
  }, [slug]);

  useEffect(() => { document.title = `The Wall — ${cityName} · LocalTour`; }, [cityName]);

  const albums = useMemo(() => ["All", ...new Set((posts ?? []).map((p) => p.album || "Photos"))], [posts]);
  const shown = useMemo(() => {
    let list = (posts ?? []).filter((p) => album === "All" || (p.album || "Photos") === album);
    if (sortPopular) list = [...list].sort((a, b) => b.likes - a.likes);
    return list;
  }, [posts, album, sortPopular]);

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return;
    setPostErr("");
    try { setDraftImg(await downscale(file)); }
    catch { setPostErr("That photo didn't load — try another one."); }
  };

  const submit = async () => {
    if (posting || (!draft.trim() && !draftImg)) return; // a moment needs words or a photo
    setPosting(true); setPostErr("");
    try {
      const res = await fetch("/api/wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: slug, sig: draftName.trim(), caption: draft.trim(), img: draftImg ?? "" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || "post_failed");
      const p = data.post as { id: string; sig: string; ts: number; caption: string; img: string };
      setPosts((cur) => [{ id: p.id, sig: p.sig, time: "Just now", caption: p.caption, likes: 0, img: p.img, album: "Photos", comments: [] }, ...(cur ?? [])]);
      setDraft(""); setDraftName(""); setDraftImg(null); setComposeOpen(false);
    } catch {
      setPostErr("Couldn't post right now — your moment is still here, try again in a second.");
    } finally {
      setPosting(false);
    }
  };

  if (!posts) return <main style={{ minHeight: "100vh", background: T.bg }} />;

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.fb, paddingBottom: 64 }}>
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(250,248,244,.9)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}`, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" title="LocalTour home" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ width: 24, height: 24, borderRadius: 6, background: T.terra, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: T.fd }}>LT</span>
          <span style={{ fontFamily: T.fd, fontSize: 17, fontWeight: 700, color: T.text }}>The Wall</span>
        </Link>
        <Link to={`/cities/${slug}`} style={{ fontFamily: T.fb, fontSize: 13, fontWeight: 600, color: T.fog, textDecoration: "none" }}>← {cityName}</Link>
      </header>

      <section style={{ maxWidth: 620, margin: "0 auto", padding: "28px 16px 8px" }}>
        <h1 style={{ fontFamily: T.fd, fontSize: "clamp(30px,7vw,44px)", fontWeight: 700, lineHeight: 1, margin: 0 }}>{cityName} <span style={{ color: T.terra }}>Wall</span></h1>
        <p style={{ color: T.fog, fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>Real photos from real visitors. No influencer staging — just moments.</p>
        <button onClick={() => setComposeOpen((v) => !v)} style={{ marginTop: 16, width: "100%", padding: "14px", borderRadius: 14, background: T.terra, color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: T.fb, border: "none", cursor: "pointer", boxShadow: `0 4px 16px ${T.glow}` }}>📷 Share a moment</button>
        {composeOpen && (
          <div style={{ marginTop: 12, background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="Your name (optional)" style={{ background: T.slate, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 14px", fontFamily: T.fb, fontSize: 14, color: T.text, outline: "none" }} />
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} placeholder="What did you see? What did it feel like?" style={{ background: T.slate, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", fontFamily: T.fb, fontSize: 15, color: T.text, resize: "none", outline: "none", lineHeight: 1.5 }} />
            {draftImg ? (
              <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}` }}>
                <img src={draftImg} alt="Your photo" style={{ width: "100%", display: "block", maxHeight: 340, objectFit: "cover" }} />
                <button onClick={() => setDraftImg(null)} aria-label="Remove photo" style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "50%", background: "rgba(12,27,42,.75)", color: "#fff", border: "none", fontSize: 14, cursor: "pointer" }}>✕</button>
              </div>
            ) : (
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 12, border: `1.5px dashed ${T.border}`, background: T.slate, fontFamily: T.fb, fontSize: 14, fontWeight: 600, color: T.fog, cursor: "pointer" }}>
                📷 Add a photo
                <input type="file" accept="image/*" hidden onChange={(e) => pickPhoto(e.target.files?.[0])} />
              </label>
            )}
            {postErr && <p style={{ fontFamily: T.fb, fontSize: 13, color: T.terra, margin: 0 }}>{postErr}</p>}
            <button onClick={submit} disabled={posting || (!draft.trim() && !draftImg)} style={{ padding: "12px", borderRadius: 12, background: !posting && (draft.trim() || draftImg) ? T.terra : "#d8d2ca", color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: T.fb, border: "none", cursor: !posting && (draft.trim() || draftImg) ? "pointer" : "default" }}>{posting ? "Posting…" : "Post to The Wall"}</button>
            <p style={{ fontFamily: T.fb, fontSize: 11, color: T.dim, margin: 0, textAlign: "center" }}>Photos are resized on your device — no location data leaves your phone.</p>
          </div>
        )}
      </section>

      <section style={{ maxWidth: 620, margin: "0 auto", padding: "8px 16px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {albums.map((a) => {
          const n = a === "All" ? (posts?.length ?? 0) : (posts ?? []).filter((p) => (p.album || "Photos") === a).length;
          const on = album === a;
          return <button key={a} onClick={() => setAlbum(a)} style={{ padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: on ? 700 : 400, background: on ? T.terra : T.card, border: on ? "none" : `1px solid ${T.border}`, color: on ? "#fff" : T.fog, fontFamily: T.fb, cursor: "pointer" }}>{a}<span style={{ opacity: 0.6, marginLeft: 4 }}>{n}</span></button>;
        })}
        <button onClick={() => setSortPopular((v) => !v)} style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 999, fontSize: 12, background: "none", border: `1px solid ${T.border}`, color: T.fog, fontFamily: T.fb, cursor: "pointer" }}>{sortPopular ? "★ Popular" : "◷ Recent"}</button>
      </section>

      <section style={{ maxWidth: 620, margin: "0 auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 18 }}>
        {shown.map((p) => <PostCard key={p.id} post={p} cityName={cityName} />)}
        {shown.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 16px" }}>
            <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>📷</span>
            <p style={{ fontFamily: T.fd, fontSize: 20, color: T.text }}>No photos in this album yet</p>
            <p style={{ fontFamily: T.fb, fontSize: 14, color: T.dim, marginTop: 6 }}>Be the first to share a moment</p>
          </div>
        )}
      </section>

      <footer style={{ textAlign: "center", marginTop: 32, fontFamily: T.fb, fontSize: 12, color: T.dim }}>
        <Link to="/" style={{ color: T.fog, textDecoration: "none", fontWeight: 600 }}>All Cities</Link>
        <span style={{ opacity: 0.4, margin: "0 12px" }}>·</span>
        <span>A SH@W Labs Product</span>
      </footer>

      {/* Primary nav on the wall too — Wall is highlighted; Plan/Chat/Deals are
          one-click intents the city page consumes (?open=...); the center
          toggle returns to the city in the OTHER view. */}
      <PrimaryNav
        slug={slug}
        view={(() => { try { return localStorage.getItem("lt_view") || "feed"; } catch { return "feed"; } })()}
        dark={false}
        current="wall"
        onPlan={() => navigate(`/cities/${slug}?open=planner`)}
        onChat={() => navigate(`/cities/${slug}?open=chat`)}
        onDeals={() => navigate(`/cities/${slug}?open=deals`)}
        onToggle={() => {
          let v = "feed";
          try { v = localStorage.getItem("lt_view") || "feed"; } catch { /* ignore */ }
          const next = v === "classic" ? "feed" : "classic";
          try { localStorage.setItem("lt_view", next); } catch { /* ignore */ }
          navigate(`/cities/${slug}`);
        }}
      />
    </main>
  );
}
