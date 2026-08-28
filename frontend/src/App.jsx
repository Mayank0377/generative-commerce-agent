import { useState, useRef, useEffect, useCallback } from 'react'

const CHIPS = [
  { label: '🎙️ Recommend a mic', text: 'I want to buy a microphone' },
  { label: '🪑 Show me chairs', text: 'Show me chairs' },
  { label: '🖥️ Monitors?', text: 'What monitors do you have?' },
  { label: '🎧 Best headphones', text: 'Best headphones?' },
  { label: '⌨️ Keyboards', text: 'Show me keyboards' },
  { label: '🔄 Compare products', text: 'I want to compare some products' },
  { label: '🛒 Show my cart', text: 'Show my cart' },
]

/* ─── Toast Notification ─── */
function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const colors = {
    error: 'from-red-500/90 to-red-600/90 border-red-400/30',
    success: 'from-emerald-500/90 to-emerald-600/90 border-emerald-400/30',
    info: 'from-blue-500/90 to-blue-600/90 border-blue-400/30',
  }

  return (
    <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl text-white text-sm font-medium bg-gradient-to-r ${colors[type]} border backdrop-blur-xl shadow-2xl animate-[slideIn_0.3s_ease]`}>
      {type === 'error' && '⚠️ '}{type === 'success' && '✅ '}{type === 'info' && 'ℹ️ '}
      {message}
    </div>
  )
}

/* ─── Markdown Parser ─── */
function parseMarkdown(text) {
  // Bold: **text** or __text__
  let result = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/__(.*?)__/g, '<strong>$1</strong>')
  // Italic: *text* or _text_ (but not inside a bold)
  result = result.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-[#9d97ff] text-[13px] font-mono">$1</code>')
  // Bullet lists: lines starting with * or -
  result = result.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>')
  // Group list items and strip newlines between them to prevent double-spacing with whitespace-pre-wrap
  result = result.replace(/((?:<li>.*?<\/li>\s*)+)/g, (match) => {
    return '<ul class="ml-4 mt-1 mb-1 space-y-0.5 list-disc list-inside text-gray-300">' + match.replace(/\s*\n\s*/g, '') + '</ul>'
  })
  // Markdown tables
  result = parseMarkdownTables(result)
  return result
}

/* ─── Markdown Table Parser ─── */
function parseMarkdownTables(text) {
  const lines = text.split('\n')
  let result = []
  let i = 0
  
  while (i < lines.length) {
    // Detect table: a line with |, followed by a separator line with |---| pattern
    if (i + 1 < lines.length && 
        lines[i].includes('|') && 
        /^\|?[\s\-:|]+\|/.test(lines[i + 1])) {
      
      // Parse header
      const headers = lines[i].split('|').map(h => h.trim()).filter(Boolean)
      i += 2 // skip header and separator
      
      // Parse rows
      const rows = []
      while (i < lines.length && lines[i].includes('|')) {
        const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean)
        if (cells.length > 0) rows.push(cells)
        i++
      }
      
      // Build HTML table
      let tableHtml = '<div class="overflow-x-auto my-3 rounded-xl border border-white/[0.08]"><table class="w-full text-[13px]">'
      tableHtml += '<thead><tr>'
      headers.forEach(h => {
        tableHtml += `<th class="px-4 py-2.5 text-left text-[#9d97ff] font-semibold bg-white/[0.04] border-b border-white/[0.08]">${h}</th>`
      })
      tableHtml += '</tr></thead><tbody>'
      rows.forEach((row, idx) => {
        const bgClass = idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'
        tableHtml += `<tr class="${bgClass}">`
        row.forEach(cell => {
          tableHtml += `<td class="px-4 py-2 text-gray-300 border-b border-white/[0.04]">${cell}</td>`
        })
        tableHtml += '</tr>'
      })
      tableHtml += '</tbody></table></div>'
      result.push(tableHtml)
    } else {
      result.push(lines[i])
      i++
    }
  }
  
  return result.join('\n')
}

/* ─── Product Card (Compact) ─── */
function ProductCard({ product, onClick }) {
  const priceFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)
  const [imgError, setImgError] = useState(false)

  return (
    <div className="my-0.5 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08] shadow-md max-w-[340px] transition-all duration-300 group flex flex-col">
      <div onClick={() => onClick?.(product)} className="flex px-3 pt-3 pb-2 gap-3 cursor-pointer hover:bg-white/[0.05] transition-colors">
        {/* Thumbnail */}
        {product.image && (
          <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden relative border border-white/[0.05]">
            {imgError ? (
              <div className="w-full h-full bg-white/[0.05] flex items-center justify-center text-gray-500 text-xs">No img</div>
            ) : (
              <img src={product.image} alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={() => setImgError(true)} />
            )}
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
function ProductModal({ product, onClose, onBuy, onAddToCart }) {
  const priceFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)
  const images = product.images || (product.image ? [product.image] : [])
  const [imgIdx, setImgIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [imgError, setImgError] = useState(false)

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
            {imgError ? (
              <div className="w-full min-h-[300px] flex items-center justify-center text-gray-500 text-sm">Image unavailable</div>
            ) : (
              <img src={images[imgIdx]} alt={product.name} 
                   className="w-full h-auto max-h-[55vh] object-contain cursor-zoom-in" 
                   onClick={() => setLightbox(true)}
                   onError={() => setImgError(true)} />
            )}
                 
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
          <div className="flex gap-3 flex-wrap">
            {product.paymentLink ? (
              <a href={product.paymentLink} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 hover:shadow-emerald-500/40 transition-all no-underline min-w-[140px]">
                💳 Pay via Razorpay ↗
              </a>
            ) : product.inStock !== false ? (
              <>
                <button onClick={() => { onBuy(product); onClose() }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-semibold text-white bg-gradient-to-r from-[#6C63FF] to-[#4C46C8] shadow-lg shadow-[#6C63FF]/25 hover:-translate-y-0.5 hover:shadow-[#6C63FF]/40 transition-all cursor-pointer min-w-[120px]">
                  🛒 Buy Now
                </button>
                <button onClick={() => { onAddToCart(product); onClose() }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-semibold text-[#9d97ff] bg-[#6C63FF]/10 border border-[#6C63FF]/30 hover:-translate-y-0.5 hover:bg-[#6C63FF]/20 transition-all cursor-pointer min-w-[120px]">
                  + Add to Cart
                </button>
              </>
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

/* ─── Voice Input Hook ─── */
function useVoiceInput(onResult) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onResult(null, 'Voice input is not supported in this browser.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = (e) => {
      setListening(false)
      if (e.error !== 'aborted') onResult(null, `Voice error: ${e.error}`)
    }
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript, null)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [onResult])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { listening, startListening, stopListening }
}

/* ─── Cart Panel ─── */
function CartPanel({ cart, onClose, onCheckout, onRemove }) {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(total)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease]" />
      <div onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[80vh] bg-[#0f0f1a] border border-white/[0.08] rounded-3xl shadow-2xl overflow-y-auto animate-[fadeIn_0.25s_ease]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a4a #0f0f1a' }}>
        
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-['Outfit',system-ui,sans-serif] flex items-center gap-2">
            🛒 Your Cart
          </h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6">
          {cart.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-3">🛒</p>
              <p className="text-gray-400 text-sm">Your cart is empty</p>
              <p className="text-gray-600 text-xs mt-1">Ask me to add products to your cart!</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 mb-5">
                {cart.map((item, i) => {
                  const subtotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price * item.quantity)
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} · {subtotal}</p>
                      </div>
                      <button onClick={() => onRemove(item.productId)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-white/[0.06] pt-4 flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Total</span>
                <span className="text-lg font-bold text-emerald-400">{totalFormatted}</span>
              </div>
              <button onClick={onCheckout}
                className="w-full py-3.5 rounded-xl text-[15px] font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 hover:shadow-emerald-500/40 transition-all cursor-pointer">
                💳 Checkout via Razorpay
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


/* ─── Main App ─── */
export default function App() {
  const [msgs, setMsgs] = useState([
    { from: 'bot', text: "Hi there! 👋 I'm **ShopAgent** — your AI-powered shopping assistant.\n\nHere's what I can do:\n- 🔍 **Search & recommend** products from our catalog\n- 🛒 **Manage your cart** — add, remove, or view items\n- 🔄 **Compare products** side by side\n- 💳 **Instant checkout** via Razorpay\n\nWhat are you looking for today?" },
  ])
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chips, setChips] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [toast, setToast] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cartData, setCartData] = useState({ cart: [], itemCount: 0, total: 0 })
  const [showCart, setShowCart] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const chipsRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  // Horizontal + Infinite Scroll for Suggestion Chips
  useEffect(() => {
    const el = chipsRef.current
    if (!el || !chips) return

    // Jump to middle set on mount
    if (el.scrollLeft === 0) {
      el.scrollLeft = el.scrollWidth / 3
    }

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }

    const handleScroll = () => {
      const singleSetWidth = el.scrollWidth / 3
      if (el.scrollLeft >= singleSetWidth * 2) {
        el.scrollLeft -= singleSetWidth
      } else if (el.scrollLeft <= 0) {
        el.scrollLeft += singleSetWidth
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    el.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('scroll', handleScroll)
    }
  }, [chips])

  // Fetch cart state from backend
  const fetchCart = useCallback(async () => {
    try {
      const r = await fetch('http://localhost:5000/api/cart')
      const d = await r.json()
      setCartData(d)
    } catch { /* silent */ }
  }, [])

  // Clear cart on fresh load (when only welcome message exists) to sync with chat reset
  useEffect(() => { 
    if (msgs.length === 1) {
      fetch('http://localhost:5000/api/cart/clear', { method: 'POST' }).then(() => fetchCart())
    } else {
      fetchCart()
    }
  }, [msgs])
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type })
  }, [])

  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product)
  }, [])

  const handleBuyFromModal = useCallback((product) => {
    send(`I want to buy the ${product.name}`)
  }, [history])

  const handleAddToCartFromModal = useCallback((product) => {
    send(`Add ${product.name} to my cart`)
    showToast(`${product.name} added to cart!`, 'success')
  }, [history])

  const handleVoiceResult = useCallback((transcript, error) => {
    if (error) {
      showToast(error, 'error')
      return
    }
    if (transcript) {
      setInput(transcript)
      // Auto-send after a brief pause so user can see what was transcribed
      setTimeout(() => send(transcript), 300)
    }
  }, [history])

  const { listening, startListening, stopListening } = useVoiceInput(handleVoiceResult)

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
      if (d.error) {
        setMsgs(p => [...p, { from: 'bot', text: '⚠️ ' + d.error }])
        showToast(d.error, 'error')
      }
      else { setMsgs(p => [...p, { from: 'bot', text: d.text }]); setHistory(d.history) }
    } catch {
      setMsgs(p => [...p, { from: 'bot', text: "❌ Can't reach the server. Is the backend running on port 5000?" }])
      showToast("Can't connect to server", 'error')
    } finally { setLoading(false) }
  }

  const NAV = [
    { label: 'AI Chat', active: true, icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { label: 'Catalog', active: false, badge: '5', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
    { label: 'Cart', active: false, badge: cartData.itemCount > 0 ? String(cartData.itemCount) : null, icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
  ]

  return (
    <div className="fixed inset-0 flex bg-[#080810] text-white font-['Inter',system-ui,sans-serif] overflow-hidden">

      {/* Mobile hamburger */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-5 left-5 z-50 w-10 h-10 rounded-xl bg-[#0f0f1a] border border-white/[0.1] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
      </button>

      {/* ═══ SIDEBAR ═══ */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-40 w-72 shrink-0 h-full bg-[#0f0f1a] border-r border-white/[0.07] flex flex-col p-6 gap-7 transition-transform duration-300`}>

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#6C63FF] to-cyan-500 flex items-center justify-center text-xl font-extrabold shadow-lg shadow-[#6C63FF]/25 font-['Outfit',system-ui,sans-serif]">
            S
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent font-['Outfit',system-ui,sans-serif]">
              ShopAgent
            </h1>
            <span className="text-[11px] text-gray-500 uppercase tracking-wider">AI Commerce</span>
          </div>
        </div>

        {/* Nav */}
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-gray-500 mb-2">Menu</p>
          {NAV.map((n, i) => (
            <div key={i} onClick={() => { if (n.label === 'Cart') { setShowCart(true); fetchCart() }; setSidebarOpen(false) }}
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ${
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
            <strong className="text-xs text-[#6C63FF] uppercase tracking-wider">AI Commerce</strong>
          </div>
          <p className="text-[12px] text-gray-400 leading-relaxed">Conversational shopping with AI-powered search, smart cart, product comparison, and instant Razorpay checkout.</p>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ═══ CHAT AREA ═══ */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="shrink-0 flex items-center justify-between px-7 py-3 border-b border-white/[0.07] bg-[#080810]/90 backdrop-blur-xl">
          <div className="ml-12 md:ml-0">
            <h2 className="text-[17px] font-semibold font-['Outfit',system-ui,sans-serif]">Shopping Assistant</h2>
            <p className="text-xs text-gray-500 mt-0.5">Powered by Gemini &amp; Razorpay</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400 animate-pulse" />
            Agent Online
          </div>
        </header>

        {/* Messages */}
        <section className="flex-1 overflow-y-auto px-7 py-4 flex flex-col gap-5 scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a4a #080810' }}>
          {msgs.map((m, i) => (
            <div key={i} className={`flex flex-col animate-[fadeIn_0.3s_ease] ${m.from === 'user' ? 'self-end items-end max-w-[85%] md:max-w-[60%]' : 'self-start items-start max-w-[90%] md:max-w-[520px]'}`}>
              <span className={`text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5`}>
                {m.from === 'user'
                  ? <><span className="w-4 h-4 rounded-full bg-gradient-to-br from-[#6C63FF] to-purple-500 flex items-center justify-center text-[8px] font-bold">Y</span> You</>
                  : <><span className="text-sm">🤖</span> ShopAgent</>
                }
              </span>
              <div className={`px-5 py-3.5 text-[14.5px] leading-relaxed whitespace-pre-wrap break-words ${
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
              <div className="px-5 py-4 bg-[#0f0f1a] border border-white/[0.07] rounded-2xl rounded-bl-sm flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6C63FF] animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-[#6C63FF] animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-[#6C63FF] animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </section>

        {/* Input */}
        <footer className="shrink-0 px-4 md:px-7 pb-2 md:pb-3 pt-2 md:pt-3 border-t border-white/[0.07] bg-[#080810]/90 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto w-full flex flex-col items-center">
            {/* Suggestion chips */}
            <div ref={chipsRef} className={`flex gap-2 mb-2 overflow-x-auto w-full transition-all duration-300 hide-scroll ${chips ? 'opacity-100' : 'opacity-0 h-0 mb-0 overflow-hidden'}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
              <div className="flex gap-2 w-max px-4 mx-auto">
                {[...CHIPS, ...CHIPS, ...CHIPS].map((c, i) => (
                  <button key={i} onClick={() => send(c.text)}
                    className="shrink-0 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium text-gray-400 bg-[#171730] border border-white/[0.07] hover:border-[#6C63FF]/40 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 hover:-translate-y-px hover:shadow-md hover:shadow-[#6C63FF]/10 transition-all cursor-pointer active:scale-95">
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full bg-[#0f0f1a] border border-white/[0.07] rounded-[18px] px-2 md:px-3 py-1 focus-within:border-[#6C63FF]/40 focus-within:shadow-[0_0_0_3px_rgba(108,99,255,0.18)] transition-all">
              {/* Voice button */}
              <button onClick={listening ? stopListening : startListening}
                disabled={loading}
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                  listening 
                    ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/30' 
                    : 'bg-transparent text-gray-500 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10'
                }`}
                title={listening ? "Stop listening" : "Voice input"}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>

              <input
                ref={inputRef}
                className="flex-1 bg-transparent border-none outline-none text-white text-[14.5px] py-2.5 placeholder:text-gray-600"
                placeholder={listening ? "🎙️ Listening..." : "Ask me anything — search, compare, or buy..."}
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                disabled={loading}
              />
              <button onClick={() => send()} disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-[10px] bg-[#6C63FF] flex items-center justify-center shrink-0 shadow-md shadow-[#6C63FF]/20 hover:bg-[#5a52e0] hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95">
                <svg className="w-4 h-4 fill-white translate-x-[-1px]" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
            <p className="text-[11px] text-gray-600 text-center mt-2 w-full">Try: "Compare the mic and headphones" · "Add the keyboard to my cart"</p>
          </div>
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
          onAddToCart={handleAddToCartFromModal}
        />
      )}
      {/* Cart Panel */}
      {showCart && (
        <CartPanel
          cart={cartData.cart || []}
          onClose={() => setShowCart(false)}
          onCheckout={() => { setShowCart(false); send('Checkout my cart') }}
          onRemove={(productId) => { send(`Remove product ${productId} from my cart`); setTimeout(fetchCart, 1500) }}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
