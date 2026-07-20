// Classic view — cinematic + offset section breaks (ported verbatim; chicago index.html ~2044–2068).
import { useRef } from "react";
import { useSectionProgress, R_Reveal } from "./scroll";
import { useCityModel } from "../../cityModel";

/* ═══ CINEMATIC BREAK (full-bleed parallax) ═══ */
export function R_CinematicBreak({image, caption}) {
  const { IMG } = useCityModel();
  const ref = useRef(null);
  const p = useSectionProgress(ref);
  // mid is -200 → 200 (px offset range)
  const mid = (p - 0.5) * 260;
  return (
    <div className="break-cinematic" ref={ref} style={{'--break-mid': mid}}>
      <img src={IMG(image)} alt="" loading="lazy" />
      {caption && <div className="caption">{caption}</div>}
    </div>
  );
}

export function R_OffsetBreak({image, side}) {
  const { IMG } = useCityModel();
  return (
    <R_Reveal>
      <div className={`break-offset ${side}`}>
        <div className="panel">
          <img src={IMG(image)} alt="" loading="lazy" />
        </div>
      </div>
    </R_Reveal>
  );
}
