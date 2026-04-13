/**
 * TDR Dashboard — Live data from API · Graceful offline fallback
 */
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useMyPerf, logSalesActivity, DataStatus } from '../../hooks/useSalesData'
import {
  TrendingUp, TrendingDown, Minus, Target, Users, ShoppingBag,
  Award, MapPin, Phone, Calendar, Wifi, WifiOff, RefreshCw,
  Loader2, PlusCircle, CheckCircle
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { useState } from 'react'

function StatusBanner({ status, error, reload }: { status: DataStatus; error: string | null; reload: () => void }) {
  if (status === 'live') return (
    <div className="bg-green-50 border-b border-green-200 px-4 py-1.5 flex items-center gap-2 text-xs text-green-700">
      <Wifi className="w-3 h-3" /> Live data
    </div>
  )
  if (status === 'loading') return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center gap-2 text-xs text-blue-700">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
    </div>
  )
  return (
    <div className="bg-amber-50 border-b border-amber-300 px-4 py-2 flex items-center justify-between text-xs text-amber-700">
      <div className="flex items-center gap-2"><WifiOff className="w-3.5 h-3.5" /><span>Offline — showing last data</span></div>
      <button onClick={reload} className="flex items-center gap-1 font-semibold"><RefreshCw className="w-3 h-3" /> Retry</button>
    </div>
  )
}

function KpiCard({ label, actual, target, unit = '', icon: Icon, color }: {
  label: string; actual: number; target: number; unit?: string
  icon: React.ElementType; color: string
}) {
  const pct = target > 0 ? Math.round((actual / target) * 100) : 0
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full',
          pct >= 100 ? 'bg-green-100 text-green-700' : pct >= 75 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
        )}>{pct}%</span>
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900">{unit}{actual.toLocaleString()}</div>
        <div className="text-xs text-gray-400 mt-0.5">{label}</div>
      </div>
      <div className="text-xs text-gray-400">Target: <span className="font-semibold text-gray-600">{unit}{target.toLocaleString()}</span></div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full', pct >= 100 ? 'bg-green-500' : pct >= 75 ? 'bg-amber-500' : 'bg-red-400')}
          style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  )
}

// ── Quick log activity buttons ────────────────────────────────────────────────
function ActivityLogger({ onLogged }: { onLogged: () => void }) {
  const [logging, setLogging] = useState<string | null>(null)

  const log = async (type: 'listing_posted' | 'farmer_onboarded' | 'transaction_completed', label: string) => {
    setLogging(type)
    const res = await logSalesActivity(type)
    setLogging(null)
    if (res.success) {
      toast.success(`${label} logged ✓`)
      onLogged()
    } else {
      toast.error(res.message)
    }
  }

  const buttons = [
    { type: 'listing_posted'       as const, label: '📋 Listing Posted', short: 'Listing' },
    { type: 'farmer_onboarded'     as const, label: '👨‍🌾 Farmer Onboarded', short: 'Farmer' },
    { type: 'transaction_completed'as const, label: '✅ Transaction Done', short: 'Txn' },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-bold text-gray-900 mb-3">Log Today's Activity</h3>
      <div className="grid grid-cols-3 gap-2">
        {buttons.map(b => (
          <button key={b.type} onClick={() => log(b.type, b.short)}
            disabled={logging !== null}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-primary-200 hover:border-primary-400 hover:bg-primary-50 transition-all disabled:opacity-50 text-center">
            {logging === b.type
              ? <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
              : <PlusCircle className="w-5 h-5 text-primary-500" />}
            <span className="text-xs font-semibold text-gray-700">{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function TDRDashboard() {
  const { user } = useSelector((s: RootState) => s.auth)
  const { data: perf, status, error, reload } = useMyPerf(user?.id)

  if (status === 'loading' || !perf) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading your performance...</p>
      </div>
    </div>
  )

  const overallScore = perf.overallScore ?? 0
  const TrendIcon = perf.trend === 'UP' ? TrendingUp : perf.trend === 'DOWN' ? TrendingDown : Minus
  const trendColor = perf.trend === 'UP' ? 'text-green-200' : perf.trend === 'DOWN' ? 'text-red-300' : 'text-white/60'

  return (
    <div className="min-h-screen bg-gray-50">
      <StatusBanner status={status} error={error} reload={reload} />

      {/* Header */}
      <div className="gradient-hero text-white px-4 pt-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-green-200 text-sm font-medium mb-0.5">Territory Development Rep</p>
              <h1 className="text-2xl font-black">{perf.tdrName ?? user?.name}</h1>
              <div className="flex items-center gap-2 mt-1 text-green-200 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{perf.territory ?? 'Your Territory'}</span>
                <span>·</span>
                <span>{perf.zoneName}</span>
              </div>
            </div>
            <div className="text-right">
              <div className={clsx('text-4xl font-black',
                overallScore >= 90 ? 'text-yellow-300' : overallScore >= 70 ? 'text-amber-200' : 'text-red-300'
              )}>{overallScore}%</div>
              <div className="text-green-200 text-xs">Overall Score</div>
              <div className={clsx('flex items-center gap-1 mt-1 justify-end text-xs', trendColor)}>
                <TrendIcon className="w-3.5 h-3.5" />
                {perf.trend}
              </div>
            </div>
          </div>

          {/* Zone rank */}
          <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-semibold">Zone Rank</span>
            </div>
            <div className="text-right">
              {perf.rank ? (
                <>
                  <span className="text-2xl font-black text-yellow-300">#{perf.rank}</span>
                  <span className="text-green-200 text-xs ml-1">of {perf.tdrCount} TDRs</span>
                </>
              ) : (
                <span className="text-green-200 text-sm">Calculating...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-10 pb-12 space-y-4">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Revenue (ZMW)" actual={perf.actualRevenue ?? 0} target={perf.assignedTargetRevenue ?? 0} unit="K" icon={TrendingUp} color="bg-primary-600" />
          <KpiCard label="Listings Posted" actual={perf.actualListings ?? 0} target={perf.assignedTargetListings ?? 0} icon={ShoppingBag} color="bg-blue-500" />
          <KpiCard label="New Farmers" actual={perf.actualNewFarmers ?? 0} target={perf.assignedTargetNewFarmers ?? 0} icon={Users} color="bg-amber-500" />
          <KpiCard label="Transactions" actual={perf.actualTransactions ?? 0} target={perf.assignedTargetTransactions ?? 0} icon={Target} color="bg-purple-500" />
        </div>

        {/* Log activity */}
        <ActivityLogger onLogged={reload} />

        {/* Target explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="text-sm font-bold text-blue-800 mb-2">📋 How your target is calculated</h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            Zone target set by HSD: <strong>K{(perf.zoneTargetRevenue ?? 0).toLocaleString()}</strong>
            {' '}÷ <strong>{perf.tdrCount} TDRs</strong> in {perf.zoneName}
            {' '}= <strong>K{(perf.assignedTargetRevenue ?? 0).toLocaleString()} per TDR</strong>
          </p>
        </div>

        {/* ZBM contact */}
        {perf.zbm && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-3">Your Zone Manager (ZBM)</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-black text-lg">{perf.zbm.name?.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{perf.zbm.name}</div>
                <div className="text-xs text-gray-500">{perf.zoneName}</div>
              </div>
              <a href={`tel:${perf.zbm.phone}`}
                className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-700" />
              </a>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
          <Calendar className="w-3.5 h-3.5" />
          <span>Performance period: <strong className="text-gray-600">{perf.period}</strong></span>
        </div>
      </div>
    </div>
  )
}
