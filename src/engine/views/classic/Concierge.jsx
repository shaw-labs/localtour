// Classic view — concierge chatbot (WS5 hybrid brain).
// Layer 1: scored keyword nodes (shared scorer). Layer 2: below-confidence
// queries hit /api/concierge — Claude grounded in this city's graph, validated
// server-side — falling back to the best keyword node on any failure.
import { useEffect, useRef, useState } from "react";
import { useCityModel } from "../../cityModel";
import { scoreNodes, askConcierge } from "../../conciergeBrain";

/* ═══ CONCIERGE CHATBOT ═══ */
export function R_Concierge({open, setOpen}) {
  const { CITY, slug, nodes, directory } = useCityModel();
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

  function nodeReply(node) {
    return node
      ? {from: 'bot', text: node.text, chips: node.chips || [], businesses: node.businesses || []}
      : {from: 'bot', text: "Hmm, not sure about that one. Try asking about food, bars, or things to do.",
         chips: nodes[0]?.chips || [], businesses: []};
  }

  async function send(text) {
    if (!text.trim()) return;
    const q = text.trim();
    setInput('');
    const { node, score, confident } = scoreNodes(q, nodes);
    if (confident) {
      setMessages(p => [...p, {from: 'user', text: q}, nodeReply(node)]);
      return;
    }
    // Layer 2 — typing beat while Claude checks the city's own graph
    setMessages(p => [...p, {from: 'user', text: q}, {from: 'bot', typing: true, text: '…', chips: [], businesses: []}]);
    const ai = await askConcierge(slug, q);
    setMessages(p => {
      const out = p.slice(0, -1); // replace the typing bubble
      if (ai && ai.source === 'ai' && ai.text) {
        // picks are server-validated directory names — classic renders name lists
        out.push({from: 'bot', text: ai.text, chips: [], businesses: (ai.picks || []).map(x => x.name)});
      } else {
        out.push(nodeReply(score > 0 ? node : null));
      }
      return out;
    });
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
