import { useState, useEffect } from "react";
import { FT } from "../theme";

// Transplanted verbatim from cities/chicago/index.html (was DeepDishDash)
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
      <div style={{fontFamily:FT.fd,fontSize:26,fontWeight:600,color:FT.ink,letterSpacing:"-.02em"}}>Deep Dish Dash</div>
      <div style={{fontFamily:FT.fb,fontSize:12,color:FT.inkMid,textAlign:"center",maxWidth:220,lineHeight:1.5}}>Tap the slices before they cool.<br/>Twenty seconds. One round.</div>
      <button onClick={start} style={{marginTop:8,padding:"10px 22px",background:FT.red,color:"#fff",border:"none",fontFamily:FT.fm,fontSize:11,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Start</button>
    </div>}
    {status==="done"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:"rgba(10,7,5,.88)",zIndex:5}}>
      <div style={{fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",color:FT.inkMid,textTransform:"uppercase"}}>Round Complete</div>
      <div style={{fontFamily:FT.fd,fontSize:64,fontWeight:600,color:"#f5c977",lineHeight:1,letterSpacing:"-.04em"}}>{score}</div>
      <div style={{fontFamily:FT.fb,fontSize:11,color:FT.inkMid}}>slices cleared</div>
      <div style={{display:"flex",gap:10,marginTop:10}}>
        <button onClick={start} style={{padding:"8px 16px",background:"transparent",color:FT.ink,border:`1px solid ${FT.inkFaint}`,fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Replay</button>
        <button onClick={()=>onComplete&&onComplete(score)} style={{padding:"8px 16px",background:FT.ink,color:FT.bg,border:"none",fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Keep Scrolling</button>
      </div>
    </div>}
  </div>);
}

export default {
  slug: "chicago",
  picks: ["Alinea","Lou Malnati's Pizzeria","Pequod's Pizza","Al's #1 Italian Beef","Girl & the Goat","Au Cheval","Kingston Mines","Green Mill Cocktail Lounge","The Violet Hour","Bavette's Bar & Boeuf","Millennium Park","Art Institute of Chicago","Chicago Architecture Center River Cruise","Lakefront Trail","Second City","AIRE Ancient Baths","Wrigley Field","Hopleaf","Big Star","Smyth"],
  game: {
    card: { title: "Deep Dish Dash", tagline: "Twenty seconds. Tap fast. A palate cleanser." },
    Game,
    comingSoon: { title: "El Platform", tagline: "Dodge the doors. Catch the train. Thirty seconds." },
  },
  defaults: { neighborhood: "Loop", author: "the dispatcher" },
  storyboard: [
    { t: "line", text: null },
    { t: "line", text: "Chicago is a food town that thinks it's a music town that's actually an architecture town. All three are true. Here's where to start." },
    { t: "pick", i: 0, kicker: "The Pinnacle", imageKey: "warm" },
    { t: "pick", i: 1, kicker: "Deep Dish · The Classic", imageKey: "deep" },
    { t: "pick", i: 2, kicker: "Deep Dish · The Cult", imageKey: "deep", override: { body: "Caramelized cheese crust deep dish that converts thin-crust loyalists. The crunchy blackened cheese edge is the move — ask for extra crispy and thank me later." } },
    { t: "game" },
    { t: "line", text: "You're going to need a break from the holy wars. Walk it off on Taylor Street." },
    { t: "pick", i: 3, kicker: "Italian Beef · Origin", imageKey: "warm" },
    { t: "pick", i: 4, kicker: "West Loop · Randolph", imageKey: "westloop" },
    { t: "blackbook", variant: "match", name: "Maren", neighborhood: "Logan Square · 1.2mi", preview: "I measure cities by their late-night diners and their early-morning parks." },
    { t: "pick", i: 5, kicker: "The Burger", imageKey: "warm" },
    { t: "deal", i: 0 },
    { t: "line", text: "The blues didn't start here but this is where it grew up. You haven't been to Chicago until you've been to Kingston Mines at 2am." },
    { t: "pick", i: 6, kicker: "Blues · Flagship", imageKey: "blues" },
    { t: "pick", i: 7, kicker: "Jazz · Since 1907", imageKey: "night" },
    { t: "shaw", property: "Slotgenie", tagline: "◆ Adjacent Property", age: "21+", body: "When the night calls for a different kind of play. Chips from $6.69, Genie Points cross every SH@W property you're already a member of.", cta: "Open slotgenie.bet" },
    { t: "pick", i: 8, kicker: "Cocktails · James Beard", imageKey: "night" },
    { t: "game2" },
    { t: "pick", i: 9, kicker: "Steakhouse · Moody", imageKey: "warm" },
    { t: "blackbook", variant: "date", name: "Maren", neighborhood: "West Loop", venueFromPick: 4, venueFallback: "Avec", date: "Thursday 8pm" },
    { t: "line", text: "Tomorrow morning. Coffee at Intelligentsia, walk to the Bean, then a ninety-minute architecture cruise. Cancel whatever else you had planned." },
    { t: "pick", i: 10, kicker: "The Bean", imageKey: "arch" },
    { t: "pick", i: 11, kicker: "Art Institute", imageKey: "arch" },
    { t: "pick", i: 12, kicker: "The River · 90 Minutes", imageKey: "arch" },
    { t: "event", i: 0 },
    { t: "pick", i: 13, kicker: "Lakefront · 18 Miles", imageKey: "lake" },
    { t: "pick", i: 14, kicker: "Comedy · The Origin", imageKey: "night" },
    { t: "deal", i: 1 },
    { t: "pick", i: 15, kicker: "Thermal Baths", imageKey: "warm" },
    { t: "pick", i: 16, kicker: "Wrigley · Baseball Church", imageKey: "park" },
    { t: "line", text: "If you're still with me, you're my kind of traveler. The rest of the directory is below — five hundred restaurants, bars, rooms, and excuses to stay another day." },
  ],
};
