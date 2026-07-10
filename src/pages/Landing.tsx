import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import STATS from "../generated/stats.json"; // WS2: computed at build, never hand-typed
import "./Landing.css";

let deferredInstallPrompt: any=null;
const DARK={bg:"#0c1b2a",card:"#152a3e",cardHover:"#1a3248",surface:"#0f2030",fog:"#94a3b8",text:"#f0ebe4",terra:"#dc2626",terraLight:"#ef4444",gold:"#d4a853",dim:"#5a7080",glow:"rgba(220,38,38,0.15)",border:"rgba(255,255,255,0.06)",borderAccent:"rgba(220,38,38,0.12)",r:24,rl:32,rp:999,fd:"'Playfair Display',Georgia,serif",fb:"'DM Sans',sans-serif"};
const LIGHT={bg:"#faf8f4",card:"#ffffff",cardHover:"#f7f3ee",surface:"#f0ebe4",fog:"#718096",text:"#0c1b2a",terra:"#dc2626",terraLight:"#b91c1c",gold:"#b8860b",dim:"#a0aec0",glow:"rgba(220,38,38,0.08)",border:"#e2e8f0",borderAccent:"rgba(220,38,38,0.08)",r:24,rl:32,rp:999,fd:"'Playfair Display',Georgia,serif",fb:"'DM Sans',sans-serif"};
let T=LIGHT;

const CITIES=[
  {slug:"new-york-city",name:"New York City",state:"NY",tagline:"The City That Never Stops",vibe:"8.3M people · 190 places",hero:"hero-fall-central-park.jpg",link:"/cities/new-york-city/"},
  {slug:"san-francisco",name:"San Francisco",state:"CA",tagline:"The City That Eats First",vibe:"874K people · 152 places",hero:"hero-golden-gate-fog-summer.jpg",link:"/cities/san-francisco/"},
  {slug:"miami",name:"Miami",state:"FL",tagline:"Where Hustle Meets Horizon",vibe:"467K people · 251 places",hero:"hero-fall-wynwood.jpg",link:"/cities/miami/"},
  {slug:"chicago",name:"Chicago",state:"IL",tagline:"Invented Itself Twice",vibe:"2.7M people · 181 places",hero:"hero-green-river-spring.jpg",link:"/cities/chicago/"},
  {slug:"houston",name:"Houston",state:"TX",tagline:"Space City Runs on Flavor",vibe:"2.3M people · 212 places",hero:"hero-artcar-spring.jpg",link:"/cities/houston/"},
  {slug:"new-orleans",name:"New Orleans",state:"LA",tagline:"The Music Never Stops",vibe:"383K people · 176 places",hero:"hero-fall-stcharles-canopy.jpg",link:"/cities/new-orleans/"},
  {slug:"las-vegas",name:"Las Vegas",state:"NV",tagline:"What Happens Here, Stays Here",vibe:"Served by SlotGenie ↗",hero:"hero-strip-night.jpg",link:"/vegas/"},
  {slug:"los-angeles",name:"Los Angeles",state:"CA",tagline:"Creative Capital of the Pacific",vibe:"3.9M people · 154 places",hero:"hero-dtla-rain-glow.jpg",link:"/cities/los-angeles/"},
  {slug:"smoky-mountains",name:"Smoky Mountains",state:"TN",tagline:"Mountains Do the Talking",vibe:"155 places curated",hero:"hero-fall-foliage.jpg",link:"/cities/smoky-mountains/"},
  {slug:"phoenix",name:"Phoenix",state:"AZ",tagline:"Where the Desert Keeps Its Own Hours",vibe:"93 places curated",hero:"hero-aerial.jpg",link:"/cities/phoenix"},
  {slug:"salt-lake-city",name:"Salt Lake City",state:"UT",tagline:"Where the Greatest Snow on Earth Meets the City",vibe:"102 places curated",hero:"hero-aerial.jpg",link:"/cities/salt-lake-city"},
  {slug:"nashville",name:"Nashville",state:"TN",tagline:"Every Street Is Somebody's Second Verse",vibe:"101 places curated",hero:"hero-aerial.jpg",link:"/cities/nashville"},
  {slug:"kansas-city",name:"Kansas City",state:"MO",tagline:"Low and Slow, and Worth Every Minute",vibe:"97 places curated",hero:"hero-aerial.jpg",link:"/cities/kansas-city"},
  {slug:"denver",name:"Denver",state:"CO",tagline:"Basecamp for a Mile-High Life",vibe:"98 places curated",hero:"hero-aerial.jpg",link:"/cities/denver"},
  {slug:"austin",name:"Austin",state:"TX",tagline:"Keep It Weird, Keep It Easy",vibe:"105 places curated",hero:"hero-aerial.jpg",link:"/cities/austin"},
  {slug:"portland",name:"Portland",state:"OR",tagline:"Keep It Weird, Keep It Covered",vibe:"104 places curated",hero:"hero-aerial.jpg",link:"/cities/portland"},
];
const COMING_SOON: string[]=[]; // all batch-2 cities now live
const FEATURES: any[]=[
  {id:"concierge",title:"AI Concierge",desc:"Every city gets a personality. Ask questions, get answers that sound like a local — not a search engine.",icon:"\u{1F4AC}",video:"/videos/concierge.mp4"},
  {id:"directory",title:"Curated Directory",desc:"Handpicked restaurants, bars, attractions, and hidden gems. Filtered by vibe, not by ad spend.",icon:"\u{1F4CD}"},
  {id:"planner",title:"Trip Planner",desc:"Tell us what you’re into. We’ll build the weekend. Drag, drop, done.",icon:"\u{1F5D3}️",video:"/videos/tripplanner.mp4"},
  {id:"wall",title:"Community Wall",desc:"Real photos from real visitors. No influencer staging. Just moments.",icon:"\u{1F4F8}",video:"/videos/wall.mp4"},
  {id:"deals",title:"Coupon Clipper",desc:"Exclusive deals from local businesses. Redeemable on the spot.",icon:"\u{1F39F}️",video:"/videos/couponclipper.mp4"},
  {id:"events",title:"Live Events",desc:"What’s happening tonight, this weekend, this season. Always current.",icon:"\u{1F3AD}"},
];

