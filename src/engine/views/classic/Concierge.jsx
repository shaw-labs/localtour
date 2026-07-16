// Classic view — concierge chatbot (ported verbatim; chicago index.html ~2325–2449).
// CONCIERGE_NODES at module scope → model.nodes via useCityModel().
import { useEffect, useRef, useState } from "react";
import { useCityModel } from "../../cityModel";

/* ═══ CONCIERGE CHATBOT ═══ */
export function R_Concierge({open, setOpen}) {
  const { CITY, nodes, directory } = useCityModel();
  const [messages, setMessages] = useState([{
    from: 'bot',
    text: nodes[0]?.text || 'Welcome!',
    chips: nodes[0]?.chips || [],
    businesses: []
  }]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({top: scrollRef.current.scrollHeight, behavior: 'smooth'});
  }, [messages]);

  // Lock body scroll when chat is open on mobile
  useEffect(() => {
    if (open && window.innerWidth < 768) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        const y = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, parseInt(y || '0') * -1);
      };
    }
  }, [open]);

  function findResponse(q) {
    const ql = q.toLowerCase().trim();
    let best = null, bs = 0;
    for (const n of nodes) {
      let s = 0;
      for (const k of n.keys) {
        if (ql.includes(k.toLowerCase())) s += k.length;
      }
      if (s > bs) { bs = s; best = n; }
    }
    return best;
  }

  function send(text) {
    if (!text.trim()) return;
    const m = {from: 'user', text: text.trim()};
    const match = findResponse(text);
    const r = match
      ? {from: 'bot', text: match.text, chips: match.chips || [], businesses: match.businesses || []}
      : {from: 'bot', text: "Hmm, not sure about that one. Try asking about food, bars, or things to do.",
         chips: nodes[0]?.chips || [], businesses: []};
    setMessages(p => [...p, m, r]);
    setInput('');
  }

  function gotoBiz(name) {
    const m = directory.find(d => d.name === name);
    if (m) {
      setOpen(false);
      setTimeout(() => {
        const el = document.getElementById(`dir-${m.category}`);
        if (el) el.scrollIntoView({behavior: 'smooth'});
      }, 400);
    }
  }

  return (
    <>
      {/* chat-fab retired — the primary nav's Chat button is the access point */}
      <div className={`chat-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <div className={`chat ${open ? 'open' : ''}`} role="dialog" aria-label="Concierge chat">
        <div className="chat-handle" />
        <div className="chat-head">
          <div className="chat-avatar">🪂</div>
          <div className="chat-meta">
            <div className="n">{CITY.concierge_name || 'Concierge'}</div>
            <div className="c">{CITY.name} · {nodes.length} topics</div>
          </div>
          <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
        <div className="chat-body" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.from}`}>
              <div className="chat-bubble">{msg.text}</div>
              {msg.businesses?.length > 0 && (
                <div className="chat-biz-row">
                  {msg.businesses.map(b => (
                    <button key={b} className="chat-biz" onClick={() => gotoBiz(b)}>
                      📍 {b}
                    </button>
                  ))}
                </div>
              )}
              {msg.chips?.length > 0 && (
                <div className="chat-chips">
                  {msg.chips.map(c => (
                    <button key={c} className="chat-chip" onClick={() => send(c)}>{c}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="chat-foot">
          <input
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(input); }}
            placeholder={`Ask ${CITY.concierge_name || 'the guide'}...`}
          />
          <button className="chat-send" onClick={() => send(input)} aria-label="Send">↑</button>
        </div>
      </div>
    </>
  );
}
