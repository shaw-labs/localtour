// LocalTour engine — Feed structural sections (transplanted verbatim from the
// inline apps; chicago index.html ~2895–2990, 3050–3061; see docs/WS1_PORT_CONTRACTS.md).
// Model mappings: CITY.hero_image → HERO.image, CITY.local_transport → LOCAL_TRANSPORT,
// CITY.region → CITY.region || CITY.state (model CITY has no region field).
import { useState } from "react";
import { FT, CAT_LABELS_PLAIN } from "../../theme";
import { Reveal } from "../../hooks";
import { useCityModel } from "../../cityModel";
import { track } from "../../beacon";
import { ImgOrVisual, FeedChip } from "./cards";
import { NewsletterSignup } from "../../NewsletterSignup";

export function FeedHeader({onOpenConcierge}){const{wallUrl}=useCityModel();return(<div style={{position:"sticky",top:0,zIndex:50,background:"rgba(10,10,11,.86)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${FT.line}`,padding:"12px 20px 12px 180px",display:"flex",justifyContent:"flex-end",alignItems:"center",height:56}}>
  <div style={{display:"flex",alignItems:"center",gap:12}}>
    <a href={wallUrl} style={{background:"transparent",border:"none",fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",color:FT.inkMid,textTransform:"uppercase",cursor:"pointer",textDecoration:"none"}}>Wall</a>
    <button onClick={onOpenConcierge} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:`1px solid ${FT.inkFaint}`,padding:"6px 10px",cursor:"pointer",fontFamily:FT.fm,fontSize:9,letterSpacing:".2em",color:FT.inkMid,textTransform:"uppercase"}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:FT.green,boxShadow:`0 0 8px ${FT.green}`,animation:"pulse 2s infinite"}}/>
      Concierge
    </button>
  </div>
</div>);}

export function FeedHero(){const{CITY,HERO,IMG}=useCityModel();return(<section style={{position:"relative",borderBottom:`1px solid ${FT.line}`,overflow:"hidden"}}>
  <ImgOrVisual src={IMG(HERO.image)} fallbackSeed="lake" label={CITY.name} aspect="1/1"/>
  <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(10,10,11,.35) 0%,rgba(10,10,11,.2) 40%,rgba(10,10,11,.92) 100%)"}}/>
  <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 24px 32px"}}>
    <Reveal><div style={{fontFamily:FT.fm,fontSize:10,letterSpacing:".3em",color:FT.red,textTransform:"uppercase",marginBottom:10}}>{CITY.region||CITY.state}</div></Reveal>
    <Reveal delay={.08}><h1 style={{fontFamily:FT.fd,fontSize:"clamp(40px,10vw,60px)",fontWeight:600,color:FT.ink,lineHeight:.98,letterSpacing:"-.035em",marginBottom:10}}>{CITY.name}</h1></Reveal>
    <Reveal delay={.16}><p style={{fontFamily:FT.fd,fontSize:16,fontStyle:"italic",color:"rgba(245,242,236,.7)",lineHeight:1.35,marginBottom:6,letterSpacing:"-.005em"}}>{CITY.tagline}</p></Reveal>
    <Reveal delay={.24}><p style={{fontFamily:FT.fb,fontSize:13,color:FT.inkMid,lineHeight:1.55,maxWidth:460}}>{CITY.hero_sub}</p></Reveal>
  </div>
</section>);}

export function FeedTicker(){const{events}=useCityModel();const featured=events.filter(e=>e.featured).slice(0,10);if(!featured.length)return null;const items=[...featured,...featured];return(<div style={{background:FT.surf,borderBottom:`1px solid ${FT.line}`,overflow:"hidden",padding:"12px 0"}}>
  <div style={{display:"flex",gap:40,whiteSpace:"nowrap",width:"max-content",animation:"ticker 55s linear infinite"}}>
    {items.map((e,i)=><span key={i} style={{color:FT.inkMid,fontSize:11,fontFamily:FT.fm,letterSpacing:".1em",display:"flex",alignItems:"center",gap:8,textTransform:"uppercase"}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:FT.red,boxShadow:`0 0 6px ${FT.red}`,flexShrink:0}}/>
      {e.title}<span style={{opacity:.4,margin:"0 4px"}}>—</span><span style={{opacity:.5}}>{e.date}</span>
    </span>)}
  </div>
</div>);}