const SENSES: any[]=[
  {n:"01",name:"Wonder",icon:"\u{1F9ED}",accent:"#dc2626",hook:"The itch to look closer.",body:"The impulse that turns a commute into a discovery. Tourists arrive with it built in — locals have to remember. LocalTour is a map for that remembering; heaven.directory is the catalog underneath it.",props:[
    {label:"heaven.directory",url:"https://heaven.directory"},
    {label:"awdaddy.ai",url:"https://awdaddy.ai"},
    {label:"heaven.institute",url:"https://heaven.institute"},
    {label:"kingdomcosign.shop",url:"https://kingdomcosign.shop"}
  ],video:"/01-wonder.mp4"},
  {n:"02",name:"Taste",icon:"\u{1F374}",accent:"#ea580c",hook:"What lands on the tongue first.",body:"The most portable kind of travel — a dish can move you without moving you. Work.Recipes pays the people who write the flavors. Work.Kitchen feeds the operators who get them to the plate.",props:[
    {label:"work.recipes",url:"https://work.recipes"},
    {label:"work.kitchen",url:"https://work.kitchen"},
    {label:"heaven.food",url:"https://heaven.food"},
    {label:"heaven.kitchen",url:"https://heaven.kitchen"}
  ],video:"/02-taste.mp4"},
  {n:"03",name:"Play",icon:"\u{1F579}️",accent:"#8b5cf6",hook:"The part of you that still keeps score.",body:"Being a local hides the player in you. An arcade is a reminder that a decision engine can also be a joystick. 33rd Path is built for the afternoons that don’t need an excuse.",props:[
    {label:"33rdpath.com",url:"https://33rdpath.com"},
    {label:"heaven.fitness",url:"https://heaven.fitness"},
    {label:"blackbook.cam",url:"https://blackbook.cam"}
  ],video:"/03-play.mp4"},
  {n:"04",name:"Story",icon:"\u{1F3AC}",accent:"#991b1b",hook:"A room where the lights go down.",body:"Every good day has a third act. On-Demand is a theater that meets you where you are — curated long-form, zero pre-roll, the way cinema used to feel when you stayed for the credits.",props:[
    {label:"on-demand.me",url:"https://on-demand.me"},
    {label:"work.photography",url:"https://work.photography"}
  ],video:"/04-story.mp4"},
  {n:"05",name:"Chance",icon:"\u{1F3B0}",accent:"#d4a853",hook:"The side of you that likes to lean.",body:"Tourism has always been a small bet — on the restaurant, on the weather, on the stranger’s recommendation. SlotGenie is that impulse, domesticated into chips.",props:[{label:"shaw.casino",url:"https://shaw.casino"}],video:"/05-chance.mp4"},
  {n:"06",name:"Rest",icon:"\u{1F3DB}️",accent:"#475569",hook:"Where the day comes to sit down.",body:"Every journey ends in a room. Heaven.Rentals finds you the night. Heaven.Properties finds you the building. Kingdom Cosign gives you the one object from the day you’ll keep.",props:[{label:"heaven.rentals",url:"https://heaven.rentals"},{label:"heaven.properties",url:"https://heaven.properties"},{label:"kingdomcosign.shop",url:"https://kingdomcosign.shop"}],video:"/06-rest.mp4"},
];

const AFFILIATES={
  flights:[
    {name:"Kayak",url:"https://www.kayak.com/?a=REPLACE_WITH_YOUR_ID",blurb:"Compare 100+ sites."},
    {name:"Skyscanner",url:"https://www.skyscanner.com/?associateid=REPLACE_WITH_YOUR_ID",blurb:"Global coverage."},
    {name:"Google Flights",url:"https://www.google.com/travel/flights",blurb:"Clean UI, flexible dates."},
  ],
  hotels:[
    {name:"Booking.com",url:"https://www.booking.com/index.html?aid=REPLACE_WITH_YOUR_ID",blurb:"Biggest inventory."},
    {name:"Expedia",url:"https://www.expedia.com/?affcid=REPLACE_WITH_YOUR_ID",blurb:"Bundle + save."},
    {name:"Hotels.com",url:"https://www.hotels.com/?affcid=REPLACE_WITH_YOUR_ID",blurb:"Stay 10, get 1 free."},
  ],
  rides:[
    {name:"Uber",url:"https://www.uber.com/a/signup/?code=REPLACE_WITH_YOUR_CODE",blurb:"From the airport, to the hotel."},
    {name:"Lyft",url:"https://www.lyft.com/i/REPLACE_WITH_YOUR_CODE",blurb:"Credit on your first ride."},
  ],
};

function useScrollReveal(th?: any): [any, any]{const ref=useRef<any>(null);const[v,setV]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e]: any)=>{if(e.isIntersecting){setV(true);o.unobserve(el)}},{threshold:th||0.1,rootMargin:"0px 0px -40px 0px"});o.observe(el);return()=>o.disconnect()},[]);return[ref,v]}
function Reveal({children,delay,dir,style}: any){const[ref,vis]=useScrollReveal();const d=delay||0;const tx: any={up:"translateY(36px)",left:"translateX(50px)",right:"translateX(-50px)",scale:"scale(0.94)"};return React.createElement("div",{ref,style:{opacity:vis?1:0,transform:vis?"none":(tx[dir||"up"]||tx.up),transition:"opacity 0.8s cubic-bezier(0.16,1,0.3,1) "+d+"s, transform 0.8s cubic-bezier(0.16,1,0.3,1) "+d+"s",...(style||{})}},children)}
function AutoVideo({src,style}: any){const ref=useRef<any>(null);useEffect(()=>{const el=ref.current;if(!el)return;const play=()=>{el.play().catch(()=>{})};const obs=new IntersectionObserver(([e]: any)=>{if(e.isIntersecting)play();else el.pause()},{threshold:0.1});obs.observe(el);play();return()=>obs.disconnect()},[]);return React.createElement("video",{ref,muted:true,loop:true,playsInline:true,style:style||{},src})}

function InstallButton(){const[available,setAvailable]=useState(false);const[installed,setInstalled]=useState(false);const[hint,setHint]=useState("");useEffect(function(){var onBefore=function(e: any){e.preventDefault();deferredInstallPrompt=e;setAvailable(true);setHint("")};var onInstalled=function(){setInstalled(true);setAvailable(false);deferredInstallPrompt=null;setHint("Installed in Chrome. You can now launch it like an app.")};window.addEventListener("beforeinstallprompt",onBefore);window.addEventListener("appinstalled",onInstalled);if(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches){setInstalled(true);setHint("Installed in Chrome. You can now launch it like an app.")}return function(){window.removeEventListener("beforeinstallprompt",onBefore);window.removeEventListener("appinstalled",onInstalled)}},[]);var clickInstall=async function(){if(installed)return; if(deferredInstallPrompt){deferredInstallPrompt.prompt();try{var choice=await deferredInstallPrompt.userChoice;if(choice&&choice.outcome==="dismissed"){setHint("Chrome opened the install prompt, but it was dismissed. Click Install App again anytime.")}}catch(e){}deferredInstallPrompt=null;setAvailable(false);return}var ua=navigator.userAgent||"";var isChrome=/Chrome|CriOS|Edg/i.test(ua)&&!/OPR|Opera/i.test(ua);if(isChrome){setHint("Open this live HTTPS site in Chrome, then use Chrome menu → Install app. The one-click prompt appears only after Chrome decides the site is installable.");return}setHint("For the Chrome app experience, open this site in Google Chrome on the live domain over HTTPS.")};if(installed){return React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:10}},React.createElement("span",{style:{background:"rgba(16,185,129,0.12)",color:"#047857",padding:"15px 26px",borderRadius:T.rp,fontSize:16,fontWeight:700,fontFamily:T.fb,border:"1px solid rgba(16,185,129,0.25)"}},"App Installed"),hint?React.createElement("div",{style:{fontFamily:T.fb,fontSize:12,color:T.dim,maxWidth:440,lineHeight:1.5,textAlign:"center"}},hint):null)}
return React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:10}},React.createElement("button",{onClick:clickInstall,title:"Install LocalTour in Chrome",style:{background:available?T.gold:T.terra,color:"white",padding:"15px 34px",borderRadius:T.rp,fontSize:16,fontWeight:700,fontFamily:T.fb,border:"none",cursor:"pointer",boxShadow:"0 4px 24px rgba(220,38,38,0.18)"}},"Install App"),hint?React.createElement("div",{style:{fontFamily:T.fb,fontSize:12,color:T.dim,maxWidth:460,lineHeight:1.5,textAlign:"center"}},hint):null)}

