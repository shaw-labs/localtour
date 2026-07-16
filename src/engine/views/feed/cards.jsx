// LocalTour engine — Feed cards (transplanted verbatim from the inline apps;
// chicago index.html ~2761–3000; see docs/WS1_PORT_CONTRACTS.md).
// City literals found inline read from model.editorial?.defaults with the
// chicago literals as final fallbacks.
import { useState, useMemo } from "react";
import { FT } from "../../theme";
import { Reveal } from "../../hooks";
import { useCityModel } from "../../cityModel";
import { track, bizId } from "../../beacon";
import { useImpression } from "../../useImpression";

// WS3 coupon redeem confirm (feed + classic share this): after a code is revealed
// the shopper can confirm redemption → GET /api/redeem, which records a single
// coupon_redeem per (code, sid). We reuse beacon's anonymous session id (lt_sid);
// if it's absent (DNT/GPC opt-out, private mode) we reveal only and never call out.
export function confirmRedeem(city, businessName, code) {
  if (!code) return;
  let sid = null;
  try { sid = sessionStorage.getItem("lt_sid"); } catch { /* storage blocked */ }
  if (!sid) return; // no anonymous session (opted out) — do not mint one just to redeem
  const qs = new URLSearchParams({
    c: String(code).toLowerCase(),   // redeem endpoint accepts [a-z0-9-] only
    sid,
    city,
    biz: bizId(businessName),
  });
  try { void fetch(`/api/redeem?${qs.toString()}`).catch(() => {}); } catch { /* never break UI */ }
}

// Classify a deal's redemption: link/app open a URL (outbound), everything else
// (qr/code/in-store) is an in-store coupon code we can reveal via the clipper.
export function dealRedemption(deal, features) {
  const rtype = deal.redemption_type;
  const isOutbound = rtype === "link" || rtype === "app";
  const value = deal.redemption_value;
  // Code comes from the WS4 build overlay (deal.code); fall back to a legacy
  // redemption_value if one ever ships in source.
  const code = deal.code || (!isOutbound ? value : null) || null;
  return {
    isOutbound,
    url: isOutbound && /^https?:\/\//i.test(value || "") ? value : null,
    code,
    hasCode: Boolean(features?.coupon_clipper) && !isOutbound && Boolean(code),
  };
}

