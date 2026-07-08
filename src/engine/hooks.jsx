// LocalTour engine — shared scroll/reveal hooks (ported verbatim from the inline apps).
import { useEffect, useRef, useState } from "react";

export function useScrollReveal(th = 0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setV(true);
          o.unobserve(el);
        }
      },
      { threshold: th, rootMargin: "0px 0px -40px 0px" },
    );
    o.observe(el);
    return () => o.disconnect();
  }, []);
  return [ref, v];
}

export function useScrollProgress(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let t = false;
    const u = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setP(Math.max(0, Math.min(1, 1 - r.bottom / (r.height + window.innerHeight))));
      t = false;
    };
    const s = () => {
      if (!t) {
        requestAnimationFrame(u);
        t = true;
      }
    };
    window.addEventListener("scroll", s, { passive: true });
    u();
    return () => window.removeEventListener("scroll", s);
  }, [ref]);
  return p;
}

export function useParallax(speed = 0.3) {
  const ref = useRef(null);
  const [off, setOff] = useState(0);
  useEffect(() => {
    let t = false;
    const s = () => {
      if (!t) {
        requestAnimationFrame(() => {
          if (ref.current) {
            const r = ref.current.getBoundingClientRect();
            setOff((r.top + r.height / 2 - window.innerHeight / 2) * speed);
          }
          t = false;
        });
        t = true;
      }
    };
    window.addEventListener("scroll", s, { passive: true });
    return () => window.removeEventListener("scroll", s);
  }, [speed]);
  return [ref, off];
}

export function Reveal({ children, delay = 0, dir = "up", style = {} }) {
  const [ref, vis] = useScrollReveal();
  const tx = {
    up: "translateY(48px)",
    left: "translateX(60px)",
    right: "translateX(-60px)",
    scale: "scale(0.93)",
  };
  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : tx[dir] || tx.up,
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