function Hero(){const[mx,setMx]=useState(0);const[my,setMy]=useState(0);return(
<section onMouseMove={e=>{setMx((e.clientX/window.innerWidth-0.5)*15);setMy((e.clientY/window.innerHeight-0.5)*15)}} style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",padding:"100px clamp(24px,6vw,80px) 60px"}}>
  <div style={{position:"absolute",top:"8%",left:"12%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle, "+T.glow+" 0%, transparent 70%)",filter:"blur(80px)",opacity:0.5,transform:"translate("+mx*0.5+"px, "+my*0.5+"px)",transition:"transform 0.6s ease-out",pointerEvents:"none"}}/>
  <div style={{position:"relative",textAlign:"center",maxWidth:860,zIndex:1}}>
    <div style={{display:"inline-flex",alignItems:"center",gap:8,background:T.borderAccent,border:"1px solid "+T.border,borderRadius:T.rp,padding:"8px 20px",marginBottom:28,animation:"fadeUp 0.7s ease 0.1s both"}}><span style={{width:6,height:6,borderRadius:"50%",background:T.terra,boxShadow:"0 0 8px "+T.terra,animation:"pulse 2s ease-in-out infinite"}}/><span style={{fontFamily:T.fb,fontSize:13,fontWeight:600,color:T.terra,letterSpacing:"0.06em",textTransform:"uppercase"}}>City Decision Engine</span></div>
    <h1 style={{fontFamily:T.fd,fontWeight:800,fontSize:"clamp(40px,7vw,76px)",lineHeight:1.08,color:T.text,animation:"fadeUp 0.8s ease 0.2s both"}}>Every city has a <em style={{color:T.terra}}>story</em><br/>We help you <em style={{color:T.gold}}>live it</em></h1>
    <p style={{fontFamily:T.fb,fontSize:"clamp(16px,2vw,19px)",color:T.fog,lineHeight:1.7,maxWidth:560,margin:"24px auto 0",animation:"fadeUp 0.8s ease 0.35s both"}}>Real local intelligence. Not a blog. Not a directory. A decision engine for every city worth visiting.</p>
    <div style={{display:"flex",gap:14,justifyContent:"center",marginTop:40,animation:"fadeUp 0.8s ease 0.5s both",flexWrap:"wrap"}}>
      <a href="#cities" style={{background:T.terra,color:"white",padding:"15px 34px",borderRadius:T.rp,fontSize:16,fontWeight:700,textDecoration:"none",fontFamily:T.fb,boxShadow:"0 4px 24px "+T.glow}}>Explore Cities &darr;</a>
      <InstallButton/><a href="#features" style={{background:"transparent",color:T.text,padding:"15px 34px",borderRadius:T.rp,fontSize:16,fontWeight:600,textDecoration:"none",fontFamily:T.fb,border:"1px solid "+T.border}}>See Features</a>
    </div>
  </div>
</section>)}

function FeaturesSection(){const[active,setActive]=useState(0);useEffect(()=>{const iv=setInterval(()=>setActive(n=>(n+1)%FEATURES.length),4500);return()=>clearInterval(iv)},[]);const f=FEATURES[active];return(
<section id="features" style={{padding:"80px clamp(24px,6vw,80px)"}}>
  <Reveal><div style={{textAlign:"center",marginBottom:56}}><span style={{fontFamily:T.fb,fontSize:13,fontWeight:700,color:T.terra,letterSpacing:"0.12em",textTransform:"uppercase"}}>Platform</span><h2 style={{fontFamily:T.fd,fontSize:"clamp(28px,4.5vw,48px)",fontWeight:700,color:T.text,marginTop:10}}>Not just a guide. <em style={{color:T.terra}}>A city intelligence platform.</em></h2></div></Reveal>
  <div className="feat-grid" style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1.3fr",gap:48,alignItems:"center"}}>
    <div style={{display:"flex",flexDirection:"column",gap:2}}>
      {FEATURES.map((feat,i)=>{const on=i===active;return(<Reveal key={feat.id} delay={i*0.04}><button onClick={()=>setActive(i)} style={{width:"100%",textAlign:"left",cursor:"pointer",background:on?T.borderAccent:"transparent",border:"none",borderRadius:14,padding:"16px 20px",borderLeft:"3px solid "+(on?T.terra:"transparent"),transition:"all 0.3s",position:"relative",overflow:"hidden"}}>{on&&<div style={{position:"absolute",bottom:0,left:3,height:3,background:T.terra,borderRadius:2,animation:"progressBar 4.5s linear forwards"}}/>}<div style={{display:"flex",alignItems:"center",gap:14}}><span style={{fontSize:24,filter:on?"none":"grayscale(0.6) opacity(0.6)",transition:"filter 0.3s"}}>{feat.icon}</span><div><h3 style={{fontFamily:T.fd,fontSize:16,fontWeight:700,color:on?T.text:T.fog,transition:"color 0.3s"}}>{feat.title}</h3><p style={{fontFamily:T.fb,fontSize:13,color:T.dim,lineHeight:1.5,marginTop:3,maxHeight:on?80:0,overflow:"hidden",opacity:on?1:0,transition:"all 0.4s"}}>{feat.desc}</p></div></div></button></Reveal>)})}
    </div>
    <Reveal dir="left">
      <div style={{aspectRatio:"16/10",borderRadius:T.rl,background:T.card,border:"1px solid "+T.border,position:"relative",overflow:"hidden",boxShadow:"0 12px 40px rgba(0,0,0,0.08)"}}>
        {f.video&&<AutoVideo src={f.video} key={f.id} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.55}}/>}
        {!f.video&&<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg, "+T.surface+", "+T.card+")"}}/>}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, "+T.card+"dd 0%, transparent 50%)"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"32px 36px",zIndex:1}}>
          <div style={{fontSize:48,marginBottom:12}}>{f.icon}</div>
          <h3 style={{fontFamily:T.fd,fontSize:24,fontWeight:700,color:T.text}}>{f.title}</h3>
          <p style={{fontFamily:T.fb,fontSize:14,color:T.fog,lineHeight:1.6,marginTop:6,maxWidth:340}}>{f.desc}</p>
        </div>
      </div>
    </Reveal>
  </div>
