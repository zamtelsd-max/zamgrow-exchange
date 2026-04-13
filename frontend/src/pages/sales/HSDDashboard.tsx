/**
 * HSD Dashboard — Head of Sales Division
 * Full national view: all zones, set targets, see every ZBM + TDR
 */
import { useMemo, useState } from 'react'
import { buildZonePerformance, ZONE_TARGETS, ZONES, ZBM_PROFILES, CURRENT_PERIOD } from '../../services/salesData'
import type { ZonePerformance, SalesTarget } from '../../types'
import {
  TrendingUp, Target, Users, ShoppingBag, Award, Globe,
  Edit3, Save, X, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Phone
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

function ZoneCard({ zone, onEdit }: { zone: ZonePerformance; onEdit: (z: ZonePerformance) => void }) {
  const [open, setOpen] = useState(false)
  const pct = zone.revenueAchievementPct
  const statusColor = pct >= 90 ? 'border-l-green-500' : pct >= 70 ? 'border-l-amber-500' : 'border-l-red-500'

  return (
    <div className={clsx('bg-white rounded-xl border border-gray-200 border-l-4 overflow-hidden', statusColor)}>
      <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-left" onClick={() => setOpen(!open)}>
        {/* Rank */}
        <div className={clsx(
          'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black',
          zone.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
          zone.rank === 2 ? 'bg-gray-300 text-gray-700' :
          zone.rank === 3 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'
        )}>{zone.rank}</div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-sm">{zone.zoneName}</div>
          <div className="text-xs text-gray-400">{zone.zbmName} · {zone.tdrCount} TDRs</div>
        </div>

        {/* Revenue progress */}
        <div className="hidden sm:block w-28">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Revenue</span>
            <span className={clsx('font-bold', pct >= 90 ? 'text-green-600' : pct >= 70 ? 'text-amber-600' : 'text-red-500')}>{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={clsx('h-full rounded-full', pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-400')}
              style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className={clsx('text-xl font-black', pct >= 90 ? 'text-green-600' : pct >= 70 ? 'text-amber-600' : 'text-red-500')}>
            {zone.overallScore}%
          </div>
        </div>

        <button
          onClick={e => { e.stopPropagation(); onEdit(zone) }}
          className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-primary-100 flex-shrink-0"
          title="Edit targets"
        >
          <Edit3 className="w-3.5 h-3.5 text-gray-500" />
        </button>

        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          {/* Zone metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[
              { l: 'Revenue', a: `K${zone.actualRevenue.toLocaleString()}`, t: `K${zone.targetRevenue.toLocaleString()}`, p: zone.revenueAchievementPct },
              { l: 'Listings', a: zone.actualListings, t: zone.targetListings, p: Math.round((zone.actualListings / zone.targetListings) * 100) },
              { l: 'Farmers', a: zone.actualNewFarmers, t: zone.targetNewFarmers, p: Math.round((zone.actualNewFarmers / zone.targetNewFarmers) * 100) },
              { l: 'Txns', a: zone.actualTransactions, t: zone.targetTransactions, p: Math.round((zone.actualTransactions / zone.targetTransactions) * 100) },
            ].map(m => (
              <div key={m.l} className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                <div className="text-xs text-gray-400">{m.l}</div>
                <div className="font-black text-gray-900">{m.a}</div>
                <div className={clsx('text-xs font-bold', m.p >= 90 ? 'text-green-600' : m.p >= 70 ? 'text-amber-600' : 'text-red-500')}>{m.p}%</div>
                <div className="text-xs text-gray-400">/ {m.t}</div>
              </div>
            ))}
          </div>

          {/* Top 3 TDRs */}
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Top TDRs</h4>
          <div className="space-y-1">
            {zone.tdrs.sort((a, b) => b.overallScore - a.overallScore).slice(0, 3).map((tdr, i) => (
              <div key={tdr.tdrId} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100 text-sm">
                <span className={clsx('text-xs font-black w-5', i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-500' : 'text-amber-600')}>#{i + 1}</span>
                <span className="flex-1 font-medium text-gray-800">{tdr.tdrName}</span>
                <span className={clsx('text-xs font-bold', tdr.overallScore >= 90 ? 'text-green-600' : tdr.overallScore >= 70 ? 'text-amber-600' : 'text-red-500')}>
                  {tdr.overallScore}%
                </span>
                <a href={`tel:${tdr.tdrPhone}`} className="text-gray-400 hover:text-primary-600">
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>

          {/* At-risk alert */}
          {zone.tdrs.filter(t => t.overallScore < 70).length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{zone.tdrs.filter(t => t.overallScore < 70).length} TDR(s) below 70% — coaching needed</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Target edit modal ─────────────────────────────────────────────────────────
function TargetEditModal({ zone, onClose }: { zone: ZonePerformance; onClose: () => void }) {
  const [revenue, setRevenue] = useState(String(zone.targetRevenue))
  const [listings, setListings] = useState(String(zone.targetListings))
  const [farmers, setFarmers] = useState(String(zone.targetNewFarmers))
  const [txns, setTxns] = useState(String(zone.targetTransactions))

  const perTDR = (val: string) => Math.round(Number(val) / zone.tdrCount)

  const handleSave = () => {
    toast.success(`Targets updated for ${zone.zoneName}!`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Set Targets</h2>
            <p className="text-sm text-gray-500">{zone.zoneName} · {zone.tdrCount} TDRs</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: 'Revenue Target (ZMW)', val: revenue, set: setRevenue, prefix: 'K' },
            { label: 'Listings Target', val: listings, set: setListings },
            { label: 'New Farmers Target', val: farmers, set: setFarmers },
            { label: 'Transactions Target', val: txns, set: setTxns },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
              <div className="relative">
                {f.prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{f.prefix}</span>}
                <input
                  type="number"
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  className={clsx('input w-full', f.prefix && 'pl-8')}
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Per TDR: <strong className="text-primary-600">{f.prefix ?? ''}{perTDR(f.val).toLocaleString()}</strong>
                {' '}(zone total ÷ {zone.tdrCount} TDRs)
              </p>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-gray-200 flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          <button onClick={handleSave} className="flex-1 btn-primary flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            Save Targets
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── HSD Dashboard ────────────────────────────────────────────────────────────
export default function HSDDashboard() {
  const zones = useMemo(() => buildZonePerformance(), [])
  const [editZone, setEditZone] = useState<ZonePerformance | null>(null)
  const [sortBy, setSortBy] = useState<'rank' | 'revenue' | 'score'>('rank')

  const sorted = useMemo(() => [...zones].sort((a, b) => {
    if (sortBy === 'revenue') return b.actualRevenue - a.actualRevenue
    if (sortBy === 'score')   return b.overallScore  - a.overallScore
    return a.rank - b.rank
  }), [zones, sortBy])

  const totals = useMemo(() => ({
    revenue:  zones.reduce((s, z) => s + z.actualRevenue, 0),
    tRevenue: zones.reduce((s, z) => s + z.targetRevenue, 0),
    listings: zones.reduce((s, z) => s + z.actualListings, 0),
    farmers:  zones.reduce((s, z) => s + z.actualNewFarmers, 0),
    txns:     zones.reduce((s, z) => s + z.actualTransactions, 0),
    tdrCount: zones.reduce((s, z) => s + z.tdrCount, 0),
    onTarget: zones.filter(z => z.overallScore >= 90).length,
    atRisk:   zones.filter(z => z.overallScore < 70).length,
  }), [zones])

  const nationalPct = Math.round((totals.revenue / totals.tRevenue) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-hero text-white px-4 pt-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-green-200 text-sm font-medium">Head of Sales Division</p>
              <h1 className="text-2xl font-black">National Overview</h1>
              <p className="text-green-200 text-sm mt-1">{CURRENT_PERIOD} · All Zones</p>
            </div>
            <div className="text-right">
              <div className={clsx('text-4xl font-black', nationalPct >= 90 ? 'text-yellow-300' : nationalPct >= 70 ? 'text-amber-200' : 'text-red-300')}>
                {nationalPct}%
              </div>
              <div className="text-green-200 text-xs">National Revenue</div>
            </div>
          </div>

          {/* National KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Revenue', value: `K${(totals.revenue / 1000).toFixed(0)}K`, sub: `of K${(totals.tRevenue/1000).toFixed(0)}K`, icon: TrendingUp },
              { label: 'TDRs', value: totals.tdrCount, sub: `${totals.onTarget} on target`, icon: Users },
              { label: 'Zones On Target', value: totals.onTarget, sub: `${totals.atRisk} at risk`, icon: Award },
              { label: 'Listings', value: totals.listings, sub: `${totals.txns} txns`, icon: ShoppingBag },
            ].map(k => (
              <div key={k.label} className="bg-white/10 rounded-xl p-3">
                <div className="text-2xl font-black text-yellow-300">{k.value}</div>
                <div className="text-xs text-green-200">{k.label}</div>
                <div className="text-xs text-white/60">{k.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 pb-12 space-y-4">

        {/* Sort + filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">All Zones ({zones.length})</h3>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600">
            <option value="rank">By Rank</option>
            <option value="revenue">By Revenue</option>
            <option value="score">By Score</option>
          </select>
        </div>

        {/* Zone cards */}
        <div className="space-y-3">
          {sorted.map(zone => (
            <ZoneCard key={zone.zoneId} zone={zone} onEdit={setEditZone} />
          ))}
        </div>

        {/* Summary insight */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="text-sm font-bold text-amber-800 mb-1">💡 Quick Insight</h4>
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>{zones.sort((a,b) => b.overallScore - a.overallScore)[0].zoneName}</strong> leads nationally
            at <strong>{zones.sort((a,b) => b.overallScore - a.overallScore)[0].overallScore}%</strong>.
            {totals.atRisk > 0 && ` ${totals.atRisk} zone(s) are below 70% — follow up with ZBMs needed.`}
          </p>
        </div>
      </div>

      {editZone && <TargetEditModal zone={editZone} onClose={() => setEditZone(null)} />}
    </div>
  )
}
