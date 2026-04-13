/**
 * HSD Dashboard — Head of Sales Division
 * Live data from API · Falls back to mock if API unreachable · Shows status banner
 */
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useAllZones, saveZoneTargets, DataStatus } from '../../hooks/useSalesData'
import {
  TrendingUp, Users, ShoppingBag, Target, Award,
  Edit3, Save, X, AlertCircle, CheckCircle, ChevronDown, ChevronUp,
  Phone, RefreshCw, Wifi, WifiOff, Download, Loader2
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import api from '../../services/api'

// ── Status banner ────────────────────────────────────────────────────────────
function StatusBanner({ status, error, reload }: { status: DataStatus; error: string | null; reload: () => void }) {
  if (status === 'live') return null
  if (status === 'loading') return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center gap-2 text-xs text-blue-700">
      <Loader2 className="w-3.5 h-3.5 animate-spin" />
      Loading live data...
    </div>
  )
  return (
    <div className="bg-amber-50 border-b border-amber-300 px-4 py-2 flex items-center justify-between text-xs text-amber-700">
      <div className="flex items-center gap-2">
        <WifiOff className="w-3.5 h-3.5" />
        <span>Offline — showing last known data. {error}</span>
      </div>
      <button onClick={reload} className="flex items-center gap-1 font-semibold hover:text-amber-900">
        <RefreshCw className="w-3 h-3" /> Retry
      </button>
    </div>
  )
}

// ── Achievement badge ────────────────────────────────────────────────────────
function AchievementBadge({ pct }: { pct: number }) {
  if (pct >= 100) return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ {pct}%</span>
  if (pct >= 75)  return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⚡ {pct}%</span>
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">⚠ {pct}%</span>
}