</section>)}

function CityCard({city,index}: any){const[h,setH]=useState(false);return(
<Reveal delay={index*0.05}>
  <a href={city.link} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:"block",textDecoration:"none",background:T.card,borderRadius:T.rl,overflow:"hidden",border:"1px solid "+(h?T.terra+"33":T.border),transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)",transform:h?"translateY(-4px)":"",boxShadow:h?"0 16px 48px rgba(0,0,0,0.1)":"0 2px 12px rgba(0,0,0,0.04)"}}>
    <div style={{height:180,position:"relative",overflow:"hidden"}}>
      <img src={"/cities/"+city.slug+"/images/"+city.hero} alt={city.name} style={{width:"100%",height:"100%",objectFit:"cover",transform:h?"scale(1.06)":"scale(1)",transition:"transform 0.6s cubic-bezier(0.16,1,0.3,1)"}} loading="lazy" onError={function(e: any){e.target.style.display="none"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)"}}/>
      <div style={{position:"absolute",top:12,right:12,display:"flex",alignItems:"center",gap:5,background:"rgba(220,38,38,0.85)",borderRadius:T.rp,padding:"4px 10px"}}><span style={{width:4,height:4,borderRadius:"50%",background:"white",boxShadow:"0 0 4px white"}}/><span style={{fontFamily:T.fb,fontSize:10,fontWeight:700,color:"white"}}>LIVE</span></div>
      <div style={{position:"absolute",bottom:14,left:18}}><h3 style={{fontFamily:T.fd,fontSize:22,fontWeight:700,color:"white",textShadow:"0 2px 8px rgba(0,0,0,0.4)"}}>{city.name}</h3></div>
    </div>
    <div style={{padding:"16px 20px 20px"}}>
      <p style={{fontFamily:T.fd,fontSize:14,fontStyle:"italic",color:T.terra}}>"{city.tagline}"</p>
      <p style={{fontFamily:T.fb,fontSize:13,color:T.dim,marginTop:6}}>{city.vibe}</p>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12}}><span style={{fontFamily:T.fb,fontSize:13,fontWeight:600,color:T.terra}}>Explore &rarr;</span><span style={{fontFamily:T.fb,fontSize:12,color:T.dim}}>{city.state}</span></div>
    </div>
  </a>
</Reveal>)}

function PipelineSection(){var steps=[{num:"01",title:"Generate",desc:"AI creates cinematic city footage via Sora 2 Pro and Veo 3.1",icon:"\u{1F3AC}"},{num:"02",title:"Extract",desc:"FFmpeg splits video into frame sequences for scroll playback",icon:"\u{1F39E}️"},{num:"03",title:"Integrate",desc:"ScrollTimeline maps scroll position to frame index",icon:"⚡"},{num:"04",title:"Experience",desc:"You scroll, the city comes alive at your pace",icon:"✨"}];return(
<section id="pipeline" style={{padding:"80px clamp(24px,6vw,80px)"}}>
  <Reveal><div style={{textAlign:"center",marginBottom:48}}><span style={{fontFamily:T.fb,fontSize:13,fontWeight:700,color:T.terra,letterSpacing:"0.12em",textTransform:"uppercase"}}>How It Works</span><h2 style={{fontFamily:T.fd,fontSize:"clamp(26px,4vw,40px)",fontWeight:700,color:T.text,marginTop:10}}>AI video meets <em style={{color:T.terra}}>scroll-driven storytelling</em></h2></div></Reveal>
  <div className="pipe-grid" style={{maxWidth:1000,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
    {steps.map(function(s,i){return(<Reveal key={s.num} delay={i*0.08}><div style={{background:T.card,borderRadius:T.r,padding:"28px 20px",border:"1px solid "+T.border,textAlign:"center"}}><span style={{fontSize:32,display:"block",marginBottom:12}}>{s.icon}</span><span style={{fontFamily:T.fb,fontSize:11,fontWeight:800,color:T.terra,letterSpacing:"0.08em"}}>{s.num}</span><h3 style={{fontFamily:T.fd,fontSize:18,fontWeight:700,color:T.text,marginTop:6,marginBottom:6}}>{s.title}</h3><p style={{fontFamily:T.fb,fontSize:12,color:T.dim,lineHeight:1.5}}>{s.desc}</p></div></Reveal>)})}
  </div>
</section>)}

function MissionSection(){return(
<section id="mission" style={{padding:"80px clamp(24px,6vw,80px)"}}>
  <div style={{maxWidth:800,margin:"0 auto",textAlign:"center"}}>
    <Reveal><span style={{fontFamily:T.fb,fontSize:13,fontWeight:700,color:T.terra,letterSpacing:"0.12em",textTransform:"uppercase"}}>Our Mission</span></Reveal>
    <Reveal delay={0.08}><h2 style={{fontFamily:T.fd,fontSize:"clamp(28px,4.5vw,48px)",fontWeight:700,color:T.text,lineHeight:1.12,marginTop:16,marginBottom:24}}>Make every trip <em style={{color:T.terra}}>safer</em>, <em style={{color:T.gold}}>smarter</em>, and <em style={{color:T.terraLight}}>unforgettable</em></h2></Reveal>
    <Reveal delay={0.16}><p style={{fontFamily:T.fb,fontSize:17,color:T.fog,lineHeight:1.8,maxWidth:600,margin:"0 auto"}}>Local knowledge shouldn't be locked behind paywalls or drowned in ads. AI-generated cinematics bring every city to life before you even arrive.</p></Reveal>
    <Reveal delay={0.24}><div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginTop:48}}>
      {[{num:String(STATS.cities),label:"Cities Live",sub:"More launching monthly"},{num:STATS.businesses.toLocaleString(),label:"Curated Places",sub:"Verified by real humans"},{num:"0",label:"Ads Served",sub:"Revenue from value"}].map(function(stat){return(
        <div key={stat.label} style={{background:T.card,borderRadius:T.r,padding:"28px 20px",border:"1px solid "+T.border}}>
          <div style={{fontFamily:T.fd,fontSize:36,fontWeight:800,color:T.terra}}>{stat.num}</div>
          <div style={{fontFamily:T.fb,fontSize:14,fontWeight:600,color:T.text,marginTop:6}}>{stat.label}</div>
          <div style={{fontFamily:T.fb,fontSize:12,color:T.dim,marginTop:4}}>{stat.sub}</div>
        </div>)})}
    </div></Reveal>
  </div>
</section>)}

