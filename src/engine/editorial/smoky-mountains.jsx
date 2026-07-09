import { useState, useEffect } from "react";
import { FT } from "../theme";

// Transplanted verbatim from cities/smoky-mountains/index.html (was PancakeStack)
function Game({onComplete}){
  const[status,setStatus]=useState("idle");const[time,setTime]=useState(20);const[score,setScore]=useState(0);const[cakes,setCakes]=useState([]);
  useEffect(()=>{if(status!=="playing")return;const t=setInterval(()=>setTime(n=>{if(n<=1){setStatus("done");return 0;}return n-1;}),1000);return()=>clearInterval(t);},[status]);
  useEffect(()=>{if(status!=="playing")return;const sp=setInterval(()=>{const id=Math.random().toString(36).slice(2);const x=8+Math.random()*78,y=12+Math.random()*72;setCakes(s=>[...s,{id,x,y}]);setTimeout(()=>setCakes(s=>s.filter(sl=>sl.id!==id)),1400);},650);return()=>clearInterval(sp);},[status]);
  const tap=id=>{setCakes(s=>s.filter(sl=>sl.id!==id));setScore(n=>n+1);};
  const start=()=>{setStatus("playing");setTime(20);setScore(0);setCakes([]);};
  return(<div style={{position:"relative",width:"100%",height:360,background:"radial-gradient(ellipse at 30% 20%,#1a1208 0%,#080502 70%)",overflow:"hidden",borderTop:`1px solid ${FT.line}`,borderBottom:`1px solid ${FT.line}`}}>
    <div style={{position:"absolute",top:12,left:14,right:14,display:"flex",justifyContent:"space-between",fontFamily:FT.fm,fontSize:10,letterSpacing:".14em",color:FT.leatherInk,textTransform:"uppercase",zIndex:3}}>
      <span>stacked · {String(score).padStart(2,"0")}</span>
      <span style={{color:time<=5?FT.redLight:FT.leatherInk}}>{String(time).padStart(2,"0")}s</span>
    </div>
    {status==="playing"&&cakes.map(s=><button key={s.id} onClick={()=>tap(s.id)} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:54,height:54,background:"none",border:"none",cursor:"pointer",padding:0,animation:"dd-pop 1.4s ease-out forwards"}} aria-label="Tap">
      <svg viewBox="0 0 54 54" width="54" height="54">
        <defs><radialGradient id={`g${s.id}`} cx=".4" cy=".35"><stop offset="0%" stopColor="#f5d089"/><stop offset="55%" stopColor="#c89b3c"/><stop offset="100%" stopColor="#5a3a1a"/></radialGradient></defs>
        <ellipse cx="27" cy="32" rx="22" ry="7" fill="#3a2410"/>
        <ellipse cx="27" cy="29" rx="22" ry="9" fill={`url(#g${s.id})`} stroke="#5a3a1a" strokeWidth="1.2"/>
        <ellipse cx="27" cy="22" rx="20" ry="7" fill="#e8b864" stroke="#8a5a2a" strokeWidth="1"/>
        <rect x="22" y="16" width="10" height="6" rx="1.5" fill="#fae098" stroke="#c89b3c" strokeWidth=".8"/>
        <path d="M 14 22 Q 16 28 14 32" stroke="#8a4a14" strokeWidth="1.6" fill="none" opacity=".75"/>
        <path d="M 38 24 Q 40 30 39 34" stroke="#8a4a14" strokeWidth="1.6" fill="none" opacity=".75"/>
      </svg>
    </button>)}
    {status==="idle"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,zIndex:4}}>
      <div style={{fontFamily:FT.fd,fontSize:26,fontWeight:600,color:FT.ink,letterSpacing:"-.02em"}}>Pancake Stack</div>
      <div style={{fontFamily:FT.fb,fontSize:12,color:FT.inkMid,textAlign:"center",maxWidth:240,lineHeight:1.5}}>Tap the pancakes before they slide off the griddle.<br/>Twenty seconds. One stack.</div>
      <button onClick={start} style={{marginTop:8,padding:"10px 22px",background:FT.red,color:"#fff",border:"none",fontFamily:FT.fm,fontSize:11,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Start</button>
    </div>}
    {status==="done"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:"rgba(8,5,2,.88)",zIndex:5}}>
      <div style={{fontFamily:FT.fm,fontSize:10,letterSpacing:".24em",color:FT.inkMid,textTransform:"uppercase"}}>Round Complete</div>
      <div style={{fontFamily:FT.fd,fontSize:64,fontWeight:600,color:"#f5c977",lineHeight:1,letterSpacing:"-.04em"}}>{score}</div>
      <div style={{fontFamily:FT.fb,fontSize:11,color:FT.inkMid}}>pancakes stacked</div>
      <div style={{display:"flex",gap:10,marginTop:10}}>
        <button onClick={start} style={{padding:"8px 16px",background:"transparent",color:FT.ink,border:`1px solid ${FT.inkFaint}`,fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Replay</button>
        <button onClick={()=>onComplete&&onComplete(score)} style={{padding:"8px 16px",background:FT.ink,color:FT.bg,border:"none",fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Keep Scrolling</button>
      </div>
    </div>}
  </div>);
}

export default {
  slug: "smoky-mountains",
  picks: ["The Peddler Steakhouse","Pancake Pantry","The Donut Friar","Huck Finn's Catfish","The Greenbrier Restaurant","Tom and Earl's Back Alley Grill","Ole Smoky Moonshine Distillery - The Holler","Sugarlands Distilling Co.","Crystelle Creek Restaurant & Grill","Great Smoky Mountains National Park","Cades Cove","Anakeesta","Gatlinburg SkyLift Park","Dollywood Theme Park","Loco Burro Fresh Mex Cantina","Peter Kern Library","J.C. Holdway","The Old Mill Restaurant","Dolly Parton's Stampede","Dollywood's DreamMore Resort and Spa"],
  game: {
    card: { title: "Pancake Stack", tagline: "Twenty seconds. Tap the cakes off the griddle. Pancake Pantry warm-up." },
    Game,
    comingSoon: { title: "Bear Spotter", tagline: "Tap the bear in Cades Cove before it ducks back into the brush." },
  },
  defaults: { neighborhood: "Loop", author: "the ridge runner" },
  storyboard: [
    { t: "line", text: null },
    { t: "line", text: "The Smokies are a national park town, a Dolly Parton town, and a moonshine town all stacked on top of each other. Most folks pick one and miss the other two. Don't be most folks." },
    { t: "pick", i: 0, kicker: "The Pinnacle", imageKey: "warm" },
    { t: "pick", i: 1, kicker: "Pancakes · Since 1960", imageKey: "warm" },
    { t: "pick", i: 2, kicker: "Cinnamon Bread · 1969", imageKey: "warm" },
    { t: "game" },
    { t: "line", text: "If the line at Pancake Pantry breaks you, swap one tourist queue for another. The catfish hits and the bill won't." },
    { t: "pick", i: 3, kicker: "Catfish · All You Can", imageKey: "warm" },
    { t: "pick", i: 4, kicker: "Hidden · Duck Breast", imageKey: "park" },
    { t: "blackbook", variant: "match", name: "Hollis", neighborhood: "Knoxville · Old City", preview: "I judge a town by its first-grist mills and its last-call moonshine. The Smokies have both, mostly within walking distance of each other." },
    { t: "pick", i: 5, kicker: "Locals' Bar · Off-Parkway", imageKey: "warm" },
    { t: "deal", i: 0 },
    { t: "line", text: "Now we drink. Sugarlands has a back bar that nobody on the Parkway knows about. Ole Smoky has live music every night and twenty flavors for five bucks. Pace yourself." },
    { t: "pick", i: 6, kicker: "Moonshine · Most Visited in America", imageKey: "warm" },
    { t: "pick", i: 7, kicker: "Back Bar · The Open Secret", imageKey: "warm" },
    { t: "shaw", property: "Slotgenie", tagline: "◆ Adjacent Property", age: "21+", body: "When the cabin's locked in and the moonshine's open. Chips from $6.69, Genie Points cross every SH@W property — same login, same balance.", cta: "Open slotgenie.bet" },
    { t: "pick", i: 8, kicker: "Creekside · Nashville Prime Rib", imageKey: "warm" },
    { t: "game2" },
    { t: "blackbook", variant: "date", name: "Hollis", neighborhood: "Gatlinburg", venueFromPick: 8, venueFallback: "Crystelle Creek", date: "Saturday 7pm" },
    { t: "line", text: "Tomorrow morning. Be in Cades Cove by sunrise — the loop is empty for the first hour. Then drive Newfound Gap. Then walk to a waterfall. The mountains are why you came." },
    { t: "pick", i: 9, kicker: "The Park · 850 Miles of Trail", imageKey: "park" },
    { t: "pick", i: 10, kicker: "Cades Cove · Sunrise", imageKey: "park" },
    { t: "pick", i: 11, kicker: "Chondola · Cliff Top Bar", imageKey: "park" },
    { t: "event", i: 0 },
    { t: "pick", i: 12, kicker: "Glass Floor · The SkyBridge", imageKey: "park" },
    { t: "pick", i: 13, kicker: "Dollywood · The Anchor", imageKey: "warm" },
    { t: "deal", i: 1 },
    { t: "pick", i: 14, kicker: "Rooftop · The Mechanical Donkey", imageKey: "warm" },
    { t: "pick", i: 15, kicker: "Speakeasy · Knoxville", imageKey: "night" },
    { t: "pick", i: 16, kicker: "James Beard · The Knoxville Pick", imageKey: "warm" },
    { t: "pick", i: 17, kicker: "1830 Grist Mill", imageKey: "warm" },
    { t: "pick", i: 18, kicker: "Dinner Show · Eat With Your Hands", imageKey: "warm" },
    { t: "pick", i: 19, kicker: "Where to Sleep · Park Perks", imageKey: "warm" },
    { t: "line", text: "If you're still scrolling, you're my kind of traveler. The full directory's below — every brewery, cabin, ridge trail, and pancake house I could verify. Stay another day." },
  ],
};
