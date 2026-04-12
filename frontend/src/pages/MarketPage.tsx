import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { setSelectedProduct, setSelectedProvince } from '../store/slices/marketSlice'
import { PROVINCES, MOCK_PRICE_DATA, PRICE_HISTORY_MAIZE, PRICE_HISTORY_SOYA, formatZMW } from '../services/mockData'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, Bell, Plus, Filter, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { getLivePrices } from '../services/liveprices'
import { setPriceData, setLoading } from '../store/slices/marketSlice'
import clsx from 'clsx'

const PRODUCTS = ['Maize', 'Soya Beans', 'Wheat', 'Groundnuts', 'Kapenta', 'Tomatoes', 'Sunflower']

export default function MarketPage() {
  const dispatch = useDispatch()
  const { priceData, heatmapData, selectedProduct, selectedProvince, isLoading } = useSelector((s: RootState) => s.market)

  useEffect(() => {
    dispatch(setLoading(true))
    getLivePrices().then(data => {
      dispatch(setPriceData(data))
      dispatch(setLoading(false))
    }).catch(() => dispatch(setLoading(false)))
  }, [dispatch])
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)
  const [alertProduct, setAlertProduct] = useState('')
  const [alertThreshold, setAlertThreshold] = useState('')
  const [alertDirection, setAlertDirection] = useState<'ABOVE' | 'BELOW'>('BELOW')

  const chartData = selectedProduct.toLowerCase().includes('soya') ? PRICE_HISTORY_SOYA : PRICE_HISTORY_MAIZE

  const displayedPrices = selectedProvince === 'all' ? priceData : priceData.filter((p: any) => p.province === selectedProvince)

  // Province heatmap colors
  const getHeatColor = (intensity: number) => {
    if (intensity >= 0.8) return '#166534'
    if (intensity >= 0.6) return '#16a34a'
    if (intensity >= 0.4) return '#22c55e'
    if (intensity >= 0.2) return '#86efac'
    return '#dcfce7'
  }

  const handleSetAlert = () => {
    if (!isAuthenticated) { toast.error('Sign in to set price alerts'); return }
    if (!alertProduct || !alertThreshold) { toast.error('Please fill all alert fields'); return }
    toast.success(`Alert set: notify when ${alertProduct} goes ${alertDirection} K${alertThreshold}`)
    setAlertProduct('')
    setAlertThreshold('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title mb-2">Market Intelligence</h1>
        <p className="text-gray-500">Real-time agricultural price data across all 10 Zambian provinces</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedProduct}
            onChange={e => dispatch(setSelectedProduct(e.target.value))}
            className="select-field text-sm py-2 w-40"
          >
            {PRODUCTS.map(p => <option key={p} value={p.toLowerCase().replace(' ', '_')}>{p}</option>)}
          </select>
        </div>
        <select
          value={selectedProvince}
          onChange={e => dispatch(setSelectedProvince(e.target.value))}
          className="select-field text-sm py-2 w-44"
        >
          <option value="all">All Provinces</option>
          {PROVINCES.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayedPrices.slice(0, 4).map(p => (
              <div key={`${p.productId}-${p.provinceId}`} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{p.product}</p>
                    <p className="text-xs text-gray-500">{p.province} Province</p>
                  </div>
                  <div className={clsx(
                    'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                    p.trend === 'UP' ? 'bg-green-50 text-green-700' :
                    p.trend === 'DOWN' ? 'bg-red-50 text-red-700' :
                    'bg-gray-50 text-gray-600'
                  )}>
                    {p.trend === 'UP' && <TrendingUp className="w-3.5 h-3.5" />}
                    {p.trend === 'DOWN' && <TrendingDown className="w-3.5 h-3.5" />}
                    {p.trend === 'STABLE' && <Minus className="w-3.5 h-3.5" />}
                    {p.trend === 'UP' ? '+' : ''}{p.changePercent}%
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary-700 mb-1">
                  {formatZMW(p.avgPrice)}
                </div>
                <p className="text-xs text-gray-500">{p.unit}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-center">
                  <div className="bg-red-50 rounded-lg p-1.5">
                    <span className="text-red-600 font-semibold">{formatZMW(p.minPrice)}</span>
                    <p className="text-gray-400">Low</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-1.5">
                    <span className="text-green-600 font-semibold">{formatZMW(p.maxPrice)}</span>
                    <p className="text-gray-400">High</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Based on {p.dataPoints} data points
                </div>
              </div>
            ))}
          </div>

          {/* Price Trend Chart */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Price Trend — {selectedProduct === 'soya_beans' || selectedProduct === 'soya' ? 'Soya Beans' : 'Maize'} (Last 7 Months)
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `K${v}`} />
                <Tooltip
                  formatter={(v: number, name: string) => [`K ${v}`, name]}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="maxPrice" name="Max Price" stroke="#22c55e" strokeWidth={1} fill="none" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="avgPrice" name="Avg Price" stroke="#16a34a" strokeWidth={2.5} fill="url(#avgGradient)" />
                <Area type="monotone" dataKey="minPrice" name="Min Price" stroke="#ef4444" strokeWidth={1} fill="none" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Province Comparison Bar Chart */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Listing Activity by Province</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={heatmapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="provinceName" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="listingCount" name="Active Listings" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Heatmap + Alerts */}
        <div className="space-y-5">
          {/* Province Heatmap */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Province Heatmap</h2>
            <p className="text-xs text-gray-500 mb-3">Trading intensity by province (listing volume)</p>
            <div className="space-y-2">
              {heatmapData.sort((a, b) => b.intensity - a.intensity).map(p => (
                <div key={p.provinceId} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getHeatColor(p.intensity) }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{p.provinceName}</span>
                      <span className="text-gray-500">{p.listingCount} listings</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${p.intensity * 100}%`, backgroundColor: getHeatColor(p.intensity) }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
              <div className="flex gap-1">
                {['#dcfce7', '#86efac', '#22c55e', '#16a34a', '#166534'].map(c => (
                  <div key={c} className="w-4 h-3 rounded" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span>Low → High activity</span>
            </div>
          </div>

          {/* Price Alerts */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-primary-600" />
              <h2 className="font-semibold text-gray-900">Set Price Alert</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">Get notified when prices hit your target</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Commodity</label>
                <select
                  value={alertProduct}
                  onChange={e => setAlertProduct(e.target.value)}
                  className="select-field text-sm py-2"
                >
                  <option value="">Select product</option>
                  {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Alert when price goes</label>
                <div className="grid grid-cols-2 gap-2">
                  {['BELOW', 'ABOVE'].map(d => (
                    <button
                      key={d}
                      onClick={() => setAlertDirection(d as 'ABOVE' | 'BELOW')}
                      className={clsx(
                        'py-2 rounded-lg text-xs font-medium border transition-colors',
                        alertDirection === d ? 'bg-primary-50 text-primary-700 border-primary-300' : 'bg-gray-50 text-gray-600 border-gray-200'
                      )}
                    >
                      {d === 'BELOW' ? '📉 Below' : '📈 Above'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Threshold Price (K)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">K</span>
                  <input
                    type="number"
                    value={alertThreshold}
                    onChange={e => setAlertThreshold(e.target.value)}
                    placeholder="300"
                    className="input-field text-sm py-2 pl-7"
                  />
                </div>
              </div>
              <button onClick={handleSetAlert} className="btn-primary w-full text-sm">
                <Bell className="w-4 h-4" />
                <Plus className="w-3 h-3" />
                Set Alert
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Free: 0 alerts · Monthly: 5 alerts · Annual: Unlimited
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