function SenseFullscreen({sense,index,total,onHalfway}: any){
  var vref=useRef<any>(null);
  var sref=useRef<any>(null);
  var firedRef=useRef(false);
  var inViewRef=useRef(false);

  useEffect(function(){
    var v=vref.current;var s=sref.current;
    if(!v||!s)return;
    var onTime=function(){
      if(firedRef.current)return;
      if(!v.duration||isNaN(v.duration))return;
      if(!inViewRef.current)return;
      if(v.currentTime>=v.duration*0.5){
        firedRef.current=true;
        if(onHalfway)onHalfway(index,s);
      }
    };
    var obs=new IntersectionObserver(function(entries){
      var e: any=entries[0];
      if(e.isIntersecting&&e.intersectionRatio>=0.55){
        inViewRef.current=true;
        firedRef.current=false;
        try{v.currentTime=0}catch(err){}
        var p=v.play();
        if(p&&p.catch)p.catch(function(){});
      }else{
        inViewRef.current=false;
        v.pause();
      }
    },{threshold:[0,0.25,0.55,0.8,1]});
    obs.observe(s);
    v.addEventListener("timeupdate",onTime);
    return function(){obs.disconnect();v.removeEventListener("timeupdate",onTime)};
  },[index,onHalfway]);

  var nextLabel=index<total-1?"Next · "+(parseInt(sense.n)+1<10?"0"+(parseInt(sense.n)+1):parseInt(sense.n)+1):null;
  var lift="0 2px 10px rgba(0,0,0,0.75), 0 6px 28px rgba(0,0,0,0.55), 0 0 60px rgba(0,0,0,0.25)";

  return React.createElement("section",{ref:sref,id:"sense-"+sense.n,className:"sense-full",style:{minHeight:"100vh",position:"relative",overflow:"hidden",display:"flex",alignItems:"flex-end",padding:"120px clamp(28px,6vw,80px) 80px",background:"#0a0a0a",scrollSnapAlign:"start"}},
    React.createElement("div",{style:{position:"absolute",inset:0,background:"linear-gradient(135deg, "+sense.accent+"44 0%, #0a0a0a 65%)",zIndex:0}}),
    sense.video?React.createElement("video",{ref:vref,src:sense.video,muted:true,loop:true,playsInline:true,preload:"auto","aria-hidden":"true",style:{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:1}}):null,
    React.createElement("div",{style:{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0.55) 100%)",zIndex:2}}),
    React.createElement("div",{style:{position:"absolute",left:0,right:0,bottom:0,height:"70%",background:"radial-gradient(ellipse at 30% 85%, rgba(0,0,0,0.55) 0%, transparent 60%)",zIndex:2,pointerEvents:"none"}}),
    React.createElement("div",{style:{position:"relative",zIndex:3,maxWidth:1120,width:"100%",margin:"0 auto"}},
      React.createElement(Reveal,null,React.createElement("div",{style:{display:"flex",alignItems:"center",gap:16,marginBottom:20,flexWrap:"wrap",textShadow:lift}},
        React.createElement("span",{style:{fontFamily:T.fd,fontSize:14,fontWeight:800,color:sense.accent,letterSpacing:"0.2em"}},sense.n+" / 06"),
        React.createElement("div",{style:{width:40,height:1,background:sense.accent,opacity:0.7,boxShadow:"0 0 12px "+sense.accent}}),
        React.createElement("span",{style:{fontFamily:T.fb,fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.95)",letterSpacing:"0.18em",textTransform:"uppercase"}},"Sense of "+sense.name),
        React.createElement("span",{style:{fontSize:22,marginLeft:4}},sense.icon)
      )),
      React.createElement(Reveal,{delay:0.08},React.createElement("h3",{style:{fontFamily:T.fd,fontSize:"clamp(68px,13vw,176px)",fontWeight:700,fontStyle:"italic",color:"#fff",lineHeight:0.95,marginBottom:26,letterSpacing:"-0.02em",textShadow:"0 4px 30px rgba(0,0,0,0.7), 0 12px 60px rgba(0,0,0,0.5)"}},sense.name+".")),
      React.createElement(Reveal,{delay:0.14},React.createElement("p",{style:{fontFamily:T.fd,fontSize:"clamp(22px,3vw,34px)",fontStyle:"italic",color:sense.accent,lineHeight:1.25,marginBottom:20,fontWeight:500,maxWidth:760,textShadow:"0 2px 18px rgba(0,0,0,0.75), 0 0 40px rgba(0,0,0,0.45)"}},"“"+sense.hook+"”")),
      React.createElement(Reveal,{delay:0.2},React.createElement("p",{style:{fontFamily:T.fb,fontSize:"clamp(15px,1.5vw,17px)",color:"rgba(255,255,255,0.96)",lineHeight:1.75,maxWidth:640,marginBottom:32,textShadow:lift}},sense.body)),
      React.createElement(Reveal,{delay:0.26},React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:10,position:"relative",zIndex:4}},
        sense.props.map(function(p: any){return React.createElement("a",{key:p.label,href:p.url,target:p.url.indexOf("http")===0?"_blank":null,rel:"noopener",style:{display:"inline-flex",alignItems:"center",gap:6,fontFamily:"ui-monospace,SFMono-Regular,Menlo,monospace",fontSize:12,fontWeight:600,letterSpacing:"0.02em",color:"#fff",background:sense.accent+"44",padding:"11px 17px",borderRadius:999,textDecoration:"none",border:"1px solid "+sense.accent+"cc",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",boxShadow:"0 4px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",transition:"all 0.25s",cursor:"pointer"},onMouseEnter:function(e){e.currentTarget.style.background=sense.accent;e.currentTarget.style.borderColor=sense.accent;e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 28px "+sense.accent+"66, inset 0 1px 0 rgba(255,255,255,0.2)"},onMouseLeave:function(e){e.currentTarget.style.background=sense.accent+"44";e.currentTarget.style.borderColor=sense.accent+"cc";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)"}},p.label,React.createElement("span",{style:{opacity:0.85}},"↗"))})
      ))
    ),
    nextLabel?React.createElement("div",{style:{position:"absolute",bottom:28,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:6,color:"rgba(255,255,255,0.7)",fontFamily:T.fb,fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",pointerEvents:"none",zIndex:3,textShadow:"0 2px 8px rgba(0,0,0,0.6)"}},React.createElement("span",null,nextLabel),React.createElement("span",{style:{fontSize:18,animation:"pulse 2.5s ease-in-out infinite"}},"↓")):null
  )
}

function SensesIntro(){return(
<section id="senses" style={{padding:"100px clamp(24px,6vw,80px) 80px",position:"relative",overflow:"hidden"}}>
  <div style={{position:"absolute",top:"5%",left:"-8%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle, "+T.glow+" 0%, transparent 70%)",filter:"blur(100px)",pointerEvents:"none"}}/>
  <div style={{position:"absolute",bottom:"10%",right:"-5%",width:420,height:420,borderRadius:"50%",background:"radial-gradient(circle, rgba(212,168,83,0.10) 0%, transparent 70%)",filter:"blur(90px)",pointerEvents:"none"}}/>
  <div style={{maxWidth:900,margin:"0 auto",position:"relative",textAlign:"center"}}>
    <Reveal><span style={{fontFamily:T.fb,fontSize:13,fontWeight:700,color:T.terra,letterSpacing:"0.14em",textTransform:"uppercase"}}>The Story</span></Reveal>
    <Reveal delay={0.06}><h2 style={{fontFamily:T.fd,fontSize:"clamp(36px,6vw,72px)",fontWeight:700,color:T.text,lineHeight:1.02,marginTop:14,marginBottom:20}}>Six senses of a <em style={{color:T.terra}}>local.</em></h2></Reveal>
    <Reveal delay={0.12}><p style={{fontFamily:T.fd,fontSize:"clamp(20px,2.4vw,26px)",fontStyle:"italic",color:T.gold,lineHeight:1.35,maxWidth:720,margin:"0 auto 28px"}}>You don’t need a plane ticket to be a tourist.</p></Reveal>
    <Reveal delay={0.18}><div style={{maxWidth:680,margin:"0 auto"}}>
      <p style={{fontFamily:T.fb,fontSize:16,color:T.fog,lineHeight:1.75}}>Being a local has a tax: familiarity. It’s the thing that makes you stop noticing the block you walk every day. Tourism, at its best, is a set of eyes on loan — and you don’t have to fly anywhere to borrow them.</p>
      <p style={{fontFamily:T.fb,fontSize:16,color:T.fog,lineHeight:1.75,marginTop:14}}>The SH@W Labs portfolio is built around that loan. Six senses a visitor brings to a new city. Seven properties that give those senses back to you in <em style={{color:T.text}}>your own</em>. Peoria or Palma de Mallorca, the work is the same: find what’s worth finding, and then actually go.</p>
    </div></Reveal>
    <Reveal delay={0.24}><div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap",marginTop:40}}>
      {SENSES.map(function(s: any){return React.createElement("a",{key:s.n,href:"#sense-"+s.n,style:{display:"inline-flex",alignItems:"center",gap:8,fontFamily:T.fb,fontSize:12,fontWeight:600,color:T.fog,textDecoration:"none",padding:"8px 14px",borderRadius:T.rp,border:"1px solid "+T.border,background:T.card,transition:"all 0.2s"},onMouseEnter:function(e){e.currentTarget.style.borderColor=s.accent+"80";e.currentTarget.style.color=s.accent},onMouseLeave:function(e){e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.fog}},React.createElement("span",{style:{fontSize:14}},s.icon),s.name)})}
    </div></Reveal>
    <Reveal delay={0.32}><div style={{marginTop:56,display:"flex",flexDirection:"column",alignItems:"center",gap:8,color:T.dim,fontFamily:T.fb,fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase"}}>
      <span>Begin</span><span style={{fontSize:20,animation:"pulse 2.5s ease-in-out infinite"}}>↓</span>
    </div></Reveal>
  </div>
</section>)}

function SensesSection(){
  var lastAutoRef=useRef(0);
  var userInteractedRef=useRef(0);
  useEffect(function(){
    var mark=function(){userInteractedRef.current=Date.now()};
    window.addEventListener("wheel",mark,{passive:true});
    window.addEventListener("touchstart",mark,{passive:true});
    window.addEventListener("keydown",mark);
    return function(){
      window.removeEventListener("wheel",mark);
      window.removeEventListener("touchstart",mark);
      window.removeEventListener("keydown",mark);
    };
  },[]);
  var onHalfway=useCallback(function(idx: any,sectionEl: any){
    if(idx>=SENSES.length-1)return;
    var now=Date.now();
    if(now-lastAutoRef.current<1500)return;
    if(now-userInteractedRef.current<1200)return;
    var rect=sectionEl.getBoundingClientRect();
    var vh=window.innerHeight||document.documentElement.clientHeight;
    var visible=Math.min(rect.bottom,vh)-Math.max(rect.top,0);
    if(visible/vh<0.5)return;
    var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var next=document.getElementById("sense-"+SENSES[idx+1].n);
    if(!next)return;
    lastAutoRef.current=now;
    if(reduce){next.scrollIntoView({block:"start"})}
    else{next.scrollIntoView({behavior:"smooth",block:"start"})}
  },[]);
  return React.createElement("div",null,
    React.createElement(SensesIntro,null),
    SENSES.map(function(s: any,i: number){return React.createElement(SenseFullscreen,{key:s.n,sense:s,index:i,total:SENSES.length,onHalfway:onHalfway})})
  )
}

function AffiliateSection(){var cats=[
  {key:"flights",icon:"✈️",label:"Flights",blurb:"Point A to point B, worth every mile.",partners:AFFILIATES.flights,accent:T.terra},
  {key:"hotels",icon:"\u{1F3E8}",label:"Hotels",blurb:"Where the day comes to sit down.",partners:AFFILIATES.hotels,accent:T.gold},
  {key:"rides",icon:"\u{1F698}",label:"Rides",blurb:"From curb to key, the ground game.",partners:AFFILIATES.rides,accent:"#475569"},
];return(
<section id="book" style={{padding:"80px clamp(24px,6vw,80px)",background:T.surface,borderTop:"1px solid "+T.border,borderBottom:"1px solid "+T.border}}>
  <div style={{maxWidth:1180,margin:"0 auto"}}>
    <Reveal><div style={{textAlign:"center",marginBottom:14}}>
      <span style={{fontFamily:T.fb,fontSize:13,fontWeight:700,color:T.terra,letterSpacing:"0.14em",textTransform:"uppercase"}}>Go There</span>
    </div></Reveal>
    <Reveal delay={0.06}><h2 style={{fontFamily:T.fd,fontSize:"clamp(30px,4.5vw,48px)",fontWeight:700,color:T.text,lineHeight:1.1,textAlign:"center",marginBottom:14}}>Book the <em style={{color:T.terra}}>trip.</em></h2></Reveal>
    <Reveal delay={0.12}><p style={{fontFamily:T.fb,fontSize:16,color:T.fog,lineHeight:1.7,textAlign:"center",maxWidth:580,margin:"0 auto 48px"}}>Partners we trust for the moving parts. A small commission comes back to the Labs when you book through these links — no change in price for you.</p></Reveal>
    <div className="aff-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
      {cats.map(function(c,ci){return React.createElement(Reveal,{key:c.key,delay:0.1+ci*0.06},
        React.createElement("div",{style:{background:T.card,borderRadius:T.rl,padding:"30px 26px 26px",border:"1px solid "+T.border,height:"100%",position:"relative",overflow:"hidden"}},
          React.createElement("div",{style:{position:"absolute",top:0,left:0,right:0,height:3,background:c.accent,opacity:0.6}}),
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:10}},
            React.createElement("div",{style:{width:42,height:42,borderRadius:12,background:c.accent+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}},c.icon),
            React.createElement("h3",{style:{fontFamily:T.fd,fontSize:22,fontWeight:700,color:T.text}},c.label)
          ),
          React.createElement("p",{style:{fontFamily:T.fd,fontSize:14,fontStyle:"italic",color:c.accent,marginBottom:20,lineHeight:1.4}},c.blurb),
          React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10}},
            c.partners.map(function(p){return React.createElement("a",{key:p.name,href:p.url,target:"_blank",rel:"noopener sponsored",style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderRadius:14,background:T.surface,border:"1px solid "+T.border,textDecoration:"none",transition:"all 0.2s"},onMouseEnter:function(e){e.currentTarget.style.borderColor=c.accent+"66";e.currentTarget.style.background=T.cardHover||T.surface},onMouseLeave:function(e){e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.surface}},
              React.createElement("div",null,
                React.createElement("div",{style:{fontFamily:T.fb,fontSize:14,fontWeight:700,color:T.text}},p.name),
                React.createElement("div",{style:{fontFamily:T.fb,fontSize:11,color:T.dim,marginTop:2}},p.blurb)
              ),
              React.createElement("span",{style:{fontFamily:T.fb,fontSize:12,fontWeight:700,color:c.accent,letterSpacing:"0.05em"}},"BOOK ↗")
            )})
          )
        )
      )})}
    </div>
    <Reveal delay={0.3}><p style={{fontFamily:T.fb,fontSize:11,color:T.dim,textAlign:"center",marginTop:32,letterSpacing:"0.02em",opacity:0.8}}>Affiliate disclosure: links on this page may earn SH@W Labs a commission on qualifying bookings. Pricing and availability are set by the partners.</p></Reveal>
  </div>
</section>)}

function AppSetupSection(){return(
<section id="app-setup" style={{padding:"40px clamp(24px,6vw,80px) 80px"}}>
  <div style={{maxWidth:960,margin:"0 auto",background:T.card,border:"1px solid "+T.border,borderRadius:T.rl,padding:"32px clamp(22px,4vw,40px)",boxShadow:"0 10px 30px rgba(0,0,0,0.05)"}}>
    <Reveal><span style={{fontFamily:T.fb,fontSize:13,fontWeight:700,color:T.terra,letterSpacing:"0.12em",textTransform:"uppercase"}}>App</span></Reveal>
    <Reveal delay={0.05}><h2 style={{fontFamily:T.fd,fontSize:"clamp(26px,4vw,40px)",fontWeight:700,color:T.text,marginTop:10}}>Install <em style={{color:T.terra}}>localtour.directory</em> like an app</h2></Reveal>
    <Reveal delay={0.1}><p style={{fontFamily:T.fb,fontSize:16,color:T.fog,lineHeight:1.7,marginTop:14,maxWidth:720}}>Deploy this page with the manifest and service worker files included, then open localtour.directory in Google Chrome over HTTPS. The Install App button is wired for Chrome's app-install flow.</p></Reveal>
    <Reveal delay={0.14}><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14,marginTop:24}}>
      {[{title:"1. Upload files",desc:"Deploy index.html, manifest.webmanifest, service-worker.js, and the two icon PNGs at your site root."},{title:"2. Use HTTPS",desc:"Install prompts only work on secure origins such as Netlify, Vercel, Cloudflare Pages, or your live domain over HTTPS."},{title:"3. Open on mobile or desktop",desc:"Google Chrome gives the closest native app flow. After install, it launches in its own app-style window."}].map(function(item){return React.createElement("div",{key:item.title,style:{background:T.surface,borderRadius:T.r,padding:"18px 18px",border:"1px solid "+T.border}},React.createElement("h3",{style:{fontFamily:T.fd,fontSize:18,fontWeight:700,color:T.text}},item.title),React.createElement("p",{style:{fontFamily:T.fb,fontSize:13,color:T.dim,lineHeight:1.6,marginTop:8}},item.desc))})}
    </div></Reveal>
  </div>
</section>)}

