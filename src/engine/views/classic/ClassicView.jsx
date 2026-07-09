// Classic view — entry point (ported verbatim from the inline apps' redesigned
// ClassicView, "preview 4"; chicago index.html ~2637–2723). The module-scope
// breakImgsR list is superseded by model.breakSchedule (built in cityModel);
// the flat image list is derived from it below.
import { useEffect, useState } from "react";
import { useCityModel } from "../../cityModel";
import { useGlobalScroll } from "./scroll";
import { R_Nav, R_SideMenu } from "./Nav";
import { R_Hero, R_Ticker } from "./Hero";
import { R_Story, R_Dispersal } from "./Story";
import { R_Reel } from "./Reel";
import { R_CinematicBreak, R_OffsetBreak } from "./Breaks";
import { R_Modes, R_DirectorySection } from "./Directory";
import { R_Deals, R_WallMosaic, R_PlannerCTA, R_Transit, R_SideTrips, R_Footer } from "./Sections";
import { R_Concierge } from "./Concierge";
import { R_TripPlanner } from "./TripPlanner";

export default function ClassicView({activeMode, setActiveMode, conciergeOpen, setConciergeOpen, plannerOpen, setPlannerOpen, isDark, setIsDark}) {
  const { CITY, sortedCats, grouped, breakImgsFlat } = useCityModel();
  // breakImgsR (ex module scope) — the raw flat list, exactly as the inline apps
  // built it (buildBreakSchedule can drop a trailing image; the flat list cannot).
  const breakImgsR = breakImgsFlat;
  // Note: preview-4 redesign is dark-only by design; isDark is accepted but unused.
  // The sliver of light-mode handling that lived in the old ClassicView is intentionally dropped.
  // Reset miami's body styles so the redesign's CSS-variable theming takes effect.
  useEffect(() => {
    document.body.classList.add('rd-active');
    // Own the body paint explicitly (the legacy page's body rule can lose to the
    // scaffold's Tailwind layer depending on bundle order) — mirrors FeedView.
    document.body.style.background = 'var(--bg)';
    document.body.style.color = 'var(--text)';
    return () => {
      document.body.classList.remove('rd-active');
      document.body.style.background = '';
      document.body.style.color = '';
    };
  }, []);

  useGlobalScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          setScrolled(window.scrollY > 60);
          raf = 0;
        });
      }
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (plannerOpen) return <R_TripPlanner onClose={() => setPlannerOpen(false)} />;

  return (
    <>
      <div className="scroll-bar" />
      <R_Nav
        scrolled={scrolled}
        onMenuToggle={() => setMenuOpen(!menuOpen)}
        menuOpen={menuOpen}
      />
      <R_SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenConcierge={() => setConciergeOpen(true)}
        onOpenPlanner={() => setPlannerOpen(true)}
      />
      <main>
        <R_Hero />
        <R_Ticker />
        <R_Story />
        <R_Dispersal />
        {breakImgsR[0] && <R_CinematicBreak image={breakImgsR[0]} caption={CITY.tagline} />}
        <R_Reel />
        <R_Modes activeMode={activeMode} setActiveMode={setActiveMode} />
        {sortedCats.map((cat, i) => {
          // Insert a break between every 2 directory sections, alternating styles
          const showBreak = i > 0 && i % 2 === 0;
          const breakIdx = Math.floor(i / 2);
          const breakImg = breakImgsR[breakIdx % breakImgsR.length];
          const breakStyle = breakIdx % 3;
          return (
            <div key={cat}>
              {showBreak && breakImg && breakStyle === 0 && (
                <R_CinematicBreak image={breakImg} />
              )}
              {showBreak && breakImg && breakStyle === 1 && (
                <R_OffsetBreak image={breakImg} side="right" />
              )}
              {showBreak && breakImg && breakStyle === 2 && (
                <R_OffsetBreak image={breakImg} side="left" />
              )}
              <R_DirectorySection
                cat={cat}
                businesses={grouped[cat] || []}
                activeMode={activeMode}
              />
            </div>
          );
        })}
        <R_Deals />
        <R_WallMosaic />
        <R_PlannerCTA onOpen={() => setPlannerOpen(true)} />
        <R_Transit />
        <R_SideTrips />
      </main>
      <R_Footer />
      <R_Concierge open={conciergeOpen} setOpen={setConciergeOpen} />
    </>
  );
}
