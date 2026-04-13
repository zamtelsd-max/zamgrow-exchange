/**
 * TDR Dashboard — Territory Development Representative
 * Shows ONLY this TDR's personal performance vs their assigned target
 * Target = zone target ÷ number of TDRs in zone (set by HSD via ZBM)
 */
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { buildTDRPerformance, buildZonePerformance, TDR_PROFILES, ZBM_PROFILES, CURRENT_PERIOD } from '../../services/salesData'
import {
  TrendingUp, TrendingDown, Minus, Target, Users, ShoppingBag,
  Award, MapPin, Phone, Calendar, Star, ChevronUp, ChevronDown
} from 'lucide-react'
import clsx from 'clsx'

function AchievementBar({ pct, label, color = 'bg-primary-500' }: { pct: number; label: string; color?: string }) {
  const capped = Math.min(pct, 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1 font-medium">
        <span className="text-gray-600">{label}</span>
        <span className={clsx(pct >= 100 ? 'text-green-600' : pct >= 75 ? 'text-amber-600' : 'text-red-500', 'font-bold')}>{pct}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', pct >= 100 ? 'bg-green-500' : pct >= 75 ? color : 'bg-red-400')}
          style={{ width: `${capped}%` }}
        />
      </div>
    </div>
  )
}

function KpiCard({ label, actual, target, unit = '', icon: Icon, color }: {
  label: string; actual: number; target: number; unit?: string
  icon: React.ElementType; color: string
}) {
  const pct = Math.round((actual / target) * 100)
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
        <div className="text-2xl font-black text-gray-900">
          {unit}{actual.toLocaleString()}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{label}</div>
      </div>
      <div className="text-xs text-gray-400">
        Target: <span className="font-semibold text-gray-600">{unit}{target.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full', pct >= 100 ? 'bg-green-500' : pct >= 75 ? 'bg-amber-500' : 'bg-red-400')}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

export default function TDRDashboard() {
  const { user } = useSelector((s: RootState) => s.auth)

  const tdrProfile = useMemo(() => TDR_PROFILES.find(t => t.id === (user?.id ?? 'tdr-l1')), [user])
  const zonePerf = useMemo(() => buildZonePerformance(), [])
  const tdrPerf = useMemo(() => {
    const all = buildTDRPerformance()
    return all.find(t => t.tdrId === (user?.id ?? 'tdr-l1')) ?? all[0]
  }, [user])

  const myZone = zonePerf.find(z => z.zoneId === tdrProfile?.zoneId)
  const zbm = ZBM_PROFILES.find(z => z.zoneId === tdrProfile?.zoneId)
  const rankInZone = myZone?.tdrs.sort((a, b) => b.overallScore - a.overallScore).findIndex(t => t.tdrId === tdrPerf.tdrId) ?? 0

  const scoreColor = tdrPerf.overallScore >= 90 ? 'text-green-600' : tdrPerf.overallScore >= 70 ? 'text-amber-600' : 'text-red-500'
  const TrendIcon = tdrPerf.trend === 'UP' ? TrendingUp : tdrPerf.trend === 'DOWN' ? TrendingDown : Minus
  const trendColor = tdrPerf.trend === 'UP' ? 'text-green-500' : tdrPerf.trend === 'DOWN' ? 'text-red-400' : 'text-gray-400'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-hero text-white px-4 pt-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-green-200 text-sm font-medium mb-0.5">Territory Development Rep</p>
              <h1 className="text-2xl font-black">{tdrPerf.tdrName}</h1>
              <div className="flex items-center gap-2 mt-1 text-green-200 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{tdrProfile?.territory ?? 'Lusaka Central'}</span>
                <span>·</span>
                <span>{tdrPerf.zoneName}</span>
              </div>
            </div>
            <div className="text-right">
              <div className={clsx('text-4xl font-black', scoreColor === 'text-green-600' ? 'text-yellow-300' : scoreColor === 'text-amber-600' ? 'text-amber-200' : 'text-red-300')}>
                {tdrPerf.overallScore}%
              </div>
              <div className="text-green-200 text-xs">Overall Score</div>
              <div className="flex items-center gap-1 mt-1 justify-end">
                <TrendIcon className={clsx('w-4 h-4', trendColor, 'text-white opacity-80')} />
                <span className="text-white text-xs opacity-80">{tdrPerf.trend}</span>
              </div>
            </div>
          </div>

          {/* Rank in zone */}
          <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-semibold">Zone Rank</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-yellow-300">#{rankInZone + 1}</span>
              <span className="text-green-200 text-xs ml-1">of {myZone?.tdrCount} TDRs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-10 pb-12 space-y-4">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Revenue (ZMW)" actual={tdrPerf.actualRevenue} target={tdrPerf.assignedTargetRevenue} unit="K" icon={TrendingUp} color="bg-primary-600" />
          <KpiCard label="Listings Posted" actual={tdrPerf.actualListings} target={tdrPerf.assignedTargetListings} icon={ShoppingBag} color="bg-blue-500" />
          <KpiCard label="New Farmers" actual={tdrPerf.actualNewFarmers} target={tdrPerf.assignedTargetNewFarmers} icon={Users} color="bg-amber-500" />
          <KpiCard label="Transactions" actual={tdrPerf.actualTransactions} target={tdrPerf.assignedTargetTransactions} icon={Target} color="bg-purple-500" />
        </div>

        {/* Achievement breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-bold text-gray-900">Achievement Breakdown</h3>
          <AchievementBar pct={tdrPerf.revenueAchievementPct} label="Revenue" color="bg-primary-500" />
          <AchievementBar pct={tdrPerf.listingsAchievementPct} label="Listings" color="bg-blue-500" />
          <AchievementBar pct={Math.round((tdrPerf.actualNewFarmers / tdrPerf.assignedTargetNewFarmers) * 100)} label="New Farmers" color="bg-amber-500" />
          <AchievementBar pct={Math.round((tdrPerf.actualTransactions / tdrPerf.assignedTargetTransactions) * 100)} label="Transactions" color="bg-purple-500" />
        </div>

        {/* Target explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="text-sm font-bold text-blue-800 mb-2">📋 How your target is calculated</h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            Your zone target (set by HSD) is divided equally among <strong>{myZone?.tdrCount} TDRs</strong> in {tdrPerf.zoneName}.
            <br /><br />
            Zone revenue target: <strong>K{myZone?.targetRevenue.toLocaleString()}</strong> ÷ {myZone?.tdrCount} TDRs
            = <strong>K{tdrPerf.assignedTargetRevenue.toLocaleString()} per TDR</strong>
          </p>
        </div>

        {/* Manager info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-3">Your Zone Manager (ZBM)</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-black text-lg">{zbm?.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{zbm?.name}</div>
              <div className="text-xs text-gray-500">{zbm?.zoneName}</div>
            </div>
            <a href={`tel:${zbm?.phone}`} className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 text-green-700" />
            </a>
          </div>
        </div>

        {/* Period */}
        <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
          <Calendar className="w-3.5 h-3.5" />
          <span>Performance period: <strong className="text-gray-600">{CURRENT_PERIOD}</strong></span>
        </div>
      </div>
    </div>
  )
}