function Footer(){var em=useState("");var email=em[0];var setEmail=em[1];return(
<footer style={{background:T.surface,padding:"64px clamp(24px,6vw,80px) 32px",borderTop:"1px solid "+T.border}}>
  <div style={{maxWidth:1100,margin:"0 auto"}}>
    <div className="foot-grid" style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1.5fr",gap:40,paddingBottom:40,borderBottom:"1px solid "+T.border}}>
      <div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><div style={{width:28,height:28,borderRadius:8,background:T.terra,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"white"}}>LT</div><span style={{fontFamily:T.fd,fontSize:18,fontWeight:700,color:T.text}}>Local<span style={{color:T.terra}}>Tour</span></span></div><p style={{fontFamily:T.fb,fontSize:13,color:T.dim,lineHeight:1.6,maxWidth:240}}>A SH@W Labs product. Config-driven city intelligence.</p></div>
      <div><h4 style={{fontFamily:T.fb,fontSize:11,fontWeight:700,color:T.fog,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14}}>Platform</h4>{[{l:"Explore Cities",h:"/#cities"},{l:"AI Concierge",h:"/#features"},{l:"Trip Planner",h:"/#features"},{l:"Community Wall",h:"/#wall"}].map(function(item){return React.createElement("a",{key:item.l,href:item.h,style:{display:"block",fontFamily:T.fb,fontSize:13,color:T.dim,textDecoration:"none",marginBottom:8}},item.l)})}</div>
      <div><h4 style={{fontFamily:T.fb,fontSize:11,fontWeight:700,color:T.fog,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14}}>Company</h4>{[{l:"About SH@W Labs",h:"/company/about.html"},{l:"Six Senses",h:"#senses"},{l:"Book the Trip",h:"#book"},{l:"Partner With Us",h:"/company/partners.html"},{l:"Privacy",h:"/company/privacy.html"},{l:"Terms",h:"/company/terms.html"}].map(function(item){return React.createElement("a",{key:item.l,href:item.h,style:{display:"block",fontFamily:T.fb,fontSize:13,color:T.dim,textDecoration:"none",marginBottom:8}},item.l)})}</div>
      <div><h4 style={{fontFamily:T.fb,fontSize:11,fontWeight:700,color:T.fog,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14}}>Stay Updated</h4><p style={{fontFamily:T.fb,fontSize:13,color:T.dim,lineHeight:1.5,marginBottom:12}}>New cities. New cinematics.</p><div style={{display:"flex",gap:8}}><input type="email" placeholder="your@email.com" value={email} onChange={function(e){setEmail(e.target.value)}} style={{flex:1,background:T.card,border:"1px solid "+T.border,borderRadius:10,padding:"10px 14px",fontFamily:T.fb,fontSize:13,color:T.text,outline:"none"}}/><button style={{background:T.terra,color:"white",border:"none",borderRadius:10,padding:"10px 18px",fontFamily:T.fb,fontSize:13,fontWeight:700,cursor:"pointer"}}>&rarr;</button></div></div>
    </div>
    <div style={{paddingTop:20}}><span style={{fontFamily:T.fb,fontSize:12,color:T.dim,opacity:0.5}}>&copy; 2026 LocalTour &middot; SH@W Labs &middot; localtour@shaw-labs.com</span></div>
  </div>
</footer>)}