export function FeedStoryCard(){const{CITY}=useCityModel();return(<Reveal><section style={{padding:"40px 24px",borderBottom:`1px solid ${FT.line}`}}>
  <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".3em",color:FT.red,textTransform:"uppercase",marginBottom:12}}>The Story</div>
  <h2 style={{fontFamily:FT.fd,fontSize:28,fontWeight:600,color:FT.ink,lineHeight:1.15,letterSpacing:"-.02em",marginBottom:16}}>{CITY.tagline}</h2>
  <p style={{fontFamily:FT.fb,fontSize:15,color:FT.inkMid,lineHeight:1.7,fontWeight:300}}>{CITY.description}</p>
</section></Reveal>);}

export function FeedModeChips({activeMode,setActiveMode}){const{MODES}=useCityModel();return(<div style={{padding:"18px 0 18px 24px",borderBottom:`1px solid ${FT.line}`,background:FT.bg,position:"relative"}}>
  <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".3em",color:FT.inkDim,textTransform:"uppercase",marginBottom:12}}>Shape the Feed</div>
  <div style={{display:"flex",gap:8,overflowX:"auto",paddingRight:24,paddingBottom:4,scrollbarWidth:"none"}}>
    <FeedChip active={!activeMode} onClick={()=>setActiveMode(null)}>All</FeedChip>
    {MODES.map(m=><FeedChip key={m.id} active={activeMode===m.id} onClick={()=>setActiveMode(m.id)}>{m.icon} {m.label}</FeedChip>)}
  </div>
</div>);}

