import { useState, useEffect } from "react";
import { FT } from "../theme";

// Transplanted verbatim from cities/new-orleans/index.html (was BeignetBounce)
function Game({onComplete}){
  const[status,setStatus]=useState("idle");const[time,setTime]=useState(20);const[score,setScore]=useState(0);const[puffs,setPuffs]=useState([]);
  useEffect(()=>{if(status!=="playing")return;const t=setInterval(()=>setTime(n=>{if(n<=1){setStatus("done");return 0;}return n-1;}),1000);return()=>clearInterval(t);},[status]);
  useEffect(()=>{if(status!=="playing")return;const sp=setInterval(()=>{const id=Math.random().toString(36).slice(2);const x=8+Math.random()*78,y=12+Math.random()*72;setPuffs(s=>[...s,{id,x,y}]);setTimeout(()=>setPuffs(s=>s.filter(sl=>sl.id!==id)),1400);},620);return()=>clearInterval(sp);},[status]);
  const tap=id=>{setPuffs(s=>s.filter(sl=>sl.id!==id));setScore(n=>n+1);};
  const start=()=>{setStatus("playing");setTime(20);setScore(0);setPuffs([]);};
  return(<div style={{position:"relative",width:"100%",height:360,background:"radial-gradient(ellipse at 30% 20%,#3a2418 0%,#180c06 70%)",overflow:"hidden",borderTop:`1px solid ${FT.line}`,borderBottom:`1px solid ${FT.line}`}}>
    <div style={{position:"absolute",top:12,left:14,right:14,display:"flex",justifyContent:"space-between",fontFamily:FT.fm,fontSize:10,letterSpacing:".14em",color:FT.leatherInk,textTransform:"uppercase",zIndex:3}}>
      <span>score · {String(score).padStart(2,"0")}</span>
      <span style={{color:time<=5?FT.redLight:FT.leatherInk}}>{String(time).padStart(2,"0")}s</span>
    </div>
    {status==="playing"&&puffs.map(s=><button key={s.id} onClick={()=>tap(s.id)} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:58,height:58,background:"none",border:"none",cursor:"pointer",padding:0,animation:"bb-pop 1.4s ease-out forwards"}} aria-label="Catch">
      <svg viewBox="0 0 58 58" width="58" height="58">
        <defs>
          <radialGradient id={`b${s.id}`} cx=".4" cy=".45"><stop offset="0%" stopColor="#f5e6c4"/><stop offset="55%" stopColor="#c89968"/><stop offset="100%" stopColor="#6a3d1c"/></radialGradient>
          <radialGradient id={`p${s.id}`} cx=".5" cy=".5"><stop offset="0%" stopColor="#ffffff" stopOpacity="1"/><stop offset="55%" stopColor="#fafafa" stopOpacity=".85"/><stop offset="100%" stopColor="#ffffff" stopOpacity="0"/></radialGradient>
        </defs>
        <rect x="14" y="20" width="30" height="26" rx="4" fill={`url(#b${s.id})`} stroke="#3a2010" strokeWidth="1"/>
        <circle cx="29" cy="27" r="22" fill={`url(#p${s.id})`}/>
        <circle cx="20" cy="22" r="2.4" fill="#ffffff" opacity=".95"/>
        <circle cx="38" cy="20" r="1.8" fill="#ffffff" opacity=".9"/>
        <circle cx="42" cy="32" r="2.2" fill="#ffffff" opacity=".95"/>
        <circle cx="16" cy="36" r="1.6" fill="#ffffff" opacity=".85"/>
        <circle cx="29" cy="14" r="2" fill="#ffffff" opacity=".9"/>
      </svg>
    </button>)}
    {status==="idle"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,zIndex:4}}>
      <div style={{fontFamily:FT.fd,fontSize:26,fontWeight:600,color:FT.ink,letterSpacing:"-.02em"}}>Beignet Bounce</div>
      <div style={{fontFamily:FT.fb,fontSize:12,color:FT.inkMid,textAlign:"center",maxWidth:240,lineHeight:1.5}}>Catch the powdered sugar before it settles.<br/>Twenty seconds. Café Du Monde rules.</div>
      <button onClick={start} style={{marginTop:8,padding:"10px 22px",background:FT.red,color:"#fff",border:"none",fontFamily:FT.fm,fontSize:11,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Start</button>
    </div>}
    {status==="done"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:"rgba(10,7,5,.88)",zIndex:5}}>
      <div style={{fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",color:FT.inkMid,textTransform:"uppercase"}}>Round Complete</div>
      <div style={{fontFamily:FT.fd,fontSize:64,fontWeight:600,color:"#f5e6c4",lineHeight:1,letterSpacing:"-.04em"}}>{score}</div>
      <div style={{fontFamily:FT.fb,fontSize:11,color:FT.inkMid}}>puffs caught</div>
      <div style={{display:"flex",gap:10,marginTop:10}}>
        <button onClick={start} style={{padding:"8px 16px",background:"transparent",color:FT.ink,border:`1px solid ${FT.inkFaint}`,fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Replay</button>
        <button onClick={()=>onComplete&&onComplete(score)} style={{padding:"8px 16px",background:FT.ink,color:FT.bg,border:"none",fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Keep Scrolling</button>
      </div>
    </div>}
  </div>);
}

export default {
  slug: "new-orleans",
  picks: ["Emeril's","Café Du Monde","Willie Mae's Scotch House","Parkway Bakery & Tavern","Commander's Palace","Lafitte's Blacksmith Shop Bar","The Spotted Cat Music Club","Preservation Hall","The Carousel Bar & Lounge","Studio","Jackson Square","The National WWII Museum","Steamboat Natchez","St. Charles Streetcar","Magazine Street","Bacchanal Fine Wine & Spirits","City Park","Snug Harbor Jazz Bistro","Pêche Seafood Grill","Cochon"],
  game: {
    card: { title: "Beignet Bounce", tagline: "Twenty seconds. Catch the sugar. A palate cleanser." },
    Game,
    comingSoon: { title: "Streetcar Stride", tagline: "Ride the line. Catch the stops. Thirty seconds." },
  },
  // As found in the source file: FeedConciergeLine author defaults to "the second line";
  // FeedBlackBookCard's date-variant neighborhood fallback is literally "Loop" (unchanged from the shared template — do not normalize).
  defaults: { neighborhood: "Loop", author: "the second line" },
  storyboard: [
    { t: "line", text: null },
    { t: "line", text: "New Orleans is a food town that runs on music, built on three hundred years of saying yes to one more drink. Here's where to start." },
    { t: "pick", i: 0, kicker: "Two Michelin Stars", imageKey: "creole" },
    { t: "pick", i: 1, kicker: "Beignets · Since 1862", imageKey: "frenchquarter" },
    { t: "pick", i: 2, kicker: "The Fried Chicken", imageKey: "warm" },
    { t: "game" },
    { t: "line", text: "You're going to need a po'boy. Skip Bourbon Street and head Mid-City." },
    { t: "pick", i: 3, kicker: "Po'boy · The Standard", imageKey: "warm" },
    { t: "pick", i: 4, kicker: "Garden District · Grande Dame", imageKey: "creole" },
    { t: "blackbook", variant: "match", name: "Camille", neighborhood: "Marigny · 0.8mi", preview: "I measure cities by their late-night jazz rooms and their early-morning beignets." },
    { t: "pick", i: 5, kicker: "Oldest Bar in America", imageKey: "frenchquarter" },
    { t: "deal", i: 0 },
    { t: "line", text: "Jazz didn't start somewhere else. It started here. Frenchmen Street is where it lives now — walk the strip and let your ears guide you." },
    { t: "pick", i: 6, kicker: "Frenchmen · The Floor", imageKey: "jazz" },
    { t: "pick", i: 7, kicker: "Pure Jazz · 250-Year Room", imageKey: "jazz" },
    { t: "shaw", property: "Slotgenie", tagline: "◆ Adjacent Property", age: "21+", body: "When the night calls for a different kind of play. Chips from $6.69, Genie Points cross every SH@W property you're already a member of.", cta: "Open slotgenie.bet" },
    { t: "pick", i: 8, kicker: "The Bar That Spins", imageKey: "frenchquarter" },
    { t: "game2" },
    { t: "pick", i: 9, kicker: "Steakhouse · Modern Uptown", imageKey: "warm" },
    { t: "blackbook", variant: "date", name: "Camille", neighborhood: "French Quarter", venueFromPick: 17, venueFallback: "Snug Harbor", date: "Friday 8pm" },
    { t: "line", text: "Tomorrow morning. Beignets at Café Du Monde, walk Jackson Square at dawn before the buskers set up, then cross Decatur to the river. The day starts itself." },
    { t: "pick", i: 10, kicker: "The Heart of the Quarter", imageKey: "frenchquarter" },
    { t: "pick", i: 11, kicker: "#1 Museum in America", imageKey: "arch" },
    { t: "pick", i: 12, kicker: "The River · Jazz Cruise", imageKey: "mississippi" },
    { t: "event", i: 0 },
    { t: "pick", i: 13, kicker: "Streetcar · Oldest in the World", imageKey: "bywater" },
    { t: "pick", i: 14, kicker: "Shopping · Six Miles", imageKey: "bywater" },
    { t: "deal", i: 1 },
    { t: "pick", i: 15, kicker: "Wine in a Garden · Bywater", imageKey: "bywater" },
    { t: "pick", i: 16, kicker: "1,300 Acres of Live Oaks", imageKey: "park" },
    // Source renders this as a template literal: `…below — ${directory.length} restaurants…`.
    // No dynamic-text mechanism exists in the storyboard contract; {directoryCount} marks
    // the interpolation point — flagged for the assembler (see port report).
    { t: "line", text: "If you're still with me, you're my kind of traveler. The rest of the directory is below — {directoryCount} restaurants, bars, rooms, and excuses to stay another day." },
  ],
};