export function EmptyGameSlot({title}){return(<div style={{width:"100%",height:300,background:"repeating-linear-gradient(45deg,#0f0f10 0 8px,#111113 8px 16px)",border:`1px dashed ${FT.inkFaint}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
  <div style={{fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",color:FT.inkDim,textTransform:"uppercase"}}>Game Slot · {title}</div>
  <div style={{fontFamily:FT.fb,fontSize:12,color:FT.inkMid,textAlign:"center",maxWidth:260,lineHeight:1.5,padding:"0 20px"}}>Pass any component with <span style={{fontFamily:FT.fm,color:FT.teal}}>onComplete(score)</span> into the <span style={{fontFamily:FT.fm,color:FT.teal}}>GameComponent</span> prop.</div>
</div>);}

let _fuidCounter=0;
export function ImgOrVisual({src,fallbackSeed,label,aspect="4/5"}){
  const{defaults}=useCityModel();
  const[err,setErr]=useState(!src);
  const uid=useMemo(()=>`gr${++_fuidCounter}`,[]);
  const coords=defaults?.coords||"41.8781°N · 87.6298°W";
  const palettes={wicker:["#1a1f2e","#2d4a5c","#6b8a7a","#d4a574"],deep:["#1a0f08","#3d1f0c","#8b4513","#d4a574"],westloop:["#0f1520","#1e3a5f","#4a6fa5","#e8c878"],blues:["#0a0a0f","#1a0a2e","#6b2d5c","#c44534"],arch:["#0d1117","#2d3540","#5a6c7d","#9cb3c9"],park:["#0a1408","#1e2f18","#3d5a2d","#8ca87a"],lake:["#0a1420","#0f2535","#1e4d6b","#a8c8d9"],night:["#0a0a14","#1a1628","#3d2a4a","#c89b3c"],warm:["#1a0a08","#2d1410","#5c2d1a","#b8692c"]};
  const p=palettes[fallbackSeed]||palettes.arch;
  if(err||!src)return(<div style={{position:"relative",width:"100%",aspectRatio:aspect,background:`linear-gradient(135deg,${p[0]} 0%,${p[1]} 45%,${p[2]} 100%)`,overflow:"hidden"}}>
    <svg width="100%" height="100%" style={{position:"absolute",inset:0,opacity:.18}}>
      <defs><pattern id={uid} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke={p[3]} strokeWidth=".4"/></pattern></defs>
      <rect width="100%" height="100%" fill={`url(#${uid})`}/>
    </svg>
    <div style={{position:"absolute",left:24,top:24,width:3,height:48,background:p[3]}}/>
    <div style={{position:"absolute",left:24,bottom:24,right:24,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
      <div style={{fontFamily:FT.fd,fontSize:34,fontWeight:600,color:p[3],lineHeight:.95,letterSpacing:"-.03em",maxWidth:"70%"}}>{label}</div>
      <div style={{fontFamily:FT.fm,fontSize:8,letterSpacing:".24em",color:p[3],opacity:.7,textTransform:"uppercase",writingMode:"vertical-rl",transform:"rotate(180deg)"}}>{coords}</div>
    </div>
  </div>);
  const base=src.replace(/\.[^.]+$/,""); // WS7: avif→webp→jpg responsive variants (optimize-images.mjs)
  const sizes="(max-width:600px) 100vw, 560px";
  return(<div style={{position:"relative",width:"100%",aspectRatio:aspect,background:FT.surf,overflow:"hidden"}}>
    <picture>
      <source type="image/avif" srcSet={`${base}-sm.avif 720w, ${base}.avif 1440w`} sizes={sizes}/>
      <source type="image/webp" srcSet={`${base}-sm.webp 720w, ${base}.webp 1440w`} sizes={sizes}/>
      <img src={`${base}.jpg`} alt={label||""} loading="lazy" onError={()=>setErr(true)} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
    </picture>
    <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 50%,rgba(10,10,11,.55) 100%)",pointerEvents:"none"}}/>
  </div>);
}

export function FeedConciergeLine({text,author}){const{defaults}=useCityModel();const by=author??(defaults?.author||"the dispatcher");return(<Reveal><div style={{padding:"22px 24px",borderBottom:`1px solid ${FT.line}`,background:"linear-gradient(180deg,transparent 0%,rgba(179,19,31,.03) 100%)"}}>
  <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".3em",color:FT.inkDim,textTransform:"uppercase",marginBottom:8}}>— {by}</div>
  <div style={{fontFamily:FT.fd,fontSize:17,fontWeight:400,color:"#d8d3c9",lineHeight:1.45,fontStyle:"italic",letterSpacing:"-.005em"}}>{text}</div>
</div></Reveal>);}

export function FeedChip({active,onClick,children}){return(<button onClick={onClick} style={{padding:"8px 14px",background:active?FT.ink:"transparent",color:active?FT.bg:FT.inkMid,border:`1px solid ${active?FT.ink:FT.inkFaint}`,fontFamily:FT.fm,fontSize:10,letterSpacing:".18em",textTransform:"uppercase",cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s"}}>{children}</button>);}

// Subtle merchant-tier badge (WS4). Renders only when biz.tier is "partner" or
// "anchor" (set upstream by the model via tierOf). Understated on purpose — a
// quiet label, not a loud ad. Anchor gets a faint gold wash; partner stays ghost.
function FeedTierBadge({tier}){
  if(tier!=="partner"&&tier!=="anchor")return null;
  const isAnchor=tier==="anchor";
  const label=isAnchor?"Anchor":"Partner";
  return(<span title={`${label} merchant`} style={{display:"inline-flex",alignItems:"center",padding:"2px 7px",borderRadius:2,border:`1px solid ${isAnchor?"rgba(200,155,60,.28)":FT.inkFaint}`,background:isAnchor?"rgba(200,155,60,.06)":"transparent",fontFamily:FT.fm,fontSize:8,letterSpacing:".16em",lineHeight:1.5,color:isAnchor?FT.gold:FT.inkMid,textTransform:"uppercase"}}>{label}</span>);
}

export function FeedBusinessCard({biz,kicker,override,imageKey}){
  const{slug,IMG,CAT_IMAGES,CAT_KICKERS}=useCityModel();
  const impRef=useImpression(slug,biz.name,"feed");
  const cat=biz.category,neighborhood=biz.address?biz.address.split(",")[1]?.trim():null;
  const imgFile=override?.image||CAT_IMAGES[cat];
  const kick=override?.kicker||kicker||CAT_KICKERS[cat]||cat;
  const title=override?.title||biz.name;
  const body=override?.body||biz.description;
  const stars=biz.rating?`★ ${biz.rating}`:"";
  const price=biz.price||"";
  return(<Reveal><article ref={impRef} style={{borderBottom:`1px solid ${FT.line}`,background:FT.bg}}>
    <ImgOrVisual src={IMG(imgFile)} fallbackSeed={imageKey||cat} label={biz.name} aspect="4/5"/>
    <div style={{padding:"20px 24px 26px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,fontFamily:FT.fm,fontSize:9,letterSpacing:".24em",color:FT.inkDim,textTransform:"uppercase",gap:12}}>
        <span style={{display:"inline-flex",alignItems:"center",gap:8}}>{kick}{biz.tier&&<FeedTierBadge tier={biz.tier}/>}</span>
        <span style={{textAlign:"right",maxWidth:"60%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{neighborhood}</span>
      </div>
      <h2 style={{fontFamily:FT.fd,fontSize:24,fontWeight:500,color:FT.ink,margin:"0 0 10px",lineHeight:1.15,letterSpacing:"-.015em"}}>{title}</h2>
      <p style={{fontFamily:FT.fb,fontSize:14,color:FT.inkMid,lineHeight:1.55,margin:"0 0 14px"}}>{body}</p>
      {biz.must_try&&<div style={{fontFamily:FT.fb,fontSize:12,color:"#d8d3c9",fontStyle:"italic",padding:"10px 12px",borderLeft:`2px solid ${FT.red}`,background:"rgba(179,19,31,.04)",marginBottom:14}}>Try: {biz.must_try}</div>}
      <div style={{display:"flex",gap:14,fontFamily:FT.fm,fontSize:10,letterSpacing:".15em",color:FT.inkMid,textTransform:"uppercase",flexWrap:"wrap",alignItems:"center"}}>
        {stars&&<span style={{color:FT.gold}}>{stars}</span>}
        {price&&<span>{price}</span>}
        {biz.hours&&<span style={{color:FT.inkDim,textTransform:"none",letterSpacing:".08em",fontSize:11}}>{biz.hours.length>40?biz.hours.slice(0,40)+"…":biz.hours}</span>}
      </div>
      <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
        {biz.address&&<a onClick={()=>track.outboundClick(slug,biz.name,"feed")} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(biz.address+" "+biz.name)}`} target="_blank" rel="noopener" style={{padding:"8px 14px",background:"transparent",color:FT.ink,border:`1px solid ${FT.inkFaint}`,fontFamily:FT.fm,fontSize:10,letterSpacing:".18em",textTransform:"uppercase",textDecoration:"none"}}>Map</a>}
        {biz.phone&&<a onClick={()=>track.outboundClick(slug,biz.name,"feed")} href={`tel:${biz.phone.replace(/[^+0-9]/g,"")}`} style={{padding:"8px 14px",background:"transparent",color:FT.ink,border:`1px solid ${FT.inkFaint}`,fontFamily:FT.fm,fontSize:10,letterSpacing:".18em",textTransform:"uppercase",textDecoration:"none"}}>Call</a>}
        {biz.website&&<a onClick={()=>track.outboundClick(slug,biz.name,"feed")} href={biz.website} target="_blank" rel="noopener" style={{padding:"8px 14px",background:FT.ink,color:FT.bg,border:"none",fontFamily:FT.fm,fontSize:10,letterSpacing:".18em",textTransform:"uppercase",textDecoration:"none"}}>Book →</a>}
      </div>
    </div>
  </article></Reveal>);
}

export function FeedGameCard({title,tagline,GameComponent}){const[,setDone]=useState(false);return(<Reveal><article style={{borderBottom:`1px solid ${FT.line}`,background:FT.bg}}>
  <div style={{padding:"20px 24px 14px"}}>
    <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".3em",color:FT.green,textTransform:"uppercase",marginBottom:8}}>◆ Interactive</div>
    <h2 style={{fontFamily:FT.fd,fontSize:22,fontWeight:500,color:FT.ink,margin:"0 0 4px",letterSpacing:"-.015em"}}>{title}</h2>
    <p style={{fontFamily:FT.fb,fontSize:13,color:FT.inkMid,margin:0}}>{tagline}</p>
  </div>
  {GameComponent?<GameComponent onComplete={()=>setDone(true)}/>:<EmptyGameSlot title={title}/>}
</article></Reveal>);}

export function FeedBlackBookCard({variant,name,neighborhood,preview,venue,date}){const{defaults}=useCityModel();const hoodFallback=defaults?.neighborhood||"Loop";return(<Reveal><article style={{borderBottom:`1px solid ${FT.line}`,background:`linear-gradient(180deg,${FT.leather} 0%,${FT.leatherMid} 100%)`,padding:"28px 24px",position:"relative"}}>
  <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 20% 30%,rgba(232,223,208,.03) 0%,transparent 50%),radial-gradient(circle at 80% 70%,rgba(232,223,208,.02) 0%,transparent 50%)",pointerEvents:"none"}}/>
  <div style={{position:"relative"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".3em",color:FT.leatherGold,textTransform:"uppercase"}}>◈ BlackBook</div>
      <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".2em",color:"#7a6a4a",textTransform:"uppercase"}}>{variant==="match"?"Mutual · 2m ago":"Date Mode"}</div>
    </div>
    {variant==="match"?<>
      <div style={{fontFamily:FT.fd,fontSize:26,fontWeight:500,color:FT.leatherInk,fontStyle:"italic",letterSpacing:"-.02em",lineHeight:1.18,marginBottom:14}}>"{preview}"</div>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${FT.leatherGold} 0%,#7a5d3a 100%)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FT.fd,fontSize:18,color:FT.leather,fontWeight:600}}>{name[0]}</div>
        <div>
          <div style={{fontFamily:FT.fd,fontSize:16,color:FT.leatherInk}}>{name}</div>
          <div style={{fontFamily:FT.fm,fontSize:10,color:"#7a6a4a",letterSpacing:".15em",textTransform:"uppercase",marginTop:2}}>{neighborhood}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button style={{flex:1,padding:12,background:FT.leatherGold,color:FT.leather,border:"none",fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",textTransform:"uppercase",cursor:"pointer"}}>Reveal</button>
        <button style={{padding:"12px 18px",background:"transparent",color:FT.leatherGold,border:"1px solid #5a4a2a",fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",textTransform:"uppercase",cursor:"pointer"}}>Pass</button>
      </div>
    </>:<>
      <div style={{fontFamily:FT.fd,fontSize:22,color:FT.leatherInk,lineHeight:1.3,marginBottom:18,letterSpacing:"-.015em"}}>You and {name} both saved {neighborhood||hoodFallback} spots this week.<br/><span style={{color:FT.leatherGold,fontStyle:"italic"}}>{venue}</span>, {date||"Thursday 8pm"}?</div>
      <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0",borderTop:"1px solid #3a2a1a",borderBottom:"1px solid #3a2a1a",marginBottom:18,fontFamily:FT.fm,fontSize:10,color:"#a89578",letterSpacing:".12em",textTransform:"uppercase"}}>
        <span>Booked via LocalTour</span><span>Seats 2</span>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button style={{flex:1,padding:12,background:FT.leatherGold,color:FT.leather,border:"none",fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",textTransform:"uppercase",cursor:"pointer"}}>Confirm & Book</button>
        <button style={{padding:"12px 18px",background:"transparent",color:FT.leatherGold,border:"1px solid #5a4a2a",fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",textTransform:"uppercase",cursor:"pointer"}}>Other night</button>
      </div>
    </>}
  </div>
</article></Reveal>);}

export function FeedPromotedCard({deal}){
  const{slug,byName,IMG,CAT_IMAGES,features}=useCityModel();
  const biz=byName[deal.business_name];
  const view="feed";
  const[revealed,setRevealed]=useState(false);
  const[redeemed,setRedeemed]=useState(false);
  const{isOutbound,url,code,hasCode}=dealRedemption(deal,features);
  const label=deal.redemption_type==="app"?"Get in App":deal.redemption_type==="link"?"Claim Online":"Show In-Store";
  const onCta=()=>{
    // The tap on the offer CTA IS the coupon reveal — fire it in every branch.
    track.couponReveal(slug,deal.business_name,view);
    if(isOutbound){                                   // link/app deals leave the site
      track.outboundClick(slug,deal.business_name,view);
      if(url)window.open(url,"_blank","noopener");
      return;
    }
    if(hasCode)setRevealed(true);                     // clipper on + real code → show it
    // else: clipper off / no code → couponReveal already recorded; no code screen
  };
  const onRedeem=()=>{
    if(redeemed)return;
    // coupon_redeem is recorded server-side by /api/redeem (idempotent per code+sid);
    // do NOT also emit it via beacon or it double-counts.
    confirmRedeem(slug,deal.business_name,code);
    setRedeemed(true);
  };
  return(<Reveal><article data-deal-card style={{borderBottom:`1px solid ${FT.line}`,background:FT.bg,position:"relative"}}>
  <div style={{position:"absolute",top:14,right:14,zIndex:10,padding:"4px 10px",background:"rgba(200,155,60,.15)",border:`1px solid #8a6a2a`,fontFamily:FT.fm,fontSize:9,letterSpacing:".24em",color:FT.gold,textTransform:"uppercase"}}>{deal.is_exclusive?"Exclusive":"Promoted"}</div>
  <ImgOrVisual src={biz?IMG(CAT_IMAGES[biz.category]):null} fallbackSeed="warm" label={deal.business_name} aspect="16/10"/>
  <div style={{padding:"20px 24px 26px"}}>
    <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".24em",color:FT.inkDim,textTransform:"uppercase",marginBottom:10}}>{deal.category}</div>
    <h2 style={{fontFamily:FT.fd,fontSize:22,fontWeight:500,color:FT.ink,margin:"0 0 10px",letterSpacing:"-.015em"}}>{deal.business_name}</h2>
    <p style={{fontFamily:FT.fb,fontSize:14,color:FT.inkMid,lineHeight:1.55,margin:"0 0 16px"}}>{deal.offer_text}</p>
    {revealed&&hasCode?(
      <div style={{border:`1px dashed ${FT.gold}`,background:"rgba(200,155,60,.08)",padding:"14px 16px"}}>
        <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".24em",color:FT.inkDim,textTransform:"uppercase",marginBottom:6}}>Your code · show in-store</div>
        <div style={{fontFamily:FT.fm,fontSize:20,letterSpacing:".08em",color:FT.gold,marginBottom:12}}>{code}</div>
        <button onClick={onRedeem} disabled={redeemed} style={{padding:"10px 20px",background:redeemed?"transparent":FT.ink,color:redeemed?FT.gold:FT.bg,border:redeemed?`1px solid ${FT.gold}`:"none",fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",textTransform:"uppercase",cursor:redeemed?"default":"pointer"}}>{redeemed?"Redeemed ✓":"Mark as redeemed"}</button>
      </div>
    ):(
      <button onClick={onCta} style={{padding:"10px 20px",background:FT.ink,color:FT.bg,border:"none",fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",textTransform:"uppercase",cursor:"pointer"}}>{label}</button>
    )}
  </div>
</article></Reveal>);}

export function FeedShawCard({property,tagline,body,cta,accent=FT.teal,age}){return(<Reveal><article style={{borderBottom:`1px solid ${FT.line}`,background:FT.bg,padding:"28px 24px",position:"relative"}}>
  <div style={{position:"absolute",top:14,right:14,padding:"4px 10px",background:"rgba(0,229,204,.08)",border:"1px solid #1a5c55",fontFamily:FT.fm,fontSize:9,letterSpacing:".24em",color:FT.teal,textTransform:"uppercase"}}>From SH@W Labs</div>
  <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".3em",color:accent,textTransform:"uppercase",marginBottom:10,marginTop:20}}>{tagline}{age&&<span style={{marginLeft:8,color:FT.redLight}}>· {age}</span>}</div>
  <h2 style={{fontFamily:FT.fd,fontSize:30,fontWeight:600,color:FT.ink,margin:"0 0 12px",letterSpacing:"-.025em",lineHeight:1.05}}>{property}</h2>
  <p style={{fontFamily:FT.fb,fontSize:14,color:FT.inkMid,lineHeight:1.55,margin:"0 0 18px"}}>{body}</p>
  <div style={{display:"flex",alignItems:"center",gap:10,fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",color:accent,textTransform:"uppercase",cursor:"pointer"}}>{cta||"Open Property"} →</div>
</article></Reveal>);}

export function FeedEventCard({event}){return(<Reveal><article style={{borderBottom:`1px solid ${FT.line}`,background:FT.bg,padding:"24px"}}>
  <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".3em",color:FT.red,textTransform:"uppercase",marginBottom:8}}>◉ Event</div>
  <h2 style={{fontFamily:FT.fd,fontSize:24,fontWeight:500,color:FT.ink,margin:"0 0 8px",letterSpacing:"-.015em"}}>{event.title}</h2>
  <div style={{fontFamily:FT.fm,fontSize:11,letterSpacing:".1em",color:FT.inkMid,textTransform:"uppercase"}}>{event.date}</div>
</article></Reveal>);}

export function FeedSideTripCard({trip}){return(<Reveal><article style={{padding:"28px 24px",borderBottom:`1px solid ${FT.line}`,background:FT.bg}}>
  <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".3em",color:FT.red,textTransform:"uppercase",marginBottom:8}}>Side Trip</div>
  <h3 style={{fontFamily:FT.fd,fontSize:22,fontWeight:600,color:FT.ink,letterSpacing:"-.02em",marginBottom:4}}>{trip.name}</h3>
  <div style={{fontFamily:FT.fm,fontSize:10,color:FT.gold,letterSpacing:".15em",textTransform:"uppercase",marginBottom:12}}>{trip.dist}</div>
  <p style={{fontFamily:FT.fb,fontSize:14,color:FT.inkMid,lineHeight:1.55,marginBottom:14}}>{trip.pitch}</p>
  {trip.hl&&<ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:6}}>{trip.hl.map((h,i)=><li key={i} style={{fontFamily:FT.fb,fontSize:13,color:"#d8d3c9",paddingLeft:14,position:"relative"}}>
    <span style={{position:"absolute",left:0,top:7,width:4,height:4,background:FT.red,borderRadius:"50%"}}/>{h}
  </li>)}</ul>}
</article></Reveal>);}
