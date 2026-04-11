import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'

export default function PriceTicker() {
  const { priceData } = useSelector((s: RootState) => s.market)

  const tickers = priceData.slice(0, 8)

  return (
    <div className="bg-gray-900 text-white py-2 overflow-hidden border-b border-gray-800">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-primary-600 px-4 py-0.5 text-xs font-bold uppercase tracking-wider z-10">
          LIVE PRICES
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex ticker-animate whitespace-nowrap">
            {[...tickers, ...tickers].map((p, i) => (
              <div key={i} className="inline-flex items-center gap-2 px-6 text-sm">
                <span className="font-semibold text-gray-200">{p.product}</span>
                <span className="text-gray-400 text-xs">({p.province})</span>
                <span className="font-bold text-white">K {p.avgPrice.toFixed(0)}</span>
                <span className="text-gray-400 text-xs">{p.unit}</span>
                {p.trend === 'UP' && <TrendingUp className={clsx('w-3.5 h-3.5', 'text-green-400')} />}
                {p.trend === 'DOWN' && <TrendingDown className={clsx('w-3.5 h-3.5', 'text-red-400')} />}
                {p.trend === 'STABLE' && <Minus className={clsx('w-3.5 h-3.5', 'text-gray-400')} />}
                <span className={clsx(
                  'text-xs font-medium',
                  p.trend === 'UP' ? 'text-green-400' : p.trend === 'DOWN' ? 'text-red-400' : 'text-gray-400'
                )}>
                  {p.trend === 'UP' ? '+' : ''}{p.changePercent.toFixed(1)}%
                </span>
                <span className="text-gray-700 mx-2">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
