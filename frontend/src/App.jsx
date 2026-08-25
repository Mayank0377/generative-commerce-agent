import { useState, useRef, useEffect, useCallback } from 'react'

const CHIPS = [
  { label: '🎙️ Recommend a mic', text: 'I want to buy a microphone' },
  { label: '🪑 Show me chairs', text: 'Show me chairs' },
  { label: '🖥️ Monitors?', text: 'What monitors do you have?' },
  { label: '🎧 Best headphones', text: 'Best headphones?' },
  { label: '⌨️ Keyboards', text: 'Show me keyboards' },
]

/* ─── Markdown Parser ─── */
function parseMarkdown(text) {
  // Bold: **text** or __text__
  let result = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/__(.*?)__/g, '<strong>$1</strong>')
  // Italic: *text* or _text_ (but not inside a bold)
  result = result.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  // Bullet lists: lines starting with * or -
  result = result.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>')
  result = result.replace(/((<li>.*<\/li>\s*)+)/g, '<ul class="ml-4 mt-1 mb-1 space-y-0.5 list-disc list-inside text-gray-300">$1</ul>')
  return result
}

/* ─── Product Card (Compact) ─── */
function ProductCard({ product, onClick }) {
  const priceFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)
  return (
    <div className="my-0.5 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08] shadow-md max-w-[340px] transition-all duration-300 group flex flex-col">
      <div onClick={() => onClick?.(product)} className="flex px-3 pt-3 pb-2 gap-3 cursor-pointer hover:bg-white/[0.05] transition-colors">
        {/* Thumbnail */}
        {product.image && (
          <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden relative border border-white/[0.05]">
            <img src={product.image} alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            {product.inStock === false && (
              <div className="absolute inset-0 bg-black/60" />
            )}
          </div>
        )}
        {/* Info */}
        <div className="flex flex-col justify-center min-w-0 flex-1 py-1">
          <h4 className="font-semibold text-[14px] text-white leading-snug group-hover:text-[#9d97ff] transition-colors truncate">{product.name}</h4>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[14px] font-bold text-emerald-400">{priceFormatted}</span>
            {product.inStock === false
              ? <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded font-medium">Out of Stock</span>
              : <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">In Stock</span>
            }
          </div>
          {product.category && (
            <span className="inline-block mt-2 text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{product.category}</span>
          )}
        </div>
        {/* Arrow */}
        <div className="flex items-center text-gray-600 group-hover:text-[#6C63FF] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>
      
      {/* Direct Payment Button */}
      {product.paymentLink && (
        <div className="px-3 pb-3 pt-1">
          <div className="border-t border-white/[0.06] mb-2.5" />
          <a href={product.paymentLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[14px] font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 hover:shadow-emerald-500/40 transition-all no-underline">
            💳 Pay via Razorpay ↗
          </a>
        </div>
      )}
    </div>
  )
}

