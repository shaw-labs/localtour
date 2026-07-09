import { useState, useEffect } from "react";
import { FT } from "../theme";

// Transplanted verbatim from cities/los-angeles/index.html (was TacoTruckRush)
function Game({onComplete}){
  const[status,setStatus]=useState("idle");const[time,setTime]=useState(20);const[score,setScore]=useState(0);const[tacos,setTacos]=useState([]);
  useEffect(()=>{if(status!=="playing")return;const t=setInterval(()=>setTime(n=>{if(n<=1){setStatus("done");return 0;}return n-1;}),1000);return()=>clearInterval(t);},[status]);
  useEffect(()=>{if(status!=="playing")return;const sp=setInterval(()=>{const id=Math.random().toString(36).slice(2);const x=8+Math.random()*78,y=12+Math.random()*72;setTacos(s=>[...s,{id,x,y}]);setTimeout(()=>setTacos(s=>s.filter(sl=>sl.id!==id)),1400);},650);return()=>clearInterval(sp);},[status]);
  const tap=id=>{setTacos(s=>s.filter(sl=>sl.id!==id));setScore(n=>n+1);};
  const start=()=>{setStatus("playing");setTime(20);setScore(0);setTacos([]);};
  return(<div style={{position:"relative",width:"100%",height:360,background:"radial-gradient(ellipse at 30% 20%,#2a1a0c 0%,#0c0805 70%)",overflow:"hidden",borderTop:`1px solid ${FT.line}`,borderBottom:`1px solid ${FT.line}`}}>
    <div style={{position:"absolute",top:12,left:14,right:14,display:"flex",justifyContent:"space-between",fontFamily:FT.fm,fontSize:10,letterSpacing:".14em",color:FT.leatherInk,textTransform:"uppercase",zIndex:3}}>
      <span>score · {String(score).padStart(2,"0")}</span>
      <span style={{color:time<=5?FT.redLight:FT.leatherInk}}>{String(time).padStart(2,"0")}s</span>
    </div>
    {status==="playing"&&tacos.map(s=><button key={s.id} onClick={()=>tap(s.id)} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:54,height:54,background:"none",border:"none",cursor:"pointer",padding:0,animation:"dd-pop 1.4s ease-out forwards"}} aria-label="Tap">
      <svg viewBox="0 0 54 54" width="54" height="54">
        <defs><linearGradient id={`g${s.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f5d076"/><stop offset="55%" stopColor="#d49b3c"/><stop offset="100%" stopColor="#7a4a18"/></linearGradient></defs>
        <path d={`M 5 20 Q 27 6 49 20 Q 49 46 27 50 Q 5 46 5 20 Z`} fill={`url(#g${s.id})`} stroke="#3a210a" strokeWidth="1.5"/>
        <circle cx="18" cy="30" r="2.6" fill="#4ade80"/><circle cx="32" cy="34" r="2.8" fill="#dc2626"/><circle cx="27" cy="22" r="2.2" fill="#f5f2ec"/><circle cx="38" cy="26" r="2" fill="#dc2626"/>
      </svg>
    </button>)}
    {status==="idle"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,zIndex:4}}>
      <div style={{fontFamily:FT.fd,fontSize:26,fontWeight:600,color:FT.ink,letterSpacing:"-.02em"}}>Taco Truck Rush</div>
      <div style={{fontFamily:FT.fb,fontSize:12,color:FT.inkMid,textAlign:"center",maxWidth:220,lineHeight:1.5}}>Tap the tacos before they slide off the counter.<br/>Twenty seconds. One round.</div>
      <button onClick={start} style={{marginTop:8,padding:"10px 22px",background:FT.red,color:"#fff",border:"none",fontFamily:FT.fm,fontSize:11,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Start</button>
    </div>}
    {status==="done"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:"rgba(10,7,5,.88)",zIndex:5}}>
      <div style={{fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",color:FT.inkMid,textTransform:"uppercase"}}>Round Complete</div>
      <div style={{fontFamily:FT.fd,fontSize:64,fontWeight:600,color:"#f5c977",lineHeight:1,letterSpacing:"-.04em"}}>{score}</div>
      <div style={{fontFamily:FT.fb,fontSize:11,color:FT.inkMid}}>tacos served</div>
      <div style={{display:"flex",gap:10,marginTop:10}}>
        <button onClick={start} style={{padding:"8px 16px",background:"transparent",color:FT.ink,border:`1px solid ${FT.inkFaint}`,fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Replay</button>
        <button onClick={()=>onComplete&&onComplete(score)} style={{padding:"8px 16px",background:FT.ink,color:FT.bg,border:"none",fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Keep Scrolling</button>
      </div>
    </div>}
  </div>);
}

export default {
  slug: "los-angeles",
  picks: ["Providence","Mariscos Jalisco","Guelaguetza","Howlin' Ray's","Bestia","Park's BBQ","The Hollywood Bowl","The Troubadour","Death & Co","Sushi Ginza Onodera","Griffith Observatory","The Getty Center","El Matador State Beach","Venice Beach Boardwalk","The Comedy Store","Wi Spa","Universal Studios Hollywood","Sqirl","Intelligentsia Coffee","Bavel"],
  game: {
    card: { title: "Taco Truck Rush", tagline: "Twenty seconds. Tap fast. Skip the line." },
    Game,
    comingSoon: { title: "PCH Cruise", tagline: "Hold the curve. Beat the marine layer. Forty seconds." },
  },
  defaults: { neighborhood: "DTLA", author: "the eastside connect" },
  storyboard: [
    { t: "line", text: null },
    { t: "line", text: "LA is a food town that thinks it's a beach town that's secretly the deepest immigrant city in America. All three are true. Start here." },
    { t: "pick", i: 0, kicker: "The Pinnacle · 3 Stars", imageKey: "warm" },
    { t: "pick", i: 1, kicker: "Taco Truck · The Original", imageKey: "deep" },
    { t: "pick", i: 2, kicker: "Oaxacan · The Crown", imageKey: "deep", override: { body: "James Beard America's Classic. Festival de Moles is seven moles on one plate — black, red, yellow, green — and a michelada the size of a small ocean. Live banda on weekends." } },
    { t: "game" },
    { t: "line", text: "Wash it down with a horchata. The drive east to the SGV is twenty minutes if you leave before three." },
    { t: "pick", i: 3, kicker: "Hot Chicken · Chinatown", imageKey: "warm" },
    { t: "pick", i: 4, kicker: "Arts District · The Reservation", imageKey: "warm" },
    { t: "blackbook", variant: "match", name: "Maren", neighborhood: "Silver Lake · 1.4mi", preview: "I rate cities by their breakfast burritos and their golden hour." },
    { t: "pick", i: 5, kicker: "KBBQ · Gold Standard", imageKey: "warm" },
    { t: "deal", i: 0 },
    { t: "line", text: "Every band you love crashed at the Troubadour their first time through. The Sunset Strip is alive again — and the Bowl in summer is the holiest room on earth." },
    { t: "pick", i: 6, kicker: "The Bowl · Summer Season", imageKey: "blues" },
    { t: "pick", i: 7, kicker: "Sunset Strip · 500 Seats", imageKey: "night" },
    { t: "shaw", property: "Slotgenie", tagline: "◆ Adjacent Property", age: "21+", body: "When the night calls for a different kind of play. Chips from $6.69, Genie Points cross every SH@W property you're already a member of.", cta: "Open slotgenie.bet" },
    { t: "pick", i: 8, kicker: "Cocktails · Arts District", imageKey: "night" },
    { t: "game2" },
    { t: "pick", i: 9, kicker: "Omakase · WeHo", imageKey: "warm" },
    { t: "blackbook", variant: "date", name: "Maren", neighborhood: "Arts District", venueFromPick: 4, venueFallback: "Bestia", date: "Thursday 8pm" },
    { t: "line", text: "Tomorrow morning. Coffee at Intelligentsia Silver Lake, sunrise at the Observatory, then PCH north until the marine layer breaks. Cancel everything else." },
    { t: "pick", i: 10, kicker: "The Observatory · Sunset", imageKey: "arch" },
    { t: "pick", i: 11, kicker: "The Getty · Free", imageKey: "arch" },
    { t: "pick", i: 12, kicker: "Malibu · Sea Caves", imageKey: "lake" },
    { t: "event", i: 0 },
    { t: "pick", i: 13, kicker: "Venice · Drum Circle", imageKey: "park" },
    { t: "pick", i: 14, kicker: "Comedy · Sunset Strip", imageKey: "night" },
    { t: "deal", i: 1 },
    { t: "pick", i: 15, kicker: "Korean Spa · 24/7", imageKey: "warm" },
    { t: "pick", i: 16, kicker: "Universal · The Backlot", imageKey: "park" },
    { t: "line", text: "If you're still scrolling, you're my kind of traveler. The rest of the directory is below — every taco truck, omakase counter, and rooftop excuse in the basin." },
  ],
};
