// LocalTour engine — Feed concierge modal + FAB (transplanted verbatim from the
// inline apps; chicago index.html ~3002–3048; see docs/WS1_PORT_CONTRACTS.md).
// The keyword-matching logic ports as-is (WS5 unifies later).
import { useState, useEffect, useRef } from "react";
import { FT } from "../../theme";
import { useCityModel } from "../../cityModel";

export function FeedConciergeModal({open,onClose}){
  const{CITY,nodes,byName}=useCityModel();
  const[msgs,setMsgs]=useState([{from:"bot",text:CITY.concierge_greeting,chips:nodes[0]?.chips||[]}]);
  const[input,setInput]=useState("");
  const feedRef=useRef(null);
  useEffect(()=>{if(feedRef.current)feedRef.current.scrollTop=feedRef.current.scrollHeight;},[msgs]);
  const ask=q=>{
    if(!q.trim())return;
    const lower=q.toLowerCase();
    const match=nodes.find(n=>n.keys.some(k=>lower.includes(k)))||nodes[0];
    const bizList=(match.businesses||[]).map(n=>byName[n]).filter(Boolean);
    setMsgs(m=>[...m,{from:"me",text:q},{from:"bot",text:match.text,chips:match.chips||[],businesses:bizList}]);
    setInput("");
  };
  if(!open)return null;
  return(<div style={{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(6px)"}}/>
    <div style={{position:"relative",width:"100%",maxWidth:520,height:"85vh",background:FT.bg,borderTop:`1px solid ${FT.line}`,borderLeft:`1px solid ${FT.line}`,borderRight:`1px solid ${FT.line}`,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 20px",borderBottom:`1px solid ${FT.line}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:FT.fm,fontSize:9,letterSpacing:".3em",color:FT.green,textTransform:"uppercase",marginBottom:2}}>● Online</div>
          <div style={{fontFamily:FT.fd,fontSize:18,color:FT.ink,letterSpacing:"-.01em"}}>{CITY.concierge_name||"Concierge"}</div>
        </div>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:FT.inkMid,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
      </div>
      <div ref={feedRef} style={{flex:1,overflowY:"auto",padding:"18px 20px",display:"flex",flexDirection:"column",gap:14}}>
        {msgs.map((m,i)=><div key={i} style={{alignSelf:m.from==="me"?"flex-end":"flex-start",maxWidth:"85%"}}>
          <div style={{padding:"12px 14px",background:m.from==="me"?FT.ink:FT.surf,color:m.from==="me"?FT.bg:FT.ink,fontFamily:FT.fb,fontSize:14,lineHeight:1.55,border:m.from==="bot"?`1px solid ${FT.line}`:"none"}}>{m.text}</div>
          {m.businesses&&m.businesses.length>0&&<div style={{marginTop:8,display:"flex",flexDirection:"column",gap:8}}>
            {m.businesses.slice(0,4).map(b=><a key={b.name} href={b.website||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address+" "+b.name)}`} target="_blank" rel="noopener" style={{padding:"10px 12px",background:FT.bg,border:`1px solid ${FT.line}`,textDecoration:"none",display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:10}}>
              <span style={{fontFamily:FT.fd,fontSize:14,color:FT.ink}}>{b.name}</span>
              <span style={{fontFamily:FT.fm,fontSize:10,color:FT.gold,letterSpacing:".1em",flexShrink:0}}>{b.rating?`★ ${b.rating}`:""}</span>
            </a>)}
          </div>}
          {m.chips&&m.chips.length>0&&<div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:6}}>{m.chips.map(c=><button key={c} onClick={()=>ask(c)} style={{padding:"6px 10px",background:"transparent",color:FT.inkMid,border:`1px solid ${FT.inkFaint}`,fontFamily:FT.fm,fontSize:10,letterSpacing:".1em",cursor:"pointer",textTransform:"uppercase"}}>{c}</button>)}</div>}
        </div>)}
      </div>
      <div style={{padding:"14px 20px",borderTop:`1px solid ${FT.line}`,display:"flex",gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")ask(input);}} placeholder={`Ask ${CITY.concierge_name||"the guide"}…`} style={{flex:1,padding:"12px 14px",background:FT.surf,color:FT.ink,border:`1px solid ${FT.line}`,fontFamily:FT.fb,fontSize:14,outline:"none"}}/>
        <button onClick={()=>ask(input)} style={{padding:"0 18px",background:FT.red,color:FT.ink,border:"none",fontFamily:FT.fm,fontSize:10,letterSpacing:".2em",textTransform:"uppercase",cursor:"pointer"}}>Send</button>
      </div>
    </div>
  </div>);
}

export function FeedConciergeFAB({onClick}){return(<button onClick={onClick} style={{position:"fixed",bottom:20,right:20,zIndex:60,width:56,height:56,borderRadius:"50%",background:FT.red,color:FT.ink,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 24px rgba(179,19,31,.4)"}}>
  <span style={{fontFamily:FT.fd,fontSize:22,fontWeight:600,lineHeight:1}}>?</span>
</button>);}
