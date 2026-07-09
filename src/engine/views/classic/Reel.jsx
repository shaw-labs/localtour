// Classic view — horizontal neighborhoods reel (ported verbatim; chicago index.html ~1990–2042).
// R_Reel consumes model.NEXUS (ex CITY_META.nexus → config.nexus_grid; tiles id/title/icon/description).
import { useRef } from "react";
import { useSectionProgress } from "./scroll";
import { useCityModel } from "../../cityModel";

/* ═══ HORIZONTAL REEL (neighborhoods) ═══ */
/* Maps each nexus card to a background image. Future: swap img for video. */
const NEXUS_MEDIA = {
  'beach-nightlife': 'hero-summer-southpointe.jpg',
  'food-culture': 'break-food-closeup.jpg',
  'water-adventure': 'break-everglades-airboat.jpg',
  'nightlife': 'break-nightlife-energy.jpg',
  'shopping': 'break-design-district.jpg',
  'plan': 'story-aerial-coast.jpg'
};

export function R_Reel() {
  const { NEXUS, IMG } = useCityModel();
  const ref = useRef(null);
  const p = useSectionProgress(ref);
  if (!NEXUS.length) return null;
  // Start centered, slide left as you scroll through
  const x = Math.max(-80, 5 - p * 110);
  return (
    <div id="explore" className="reel" ref={ref}>
      <div className="reel-sticky">
        <div className="reel-head">
          <div className="eyebrow">Explore</div>
          <h2 className="h-section" style={{marginTop: 14}}>
            Where do you <em>start</em>?
          </h2>
        </div>
        <div className="reel-track" style={{'--reel-x': x}}>
          {NEXUS.map((item, i) => {
            const mediaImg = NEXUS_MEDIA[item.id];
            return (
              <div className="reel-card" key={i}>
                {mediaImg && (
                  <div className="reel-card-media">
                    <img src={IMG(mediaImg)} alt="" loading="lazy" />
                  </div>
                )}
                <div className="reel-card-gradient" />
                <div className="rc-num">
                  {String(i + 1).padStart(2, '0')} / {String(NEXUS.length).padStart(2, '0')}
                </div>
                <div className="rc-icon">{item.icon}</div>
                <div className="rc-body">
                  <h3>{item.title}</h3>
                  <p>{item.desc || item.description || ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
