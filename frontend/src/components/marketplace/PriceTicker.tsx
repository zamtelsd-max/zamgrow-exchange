import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { getLivePrices, getPriceSource } from '../../services/liveprices'
import type { PriceData } from '../../types'
import { MOCK_PRICE_DATA } from '../../services/mockData'
import clsx from 'clsx'

const CROP_EMOJIS: Record<string, string> = {
  maize: '🌽', 'maize-meal': '🌾', 'maize-breakfast': '🌾', 'maize-roller': '🌾',
  soya: '🫘', beans: '🫘', 'beans-dry': '🫘', groundnuts: '🥜',
  kapenta: '🐟', 'bream-dry': '🐟', 'fish-dry': '🐟', 'fish-fresh': '🐠',
  rice: '🍚', 'rice-local': '🍚', wheat: '🌾', cassava: '🍠',
  tomatoes: '🍅', onions: '🧅', sunflower: '🌻', cotton: '🌿',
  meat: '🥩', eggs: '🥚', milk: '🥛', sugar: '🍬', salt: '🧂',
  sorghum: '🌾', millet: '🌾', rape: '🥬', bananas: '🍌',
  'sweet-potato': '🍠', 'oil-local': '🫙', 'oil-import': '🫙', soy: '🫘',
}

function getEmoji(productId: string, product: string): string {
  const id = (productId || '').toLowerCase()
  const name = (product || '').toLowerCase()
  if (CROP_EMOJIS[id]) return CROP_EMOJIS[id]
  for (const [key, emoji] of Object.entries(CROP_EMOJIS)) {
    if (id.includes(key) || name.includes(key)) return emoji
  }
  return '🌿'
}

export default function PriceTicker() {
  const [prices, setPrices] = useState<PriceData[]>(MOCK_PRICE_DATA)
  const [isLive, setIsLive] = useState(false)
  const [source, setSource] = useState('Loading...')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await getLivePrices()
        if (!mounted) return
        if (data?.length > 0) {
          setPrices(data)
          setIsLive(true)
          const src = await getPriceSource().catch(() => 'WFP/HDX')
          if (mounted) setSource(src)
        }
      } catch {
        if (mounted) setIsLive(false)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    // Refresh every 6 hours
    const interval = setInterval(load, 6 * 60 * 60 * 1000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  // Deduplicate — one per productId
  const seen = new Set<string>()
  const deduped = prices.filter(p => {
    if (seen.has(p.productId)) return false
    seen.add(p.productId)
    return true
  })

  // Triple-loop for seamless infinite scroll
  const base = deduped.length < 6 ? [...deduped, ...deduped] : deduped
  const tickerItems = [...base, ...base, ...base]

  return (
    <div
      className="bg-green-950 border-b-2 border-green-800 overflow-hidden select-none"
      role="marquee"
      aria-label={`Live crop prices — ${source}`}
    >
      <div className="flex items-stretch">

        {/* LEFT BADGE */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-green-700 px-3 py-1.5 z-10 gap-0.5">
          <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">LIVE</span>
          <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">PRICES</span>
          <div className="flex items-center gap-1 mt-1">
            {loading
              ? <RefreshCw className="w-3 h-3 text-yellow-300 animate-spin" aria-hidden />
              : isLive
                ? <Wifi className="w-3 h-3 text-green-200" aria-hidden />
                : <WifiOff className="w-3 h-3 text-yellow-300" aria-hidden />}
            <span className="text-[9px] text-green-100 font-semibold leading-none">
              {loading ? '...' : isLive ? 'WFP' : 'Demo'}
            </span>
          </div>
        </div>

        {/* SCROLLING TICKER */}
        <div className="flex-1 overflow-hidden py-1.5">
          <div className="ticker-track flex items-center whitespace-nowrap">
            {tickerItems.map((p, i) => {
              const emoji = getEmoji(p.productId, p.product)
              const price = p.avgPrice
              const isUp = p.trend === 'UP'
              const isDown = p.trend === 'DOWN'
              const pct = p.changePercent?.toFixed(1) ?? '0.0'

              return (
                <span
                  key={`${p.productId}-${i}`}
                  className="inline-flex items-center gap-2 px-5"
                  aria-hidden={i >= base.length}
                >
                  {/* Emoji */}
                  <span className="text-base leading-none" role="img" aria-label={p.product}>{emoji}</span>

                  {/* Crop name — 15:1 contrast on dark green */}
                  <span className="text-sm font-bold text-green-50 tracking-wide">{p.product}</span>

                  {/* Province */}
                  <span className="text-xs text-green-300">({p.province})</span>

                  {/* Price — yellow 8:1+ on dark green */}
                  <span className="text-sm font-black text-yellow-300">
                    K{price >= 1000 ? (price / 1000).toFixed(1) + 'k' : price.toFixed(0)}
                  </span>
                  <span className="text-xs text-green-400">/50kg</span>

                  {/* Trend */}
                  <span className={clsx(
                    'inline-flex items-center gap-0.5 text-xs font-bold',
                    isUp ? 'text-emerald-300' : isDown ? 'text-red-400' : 'text-green-400'
                  )}>
                    {isUp && <TrendingUp className="w-3.5 h-3.5" />}
                    {isDown && <TrendingDown className="w-3.5 h-3.5" />}
                    {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
                    {isUp ? '+' : ''}{pct}%
                  </span>

                  {/* Divider */}
                  <span className="text-green-700 pl-3 text-lg font-thin">|</span>
                </span>
              )
            })}
          </div>
        </div>

        {/* RIGHT — source + date */}
        <div className="flex-shrink-0 hidden md:flex flex-col items-end justify-center px-3 border-l border-green-800 gap-0.5 min-w-[90px]">
          <span className="text-[10px] text-green-400 font-semibold leading-none">
            {isLive ? '✓ Live' : '○ Demo'}
          </span>
          <span className="text-[9px] text-green-600 leading-none">{source}</span>
          <span className="text-[9px] text-green-700 leading-none">{deduped.length} crops</span>
        </div>
      </div>
    </div>
  )
}