export function FeedDirectorySection({cat,businesses}){
  const{slug}=useCityModel();
  const[expanded,setExpanded]=useState(false);
  const label=CAT_LABELS_PLAIN[cat]||cat;
  const show=expanded?businesses:businesses.slice(0,3);
  if(!businesses.length)return null;
  return(<Reveal><section style={{padding:"28px 24px",borderBottom:`1px solid ${FT.line}`}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:18}}>
      <div>
        <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".3em",color:FT.inkDim,textTransform:"uppercase",marginBottom:6}}>Directory</div>
        <h3 style={{fontFamily:FT.fd,fontSize:22,fontWeight:600,color:FT.ink,letterSpacing:"-.02em"}}>{label}</h3>
      </div>
      <span style={{fontFamily:FT.fm,fontSize:10,color:FT.inkDim,letterSpacing:".15em"}}>{businesses.length}</span>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      {show.map((b,i)=><a key={b.name} onClick={()=>track.outboundClick(slug,b.name,"feed")} href={b.website||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address+" "+b.name)}`} target="_blank" rel="noopener" style={{display:"block",padding:"14px 0",borderTop:i===0?"none":`1px solid ${FT.line}`,textDecoration:"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:12,marginBottom:4}}>
          <span style={{fontFamily:FT.fd,fontSize:17,fontWeight:500,color:FT.ink,letterSpacing:"-.01em"}}>{b.name}</span>
          <span style={{fontFamily:FT.fm,fontSize:10,color:FT.gold,letterSpacing:".1em",flexShrink:0}}>{b.rating?`★ ${b.rating}`:""} {b.price||""}</span>
        </div>
        <p style={{fontFamily:FT.fb,fontSize:13,color:FT.inkMid,lineHeight:1.45,marginBottom:4}}>{b.description.slice(0,140)}{b.description.length>140?"…":""}</p>
        {b.address&&<div style={{fontFamily:FT.fm,fontSize:10,color:FT.inkDim,letterSpacing:".1em",textTransform:"uppercase"}}>{b.address.split(",")[1]?.trim()||b.address.split(",")[0]}</div>}
      </a>)}
    </div>
    {businesses.length>3&&<button onClick={()=>setExpanded(!expanded)} style={{marginTop:16,padding:"10px 18px",background:"transparent",color:FT.ink,border:`1px solid ${FT.inkFaint}`,fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>{expanded?"Collapse":`Show All ${businesses.length}`}</button>}
  </section></Reveal>);
}

export function FeedWallSection(){const{WALL_IMAGES,IMG,wallUrl}=useCityModel();return(<Reveal><section style={{padding:"32px 24px",borderBottom:`1px solid ${FT.line}`}}>
  <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".3em",color:FT.red,textTransform:"uppercase",marginBottom:8}}>The Wall</div>
  <h3 style={{fontFamily:FT.fd,fontSize:22,fontWeight:600,color:FT.ink,letterSpacing:"-.02em",marginBottom:16}}>What locals are posting</h3>
  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
    {(WALL_IMAGES||[]).slice(0,9).map((f,i)=><a key={i} href={wallUrl} style={{position:"relative",aspectRatio:"1/1",overflow:"hidden",background:FT.surf,textDecoration:"none",display:"block"}}>
      <img src={IMG(f)} alt="" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";e.target.parentElement.style.background=`linear-gradient(135deg,${["#1a1f2e","#2d1410","#1e4d6b","#1a0a2e","#3d1f0c","#2d4a5c","#0f2535","#3d2a4a","#1e3a5f"][i]} 0%,${FT.surf} 100%)`;}}/>
    </a>)}
  </div>
  <a href={wallUrl} style={{display:"inline-block",marginTop:16,padding:"10px 18px",background:"transparent",color:FT.ink,border:`1px solid ${FT.inkFaint}`,fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",textDecoration:"none"}}>Open The Wall →</a>
</section></Reveal>);}

export function FeedTransitSection(){const{TRANSIT,LOCAL_TRANSPORT}=useCityModel();return(<Reveal><section style={{padding:"32px 24px",borderBottom:`1px solid ${FT.line}`,background:FT.surf}}>
  <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".3em",color:FT.red,textTransform:"uppercase",marginBottom:8}}>Getting Here</div>
  <h3 style={{fontFamily:FT.fd,fontSize:22,fontWeight:600,color:FT.ink,letterSpacing:"-.02em",marginBottom:20}}>Transit & Arrival</h3>
  <div style={{display:"flex",flexDirection:"column",gap:14}}>
    {TRANSIT.map((t,i)=><div key={i} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
      <div style={{fontSize:22,flexShrink:0,filter:"grayscale(.3)"}}>{t.icon}</div>
      <div>
        <div style={{fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",color:FT.red,textTransform:"uppercase",marginBottom:4}}>{t.label}</div>
        <div style={{fontFamily:FT.fb,fontSize:13,color:FT.inkMid,lineHeight:1.55}}>{t.text}</div>
      </div>
    </div>)}
    {LOCAL_TRANSPORT&&<div style={{marginTop:8,paddingTop:14,borderTop:`1px solid ${FT.line}`,fontFamily:FT.fb,fontSize:13,color:FT.inkMid,lineHeight:1.55,fontStyle:"italic"}}>{LOCAL_TRANSPORT}</div>}
  </div>
</section></Reveal>);}

export function FeedFooter(){const{CITY,directory,deals,events}=useCityModel();return(<footer style={{background:FT.bg,borderTop:`1px solid ${FT.line}`,padding:"44px 24px 32px",textAlign:"center"}}>
  <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:12}}>
    <div style={{width:22,height:22,background:FT.red,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:FT.ink,fontFamily:FT.fd}}>LT</div>
    <span style={{fontFamily:FT.fd,fontSize:16,fontWeight:500,color:FT.ink}}>LocalTour <span style={{color:FT.red}}>{CITY.name}</span></span>
  </div>
  <p style={{fontFamily:FT.fb,fontSize:13,color:FT.inkMid,marginBottom:20}}>{directory.length} curated places · {deals.length} deals · {events.length} events</p>
  <div style={{display:"flex",justifyContent:"center",marginBottom:22}}><NewsletterSignup accent={FT.red} fg={FT.ink} muted={FT.inkMid} border={FT.line} bg={FT.bg}/></div>
  <div style={{display:"flex",justifyContent:"center",gap:18,fontFamily:FT.fm,fontSize:9,letterSpacing:".24em",color:FT.inkDim,textTransform:"uppercase"}}>
    <a href="/" style={{color:FT.inkDim,textDecoration:"none"}}>All Cities</a>
    <span style={{opacity:.3}}>·</span>
    <span>A SH@W Labs Product</span>
  </div>
</footer>);}
