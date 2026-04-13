/**
 * ZBM Dashboard — Zone Business Manager
 * Live API data · ZBM sees ONLY their zone
 */
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useMyZone, DataStatus } from '../../hooks/useSalesData'
import {
  TrendingUp, TrendingDown, Minus, Users, ShoppingBag, Target,
  Award, MapPin, Phone, ChevronDown, ChevronUp, AlertCircle,
  CheckCircle, Wifi, WifiOff, RefreshCw, Loader2
} from 'lucide-react'
import clsx from 'clsx'
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
      <div className="flex items-center gap-2"><WifiOff className="w-3.5 h-3.5" /><span>Offline — cached data</span></div>
      <button onClick={reload} className="flex items-center gap-1 font-semibold"><RefreshCw className="w-3 h-3" /> Retry</button>
    </div>
  )
}

function AchievementBadge({ pct }: { pct: number }) {
  if (pct >= 100) return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ {pct}%</span>
  if (pct >= 75)  return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⚡ {pct}%</span>
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">⚠ {pct}%</span>
}

function TDRRow({ tdr, rank }: { tdr: any; rank: number }) {
  const [open, setOpen] = useState(false)
  const score = tdr.overallScore ?? 0
  const TrendIcon = tdr.trend === 'UP' ? TrendingUp : tdr.trend === 'DOWN' ? TrendingDown : Minus
  const trendColor = tdr.trend === 'UP' ? 'text-green-500' : tdr.trend === 'DOWN' ? 'text-red-400' : 'text-gray-400'

  const metrics = [
    { label: 'Revenue',      actual: `K${(tdr.actualRevenue ?? 0).toLocaleString()}`,    target: `K${(tdr.assignedTargetRevenue ?? 0).toLocaleString()}`,    pct: tdr.revenueAchievementPct  ?? 0 },
    { label: 'Listings',     actual: tdr.actualListings     ?? 0,                         target: tdr.assignedTargetListings     ?? 0,                         pct: tdr.listingsAchievementPct ?? 0 },
    { label: 'New Farmers',  actual: tdr.actualNewFarmers   ?? 0,                         target: tdr.assignedTargetNewFarmers   ?? 0,                         pct: tdr.assignedTargetNewFarmers   > 0 ? Math.round(((tdr.actualNewFarmers ?? 0)   / tdr.assignedTargetNewFarmers)   * 100) : 0 },
    { label: 'Transactions', actual: tdr.actualTransactions ?? 0,                         target: tdr.assignedTargetTransactions ?? 0,                         pct: tdr.assignedTargetTransactions > 0 ? Math.round(((tdr.actualTransactions ?? 0) / tdr.assignedTargetTransactions) * 100) : 0 },
  ]

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left">
        <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0',
          rank === 1 ? 'bg-yellow-400 text-yellow-900' : rank === 2 ? 'bg-gray-300 text-gray-700' :
          rank === 3 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'
        )}>{rank}</div>
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          <span className="text-primary-700 font-bold text-sm">{(tdr.tdrName ?? '?').charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm">{tdr.tdrName}</div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {tdr.territory ?? `Territory ${rank}`}
          </div>
        </div>
        <div className="text-right mr-2">
          <div className={clsx('font-black text-gray-900', score >= 90 ? 'text-green-600' : score >= 70 ? 'text-amber-600' : 'text-red-500')}>
            {score}%
          </div>
          <div className={clsx('flex items-center justify-end gap-0.5 text-xs', trendColor)}>
            <TrendIcon className="w-3 h-3" />{tdr.trend}
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="bg-gray-50 px-4 pb-4 pt-1 border-t border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {metrics.map(m => (
              <div key={m.label} className="bg-white rounded-lg p-2.5 border border-gray-200">
                <div className="text-xs text-gray-400 mb-0.5">{m.label}</div>
                <div className="font-bold text-gray-900">{m.actual}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">of {m.target}</span>
                  <AchievementBadge pct={m.pct} />
                </div>
                <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <div className={clsx('h-full rounded-full', m.pct >= 100 ? 'bg-green-500' : m.pct >= 75 ? 'bg-amber-500' : 'bg-red-400')}
                    style={{ width: `${Math.min(m.pct, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a href={`tel:${tdr.tdrPhone}`}
              className="flex items-center gap-1.5 text-xs text-primary-600 font-medium bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-lg">
              <Phone className="w-3.5 h-3.5" />{tdr.tdrPhone}
            </a>
            {score < 70 && (
              <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5" /> Needs coaching
              </span>
            )}
            {score >= 100 && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                <CheckCircle className="w-3.5 h-3.5" /> Target met!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ZBMDashboard() {
  const { user } = useSelector((s: RootState) => s.auth)
  const zoneId = (user as any)?.zoneId
  const { data: zone, status, error, reload } = useMyZone(zoneId)
  const [sortBy, setSortBy] = useState<'score' | 'revenue' | 'listings'>('score')

  if (status === 'loading' || !zone) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading zone data...</p>
      </div>
    </div>
  )

  const zoneName = zone.zone?.name ?? zone.zoneName ?? 'Your Zone'
  const zbmName  = zone.zone?.zbm?.name ?? user?.name ?? 'ZBM'
  const tdrCount = zone.tdrCount ?? (zone.tdrs?.length ?? 0)

  const revPct  = zone.revPct  ?? zone.revenueAchievementPct ?? 0
  const score   = zone.overallScore ?? 0
  const atRisk  = (zone.tdrs ?? []).filter((t: any) => (t.overallScore ?? 0) < 70).length
  const onTarget = (zone.tdrs ?? []).filter((t: any) => (t.overallScore ?? 0) >= 90).length

  const sortedTDRs = [...(zone.tdrs ?? [])].sort((a: any, b: any) => {
    if (sortBy === 'revenue') return (b.actualRevenue ?? 0) - (a.actualRevenue ?? 0)
    if (sortBy === 'listings') return (b.actualListings ?? 0) - (a.actualListings ?? 0)
    return (b.overallScore ?? 0) - (a.overallScore ?? 0)
  })

  const zoneMetrics = [
    { l: 'Revenue',   a: `K${(zone.actualRevenue ?? 0).toLocaleString()}`,      t: `K${(zone.tgtRevenue ?? zone.targetRevenue ?? 0).toLocaleString()}`,      p: revPct },
    { l: 'Listings',  a: zone.actualListings  ?? 0,  t: zone.tgtListings  ?? zone.targetListings  ?? 0,  p: zone.listPct ?? 0 },
    { l: 'Farmers',   a: zone.actualNewFarmers  ?? 0, t: zone.tgtFarmers  ?? zone.targetNewFarmers  ?? 0, p: zone.farmPct ?? 0 },
    { l: 'Txns',      a: zone.actualTransactions ?? 0, t: zone.tgtTxns ?? zone.targetTransactions ?? 0,   p: zone.txnPct  ?? 0 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <StatusBanner status={status} error={error} reload={reload} />

      {/* Header */}
      <div className="gradient-hero text-white px-4 pt-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start gap-2 mb-1">
            <div className="flex-1">
              <p className="text-green-200 text-sm font-medium">Zone Business Manager</p>
              <h1 className="text-2xl font-black mb-1">{zbmName}</h1>
              <div className="flex items-center gap-2 text-green-200 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{zoneName}</span>
                <span>·</span>
                <Users className="w-3.5 h-3.5" />
                <span>{tdrCount} TDRs</span>
              </div>
            </div>
            <button onClick={reload} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mt-1">
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className={clsx('text-2xl font-black', score >= 90 ? 'text-yellow-300' : score >= 70 ? 'text-amber-200' : 'text-red-300')}>{score}%</div>
              <div className="text-xs text-green-200 mt-0.5">Zone Score</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-green-300">{onTarget}</div>
              <div className="text-xs text-green-200 mt-0.5">On Target</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-red-300">{atRisk}</div>
              <div className="text-xs text-green-200 mt-0.5">At Risk</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-10 pb-12 space-y-4">

        {/* Zone KPIs */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Zone Performance — {zone.period}</h3>
          <div className="grid grid-cols-2 gap-3">
            {zoneMetrics.map(m => (
              <div key={m.l} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 font-medium">{m.l}</span>
                  <AchievementBadge pct={m.p} />
                </div>
                <div className="text-xl font-black text-gray-900">{m.a}</div>
                <div className="text-xs text-gray-400">of {m.t} target</div>
                <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div className={clsx('h-full rounded-full', m.p >= 100 ? 'bg-green-500' : m.p >= 75 ? 'bg-amber-500' : 'bg-red-400')}
                    style={{ width: `${Math.min(m.p, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TDR Leaderboard */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">TDR Performance ({tdrCount})</h3>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600">
              <option value="score">By Score</option>
              <option value="revenue">By Revenue</option>
              <option value="listings">By Listings</option>
            </select>
          </div>
          <div className="space-y-2">
            {sortedTDRs.map((tdr: any, i: number) => (
              <TDRRow key={tdr.tdrId} tdr={tdr} rank={i + 1} />
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>📋 Target Source:</strong> Targets for {zoneName} are set by the HSD.
            Zone revenue target: <strong>K{(zone.tgtRevenue ?? zone.targetRevenue ?? 0).toLocaleString()}</strong>
            {tdrCount > 0 && ` ÷ ${tdrCount} TDRs = K${Math.round((zone.tgtRevenue ?? zone.targetRevenue ?? 0) / tdrCount).toLocaleString()} per TDR`}
          </p>
        </div>
      </div>
    </div>
  )
}
