/**
 * ZBM Dashboard — Zone Business Manager
 * Shows ONLY their zone's performance and their TDRs
 * Cannot see other zones
 */
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { buildZonePerformance, ZBM_PROFILES, CURRENT_PERIOD } from '../../services/salesData'
import type { TDRPerformance } from '../../types'
import {
  TrendingUp, TrendingDown, Minus, Users, ShoppingBag, Target,
  Award, MapPin, Phone, ChevronDown, ChevronUp, AlertCircle, CheckCircle
} from 'lucide-react'
import clsx from 'clsx'

function AchievementBadge({ pct }: { pct: number }) {
  if (pct >= 100) return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ {pct}%</span>
  if (pct >= 75)  return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⚡ {pct}%</span>
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">⚠ {pct}%</span>
}

function TDRRow({ tdr, rank }: { tdr: TDRPerformance; rank: number }) {
  const [open, setOpen] = useState(false)
  const TrendIcon = tdr.trend === 'UP' ? TrendingUp : tdr.trend === 'DOWN' ? TrendingDown : Minus
  const trendColor = tdr.trend === 'UP' ? 'text-green-500' : tdr.trend === 'DOWN' ? 'text-red-400' : 'text-gray-400'

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        {/* Rank badge */}
        <div className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0',
          rank === 1 ? 'bg-yellow-400 text-yellow-900' :
          rank === 2 ? 'bg-gray-300 text-gray-700' :
          rank === 3 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'
        )}>{rank}</div>

        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          <span className="text-primary-700 font-bold text-sm">{tdr.tdrName.charAt(0)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm">{tdr.tdrName}</div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Territory #{rank}
          </div>
        </div>

        <div className="text-right mr-2">
          <div className="font-black text-gray-900">
            {tdr.overallScore}%
          </div>
          <div className={clsx('flex items-center justify-end gap-0.5', trendColor)}>
            <TrendIcon className="w-3 h-3" />
            <span className="text-xs">{tdr.trend}</span>
          </div>
        </div>

        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="bg-gray-50 px-4 pb-4 pt-1 border-t border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { label: 'Revenue', actual: `K${tdr.actualRevenue.toLocaleString()}`, target: `K${tdr.assignedTargetRevenue.toLocaleString()}`, pct: tdr.revenueAchievementPct },
              { label: 'Listings', actual: tdr.actualListings, target: tdr.assignedTargetListings, pct: tdr.listingsAchievementPct },
              { label: 'New Farmers', actual: tdr.actualNewFarmers, target: tdr.assignedTargetNewFarmers, pct: Math.round((tdr.actualNewFarmers / tdr.assignedTargetNewFarmers) * 100) },
              { label: 'Transactions', actual: tdr.actualTransactions, target: tdr.assignedTargetTransactions, pct: Math.round((tdr.actualTransactions / tdr.assignedTargetTransactions) * 100) },
            ].map(m => (
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
          <div className="flex items-center gap-2">
            <a href={`tel:${tdr.tdrPhone}`} className="flex items-center gap-1.5 text-xs text-primary-600 font-medium bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-lg">
              <Phone className="w-3.5 h-3.5" />
              {tdr.tdrPhone}
            </a>
            {tdr.overallScore < 70 && (
              <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5" />
                Needs coaching
              </span>
            )}
            {tdr.overallScore >= 100 && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                <CheckCircle className="w-3.5 h-3.5" />
                Target met!
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
  const [sortBy, setSortBy] = useState<'score' | 'revenue' | 'listings'>('score')

  const zbmProfile = useMemo(() => {
    const id = (user as any)?.id ?? 'zbm-01'
    return ZBM_PROFILES.find(z => z.id === id) ?? ZBM_PROFILES[0]
  }, [user])

  const allZones = useMemo(() => buildZonePerformance(), [])
  const myZone = useMemo(() =>
    allZones.find(z => z.zoneId === zbmProfile.zoneId) ?? allZones[0]
  , [allZones, zbmProfile])

  const sortedTDRs = useMemo(() => {
    return [...myZone.tdrs].sort((a, b) => {
      if (sortBy === 'revenue') return b.actualRevenue - a.actualRevenue
      if (sortBy === 'listings') return b.actualListings - a.actualListings
      return b.overallScore - a.overallScore
    })
  }, [myZone, sortBy])

  const atRisk = myZone.tdrs.filter(t => t.overallScore < 70).length
  const onTarget = myZone.tdrs.filter(t => t.overallScore >= 90).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-hero text-white px-4 pt-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-green-200 text-sm font-medium mb-0.5">Zone Business Manager</p>
          <h1 className="text-2xl font-black mb-1">{zbmProfile.name}</h1>
          <div className="flex items-center gap-2 text-green-200 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>{zbmProfile.zoneName}</span>
            <span>·</span>
            <Users className="w-3.5 h-3.5" />
            <span>{myZone.tdrCount} TDRs</span>
          </div>

          {/* Zone score */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-yellow-300">{myZone.overallScore}%</div>
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

        {/* Zone target vs actual */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Zone Performance — {CURRENT_PERIOD}</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Revenue', actual: `K${myZone.actualRevenue.toLocaleString()}`, target: `K${myZone.targetRevenue.toLocaleString()}`, pct: myZone.revenueAchievementPct, icon: TrendingUp },
              { label: 'Listings', actual: myZone.actualListings, target: myZone.targetListings, pct: Math.round((myZone.actualListings / myZone.targetListings) * 100), icon: ShoppingBag },
              { label: 'New Farmers', actual: myZone.actualNewFarmers, target: myZone.targetNewFarmers, pct: Math.round((myZone.actualNewFarmers / myZone.targetNewFarmers) * 100), icon: Users },
              { label: 'Transactions', actual: myZone.actualTransactions, target: myZone.targetTransactions, pct: Math.round((myZone.actualTransactions / myZone.targetTransactions) * 100), icon: Target },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 font-medium">{m.label}</span>
                  <AchievementBadge pct={m.pct} />
                </div>
                <div className="text-xl font-black text-gray-900">{m.actual}</div>
                <div className="text-xs text-gray-400">of {m.target} target</div>
                <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div className={clsx('h-full rounded-full', m.pct >= 100 ? 'bg-green-500' : m.pct >= 75 ? 'bg-amber-500' : 'bg-red-400')}
                    style={{ width: `${Math.min(m.pct, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TDR Leaderboard */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">TDR Performance ({myZone.tdrCount})</h3>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600"
            >
              <option value="score">By Score</option>
              <option value="revenue">By Revenue</option>
              <option value="listings">By Listings</option>
            </select>
          </div>
          <div className="space-y-2">
            {sortedTDRs.map((tdr, i) => (
              <TDRRow key={tdr.tdrId} tdr={tdr} rank={i + 1} />
            ))}
          </div>
        </div>

        {/* Target source note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>📋 Target Source:</strong> Targets for {zbmProfile.zoneName} are set by the HSD (Head of Sales Division)
            and distributed equally across your {myZone.tdrCount} TDRs. Zone revenue target:
            <strong> K{myZone.targetRevenue.toLocaleString()}</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
