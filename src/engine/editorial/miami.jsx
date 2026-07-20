import { useState, useEffect } from "react";
import { FT } from "../theme";

// Transplanted verbatim from cities/miami/index.html (was CafecitoCountdown)
function Game({onComplete}){
  const[status,setStatus]=useState("idle");const[time,setTime]=useState(20);const[score,setScore]=useState(0);const[cups,setCups]=useState([]);
  useEffect(()=>{if(status!=="playing")return;const t=setInterval(()=>setTime(n=>{if(n<=1){setStatus("done");return 0;}return n-1;}),1000);return()=>clearInterval(t);},[status]);
  useEffect(()=>{if(status!=="playing")return;const sp=setInterval(()=>{const id=Math.random().toString(36).slice(2);const x=8+Math.random()*78,y=12+Math.random()*72;setCups(s=>[...s,{id,x,y}]);setTimeout(()=>setCups(s=>s.filter(sl=>sl.id!==id)),1400);},650);return()=>clearInterval(sp);},[status]);
  const tap=id=>{setCups(s=>s.filter(sl=>sl.id!==id));setScore(n=>n+1);};
  const start=()=>{setStatus("playing");setTime(20);setScore(0);setCups([]);};
  return(<div style={{position:"relative",width:"100%",height:360,background:"radial-gradient(ellipse at 30% 20%,#2a1a0c 0%,#0a0604 70%)",overflow:"hidden",borderTop:`1px solid ${FT.line}`,borderBottom:`1px solid ${FT.line}`}}>
    <div style={{position:"absolute",top:12,left:14,right:14,display:"flex",justifyContent:"space-between",fontFamily:FT.fm,fontSize:10,letterSpacing:".14em",color:FT.leatherInk,textTransform:"uppercase",zIndex:3}}>
      <span>shots · {String(score).padStart(2,"0")}</span>
      <span style={{color:time<=5?FT.redLight:FT.leatherInk}}>{String(time).padStart(2,"0")}s</span>
    </div>
    {status==="playing"&&cups.map(s=><button key={s.id} onClick={()=>tap(s.id)} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:54,height:54,background:"none",border:"none",cursor:"pointer",padding:0,animation:"dd-pop 1.4s ease-out forwards"}} aria-label="Tap">
      <svg viewBox="0 0 54 54" width="54" height="54">
        <defs><radialGradient id={`g${s.id}`} cx=".35" cy=".3"><stop offset="0%" stopColor="#d4a574"/><stop offset="55%" stopColor="#7a4218"/><stop offset="100%" stopColor="#2a1408"/></radialGradient></defs>
        <path d="M 14 22 L 16 44 Q 16 48 20 48 L 34 48 Q 38 48 38 44 L 40 22 Z" fill="#f5f0e8" stroke="#1a0f08" strokeWidth="1.2"/>
        <ellipse cx="27" cy="22" rx="13" ry="3" fill={`url(#g${s.id})`} stroke="#1a0f08" strokeWidth="1"/>
        <ellipse cx="27" cy="21.5" rx="9" ry="1.8" fill="#c89b3c" opacity=".55"/>
        <path d="M 22 14 Q 23 10 22 6" stroke="#e8dfd0" strokeWidth="1.4" fill="none" opacity=".55"/>
        <path d="M 27 14 Q 28 9 27 5" stroke="#e8dfd0" strokeWidth="1.4" fill="none" opacity=".55"/>
        <path d="M 32 14 Q 33 10 32 6" stroke="#e8dfd0" strokeWidth="1.4" fill="none" opacity=".55"/>
        <rect x="38" y="26" width="6" height="10" rx="3" fill="none" stroke="#1a0f08" strokeWidth="1.2"/>
      </svg>
    </button>)}
    {status==="idle"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,zIndex:4}}>
      <div style={{fontFamily:FT.fd,fontSize:26,fontWeight:600,color:FT.ink,letterSpacing:"-.02em"}}>Cafecito Countdown</div>
      <div style={{fontFamily:FT.fb,fontSize:12,color:FT.inkMid,textAlign:"center",maxWidth:240,lineHeight:1.5}}>Pull the perfect shot before it cools.<br/>Twenty seconds. One ventanita.</div>
      <button onClick={start} style={{marginTop:8,padding:"10px 22px",background:FT.red,color:"#fff",border:"none",fontFamily:FT.fm,fontSize:11,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Start</button>
    </div>}
    {status==="done"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:"rgba(10,7,5,.88)",zIndex:5}}>
      <div style={{fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",color:FT.inkMid,textTransform:"uppercase"}}>Shift Complete</div>
      <div style={{fontFamily:FT.fd,fontSize:64,fontWeight:600,color:"#d4a574",lineHeight:1,letterSpacing:"-.04em"}}>{score}</div>
      <div style={{fontFamily:FT.fb,fontSize:11,color:FT.inkMid}}>shots pulled</div>
      <div style={{display:"flex",gap:10,marginTop:10}}>
        <button onClick={start} style={{padding:"8px 16px",background:"transparent",color:FT.ink,border:`1px solid ${FT.inkFaint}`,fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Replay</button>
        <button onClick={()=>onComplete&&onComplete(score)} style={{padding:"8px 16px",background:FT.ink,color:FT.bg,border:"none",fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Keep Scrolling</button>
      </div>
    </div>}
  </div>);
}

export default {
  slug: "miami",
  picks: ["Joe's Stone Crab","Versailles Restaurant","El Palacio de los Jugos","Sanguich de Miami","Cote Miami","Stubborn Seed","Ball & Chain","LIV","Sweet Liberty","Smith & Wollensky","Wynwood Walls","Pérez Art Museum Miami (PAMM)","Vizcaya Museum and Gardens","South Beach","The Fillmore Miami Beach","Carillon Miami Wellness Resort","Everglades National Park","Faena Hotel Miami Beach","Cafe La Trova","South Pointe Park"],
  game: {
    card: { title: "Cafecito Countdown", tagline: "Twenty seconds. Pull every shot before it cools." },
    Game,
    comingSoon: { title: "Domino Drop", tagline: "Slap the bone. Beat the abuela. Forty-five seconds." },
  },
  defaults: { neighborhood: "Loop", author: "la ventanita" },
  storyboard: [
    { t: "line", text: null },
    { t: "line", text: "Miami is a beach town that thinks it's a club town that's actually a Cuban town. All three are true. Here's where to start." },
    { t: "pick", i: 0, kicker: "The Pinnacle", imageKey: "warm" },
    { t: "pick", i: 1, kicker: "Cuban · The Soul of Miami", imageKey: "warm" },
    { t: "pick", i: 2, kicker: "Cuban · The Real Deal", imageKey: "warm", override: { body: "Open-air cafeteria where you point at what you want — roast pork, fresh juices, whole fried snapper. No English needed. This is real Miami, not the postcard version." } },
    { t: "game" },
    { t: "line", text: "You're going to need a sandwich. Walk it off in Little Havana." },
    { t: "pick", i: 3, kicker: "Cuban · The Sandwich", imageKey: "warm" },
    { t: "pick", i: 4, kicker: "Design District · Michelin", imageKey: "night" },
    { t: "blackbook", variant: "match", name: "Camila", neighborhood: "Wynwood · 1.4mi", preview: "I measure cities by their late-night ventanitas and the sunrise on the bay." },
    { t: "pick", i: 5, kicker: "Top Chef · Michelin", imageKey: "warm" },
    { t: "deal", i: 0 },
    { t: "line", text: "The salsa didn't start here but this is where it grew up. You haven't been to Miami until you've been on the floor at Ball & Chain on a Sunday night." },
    { t: "pick", i: 6, kicker: "Salsa · Calle Ocho", imageKey: "warm" },
    { t: "pick", i: 7, kicker: "Mega Club · The Icon", imageKey: "night" },
    { t: "shaw", property: "Slotgenie", tagline: "◆ Adjacent Property", age: "21+", body: "When South Beach calls for a different kind of play. Chips from $6.69, Genie Points cross every SH@W property you're already a member of.", cta: "Open slotgenie.bet" },
    { t: "pick", i: 8, kicker: "Cocktails · Best in America", imageKey: "night" },
    { t: "game2" },
    { t: "pick", i: 9, kicker: "Steakhouse · South Pointe", imageKey: "warm" },
    { t: "blackbook", variant: "date", name: "Camila", neighborhood: "Wynwood", venueFromPick: 8, venueFallback: "Sweet Liberty", date: "Thursday 8pm" },
    { t: "line", text: "Tomorrow morning. Cafecito at the ventanita, walk through Wynwood Walls, then head to Vizcaya before the heat. Cancel whatever else you had planned." },
    { t: "pick", i: 10, kicker: "Street Art · Wynwood", imageKey: "arch" },
    { t: "pick", i: 11, kicker: "Contemporary · Bayfront", imageKey: "arch" },
    { t: "pick", i: 12, kicker: "1922 · The Estate", imageKey: "park" },
    { t: "event", i: 0 },
    { t: "pick", i: 13, kicker: "South Beach · Lummus", imageKey: "lake" },
    { t: "pick", i: 14, kicker: "Live Music · Art Deco", imageKey: "night" },
    { t: "deal", i: 1 },
    { t: "pick", i: 15, kicker: "Wellness · 70,000 sq ft", imageKey: "warm" },
    { t: "pick", i: 16, kicker: "River of Grass · 45min", imageKey: "park" },
    { t: "line", text: "If you're still with me, you're my kind of traveler. The rest of the directory is below — over two hundred restaurants, bars, hotels, and excuses to stay another week." },
  ],
};
