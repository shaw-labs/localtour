import { useState, useEffect } from "react";
import { FT } from "../theme";

// Transplanted verbatim from cities/new-york-city/index.html (was SliceRun)
function Game({onComplete}){
  const[status,setStatus]=useState("idle");const[time,setTime]=useState(20);const[score,setScore]=useState(0);const[slices,setSlices]=useState([]);
  useEffect(()=>{if(status!=="playing")return;const t=setInterval(()=>setTime(n=>{if(n<=1){setStatus("done");return 0;}return n-1;}),1000);return()=>clearInterval(t);},[status]);
  useEffect(()=>{if(status!=="playing")return;const sp=setInterval(()=>{const id=Math.random().toString(36).slice(2);const x=8+Math.random()*78,y=12+Math.random()*72;const rot=Math.random()*30-15;setSlices(s=>[...s,{id,x,y,rot}]);setTimeout(()=>setSlices(s=>s.filter(sl=>sl.id!==id)),1300);},620);return()=>clearInterval(sp);},[status]);
  const tap=id=>{setSlices(s=>s.filter(sl=>sl.id!==id));setScore(n=>n+1);};
  const start=()=>{setStatus("playing");setTime(20);setScore(0);setSlices([]);};
  return(<div style={{position:"relative",width:"100%",height:360,background:"radial-gradient(ellipse at 30% 20%,#2a1410 0%,#0e0605 70%)",overflow:"hidden",borderTop:`1px solid ${FT.line}`,borderBottom:`1px solid ${FT.line}`}}>
    <div style={{position:"absolute",top:12,left:14,right:14,display:"flex",justifyContent:"space-between",fontFamily:FT.fm,fontSize:10,letterSpacing:".14em",color:FT.leatherInk,textTransform:"uppercase",zIndex:3}}>
      <span>score · {String(score).padStart(2,"0")}</span>
      <span style={{color:time<=5?FT.redLight:FT.leatherInk}}>{String(time).padStart(2,"0")}s</span>
    </div>
    {status==="playing"&&slices.map(s=><button key={s.id} onClick={()=>tap(s.id)} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:62,height:62,background:"none",border:"none",cursor:"pointer",padding:0,animation:"dd-pop 1.3s ease-out forwards",transform:`rotate(${s.rot}deg)`}} aria-label="Tap">
      <svg viewBox="0 0 62 62" width="62" height="62">
        <defs><linearGradient id={`gs${s.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f5d077"/><stop offset="55%" stopColor="#e89030"/><stop offset="100%" stopColor="#7a3a18"/></linearGradient></defs>
        <polygon points="31,4 56,54 6,54" fill={`url(#gs${s.id})`} stroke="#3d1810" strokeWidth="1.5"/>
        <polygon points="31,4 56,54 6,54" fill="#fff8d8" opacity=".25"/>
        <circle cx="22" cy="38" r="3.2" fill="#c44534"/><circle cx="36" cy="32" r="2.6" fill="#c44534"/><circle cx="38" cy="44" r="2.8" fill="#c44534"/><circle cx="28" cy="46" r="2.2" fill="#c44534"/>
      </svg>
    </button>)}
    {status==="idle"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,zIndex:4}}>
      <div style={{fontFamily:FT.fd,fontSize:26,fontWeight:600,color:FT.ink,letterSpacing:"-.02em"}}>Slice Run</div>
      <div style={{fontFamily:FT.fb,fontSize:12,color:FT.inkMid,textAlign:"center",maxWidth:240,lineHeight:1.5}}>Tap the slices before someone else grabs them.<br/>Twenty seconds. Fold and go.</div>
      <button onClick={start} style={{marginTop:8,padding:"10px 22px",background:FT.red,color:"#fff",border:"none",fontFamily:FT.fm,fontSize:11,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Start</button>
    </div>}
    {status==="done"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:"rgba(10,6,5,.88)",zIndex:5}}>
      <div style={{fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",color:FT.inkMid,textTransform:"uppercase"}}>Round Complete</div>
      <div style={{fontFamily:FT.fd,fontSize:64,fontWeight:600,color:"#f5c977",lineHeight:1,letterSpacing:"-.04em"}}>{score}</div>
      <div style={{fontFamily:FT.fb,fontSize:11,color:FT.inkMid}}>slices grabbed</div>
      <div style={{display:"flex",gap:10,marginTop:10}}>
        <button onClick={start} style={{padding:"8px 16px",background:"transparent",color:FT.ink,border:`1px solid ${FT.inkFaint}`,fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Replay</button>
        <button onClick={()=>onComplete&&onComplete(score)} style={{padding:"8px 16px",background:FT.ink,color:FT.bg,border:"none",fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Keep Scrolling</button>
      </div>
    </div>}
  </div>);
}

export default {
  slug: "new-york-city",
  picks: ["Le Bernardin","Joe's Pizza","Katz's Delicatessen","Russ & Daughters","Carbone","Dead Rabbit","Smalls Jazz Club","Bowery Ballroom","Peter Luger Steak House","Central Park","The Metropolitan Museum of Art","Statue of Liberty & Ellis Island","Brooklyn Bridge","Broadway (Theater District)","Eleven Madison Park","Lucali","Comedy Cellar","The High Line","Bemelmans Bar","Tatiana by Kwame Onwuachi"],
  game: {
    card: { title: "Slice Run", tagline: "Twenty seconds. Tap the slices before someone else folds them first." },
    Game,
    comingSoon: { title: "Subway Shuffle", tagline: "Dodge the closing doors. Catch the next train. Thirty seconds." },
  },
  defaults: { neighborhood: "Loop", author: "the doorman" },
  storyboard: [
    { t: "line", text: null },
    { t: "line", text: "New York is a food town that thinks it's a theater town that's actually a hundred neighborhoods stitched into one. All three are true. Here's where to start." },
    { t: "pick", i: 0, kicker: "The Pinnacle", imageKey: "warm" },
    { t: "pick", i: 1, kicker: "The Slice · Origin", imageKey: "pizza" },
    { t: "pick", i: 2, kicker: "Pastrami · Since 1888", imageKey: "deli" },
    { t: "game" },
    { t: "line", text: "Walk it off. Houston Street to Orchard. The bagel shop is around the corner and you're going to want one before noon." },
    { t: "pick", i: 3, kicker: "Bagel & Lox · Since 1914", imageKey: "bagel" },
    { t: "pick", i: 4, kicker: "Greenwich Village · Reservations Only", imageKey: "warm" },
    { t: "blackbook", variant: "match", name: "Maya", neighborhood: "Williamsburg · 2.4mi", preview: "I judge a city by its 4am pizza window and its 6am subway car. Both yours pass." },
    { t: "pick", i: 5, kicker: "FiDi · World's Best Bar List", imageKey: "night" },
    { t: "deal", i: 0 },
    { t: "line", text: "The blues lives in Chicago. The jazz lives here. You haven't done New York until you've sat in a basement on West 10th Street at 1am, BYOB, no drink minimum." },
    { t: "pick", i: 6, kicker: "Jazz · Basement · BYOB", imageKey: "night" },
    { t: "pick", i: 7, kicker: "Live Music · The Mid-Sized Cathedral", imageKey: "theater" },
    { t: "shaw", property: "Slotgenie", tagline: "◆ Adjacent Property", age: "21+", body: "When the city won't sleep, neither will your bankroll. Chips from $6.69, Genie Points cross every SH@W property you're already a member of.", cta: "Open slotgenie.bet" },
    { t: "pick", i: 8, kicker: "Steakhouse · Since 1887 · Cash Only", imageKey: "warm" },
    { t: "game2" },
    { t: "blackbook", variant: "date", name: "Maya", neighborhood: "West Village", venueFromPick: 5, venueFallback: "Dead Rabbit", date: "Thursday 8pm" },
    { t: "line", text: "Tomorrow morning. Coffee at Devoción in Williamsburg, walk across the bridge into DUMBO, then the rooftop of the Met by sunset. Cancel whatever else you had planned." },
    { t: "pick", i: 9, kicker: "843 Acres · The Lung", imageKey: "park" },
    { t: "pick", i: 10, kicker: "The Met · 5,000 Years", imageKey: "theater" },
    { t: "pick", i: 11, kicker: "Liberty Island · Ferry from Battery", imageKey: "harbor" },
    { t: "event", i: 0 },
    { t: "pick", i: 12, kicker: "Manhattan → DUMBO · The Walk", imageKey: "bridge" },
    { t: "deal", i: 1 },
    { t: "pick", i: 13, kicker: "Broadway · The Capstone", imageKey: "theater" },
    { t: "line", text: "If you're still with me, you're my kind of traveler. The rest of the directory is below — every borough, every cuisine, every excuse to extend the trip another day." },
  ],
};
