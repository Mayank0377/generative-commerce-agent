import { useState, useRef, useEffect } from 'react'

const CHIPS = [
  { label: '🎙️ Recommend a mic', text: 'I want to buy a microphone' },
  { label: '🪑 Show me chairs', text: 'Show me chairs' },
  { label: '🖥️ Monitors?', text: 'What monitors do you have?' },
  { label: '🎧 Best headphones', text: 'Best headphones?' },
]

function Msg({ text }) {
  const linkRe = /\[[^\]]*\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = linkRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const url = match[1] || match[2];
    
    parts.push(
      <a key={match.index} href={url} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-2 mt-3 mb-1 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 hover:shadow-emerald-500/40 transition-all no-underline">
          💳 Pay via Razorpay ↗
      </a>
    );
    lastIndex = linkRe.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return <>{parts.map((p, i) => typeof p === 'string' ? p.replace(/\*\*/g, '') : p)}</>;
}

export default function App() {
  const [msgs, setMsgs] = useState([
    { from: 'bot', text: "Hi there! 👋 I'm your AI Shopping Agent.\n\nI can help you find products, answer questions, and checkout instantly with Razorpay.\n\nWhat are you looking for today?" },
  ])
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chips, setChips] = useState(true)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  async function send(override) {
    const t = (override || input).trim()
    if (!t || loading) return
    setInput(''); setChips(false)
    setMsgs(p => [...p, { from: 'user', text: t }])
    setLoading(true)
    try {
      const r = await fetch('http://localhost:5000/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: t, history }),
      })
      const d = await r.json()
      if (d.error) setMsgs(p => [...p, { from: 'bot', text: '⚠️ ' + d.error }])
      else { setMsgs(p => [...p, { from: 'bot', text: d.text }]); setHistory(d.history) }
    } catch {
      setMsgs(p => [...p, { from: 'bot', text: "❌ Can't reach the server. Is the backend running on port 5000?" }])
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 flex bg-[#080810] text-white font-['Inter',system-ui,sans-serif] overflow-hidden">

      {/* ═══ SIDEBAR ═══ */}
      <aside className="w-72 shrink-0 h-full bg-[#0f0f1a] border-r border-white/[0.07] flex flex-col p-6 gap-7">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#6C63FF] to-cyan-500 flex items-center justify-center text-xl font-extrabold shadow-lg shadow-[#6C63FF]/25 font-['Outfit',system-ui,sans-serif]">
            S
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent font-['Outfit',system-ui,sans-serif]">
              ShopAgent
            </h1>
            <span className="text-[11px] text-gray-500 uppercase tracking-wider">Razorpay Buildathon</span>
          </div>
        </div>

        {/* Nav */}
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-gray-500 mb-2">Menu</p>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30 cursor-pointer">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            AI Chat
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/[0.04] hover:text-white transition cursor-pointer">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Catalog
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/[0.04] hover:text-white transition cursor-pointer">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Payments
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto p-4 rounded-[14px] bg-[#171730] border border-white/[0.07]">
          <strong className="text-xs text-[#6C63FF] uppercase tracking-wider">Track 01</strong>
          <p className="text-xs text-gray-500 leading-relaxed mt-1.5">AI Growth &amp; Agentic Commerce — this agent searches products and generates Razorpay checkout links autonomously.</p>
        </div>
      </aside>

      {/* ═══ CHAT AREA ═══ */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="shrink-0 flex items-center justify-between px-7 py-5 border-b border-white/[0.07] bg-[#080810]/90 backdrop-blur-xl">
          <div>
            <h2 className="text-[17px] font-semibold font-['Outfit',system-ui,sans-serif]">Shopping Assistant</h2>
            <p className="text-xs text-gray-500 mt-0.5">Powered by Gemini &amp; Razorpay</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400 animate-pulse" />
            Agent Online
          </div>
        </header>

        {/* Messages */}
        <section className="flex-1 overflow-y-auto p-7 flex flex-col gap-5">
          {msgs.map((m, i) => (
            <div key={i} className={`flex flex-col max-w-[72%] animate-[fadeIn_0.2s_ease] ${m.from === 'user' ? 'self-end' : 'self-start'}`}>
              <span className={`text-[11px] font-semibold text-gray-500 mb-1.5 ${m.from === 'user' ? 'text-right' : ''}`}>
                {m.from === 'user' ? 'You' : '🤖 ShopAgent'}
              </span>
              <div className={`px-5 py-4 text-[14.5px] leading-relaxed whitespace-pre-wrap break-words rounded-2xl ${
                m.from === 'user'
                  ? 'bg-gradient-to-br from-[#6C63FF] to-[#4C46C8] text-white rounded-br-sm shadow-lg shadow-[#6C63FF]/20'
                  : 'bg-[#0f0f1a] border border-white/[0.07] text-white rounded-bl-sm shadow-md shadow-black/20'
              }`}>
                <Msg text={m.text} />
              </div>
            </div>
          ))}

          {loading && (
            <div className="self-start flex flex-col max-w-[72%]">
              <span className="text-[11px] font-semibold text-gray-500 mb-1.5">🤖 ShopAgent</span>
              <div className="px-5 py-4 bg-[#0f0f1a] border border-white/[0.07] rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </section>

        {/* Input */}
        <footer className="shrink-0 px-7 pb-6 pt-5 border-t border-white/[0.07] bg-[#080810]/90 backdrop-blur-xl">
          {chips && (
            <div className="flex flex-wrap gap-2 mb-4">
              {CHIPS.map((c, i) => (
                <button key={i} onClick={() => send(c.text)}
                  className="px-4 py-2 rounded-full text-[13px] font-medium text-gray-400 bg-[#171730] border border-white/[0.07] hover:border-[#6C63FF]/40 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 hover:-translate-y-px transition-all cursor-pointer">
                  {c.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 bg-[#0f0f1a] border border-white/[0.07] rounded-[14px] px-5 py-1.5 focus-within:border-[#6C63FF]/40 focus-within:shadow-[0_0_0_3px_rgba(108,99,255,0.18)] transition-all">
            <input
              className="flex-1 bg-transparent border-none outline-none text-white text-[15px] py-3 placeholder:text-gray-600"
              placeholder="Ask me anything — 'I want to buy a mic'..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              disabled={loading}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className="w-11 h-11 rounded-xl bg-[#6C63FF] flex items-center justify-center shrink-0 shadow-lg shadow-[#6C63FF]/25 hover:bg-[#4C46C8] hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
              <svg className="w-[18px] h-[18px] fill-white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
          <p className="text-[11.5px] text-gray-500 text-center mt-3">Tip: Say "I want to buy the microphone" to get an instant Razorpay checkout link.</p>
        </footer>
      </main>

      {/* Ambient glows */}
      <div className="fixed -top-[18%] -left-[8%] w-[44vw] h-[44vw] rounded-full bg-[radial-gradient(circle,rgba(108,99,255,0.12)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="fixed -bottom-[22%] -right-[8%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.08)_0%,transparent_70%)] pointer-events-none z-0" />
    </div>
  )
}
