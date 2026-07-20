import { useState, useEffect } from "react";
import { FT } from "../theme";

// Houston arcade game — transplanted verbatim from cities/houston/index.html (was MissionControl)
function Game({onComplete}){
  const[status,setStatus]=useState("idle");const[time,setTime]=useState(20);const[score,setScore]=useState(0);const[targets,setTargets]=useState([]);
  useEffect(()=>{if(status!=="playing")return;const t=setInterval(()=>setTime(n=>{if(n<=1){setStatus("done");return 0;}return n-1;}),1000);return()=>clearInterval(t);},[status]);
  useEffect(()=>{if(status!=="playing")return;const sp=setInterval(()=>{const id=Math.random().toString(36).slice(2);const x=8+Math.random()*78,y=12+Math.random()*72;setTargets(s=>[...s,{id,x,y}]);setTimeout(()=>setTargets(s=>s.filter(t=>t.id!==id)),1400);},620);return()=>clearInterval(sp);},[status]);
  const tap=id=>{setTargets(s=>s.filter(t=>t.id!==id));setScore(n=>n+1);};
  const start=()=>{setStatus("playing");setTime(20);setScore(0);setTargets([]);};
  return(<div style={{position:"relative",width:"100%",height:360,background:"radial-gradient(ellipse at 50% 100%,#1a2845 0%,#08081a 60%,#000 100%)",overflow:"hidden",borderTop:`1px solid ${FT.line}`,borderBottom:`1px solid ${FT.line}`}}>
    <svg width="100%" height="100%" style={{position:"absolute",inset:0,opacity:.55,pointerEvents:"none"}}>
      <circle cx="14%" cy="18%" r="0.7" fill="#fff"/><circle cx="78%" cy="12%" r="0.5" fill="#cdd"/><circle cx="42%" cy="28%" r="0.6" fill="#fff"/><circle cx="62%" cy="40%" r="0.4" fill="#aac"/><circle cx="22%" cy="52%" r="0.5" fill="#fff"/><circle cx="88%" cy="62%" r="0.6" fill="#ccd"/><circle cx="34%" cy="70%" r="0.4" fill="#fff"/><circle cx="56%" cy="84%" r="0.5" fill="#aac"/><circle cx="8%" cy="78%" r="0.4" fill="#fff"/><circle cx="72%" cy="28%" r="0.3" fill="#bbc"/>
    </svg>
    <div style={{position:"absolute",top:12,left:14,right:14,display:"flex",justifyContent:"space-between",fontFamily:FT.fm,fontSize:10,letterSpacing:".14em",color:"#a8c8e8",textTransform:"uppercase",zIndex:3}}>
      <span>launches · {String(score).padStart(2,"0")}</span>
      <span style={{color:time<=5?"#ff6b4a":"#a8c8e8"}}>T-{String(time).padStart(2,"0")}s</span>
    </div>
    {status==="playing"&&targets.map(t=><button key={t.id} onClick={()=>tap(t.id)} style={{position:"absolute",left:`${t.x}%`,top:`${t.y}%`,width:54,height:54,background:"none",border:"none",cursor:"pointer",padding:0,animation:"dd-pop 1.4s ease-out forwards"}} aria-label="Launch">
      <svg viewBox="0 0 54 54" width="54" height="54">
        <defs><linearGradient id={`r${t.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e8e8ee"/><stop offset="60%" stopColor="#9aa3b3"/><stop offset="100%" stopColor="#3a4458"/></linearGradient><radialGradient id={`f${t.id}`} cx=".5" cy="0"><stop offset="0%" stopColor="#fff5b8"/><stop offset="40%" stopColor="#ff9d3a"/><stop offset="100%" stopColor="#c43618"/></radialGradient></defs>
        <ellipse cx="27" cy="48" rx="9" ry="6" fill={`url(#f${t.id})`} opacity=".95"/>
        <path d="M27 8 L36 32 L36 42 L18 42 L18 32 Z" fill={`url(#r${t.id})`} stroke="#1a1f2e" strokeWidth="1"/>
        <path d="M18 36 L12 44 L18 42 Z" fill="#5a6478"/><path d="M36 36 L42 44 L36 42 Z" fill="#5a6478"/>
        <circle cx="27" cy="22" r="3" fill="#1a2845" stroke="#aac" strokeWidth=".8"/>
      </svg>
    </button>)}
    {status==="idle"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,zIndex:4}}>
      <div style={{fontFamily:FT.fd,fontSize:26,fontWeight:600,color:FT.ink,letterSpacing:"-.02em"}}>Mission Control</div>
      <div style={{fontFamily:FT.fb,fontSize:12,color:FT.inkMid,textAlign:"center",maxWidth:240,lineHeight:1.5}}>Tap each rocket to launch.<br/>Twenty seconds. Houston needs you.</div>
      <button onClick={start} style={{marginTop:8,padding:"10px 22px",background:FT.red,color:"#fff",border:"none",fontFamily:FT.fm,fontSize:11,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Initiate</button>
    </div>}
    {status==="done"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:"rgba(8,8,26,.92)",zIndex:5}}>
      <div style={{fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",color:"#a8c8e8",textTransform:"uppercase"}}>Mission Complete</div>
      <div style={{fontFamily:FT.fd,fontSize:64,fontWeight:600,color:"#fff5b8",lineHeight:1,letterSpacing:"-.04em"}}>{score}</div>
      <div style={{fontFamily:FT.fb,fontSize:11,color:"#a8c8e8"}}>successful launches</div>
      <div style={{display:"flex",gap:10,marginTop:10}}>
        <button onClick={start} style={{padding:"8px 16px",background:"transparent",color:FT.ink,border:`1px solid ${FT.inkFaint}`,fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Replay</button>
        <button onClick={()=>onComplete&&onComplete(score)} style={{padding:"8px 16px",background:FT.ink,color:FT.bg,border:"none",fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Keep Scrolling</button>
      </div>
    </div>}
  </div>);
}

export default {
  slug: "houston",
  picks: ["Tatemó","Truth BBQ","Killen's BBQ","Ninfa's on Navigation","Hugo's","Crawfish & Noodles","Saint Arnold Brewing Company","Axelrad","Anvil Bar & Refuge","Pappas Bros. Steakhouse","Space Center Houston","Museum of Fine Arts, Houston","Buffalo Bayou Park","The Menil Collection","Daikin Park (Minute Maid Park)","Trellis Spa","Hotel Saint Augustine","Karbach Brewing Co.","Theodore Rex","Agnes and Sherman"],
  game: {
    card: { title: "Mission Control", tagline: "Twenty seconds. Tap to launch. We are go for liftoff." },
    Game,
    comingSoon: { title: "Crawfish Boil", tagline: "Sort the mudbugs. Forty-five seconds. Coming soon." },
  },
  defaults: { neighborhood: "Montrose", author: "space city sam" },
  storyboard: [
    { t: "line", text: null },
    { t: "line", text: "Houston is a sprawl that pretends to be a freeway that's secretly the most diverse food city in America. Three things are true. Here's where to start." },
    { t: "pick", i: 0, kicker: "The Pinnacle · Michelin", imageKey: "warm" },
    { t: "pick", i: 1, kicker: "Texas BBQ · The Heights", imageKey: "bbq" },
    { t: "pick", i: 2, kicker: "Texas BBQ · Worth The Drive", imageKey: "bbq", override: { body: "Pearland pitmaster Ronnie Killen's temple to brisket. The bark is a religious experience. Get there early — when it sells out, it's done. Worth every minute of the 30-minute drive south." } },
    { t: "game" },
    { t: "line", text: "The fajita was invented at this address in 1973. Tacos al carbon, sizzling skillet, no apologies. This is where Tex-Mex starts." },
    { t: "pick", i: 3, kicker: "Tex-Mex · Origin Of The Fajita", imageKey: "texmex" },
    { t: "pick", i: 4, kicker: "Mexican · Hugo Ortega's Flagship", imageKey: "texmex" },
    { t: "blackbook", variant: "match", name: "Camila", neighborhood: "Montrose · 0.8mi", preview: "I judge a city by its taquerías and its public pools. Houston scores high on both." },
    { t: "pick", i: 5, kicker: "Viet-Cajun · Houston Original", imageKey: "warm" },
    { t: "deal", i: 0 },
    { t: "line", text: "Saint Arnold predates most of the craft scene in this country. The skyline view from the beer garden alone is worth the visit." },
    { t: "pick", i: 6, kicker: "Beer Garden · Texas Oldest", imageKey: "park" },
    { t: "pick", i: 7, kicker: "Hammocks · The Houston Vibe", imageKey: "park" },
    { t: "shaw", property: "Slotgenie", tagline: "◆ Adjacent Property", age: "21+", body: "When the night needs a different kind of play. Chips from $6.69, Genie Points cross every SH@W property you're already a member of.", cta: "Open slotgenie.bet" },
    { t: "pick", i: 8, kicker: "Cocktails · National Top 50", imageKey: "night" },
    { t: "game2" },
    { t: "pick", i: 9, kicker: "Steakhouse · Texas Classic", imageKey: "warm" },
    { t: "blackbook", variant: "date", name: "Camila", neighborhood: "Montrose", venueFromPick: 8, venueFallback: "Anvil", date: "Friday 7pm" },
    { t: "line", text: "Tomorrow morning. NASA, then a kayak through downtown, then free art at the Menil. Rocket science and Rothko in the same day — only Houston pulls that off." },
    { t: "pick", i: 10, kicker: "NASA · The Reason Houston Exists", imageKey: "space" },
    { t: "pick", i: 11, kicker: "Largest Art Museum in the Southwest", imageKey: "arch" },
    { t: "pick", i: 12, kicker: "Buffalo Bayou · Kayak Through Downtown", imageKey: "bayou" },
    { t: "event", i: 0 },
    { t: "pick", i: 13, kicker: "The Menil · Free, Always", imageKey: "arch" },
    { t: "pick", i: 14, kicker: "Daikin Park · Astros", imageKey: "night" },
    { t: "deal", i: 1 },
    { t: "pick", i: 15, kicker: "Spa · Best in Houston", imageKey: "warm" },
    { t: "pick", i: 16, kicker: "Hotel · Michelin Key", imageKey: "night" },
    { t: "line", text: "If you're still scrolling, you're my kind of traveler. The full directory is below — two hundred restaurants, bars, rooms, and excuses to extend the trip." },
  ],
};
