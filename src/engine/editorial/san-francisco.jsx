import { useState, useEffect } from "react";
import { FT } from "../theme";

// Transplanted verbatim from cities/san-francisco/index.html (was MissionBurrito)
function Game({onComplete}){
  const[status,setStatus]=useState("idle");const[time,setTime]=useState(20);const[score,setScore]=useState(0);const[slices,setSlices]=useState([]);
  useEffect(()=>{if(status!=="playing")return;const t=setInterval(()=>setTime(n=>{if(n<=1){setStatus("done");return 0;}return n-1;}),1000);return()=>clearInterval(t);},[status]);
  useEffect(()=>{if(status!=="playing")return;const sp=setInterval(()=>{const id=Math.random().toString(36).slice(2);const x=8+Math.random()*78,y=12+Math.random()*72;setSlices(s=>[...s,{id,x,y}]);setTimeout(()=>setSlices(s=>s.filter(sl=>sl.id!==id)),1400);},650);return()=>clearInterval(sp);},[status]);
  const tap=id=>{setSlices(s=>s.filter(sl=>sl.id!==id));setScore(n=>n+1);};
  const start=()=>{setStatus("playing");setTime(20);setScore(0);setSlices([]);};
  return(<div style={{position:"relative",width:"100%",height:360,background:"radial-gradient(ellipse at 30% 20%,#2a1610 0%,#0e0705 70%)",overflow:"hidden",borderTop:`1px solid ${FT.line}`,borderBottom:`1px solid ${FT.line}`}}>
    <div style={{position:"absolute",top:12,left:14,right:14,display:"flex",justifyContent:"space-between",fontFamily:FT.fm,fontSize:10,letterSpacing:".14em",color:FT.leatherInk,textTransform:"uppercase",zIndex:3}}>
      <span>score · {String(score).padStart(2,"0")}</span>
      <span style={{color:time<=5?FT.redLight:FT.leatherInk}}>{String(time).padStart(2,"0")}s</span>
    </div>
    {status==="playing"&&slices.map(s=><button key={s.id} onClick={()=>tap(s.id)} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:54,height:54,background:"none",border:"none",cursor:"pointer",padding:0,animation:"dd-pop 1.4s ease-out forwards"}} aria-label="Tap">
      <svg viewBox="0 0 54 54" width="54" height="54">
        <defs><radialGradient id={`g${s.id}`} cx=".3" cy=".3"><stop offset="0%" stopColor="#f5c977"/><stop offset="60%" stopColor="#b8692c"/><stop offset="100%" stopColor="#5a2d10"/></radialGradient></defs>
        <polygon points="27,4 50,48 4,48" fill={`url(#g${s.id})`} stroke="#2a1610" strokeWidth="1.5"/>
        <circle cx="20" cy="35" r="3" fill="#c44534"/><circle cx="32" cy="30" r="2.5" fill="#c44534"/><circle cx="35" cy="40" r="2.8" fill="#c44534"/>
      </svg>
    </button>)}
    {status==="idle"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,zIndex:4}}>
      <div style={{fontFamily:FT.fd,fontSize:26,fontWeight:600,color:FT.ink,letterSpacing:"-.02em"}}>Mission Burrito</div>
      <div style={{fontFamily:FT.fb,fontSize:12,color:FT.inkMid,textAlign:"center",maxWidth:220,lineHeight:1.5}}>Tap ingredients before they slide off the tortilla.<br/>Twenty seconds. One round.</div>
      <button onClick={start} style={{marginTop:8,padding:"10px 22px",background:FT.red,color:"#fff",border:"none",fontFamily:FT.fm,fontSize:11,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Roll</button>
    </div>}
    {status==="done"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:"rgba(10,7,5,.88)",zIndex:5}}>
      <div style={{fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",color:FT.inkMid,textTransform:"uppercase"}}>Round Complete</div>
      <div style={{fontFamily:FT.fd,fontSize:64,fontWeight:600,color:"#f5c977",lineHeight:1,letterSpacing:"-.04em"}}>{score}</div>
      <div style={{fontFamily:FT.fb,fontSize:11,color:FT.inkMid}}>ingredients locked in</div>
      <div style={{display:"flex",gap:10,marginTop:10}}>
        <button onClick={start} style={{padding:"8px 16px",background:"transparent",color:FT.ink,border:`1px solid ${FT.inkFaint}`,fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Replay</button>
        <button onClick={()=>onComplete&&onComplete(score)} style={{padding:"8px 16px",background:FT.ink,color:FT.bg,border:"none",fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Keep Scrolling</button>
      </div>
    </div>}
  </div>);
}

export default {
  slug: "san-francisco",
  picks: ["State Bird Provisions","La Taqueria","El Farolito","Swan Oyster Depot","Mister Jiu's","Super Duper Burgers","The Saloon","The Dawn Club","Smuggler's Cove","Bourbon Steak","Golden Gate Bridge","SFMOMA","Alcatraz Island","Lands End Trail","Dear San Francisco (Club Fugazi)","Kabuki Springs & Spa","Oracle Park","Dolores Park","Ferry Building Marketplace","Chinatown"],
  game: {
    card: { title: "Mission Burrito", tagline: "Twenty seconds. Tap fast. A palate cleanser." },
    Game,
    comingSoon: { title: "Cable Car Climb", tagline: "Ring the bell. Beat the hill. Thirty seconds." },
  },
  defaults: { neighborhood: "Loop", author: "the fog whisperer" },
  storyboard: [
    { t: "line", text: null },
    { t: "line", text: "San Francisco is a food town that thinks it's a tech town that's actually a fog town. All three are true. Karl rolls in, the city eats, and you figure out the rest. Here's where to start." },
    { t: "pick", i: 0, kicker: "The Pinnacle", imageKey: "fog" },
    { t: "pick", i: 1, kicker: "Mission · The Classic", imageKey: "mission" },
    { t: "pick", i: 2, kicker: "Mission · The Late-Night", imageKey: "mission", override: { body: "The Mission's 2am temple. Super burritos the size of your forearm, carne asada that doesn't quit, and a chile relleno if they've got one. Cash works best. Line moves faster than it looks." } },
    { t: "game" },
    { t: "line", text: "You're going to need a break from the burrito wars. Walk it off up Valencia, or catch a J-Church car and keep going." },
    { t: "pick", i: 3, kicker: "Raw Bar · Since 1912", imageKey: "bay" },
    { t: "pick", i: 4, kicker: "Chinatown · Michelin", imageKey: "chinatown" },
    { t: "blackbook", variant: "match", name: "Luka", neighborhood: "Mission · 0.8mi", preview: "I measure cities by their coastal trails and their late-night taquerias." },
    { t: "pick", i: 5, kicker: "The Burger", imageKey: "warm" },
    { t: "deal", i: 0 },
    { t: "line", text: "The blues didn't start here but The Saloon has been playing them since 1861. You haven't seen San Francisco until you've caught a North Beach band at last call, a little sideways." },
    { t: "pick", i: 6, kicker: "Blues · Since 1861", imageKey: "sunset" },
    { t: "pick", i: 7, kicker: "Live Music · Nightly", imageKey: "painted" },
    { t: "shaw", property: "Slotgenie", tagline: "◆ Adjacent Property", age: "21+", body: "When the fog rolls in and the night calls for a different kind of play. Chips from $6.69, Genie Points cross every SH@W property you're already a member of.", cta: "Open slotgenie.bet" },
    { t: "pick", i: 8, kicker: "Tiki · James Beard", imageKey: "warm" },
    { t: "game2" },
    { t: "pick", i: 9, kicker: "Steakhouse · Four Seasons", imageKey: "warm" },
    { t: "blackbook", variant: "date", name: "Luka", neighborhood: "Mission", venueFromPick: 4, venueFallback: "Mister Jiu's", date: "Thursday 8pm" },
    { t: "line", text: "Tomorrow morning. Coffee at Sightglass, walk across the bridge, then ferry out to The Rock. Cancel whatever else you had planned." },
    { t: "pick", i: 10, kicker: "The Bridge", imageKey: "goldengate" },
    { t: "pick", i: 11, kicker: "Modern Art", imageKey: "painted" },
    { t: "pick", i: 12, kicker: "The Rock · Ferry from Pier 33", imageKey: "bay" },
    { t: "event", i: 0 },
    { t: "pick", i: 13, kicker: "Coast · 3.4 Miles", imageKey: "goldengate" },
    { t: "pick", i: 14, kicker: "SF Stage · Club Fugazi", imageKey: "sunset" },
    { t: "deal", i: 1 },
    { t: "pick", i: 15, kicker: "Japantown · The Soak", imageKey: "fog" },
    { t: "pick", i: 16, kicker: "Oracle · Bayfront Baseball", imageKey: "bay" },
    { t: "line", text: "If you're still with me, you're my kind of traveler. The rest of the directory is below — ${directory.length} restaurants, bars, rooms, and excuses to stay another day through the fog." },
  ],
};
