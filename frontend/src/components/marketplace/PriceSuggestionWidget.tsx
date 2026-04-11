import { Sparkles, TrendingUp, TrendingDown, Info, RefreshCw } from 'lucide-react'
import { PriceData } from '../../types'
import { formatZMW } from '../../services/mockData'

interface Props {
  priceData: PriceData | null
  isLoading?: boolean
}

export default function PriceSuggestionWidget({ priceData, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-primary-200 rounded" />
          <div className="h-4 w-32 bg-primary-200 rounded" />
        </div>
        <div className="h-8 w-24 bg-primary-200 rounded mb-3" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => <div key={i} className="h-10 bg-primary-200 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!priceData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 text-gray-500">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm">Select a product and province to get AI price suggestion</span>
        </div>
      </div>
    )
  }

  const confidence = Math.round(priceData.confidenceScore! * 100)

  return (
    <div className="bg-gradient-to-br from-primary-50 to-emerald-50 border border-primary-200 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary-800">AI Price Suggestion</p>
            <p className="text-xs text-primary-500">Based on {priceData.dataPoints} data points</p>
          </div>
        </div>
        <button className="text-primary-400 hover:text-primary-600 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Price */}
      <div className="mb-4">
        <p className="text-xs text-primary-600 uppercase tracking-wider font-semibold mb-1">Suggested Price</p>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-primary-800">
            {formatZMW(priceData.suggestedPrice!)}
          </span>
          <span className="text-sm text-primary-500 pb-1">{priceData.unit}</span>
        </div>
      </div>

      {/* Min / Avg / Max */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Market Low', value: priceData.minPrice, color: 'text-red-600' },
          { label: 'Average', value: priceData.avgPrice, color: 'text-primary-700' },
          { label: 'Market High', value: priceData.maxPrice, color: 'text-green-600' },
        ].map(item => (
          <div key={item.label} className="bg-white/70 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className={`font-bold text-sm ${item.color}`}>K {item.value}</p>
          </div>
        ))}
      </div>

      {/* Trend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {priceData.trend === 'UP' ? (
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+{priceData.changePercent}% this week</span>
            </div>
          ) : priceData.trend === 'DOWN' ? (
            <div className="flex items-center gap-1 text-red-500">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">{priceData.changePercent}% this week</span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">Stable this week</span>
          )}
        </div>

        {/* Confidence Score */}
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-xs text-primary-500">{confidence}% confidence</span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mt-3">
        <div className="h-1.5 bg-primary-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-emerald-400 rounded-full transition-all"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-primary-400 mt-2">
        Updated {new Date(priceData.lastUpdated).toLocaleDateString('en-GB')} · Powered by Zamgrow AI
      </p>
    </div>
  )
}