// Combined travel-photo wall — interleaves a few photos from every city; each tile
// links through to that city's wall page (/cities/<slug>/wall).
function WallSection(){
  const walls: any[] = (STATS as any).walls || [];
  const rounds = walls.reduce((m: number, w: any)=>Math.max(m, w.photos.length), 0);
  const tiles: any[] = [];
  for(let r=0;r<rounds;r++) for(const w of walls) if(w.photos[r]) tiles.push({src:w.photos[r],slug:w.slug,name:w.name});
  return (
    <section id="wall" style={{padding:"80px clamp(24px,6vw,80px)",background:T.surface}}>
      <Reveal>
        <div style={{textAlign:"center",marginBottom:40}}>
          <span style={{fontFamily:T.fb,fontSize:13,fontWeight:700,color:T.terra,letterSpacing:"0.12em",textTransform:"uppercase"}}>The Wall</span>
          <h2 style={{fontFamily:T.fd,fontSize:"clamp(28px,4.5vw,48px)",fontWeight:700,color:T.text,marginTop:10}}>Every city, <em style={{color:T.terra}}>in the wild.</em></h2>
          <p style={{fontFamily:T.fb,fontSize:16,color:T.fog,maxWidth:560,margin:"10px auto 0"}}>Travel photos from across the map. Tap any shot to open that city&rsquo;s wall.</p>
        </div>
      </Reveal>
      <div style={{maxWidth:1200,margin:"0 auto",columns:"4 220px",columnGap:12}}>
        {tiles.map((t,i)=>(
          <a key={i} href={`/cities/${t.slug}/wall`} title={`${t.name} — open the wall`} style={{breakInside:"avoid",display:"block",marginBottom:12,position:"relative",borderRadius:T.r,overflow:"hidden",textDecoration:"none"}}>
            <img src={t.src} alt={t.name} loading="lazy" style={{width:"100%",display:"block"}} onError={(e:any)=>{e.currentTarget.parentElement.style.display="none"}}/>
            <span style={{position:"absolute",left:10,bottom:10,fontFamily:T.fb,fontSize:12,fontWeight:700,color:"#fff",textShadow:"0 1px 6px rgba(0,0,0,.6)"}}>{t.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function Landing(){
  var sv=useState(0);var scrollY=sv[0];var setScrollY=sv[1];
  var dv=useState(false);var isDark=dv[0];var setIsDark=dv[1];
  T=isDark?DARK:LIGHT;
  useEffect(function(){if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("/service-worker.js").catch(function(){})})}},[]);
  useEffect(function(){document.body.style.background=T.bg;document.body.style.color=T.text;return function(){document.body.style.background="";document.body.style.color=""}},[isDark]);
  useEffect(function(){var t=false;var s=function(){if(!t){requestAnimationFrame(function(){setScrollY(window.scrollY);t=false});t=true}};window.addEventListener("scroll",s,{passive:true});return function(){window.removeEventListener("scroll",s)}},[]);
  return(
React.createElement("div",{className:"lt-landing",style:{background:T.bg,fontFamily:T.fb,transition:"background 0.4s, color 0.4s"}},
  React.createElement("nav",{style:{position:"fixed",top:0,left:0,right:0,zIndex:100,background:scrollY>60?(isDark?"rgba(12,27,42,0.92)":"rgba(250,248,244,0.92)"):"transparent",backdropFilter:scrollY>60?"blur(20px)":"none",borderBottom:"1px solid "+(scrollY>60?T.border:"transparent"),padding:"0 clamp(20px,4vw,48px)",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all 0.3s"}},
    React.createElement("a",{href:"/",style:{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}},
      React.createElement("div",{style:{width:30,height:30,borderRadius:9,background:T.terra,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"white"}},"LT"),
      React.createElement("span",{style:{fontFamily:T.fd,fontSize:19,fontWeight:700,color:T.text}},React.createElement("span",null,"Local"),React.createElement("span",{style:{color:T.terra}},"Tour"))
    ),
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:16}},
      React.createElement("button",{onClick:function(){setIsDark(!isDark)},style:{background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.03)",border:"1px solid "+T.border,borderRadius:T.rp,padding:"6px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:13,color:T.fog,fontFamily:T.fb}},isDark?"☀️ Light":"\u{1F319} Dark"),
      React.createElement("a",{href:"#wall",style:{color:T.fog,fontSize:13,fontWeight:500,textDecoration:"none",fontFamily:T.fb}},"The Wall"),React.createElement("a",{href:"#senses",style:{color:T.fog,fontSize:13,fontWeight:500,textDecoration:"none",fontFamily:T.fb}},"Senses"),React.createElement("a",{href:"#cities",style:{background:T.terra,color:"white",padding:"8px 20px",borderRadius:T.rp,fontSize:13,fontWeight:700,textDecoration:"none",fontFamily:T.fb}},"Explore")
    )
  ),
  React.createElement(Hero,null),
  React.createElement(SensesSection,null),
  React.createElement("section",{id:"cities",style:{padding:"80px clamp(24px,6vw,80px)"}},
    React.createElement(Reveal,null,React.createElement("div",{style:{textAlign:"center",marginBottom:48}},
      React.createElement("span",{style:{fontFamily:T.fb,fontSize:13,fontWeight:700,color:T.terra,letterSpacing:"0.12em",textTransform:"uppercase"}},"Arrive"),
      React.createElement("h2",{style:{fontFamily:T.fd,fontSize:"clamp(28px,4.5vw,48px)",fontWeight:700,color:T.text,marginTop:10}},"Now — choose a ",React.createElement("em",{style:{color:T.terra}},"city.")),
      React.createElement("p",{style:{fontFamily:T.fb,fontSize:16,color:T.fog,maxWidth:520,margin:"10px auto 0"}},"You’ve borrowed the eyes. Point them somewhere. Every city is a full decision engine — directory, concierge, planner, and more.")
    )),
    React.createElement("div",{className:"city-grid",style:{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:20}},
      CITIES.map(function(city,i){return React.createElement(CityCard,{key:city.slug,city:city,index:i})}),
      COMING_SOON.map(function(name,i){return React.createElement(Reveal,{key:name,delay:0.3+i*0.03},React.createElement("div",{style:{background:T.card,borderRadius:T.rl,padding:28,border:"1px dashed "+T.border,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:6,minHeight:120,opacity:0.4}},
        React.createElement("span",{style:{fontSize:20,filter:"grayscale(1) opacity(0.5)"}},"📍"),
        React.createElement("span",{style:{fontFamily:T.fd,fontSize:15,fontWeight:700,color:T.dim}},name),
        React.createElement("span",{style:{fontFamily:T.fb,fontSize:10,color:T.dim,letterSpacing:"0.08em",textTransform:"uppercase"}},"Coming Soon")
      ))})
    )
  ),
  React.createElement(WallSection,null),
  React.createElement(FeaturesSection,null),
  React.createElement(AffiliateSection,null),
  React.createElement(PipelineSection,null),
  React.createElement(MissionSection,null),
  React.createElement(AppSetupSection,null),
  React.createElement(Footer,null)
))}
