import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Wifi, WifiOff } from 'lucide-react'
import { getLivePrices } from '../../services/liveprices'
import type { PriceData } from '../../types'
import { MOCK_PRICE_DATA } from '../../services/mockData'
import clsx from 'clsx'

// All key Zambian crops with emojis
const CROP_EMOJIS: Record<string, string> = {
  maize: '🌽', soya: '🫘', beans: '🫘', groundnuts: '🥜',
  kapenta: '🐟', rice: '🌾', wheat: '🌾', cassava: '🍠',
  tomatoes: '🍅', onions: '🧅', sunflower: '🌻', cotton: '🌿',
  tobacco: '🌿', cattle: '🐄', goats: '🐐', honey: '🍯',
}

function getEmoji(productId: string, product: string): string {
  const id = productId?.toLowerCase() || ''
  const name = product?.toLowerCase() || ''
  for (const [key, emoji] of Object.entries(CROP_EMOJIS)) {
    if (id.includes(key) || name.includes(key)) return emoji
  }
  return '🌿'
}

export default function PriceTicker() {
  const [prices, setPrices] = useState<PriceData[]>(MOCK_PRICE_DATA)
  const [isLive, setIsLive] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    getLivePrices()
      .then(data => {
        if (data && data.length > 0) {
          setPrices(data)
          setIsLive(true)
          // Get most recent date from data
          const dates = data.map((d: any) => d.lastUpdated || '').filter(Boolean).sort().reverse()
          if (dates[0]) setLastUpdated(new Date(dates[0]).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }))
        }
      })
      .catch(() => setIsLive(false))
  }, [])

  // Deduplicate: one entry per product (pick highest avgPrice province for variety)
  const seen = new Set<string>()
  const deduped = prices.filter(p => {
    if (seen.has(p.productId)) return false
    seen.add(p.productId)
    return true
  })

  // Ensure we have enough items — repeat to fill ticker
  const items = deduped.length < 6 ? [...deduped, ...deduped] : deduped
  // Triple the array so the loop animation looks seamless
  const tickerItems = [...items, ...items, ...items]

  return (
    <div className="bg-gray-950 text-white border-b border-gray-800 overflow-hidden select-none">
      <div className="flex items-stretch">

        {/* LEFT BADGE */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-primary-600 px-3 py-1 z-10 gap-0.5">
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">LIVE</span>
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">PRICES</span>
          <div className="flex items-center gap-1 mt-0.5">
            {isLive
              ? <Wifi className="w-3 h-3 text-green-300" />
              : <WifiOff className="w-3 h-3 text-yellow-300" />}
            <span className="text-[8px] text-green-200 leading-none">{isLive ? 'WFP' : 'Demo'}</span>
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
              return (
                <span key={i} className="inline-flex items-center gap-1.5 px-5">
                  {/* Emoji + crop name */}
                  <span className="text-base leading-none">{emoji}</span>
                  <span className="text-xs font-bold text-white tracking-wide">{p.product}</span>

                  {/* Province */}
                  <span className="text-[10px] text-gray-400">({p.province})</span>

                  {/* Price */}
                  <span className="text-xs font-black text-yellow-300">
                    K{price >= 1000 ? (price / 1000).toFixed(1) + 'k' : price.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-gray-500">/50kg</span>

                  {/* Trend icon + percent */}
                  <span className={clsx(
                    'inline-flex items-center gap-0.5 text-[10px] font-bold',
                    isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-gray-400'
                  )}>
                    {isUp && <TrendingUp className="w-3 h-3" />}
                    {isDown && <TrendingDown className="w-3 h-3" />}
                    {!isUp && !isDown && <Minus className="w-3 h-3" />}
                    {isUp ? '+' : ''}{p.changePercent?.toFixed(1) ?? '0.0'}%
                  </span>

                  {/* Divider */}
                  <span className="text-gray-700 pl-4">·</span>
                </span>
              )
            })}
          </div>
        </div>

        {/* RIGHT: last updated */}
        {lastUpdated && (
          <div className="flex-shrink-0 flex items-center px-3 text-[9px] text-gray-500 border-l border-gray-800">
            <span>Data: {lastUpdated}</span>
          </div>
        )}
      </div>
    </div>
  )
}
