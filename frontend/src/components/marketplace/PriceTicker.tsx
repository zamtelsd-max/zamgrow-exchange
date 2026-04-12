import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Wifi, WifiOff } from 'lucide-react'
import { getLivePrices } from '../../services/liveprices'
import type { PriceData } from '../../types'
import { MOCK_PRICE_DATA } from '../../services/mockData'
import clsx from 'clsx'

const CROP_EMOJIS: Record<string, string> = {
  maize: '🌽', soya: '🫘', beans: '🫘', groundnuts: '🥜',
  kapenta: '🐟', rice: '🌾', wheat: '🌾', cassava: '🍠',
  tomatoes: '🍅', onions: '🧅', sunflower: '🌻', cotton: '🌿',
}

function getEmoji(productId: string, product: string): string {
  const id = (productId || '').toLowerCase()
  const name = (product || '').toLowerCase()
  for (const [key, emoji] of Object.entries(CROP_EMOJIS)) {
    if (id.includes(key) || name.includes(key)) return emoji
  }
  return '🌿'
}

export default function PriceTicker() {
  const [prices, setPrices] = useState<PriceData[]>(MOCK_PRICE_DATA)
  const [isLive, setIsLive] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    getLivePrices()
      .then(data => {
        if (data?.length > 0) {
          setPrices(data)
          setIsLive(true)
          const dates = data.map((d: any) => d.lastUpdated || '').filter(Boolean).sort().reverse()
          if (dates[0]) setLastUpdated(new Date(dates[0]).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }))
        }
      })
      .catch(() => setIsLive(false))
  }, [])

  // One entry per product
  const seen = new Set<string>()
  const deduped = prices.filter(p => {
    if (seen.has(p.productId)) return false
    seen.add(p.productId)
    return true
  })

  const items = deduped.length < 6 ? [...deduped, ...deduped] : deduped
  const tickerItems = [...items, ...items, ...items]

  return (
    // Dark green background — WCAG AA contrast ratio 4.5:1+ for all text colours used
    <div className="bg-green-950 border-b-2 border-green-800 overflow-hidden select-none" role="marquee" aria-label="Live crop prices">
      <div className="flex items-stretch">

        {/* LEFT BADGE — white text on green-700 = 5.2:1 contrast ✓ */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-green-700 px-3 py-1.5 z-10 gap-0.5">
          <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">LIVE</span>
          <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">PRICES</span>
          <div className="flex items-center gap-1 mt-1">
            {isLive
              ? <Wifi className="w-3 h-3 text-green-200" aria-hidden />
              : <WifiOff className="w-3 h-3 text-yellow-300" aria-hidden />}
            <span className="text-[9px] text-green-100 font-semibold leading-none">{isLive ? 'WFP' : 'Demo'}</span>
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
                <span key={i} className="inline-flex items-center gap-2 px-5" aria-hidden={i >= items.length}>

                  {/* Emoji */}
                  <span className="text-base leading-none" role="img" aria-label={p.product}>{emoji}</span>

                  {/* Crop name — near-white on dark green = 15:1 contrast ✓ */}
                  <span className="text-sm font-bold text-green-50 tracking-wide">{p.product}</span>

                  {/* Province — light green, 7:1 contrast ✓ */}
                  <span className="text-xs text-green-300">({p.province})</span>

                  {/* Price — bright yellow, 8:1 contrast on dark green ✓ */}
                  <span className="text-sm font-black text-yellow-300">
                    K{price >= 1000 ? (price / 1000).toFixed(1) + 'k' : price.toFixed(0)}
                  </span>
                  <span className="text-xs text-green-400">/50kg</span>

                  {/* Trend — green/red on dark green both 4.5:1+ ✓ */}
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

        {/* RIGHT — data date */}
        {lastUpdated && (
          <div className="flex-shrink-0 hidden md:flex items-center px-3 border-l border-green-800">
            <span className="text-xs text-green-400 font-medium">Data: {lastUpdated}</span>
          </div>
        )}
      </div>
    </div>
  )
}