function Lightbox({ images, initialIdx, onClose }) {
  const [idx, setIdx] = useState(initialIdx)
  
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])
  
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length) }
  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length) }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-[fadeIn_0.2s_ease]" onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-6 z-10 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 backdrop-blur transition-all">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={next} className="absolute right-6 z-10 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 backdrop-blur transition-all">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </>
      )}
      
      <img src={images[idx]} alt="" className="w-full h-full object-contain max-w-5xl pointer-events-none" />
      
      {images.length > 1 && (
        <div className="absolute bottom-6 flex gap-2" onClick={e => e.stopPropagation()}>
          {images.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === idx ? 'bg-white scale-125 shadow-[0_0_8px_white]' : 'bg-white/30 hover:bg-white/60'}`} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Product Detail Modal (E-commerce style) ─── */
function ProductModal({ product, onClose, onBuy }) {
  const priceFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)
  const images = product.images || (product.image ? [product.image] : [])
  const [imgIdx, setImgIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && !lightbox) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, lightbox])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease]" />

      <div onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#0f0f1a] border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/50 overflow-y-auto animate-[fadeIn_0.25s_ease]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a4a #0f0f1a' }}>

        {/* Close button */}
        <button onClick={onClose}
          className="sticky top-4 float-right mr-4 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/70 transition-all cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        {/* Hero image Carousel */}
        {images.length > 0 && (
          <div className="w-full relative -mt-9 flex flex-col group/hero min-h-[300px] bg-[#080810]/50">
            <img src={images[imgIdx]} alt={product.name} 
                 className="w-full h-auto max-h-[55vh] object-contain cursor-zoom-in" 
                 onClick={() => setLightbox(true)} />
                 
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length) }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity backdrop-blur hover:bg-black/70">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length) }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity backdrop-blur hover:bg-black/70">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
                
                <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 z-30 flex gap-2">
                  {images.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setImgIdx(i) }}
                      className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? 'bg-white scale-125 shadow-md' : 'bg-white/40 hover:bg-white/80'}`} />
                  ))}
                </div>
              </>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute top-4 left-4 z-30">
              {product.inStock !== false ? (
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> In Stock
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold backdrop-blur-sm">Out of Stock</span>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-7 pb-7 pt-1">
          {/* Title & Price row */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="text-xl font-bold text-white leading-tight font-['Outfit',system-ui,sans-serif]">{product.name}</h3>
              {product.category && (
                <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-[#6C63FF]/10 text-[#9d97ff] text-[11px] font-semibold uppercase tracking-wider">
                  {product.category}
                </span>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-bold text-emerald-400">{priceFormatted}</span>
              <p className="text-[11px] text-gray-500 mt-0.5">Inclusive of all taxes</p>
            </div>
          </div>

          <div className="border-t border-white/[0.06] my-5" />

          {/* Description */}
          {product.description && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                About this product
              </h4>
              <p className="text-[14px] text-gray-400 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Highlights */}
          {product.highlights && product.highlights.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Key Highlights
              </h4>
              <div className="grid gap-2">
                {product.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[13px] text-gray-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6C63FF] shrink-0" />
                    {h}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifications */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                Specifications
              </h4>
              <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                {Object.entries(product.specs).map(([key, value], i) => (
                  <div key={i} className={`flex items-center text-[13px] ${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}`}>
                    <span className="w-40 shrink-0 px-4 py-2.5 text-gray-500 font-medium">{key}</span>
                    <span className="px-4 py-2.5 text-gray-300">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-white/[0.06] my-5" />

          {/* Action buttons */}
          <div className="flex gap-3">
            {product.paymentLink ? (
              <a href={product.paymentLink} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 hover:shadow-emerald-500/40 transition-all no-underline">
                💳 Pay via Razorpay ↗
              </a>
            ) : product.inStock !== false ? (
              <button onClick={() => { onBuy(product); onClose() }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-semibold text-white bg-gradient-to-r from-[#6C63FF] to-[#4C46C8] shadow-lg shadow-[#6C63FF]/25 hover:-translate-y-0.5 hover:shadow-[#6C63FF]/40 transition-all cursor-pointer">
                🛒 Buy This Product
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-semibold text-gray-500 bg-white/[0.04] border border-white/[0.06] cursor-not-allowed">
                Currently Unavailable
              </div>
            )}
            <button onClick={onClose}
              className="px-6 py-3.5 rounded-xl text-[15px] font-medium text-gray-400 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer">
              Close
            </button>
          </div>
        </div>
      </div>
      
      {lightbox && <Lightbox images={images} initialIdx={imgIdx} onClose={() => setLightbox(false)} />}
    </div>
  )
}

/* ─── Message Content Renderer ─── */
function Msg({ text, onProductClick }) {
  // 1. Try to detect structured product JSON blocks: ```json ... ```
  const jsonBlockRe = /```json\s*([\s\S]*?)```/g
  const hasJson = jsonBlockRe.test(text)
  jsonBlockRe.lastIndex = 0 // reset

  if (hasJson) {
    const segments = []
    let lastIdx = 0
    let m
    while ((m = jsonBlockRe.exec(text)) !== null) {
      if (m.index > lastIdx) {
        segments.push({ type: 'text', content: text.substring(lastIdx, m.index) })
      }
      try {
        const parsed = JSON.parse(m[1])
        const products = Array.isArray(parsed) ? parsed : (parsed.products || [parsed])
        segments.push({ type: 'products', content: products })
      } catch {
        segments.push({ type: 'text', content: m[1] })
      }
      lastIdx = jsonBlockRe.lastIndex
    }
    if (lastIdx < text.length) {
      segments.push({ type: 'text', content: text.substring(lastIdx) })
    }
    return (
      <div className="flex flex-col gap-1.5 max-w-[340px]">
        {segments.map((seg, i) => {
          if (seg.type === 'products') {
            return seg.content.map((p, j) => <ProductCard key={`${i}-${j}`} product={p} onClick={onProductClick} />)
          }
          return <div key={i} className="text-[14px] text-gray-300 px-1"><RichText text={seg.content} /></div>
        })}
      </div>
    )
  }

  // 2. Fallback: regular text with markdown + link parsing
  return <RichText text={text} />

}

function RichText({ text }) {
  const trimmed = text.trim()
  if (!trimmed) return null
  
  return <span dangerouslySetInnerHTML={{ __html: parseMarkdown(trimmed) }} />
}


/* ─── Main App ─── */
export default function App() {
  const [msgs, setMsgs] = useState([
    { from: 'bot', text: "Hi there! 👋 I'm your **AI Shopping Agent**.\n\nI can help you find products, answer questions, and checkout instantly with Razorpay.\n\nWhat are you looking for today?" },
  ])
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chips, setChips] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product)
  }, [])

  const handleBuyFromModal = useCallback((product) => {
    send(`I want to buy the ${product.name}`)
  }, [history])
  useEffect(() => { inputRef.current?.focus() }, [loading])

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

  const NAV = [
    { label: 'AI Chat', active: true, icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { label: 'Catalog', active: false, badge: '5', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
    { label: 'Payments', active: false, icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  ]

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
          {NAV.map((n, i) => (
            <div key={i} className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ${
              n.active
                ? 'bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30 shadow-sm shadow-[#6C63FF]/10'
                : 'text-gray-400 border border-transparent hover:bg-white/[0.04] hover:text-white hover:border-white/[0.06]'
            }`}>
              <span className={`transition-transform duration-200 ${n.active ? '' : 'group-hover:scale-110'}`}>{n.icon}</span>
              {n.label}
              {n.badge && (
                <span className={`ml-auto text-[11px] font-bold rounded-md px-2 py-0.5 ${
                  n.active ? 'bg-[#6C63FF]/25 text-[#9d97ff]' : 'bg-white/[0.06] text-gray-500 group-hover:bg-white/[0.1] group-hover:text-gray-300'
                }`}>
                  {n.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-[#171730] to-[#12122a] border border-white/[0.07] backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#6C63FF] shadow-[0_0_8px] shadow-[#6C63FF]/50" />
            <strong className="text-xs text-[#6C63FF] uppercase tracking-wider">Track 01</strong>
          </div>
          <p className="text-[12px] text-gray-400 leading-relaxed">AI Growth &amp; Agentic Commerce — this agent searches products and generates Razorpay checkout links autonomously.</p>
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
        <section className="flex-1 overflow-y-auto p-7 flex flex-col gap-5 scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a4a #080810' }}>
          {msgs.map((m, i) => (
            <div key={i} className={`flex flex-col max-w-[75%] animate-[fadeIn_0.3s_ease] ${m.from === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
              <span className={`text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5`}>
                {m.from === 'user'
                  ? <><span className="w-4 h-4 rounded-full bg-gradient-to-br from-[#6C63FF] to-purple-500 flex items-center justify-center text-[8px] font-bold">Y</span> You</>
                  : <><span className="text-sm">🤖</span> ShopAgent</>
                }
              </span>
              <div className={`px-5 py-4 text-[14.5px] leading-relaxed whitespace-pre-wrap break-words ${
                m.from === 'user'
                  ? 'bg-gradient-to-br from-[#6C63FF] to-[#4C46C8] text-white rounded-2xl rounded-br-sm shadow-lg shadow-[#6C63FF]/20'
                  : 'bg-[#0f0f1a] border border-white/[0.07] text-gray-200 rounded-2xl rounded-bl-sm shadow-md shadow-black/20'
              }`}>
                <Msg text={m.text} onProductClick={handleProductClick} />
              </div>
            </div>
          ))}

          {loading && (
            <div className="self-start flex flex-col max-w-[75%] animate-[fadeIn_0.3s_ease]">
              <span className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                <span className="text-sm">🤖</span> ShopAgent
              </span>
              <div className="px-5 py-4 bg-[#0f0f1a] border border-white/[0.07] rounded-2xl rounded-bl-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6C63FF] animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-[#6C63FF] animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-[#6C63FF] animate-bounce [animation-delay:300ms]" />
                <span className="text-xs text-gray-500 ml-2">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </section>

        {/* Input */}
        <footer className="shrink-0 px-7 pb-6 pt-5 border-t border-white/[0.07] bg-[#080810]/90 backdrop-blur-xl">
          {/* Suggestion chips — always visible after initial message */}
          <div className={`flex flex-wrap gap-2 mb-4 transition-all duration-300 ${chips ? 'opacity-100' : 'opacity-0 h-0 mb-0 overflow-hidden'}`}>
            {CHIPS.map((c, i) => (
              <button key={i} onClick={() => send(c.text)}
                className="px-4 py-2 rounded-full text-[13px] font-medium text-gray-400 bg-[#171730] border border-white/[0.07] hover:border-[#6C63FF]/40 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 hover:-translate-y-px hover:shadow-md hover:shadow-[#6C63FF]/10 transition-all cursor-pointer active:scale-95">
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 bg-[#0f0f1a] border border-white/[0.07] rounded-2xl px-5 py-1.5 focus-within:border-[#6C63FF]/40 focus-within:shadow-[0_0_0_3px_rgba(108,99,255,0.18)] transition-all">
            <input
              ref={inputRef}
              className="flex-1 bg-transparent border-none outline-none text-white text-[15px] py-3 placeholder:text-gray-600"
              placeholder="Ask me anything — 'I want to buy a mic'..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              disabled={loading}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className="w-11 h-11 rounded-xl bg-[#6C63FF] flex items-center justify-center shrink-0 shadow-lg shadow-[#6C63FF]/25 hover:bg-[#5a52e0] hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95">
              <svg className="w-[18px] h-[18px] fill-white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
          <p className="text-[11.5px] text-gray-600 text-center mt-3">Tip: Say "I want to buy the microphone" to get an instant Razorpay checkout link.</p>
        </footer>
      </main>

      {/* Ambient glows */}
      <div className="fixed -top-[18%] -left-[8%] w-[44vw] h-[44vw] rounded-full bg-[radial-gradient(circle,rgba(108,99,255,0.12)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="fixed -bottom-[22%] -right-[8%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.08)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuy={handleBuyFromModal}
        />
      )}
    </div>
  )
}
