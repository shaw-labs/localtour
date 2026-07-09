// Classic view — word-by-word story + image dispersal (ported verbatim; chicago index.html ~1918–1988).
import { useRef } from "react";
import { useSectionProgress, R_Reveal } from "./scroll";
import { useCityModel } from "../../cityModel";

/* ═══ STORY (word-by-word reveal) ═══ */
export function R_Story() {
  const { CITY } = useCityModel();
  const ref = useRef(null);
  const p = useSectionProgress(ref);
  const words = CITY.description.split(' ');
  const revealed = Math.floor(p * words.length * 2.6);
  return (
    <section id="story" className="story" ref={ref}>
      <div className="story-inner">
        <R_Reveal><div className="eyebrow center">The R_Story</div></R_Reveal>
        <R_Reveal delay={0.1}>
          <h2>{CITY.tagline}</h2>
        </R_Reveal>
        <p className="story-body">
          {words.map((w, i) => (
            <span key={i} className={`w ${i < revealed ? 'on' : ''}`}>{w} </span>
          ))}
        </p>
      </div>
    </section>
  );
}

/* ═══ IMAGE DISPERSAL (4 images fly from center) ═══ */
export function R_Dispersal() {
  const { CITY, STORY_IMAGES, IMG } = useCityModel();
  const ref = useRef(null);
  const p = useSectionProgress(ref);
  const imgs = STORY_IMAGES.slice(0, 4);
  if (imgs.length < 2) return null;
  // d = 0 at p=0.12 (stacked), 1 at p=0.6 (fully dispersed)
  const d = Math.max(0, Math.min(1, (p - 0.12) * 2.2));
  const positions = [
    {tx: -58, ty: -52, rot: -8},
    {tx: 58, ty: -52, rot: 6},
    {tx: -58, ty: 52, rot: 11},
    {tx: 58, ty: 52, rot: -7}
  ];
  const capOp = Math.max(0, Math.min(1, (p - 0.05) * 5 - Math.max(0, p - 0.5) * 4));
  const vibeOp = Math.max(0, Math.min(1, (p - 0.55) * 4));
  return (
    <div className="dispersal" ref={ref} style={{
      '--cap-opacity': capOp,
      '--vibe-opacity': vibeOp
    }}>
      <div className="dispersal-sticky">
        <div className="dispersal-caption">Scenes from the city</div>
        <div className="dispersal-stage">
          {imgs.map((img, i) => {
            const pos = positions[i % 4];
            return (
              <div
                key={i}
                className="dispersal-card"
                style={{
                  '--tx': `${pos.tx * d}%`,
                  '--ty': `${pos.ty * d}%`,
                  '--rot': `${pos.rot * (1 - d)}deg`,
                  '--scale': `${1.3 - d * 0.4}`,
                  zIndex: 4 - i
                }}
              >
                <img src={IMG(img)} alt="" loading="lazy" />
              </div>
            );
          })}
        </div>
        <div className="dispersal-vibe">{CITY.vibe}</div>
      </div>
    </div>
  );
}
