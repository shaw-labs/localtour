// Classic view — global scroll system + reveal primitives (ported verbatim from
// the inline apps' redesigned ClassicView, "preview 4"; chicago index.html ~1736–1807).
import { useEffect, useRef, useState } from "react";

/* ═══ GLOBAL SCROLL SYSTEM (CSS var driven) ═══ */
export function useGlobalScroll() {
  useEffect(() => {
    let raf = 0;
    const doc = document.documentElement;
    const update = () => {
      const y = window.scrollY;
      const h = doc.scrollHeight - window.innerHeight;
      doc.style.setProperty('--scroll-y', y);
      doc.style.setProperty('--scroll-pct', h > 0 ? Math.min(100, (y / h) * 100) : 0);
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', update, {passive: true});
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}

/* Section-scoped scroll progress (0→1 across element passing viewport) */
export function useSectionProgress(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = Math.max(0, Math.min(1, 1 - r.bottom / (r.height + vh)));
      setP(prog);
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, {passive: true});
    update();
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [ref]);
  return p;
}

export function useReveal(opts) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); io.unobserve(el); }
    }, {threshold: opts?.threshold || 0.12, rootMargin: opts?.rootMargin || '0px 0px -40px 0px'});
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, vis];
}

export function R_Reveal({children, delay, className}) {
  const [ref, vis] = useReveal();
  return (
    <div
      ref={ref}
      className={`rv ${vis ? 'in' : ''} ${className || ''}`}
      style={{transitionDelay: `${delay || 0}s`}}
    >
      {children}
    </div>
  );
}