// ── Zone card ────────────────────────────────────────────────────────────────
function ZoneCard({ zone, onEdit }: { zone: any; onEdit: (z: any) => void }) {
  const [open, setOpen] = useState(false)
  const pct = zone.revPct ?? zone.revenueAchievementPct ?? 0
  const score = zone.overallScore ?? 0

  return (
    <div className={clsx('bg-white rounded-xl border border-gray-200 border-l-4 overflow-hidden',
      score >= 90 ? 'border-l-green-500' : score >= 70 ? 'border-l-amber-500' : 'border-l-red-500'
    )}>
      <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-left" onClick={() => setOpen(!open)}>
        <div className={clsx('w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black',
          zone.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
          zone.rank === 2 ? 'bg-gray-300 text-gray-700' :
          zone.rank === 3 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'
        )}>{zone.rank}</div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-sm">{zone.zoneName}</div>
          <div className="text-xs text-gray-400">{zone.zbmName} · {zone.tdrCount} TDRs</div>
        </div>

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

        <div className={clsx('text-xl font-black flex-shrink-0',
          score >= 90 ? 'text-green-600' : score >= 70 ? 'text-amber-600' : 'text-red-500'
        )}>{score}%</div>

        <button onClick={e => { e.stopPropagation(); onEdit(zone) }}
          className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-primary-100 flex-shrink-0">
          <Edit3 className="w-3.5 h-3.5 text-gray-500" />
        </button>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[
              { l: 'Revenue',     a: `K${(zone.actualRevenue ?? 0).toLocaleString()}`,      t: `K${(zone.tgtRevenue ?? zone.targetRevenue ?? 0).toLocaleString()}`,      p: zone.revPct  ?? zone.revenueAchievementPct ?? 0 },
              { l: 'Listings',    a: zone.actualListings    ?? 0,                            t: zone.tgtListings    ?? zone.targetListings    ?? 0,                        p: zone.listPct ?? Math.round(((zone.actualListings ?? 0) / Math.max(zone.tgtListings ?? zone.targetListings ?? 1, 1)) * 100) },
              { l: 'Farmers',     a: zone.actualNewFarmers  ?? 0,                            t: zone.tgtFarmers     ?? zone.targetNewFarmers  ?? 0,                        p: zone.farmPct ?? Math.round(((zone.actualNewFarmers ?? 0) / Math.max(zone.tgtFarmers ?? zone.targetNewFarmers ?? 1, 1)) * 100) },
              { l: 'Txns',        a: zone.actualTransactions ?? 0,                           t: zone.tgtTxns        ?? zone.targetTransactions ?? 0,                       p: zone.txnPct  ?? Math.round(((zone.actualTransactions ?? 0) / Math.max(zone.tgtTxns ?? zone.targetTransactions ?? 1, 1)) * 100) },
            ].map(m => (
              <div key={m.l} className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                <div className="text-xs text-gray-400">{m.l}</div>
                <div className="font-black text-gray-900">{m.a}</div>
                <div className={clsx('text-xs font-bold', m.p >= 90 ? 'text-green-600' : m.p >= 70 ? 'text-amber-600' : 'text-red-500')}>{m.p}%</div>
                <div className="text-xs text-gray-400">/ {m.t}</div>
              </div>
            ))}
          </div>

          {/* Top TDRs */}
          {(zone.tdrs ?? []).length > 0 && (
            <>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Top TDRs</h4>
              <div className="space-y-1">
                {(zone.tdrs as any[]).sort((a: any, b: any) => b.overallScore - a.overallScore).slice(0, 3).map((tdr: any, i: number) => (
                  <div key={tdr.tdrId} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100 text-sm">
                    <span className={clsx('text-xs font-black w-5', i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-500' : 'text-amber-600')}>#{i+1}</span>
                    <span className="flex-1 font-medium text-gray-800">{tdr.tdrName}</span>
                    <span className={clsx('text-xs font-bold', tdr.overallScore >= 90 ? 'text-green-600' : tdr.overallScore >= 70 ? 'text-amber-600' : 'text-red-500')}>{tdr.overallScore}%</span>
                    <a href={`tel:${tdr.tdrPhone}`} className="text-gray-400 hover:text-primary-600"><Phone className="w-3.5 h-3.5" /></a>
                  </div>
                ))}
              </div>
            </>
          )}

          {(zone.tdrs ?? []).filter((t: any) => (t.overallScore ?? 0) < 70).length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {(zone.tdrs as any[]).filter((t: any) => (t.overallScore ?? 0) < 70).length} TDR(s) below 70% — coaching needed
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Target edit modal ─────────────────────────────────────────────────────────
function TargetEditModal({ zone, period, onClose, onSaved }: {
  zone: any; period: string; onClose: () => void; onSaved: () => void
}) {
  const [revenue,  setRevenue]  = useState(String(zone.tgtRevenue  ?? zone.targetRevenue  ?? 0))
  const [listings, setListings] = useState(String(zone.tgtListings ?? zone.targetListings ?? 0))
  const [farmers,  setFarmers]  = useState(String(zone.tgtFarmers  ?? zone.targetNewFarmers  ?? 0))
  const [txns,     setTxns]     = useState(String(zone.tgtTxns     ?? zone.targetTransactions ?? 0))
  const [saving,   setSaving]   = useState(false)

  const perTDR = (val: string) => zone.tdrCount > 0
    ? `K${Math.round(Number(val) / zone.tdrCount).toLocaleString()} each`
    : '—'

  const handleSave = async () => {
    setSaving(true)
    const result = await saveZoneTargets({
      zoneId:             zone.zoneId,
      period,
      targetRevenue:      Number(revenue),
      targetListings:     Number(listings),
      targetNewFarmers:   Number(farmers),
      targetTransactions: Number(txns),
    })
    setSaving(false)
    if (result.success) {
      toast.success(result.message || `Targets saved for ${zone.zoneName}`)
      onSaved()
      onClose()
    } else {
      toast.error(result.message || 'Failed to save targets')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Set Targets — {zone.zoneName}</h2>
            <p className="text-sm text-gray-500">{period} · {zone.tdrCount} TDRs</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {[
            { label: 'Revenue Target (ZMW)', val: revenue, set: setRevenue, prefix: 'K' },
            { label: 'Listings Target',      val: listings, set: setListings },
            { label: 'New Farmers Target',   val: farmers,  set: setFarmers },
            { label: 'Transactions Target',  val: txns,     set: setTxns },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
              <div className="relative">
                {f.prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{f.prefix}</span>}
                <input type="number" value={f.val} onChange={e => f.set(e.target.value)}
                  className={clsx('input w-full', f.prefix && 'pl-8')} />
              </div>
              {f.label.includes('Revenue') && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Per TDR: <strong className="text-primary-600">{perTDR(f.val)}</strong> (÷ {zone.tdrCount} TDRs)
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-gray-200 flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Targets'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── HSD Dashboard ─────────────────────────────────────────────────────────────
export default function HSDDashboard() {
  const { user } = useSelector((s: RootState) => s.auth)
  const { data: zones, period, status, error, reload } = useAllZones()
  const [editZone,  setEditZone]  = useState<any>(null)
  const [sortBy,    setSortBy]    = useState<'rank' | 'revenue' | 'score'>('rank')
  const [exporting, setExporting] = useState(false)

  const sorted = useMemo(() => [...zones].sort((a, b) => {
    if (sortBy === 'revenue') return (b.actualRevenue ?? 0) - (a.actualRevenue ?? 0)
    if (sortBy === 'score')   return (b.overallScore  ?? 0) - (a.overallScore  ?? 0)
    return (a.rank ?? 0) - (b.rank ?? 0)
  }), [zones, sortBy])

  const totals = useMemo(() => ({
    revenue:  zones.reduce((s, z) => s + (z.actualRevenue ?? 0), 0),
    tRevenue: zones.reduce((s, z) => s + (z.tgtRevenue ?? z.targetRevenue ?? 0), 0),
    tdrCount: zones.reduce((s, z) => s + (z.tdrCount ?? 0), 0),
    onTarget: zones.filter(z => (z.overallScore ?? 0) >= 90).length,
    atRisk:   zones.filter(z => (z.overallScore ?? 0) < 70).length,
    listings: zones.reduce((s, z) => s + (z.actualListings ?? 0), 0),
    txns:     zones.reduce((s, z) => s + (z.actualTransactions ?? 0), 0),
  }), [zones])

  const nationalPct = totals.tRevenue > 0 ? Math.round((totals.revenue / totals.tRevenue) * 100) : 0

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await api.sales.exportCsv()
      const url = URL.createObjectURL(blob as Blob)
      const a = document.createElement('a')
      a.href = url; a.download = `zamgrow-sales-${period}.csv`; a.click()
      URL.revokeObjectURL(url)
      toast.success('Export downloaded')
    } catch {
      toast.error('Export unavailable — backend not connected')
    }
    setExporting(false)
  }

  const topZone = [...zones].sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0))[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <StatusBanner status={status} error={error} reload={reload} />

      {/* Header */}
      <div className="gradient-hero text-white px-4 pt-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-green-200 text-sm font-medium">Head of Sales Division</p>
                {status === 'live' && <span className="flex items-center gap-1 text-xs bg-green-700/40 text-green-200 px-2 py-0.5 rounded-full"><Wifi className="w-3 h-3" /> Live</span>}
              </div>
              <h1 className="text-2xl font-black">{user?.name ?? 'HSD Dashboard'}</h1>
              <p className="text-green-200 text-sm mt-1">{period} · All Zones</p>
            </div>
            <div className="text-right">
              <div className={clsx('text-4xl font-black', nationalPct >= 90 ? 'text-yellow-300' : nationalPct >= 70 ? 'text-amber-200' : 'text-red-300')}>
                {nationalPct}%
              </div>
              <div className="text-green-200 text-xs">National Revenue</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Revenue', value: `K${Math.round(totals.revenue / 1000)}K`, sub: `of K${Math.round(totals.tRevenue / 1000)}K` },
              { label: 'TDRs', value: totals.tdrCount, sub: `${totals.onTarget} on target` },
              { label: 'Zones On Target', value: totals.onTarget, sub: `${totals.atRisk} at risk` },
              { label: 'Listings', value: totals.listings, sub: `${totals.txns} txns` },
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

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-bold text-gray-900">All Zones ({zones.length})</h3>
          <div className="flex items-center gap-2">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600">
              <option value="rank">By Rank</option>
              <option value="revenue">By Revenue</option>
              <option value="score">By Score</option>
            </select>
            <button onClick={handleExport} disabled={exporting}
              className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Export CSV
            </button>
            <button onClick={reload} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {status === 'loading' ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(zone => (
              <ZoneCard key={zone.zoneId} zone={zone} onEdit={setEditZone} />
            ))}
          </div>
        )}

        {topZone && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="text-sm font-bold text-amber-800 mb-1">💡 Quick Insight</h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>{topZone.zoneName}</strong> leads nationally at <strong>{topZone.overallScore}%</strong>.
              {totals.atRisk > 0 && ` ${totals.atRisk} zone(s) below 70% — ZBM follow-up recommended.`}
              {status === 'offline' && ' (Showing cached/demo data — connect backend for live figures.)'}
            </p>
          </div>
        )}
      </div>

      {editZone && (
        <TargetEditModal
          zone={editZone}
          period={period}
          onClose={() => setEditZone(null)}
          onSaved={reload}
        />
      )}
    </div>
  )
}
