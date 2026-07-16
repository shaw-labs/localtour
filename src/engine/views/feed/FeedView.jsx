// LocalTour engine — FeedView entry (transplanted from the inline apps' FeedView,
// chicago index.html ~3063–3124; see docs/WS1_PORT_CONTRACTS.md). Chicago's
// hardcoded editorial sequence is replaced by model.storyboard rendered per the
// contract's item table; editorial-only items (game/game2/blackbook/shaw) are
// skipped when model.editorial is null. Everything after the storyboard — wall,
// directory header, per-category sections, transit, side trips, footer, FAB,
// concierge modal — is verbatim from the inline FeedView.
import { useEffect, useMemo } from "react";
import { FT } from "../../theme";
import { useCityModel } from "../../cityModel";
import {
  FeedConciergeLine,
  FeedBusinessCard,
  FeedGameCard,
  FeedBlackBookCard,
  FeedPromotedCard,
  FeedShawCard,
  FeedEventCard,
  FeedSideTripCard,
} from "./cards";
import {
  FeedHeader,
  FeedHero,
  FeedTicker,
  FeedStoryCard,
  FeedModeChips,
  FeedDirectorySection,
  FeedWallSection,
  FeedTransitSection,
  FeedFooter,
} from "./sections";
import { FeedConciergeModal, FeedConciergeFAB } from "./concierge";
import { TrailRail } from "../../TrailRail";

export default function FeedView({activeMode,setActiveMode,conciergeOpen,setConciergeOpen}){
  const{CITY,picks,storyboard,deals,events,byName,directory,grouped,sortedCats,SIDE_TRIPS,editorial}=useCityModel();
  useEffect(()=>{document.body.style.background=FT.bg;document.body.style.color=FT.ink;const el=document.getElementById("amb");if(el)el.className="amb-feed"},[]);
  const feedPicks=useMemo(()=>{if(!activeMode)return picks;return picks.filter(b=>b.modes&&b.modes.includes(activeMode));},[activeMode,picks]);
  const topDeals=deals.filter(d=>byName[d.business_name]).slice(0,3);
  const upcomingEvents=events.filter(e=>e.featured).slice(0,3);
  const renderItem=(item,idx)=>{
    switch(item.t){
      case"line":
        return <FeedConciergeLine key={idx} text={item.text??CITY.concierge_greeting}/>;
      case"pick":{
        const biz=feedPicks[item.i];
        if(!biz)return null;
        return <FeedBusinessCard key={idx} biz={biz} kicker={item.kicker} imageKey={item.imageKey} override={item.override}/>;
      }
      case"game":
        if(!editorial?.game?.card)return null;
        return <FeedGameCard key={idx} title={editorial.game.card.title} tagline={editorial.game.card.tagline} GameComponent={editorial.game.Game}/>;
      case"game2":
        if(!editorial?.game?.comingSoon)return null;
        return <FeedGameCard key={idx} title={editorial.game.comingSoon.title} tagline={editorial.game.comingSoon.tagline} GameComponent={null}/>;
      case"blackbook":{
        if(!editorial)return null;
        const venue=(item.venueFromPick!=null?feedPicks[item.venueFromPick]?.name:null)??item.venueFallback;
        return <FeedBlackBookCard key={idx} variant={item.variant} name={item.name} neighborhood={item.neighborhood} preview={item.preview} venue={venue} date={item.date}/>;
      }
      case"shaw":
        if(!editorial)return null;
        return <FeedShawCard key={idx} property={item.property} tagline={item.tagline} age={item.age} body={item.body} cta={item.cta}/>;
      case"deal":
        return topDeals[item.i]?<FeedPromotedCard key={idx} deal={topDeals[item.i]}/>:null;
      case"event":
        return upcomingEvents[item.i]?<FeedEventCard key={idx} event={upcomingEvents[item.i]}/>:null;
      default:
        return null;
    }
  };
  return(<div className="view-enter" style={{position:"relative",zIndex:1}}>
    <div className="feed" style={{maxWidth:560,margin:"0 auto",background:FT.bg,minHeight:"100vh"}}>
      <FeedHeader onOpenConcierge={()=>setConciergeOpen(true)}/>
      <FeedHero/>
      <FeedTicker/>
      {/* WS8 — America 250 campaign rail (shared component; classic mounts it too) */}
      <TrailRail dark/>
      {/* inline order: greeting line, THEN StoryCard + ModeChips, then the rest of
          the storyboard — so the first item (the greeting) renders before them */}
      {storyboard.length>0&&renderItem(storyboard[0],"sb-0")}
      <FeedStoryCard/>
      <FeedModeChips activeMode={activeMode} setActiveMode={setActiveMode}/>
      {storyboard.slice(1).map((item,i)=>renderItem(item,i+1))}
      <FeedWallSection/>
      <div style={{padding:"32px 24px 16px",borderBottom:`1px solid ${FT.line}`,background:FT.surf}}>
        <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".3em",color:FT.red,textTransform:"uppercase",marginBottom:6}}>Browse Everything</div>
        <h2 style={{fontFamily:FT.fd,fontSize:28,fontWeight:600,color:FT.ink,letterSpacing:"-.025em",lineHeight:1.1}}>The Full Directory</h2>
        <p style={{fontFamily:FT.fb,fontSize:13,color:FT.inkMid,lineHeight:1.55,marginTop:10}}>{directory.length} places across {sortedCats.length} categories. Tap any section to expand.</p>
      </div>
      {sortedCats.map(cat=><FeedDirectorySection key={cat} cat={cat} businesses={grouped[cat]}/>)}
      <FeedTransitSection/>
      <div style={{padding:"32px 24px 16px",borderBottom:`1px solid ${FT.line}`,background:FT.bg}}>
        <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".3em",color:FT.red,textTransform:"uppercase",marginBottom:6}}>Beyond {CITY.name}</div>
        <h2 style={{fontFamily:FT.fd,fontSize:28,fontWeight:600,color:FT.ink,letterSpacing:"-.025em",lineHeight:1.1}}>Worth The Drive</h2>
      </div>
      {(SIDE_TRIPS||[]).map(t=><FeedSideTripCard key={t.name} trip={t}/>)}
      <FeedFooter/>
    </div>
    <FeedConciergeFAB onClick={()=>setConciergeOpen(true)}/>
    <FeedConciergeModal open={conciergeOpen} onClose={()=>setConciergeOpen(false)}/>
  </div>);
}
