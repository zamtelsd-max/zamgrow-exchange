/**
 * Sales Performance API Routes
 * GET  /api/v1/sales/zones          — HSD: all zones with performance
 * GET  /api/v1/sales/zones/:id      — ZBM: their zone + all TDRs
 * GET  /api/v1/sales/my             — TDR: own performance vs target
 * POST /api/v1/sales/targets        — HSD: set/update zone targets
 * POST /api/v1/sales/activity       — TDR: log an activity
 * GET  /api/v1/sales/leaderboard    — ZBM/HSD: ranked TDRs
 * GET  /api/v1/sales/history/:tdrId — ZBM/HSD: TDR monthly history
 * GET  /api/v1/sales/export         — HSD: download CSV of all performance
 */

import { Router, Request, Response } from 'express'
import prisma from '../prisma'
import { authenticate, requireRole } from '../middleware/auth'
import { z } from 'zod'

const router = Router()

// ── Helpers ──────────────────────────────────────────────────────────────────
function currentPeriod() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

async function computeZoneStats(zoneId: string, period: string) {
  const target = await prisma.salesTarget.findUnique({ where: { zoneId_period: { zoneId, period } } })
  const tdrs = await prisma.user.findMany({
    where: { zoneId, role: 'tdr' },
    select: { id: true, name: true, phone: true, territory: true }
  })
  const activities = await prisma.salesActivity.findMany({
    where: { zoneId, period }
  })
  const sum = (field: 'revenue' | 'listings' | 'newFarmers' | 'transactions') =>
    activities.reduce((s, a) => s + (a[field] as number), 0)

  const actualRevenue      = sum('revenue')
  const actualListings     = sum('listings')
  const actualNewFarmers   = sum('newFarmers')
  const actualTransactions = sum('transactions')

  const tgtRevenue  = target?.targetRevenue      ?? 0
  const tgtListings = target?.targetListings      ?? 0
  const tgtFarmers  = target?.targetNewFarmers    ?? 0
  const tgtTxns     = target?.targetTransactions  ?? 0

  const revPct  = tgtRevenue  > 0 ? Math.round((actualRevenue  / tgtRevenue)  * 100) : 0
  const listPct = tgtListings > 0 ? Math.round((actualListings / tgtListings) * 100) : 0
  const farmPct = tgtFarmers  > 0 ? Math.round((actualNewFarmers / tgtFarmers) * 100) : 0
  const txnPct  = tgtTxns     > 0 ? Math.round((actualTransactions / tgtTxns)  * 100) : 0
  const overallScore = Math.round(revPct * 0.5 + listPct * 0.25 + farmPct * 0.15 + txnPct * 0.10)

  // Per-TDR assigned targets
  const tdrCount = tdrs.length || 1
  const perTDR = {
    revenue:      tgtRevenue  > 0 ? Math.round(tgtRevenue  / tdrCount) : 0,
    listings:     tgtListings > 0 ? Math.round(tgtListings / tdrCount) : 0,
    newFarmers:   tgtFarmers  > 0 ? Math.round(tgtFarmers  / tdrCount) : 0,
    transactions: tgtTxns     > 0 ? Math.round(tgtTxns     / tdrCount) : 0,
  }

  // TDR performance list
  const tdrPerf = tdrs.map(tdr => {
    const act = activities.find(a => a.tdrId === tdr.id)
    const aRev  = act?.revenue      ?? 0
    const aList = act?.listings     ?? 0
    const aFarm = act?.newFarmers   ?? 0
    const aTxn  = act?.transactions ?? 0
    const rPct  = perTDR.revenue  > 0 ? Math.round((aRev  / perTDR.revenue)      * 100) : 0
    const lPct  = perTDR.listings > 0 ? Math.round((aList / perTDR.listings)     * 100) : 0
    const fPct  = perTDR.newFarmers  > 0 ? Math.round((aFarm / perTDR.newFarmers)  * 100) : 0
    const tPct  = perTDR.transactions > 0 ? Math.round((aTxn / perTDR.transactions) * 100) : 0
    const score = Math.round(rPct * 0.5 + lPct * 0.25 + fPct * 0.15 + tPct * 0.10)
    return {
      tdrId: tdr.id, tdrName: tdr.name, tdrPhone: tdr.phone, territory: tdr.territory,
      actualRevenue: aRev, actualListings: aList, actualNewFarmers: aFarm, actualTransactions: aTxn,
      assignedTargetRevenue: perTDR.revenue, assignedTargetListings: perTDR.listings,
      assignedTargetNewFarmers: perTDR.newFarmers, assignedTargetTransactions: perTDR.transactions,
      revenueAchievementPct: rPct, listingsAchievementPct: lPct, overallScore: score,
      trend: score >= 90 ? 'UP' : score >= 70 ? 'STABLE' : 'DOWN' as const,
    }
  }).sort((a, b) => b.overallScore - a.overallScore)
    .map((t, i) => ({ ...t, rank: i + 1 }))

  return {
    target: target ?? null,
    actualRevenue, actualListings, actualNewFarmers, actualTransactions,
    tgtRevenue, tgtListings, tgtFarmers, tgtTxns,
    revPct, listPct, farmPct, txnPct, overallScore,
    tdrCount, perTDR, tdrs: tdrPerf,
  }
}

// ── GET /sales/zones — HSD only: all zones ────────────────────────────────────
router.get('/zones', authenticate, requireRole(['hsd']), async (_req: Request, res: Response) => {
  try {
    const period = currentPeriod()
    const zones = await prisma.zone.findMany({
      include: {
        zbm: { select: { id: true, name: true, phone: true } },
        _count: { select: { tdrs: true } },
      },
      orderBy: { name: 'asc' },
    })

    const result = await Promise.all(zones.map(async (zone, idx) => {
      const stats = await computeZoneStats(zone.id, period)
      return {
        zoneId: zone.id,
        zoneName: zone.name,
        province: zone.province,
        zbmId: zone.zbmId,
        zbmName: zone.zbm?.name ?? '—',
        zbmPhone: zone.zbm?.phone ?? '—',
        period,
        ...stats,
        tdrCount: zone._count.tdrs,
        rank: idx + 1, // will re-sort below
      }
    }))

    // Re-rank by overall score
    result.sort((a, b) => b.overallScore - a.overallScore)
    result.forEach((z, i) => { z.rank = i + 1 })

    res.json({ success: true, data: result, period })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch zone performance' })
  }
})

// ── GET /sales/zones/:id — ZBM: their own zone ────────────────────────────────
router.get('/zones/:id', authenticate, requireRole(['hsd', 'zbm']), async (req: Request, res: Response) => {
  try {
    const { user } = req as any
    const zoneId = req.params.id

    // ZBM can only access their own zone
    if (user.role === 'zbm' && user.zoneId !== zoneId) {
      return res.status(403).json({ error: 'Access denied — not your zone' })
    }

    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      include: { zbm: { select: { id: true, name: true, phone: true, email: true } } },
    })
    if (!zone) return res.status(404).json({ error: 'Zone not found' })

    const period = currentPeriod()
    const stats = await computeZoneStats(zoneId, period)

    res.json({ success: true, data: { zone, period, ...stats } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch zone' })
  }
})

// ── GET /sales/my — TDR: own performance ─────────────────────────────────────
router.get('/my', authenticate, requireRole(['tdr']), async (req: Request, res: Response) => {
  try {
    const { user } = req as any
    const period = currentPeriod()

    if (!user.zoneId) return res.status(400).json({ error: 'TDR not assigned to a zone' })

    const zone = await prisma.zone.findUnique({ where: { id: user.zoneId } })
    const zbm  = user.zbmId ? await prisma.user.findUnique({
      where: { id: user.zbmId },
      select: { id: true, name: true, phone: true }
    }) : null

    const tdrCount = await prisma.user.count({ where: { zoneId: user.zoneId, role: 'tdr' } })
    const target = await prisma.salesTarget.findUnique({
      where: { zoneId_period: { zoneId: user.zoneId, period } }
    })

    const activity = await prisma.salesActivity.findUnique({
      where: { tdrId_period: { tdrId: user.id, period } }
    })

    const perTDR = target && tdrCount > 0 ? {
      revenue:      Math.round(target.targetRevenue      / tdrCount),
      listings:     Math.round(target.targetListings      / tdrCount),
      newFarmers:   Math.round(target.targetNewFarmers    / tdrCount),
      transactions: Math.round(target.targetTransactions  / tdrCount),
    } : { revenue: 0, listings: 0, newFarmers: 0, transactions: 0 }

    const act = activity ?? { revenue: 0, listings: 0, newFarmers: 0, transactions: 0 }
    const revPct  = perTDR.revenue      > 0 ? Math.round((act.revenue      / perTDR.revenue)      * 100) : 0
    const listPct = perTDR.listings     > 0 ? Math.round((act.listings     / perTDR.listings)     * 100) : 0
    const farmPct = perTDR.newFarmers   > 0 ? Math.round((act.newFarmers   / perTDR.newFarmers)   * 100) : 0
    const txnPct  = perTDR.transactions > 0 ? Math.round((act.transactions / perTDR.transactions) * 100) : 0
    const overallScore = Math.round(revPct * 0.5 + listPct * 0.25 + farmPct * 0.15 + txnPct * 0.10)

    // Zone rank
    const zoneStats = await computeZoneStats(user.zoneId, period)
    const rank = zoneStats.tdrs.findIndex((t: any) => t.tdrId === user.id) + 1

    res.json({
      success: true, data: {
        tdrId: user.id, tdrName: user.name, tdrPhone: user.phone,
        territory: user.territory, zoneId: user.zoneId, zoneName: zone?.name,
        period, zbm,
        actualRevenue: act.revenue, actualListings: act.listings,
        actualNewFarmers: act.newFarmers, actualTransactions: act.transactions,
        assignedTargetRevenue: perTDR.revenue, assignedTargetListings: perTDR.listings,
        assignedTargetNewFarmers: perTDR.newFarmers, assignedTargetTransactions: perTDR.transactions,
        zoneTargetRevenue: target?.targetRevenue ?? 0,
        tdrCount, revPct, listPct, farmPct, txnPct, overallScore,
        rank: rank > 0 ? rank : null,
        trend: overallScore >= 90 ? 'UP' : overallScore >= 70 ? 'STABLE' : 'DOWN',
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch TDR performance' })
  }
})

// ── POST /sales/targets — HSD: set zone targets ───────────────────────────────
const targetSchema = z.object({
  zoneId:             z.string(),
  period:             z.string().regex(/^\d{4}-\d{2}$/),
  targetRevenue:      z.number().positive(),
  targetListings:     z.number().int().positive(),
  targetNewFarmers:   z.number().int().positive(),
  targetTransactions: z.number().int().positive(),
})

router.post('/targets', authenticate, requireRole(['hsd']), async (req: Request, res: Response) => {
  try {
    const { user } = req as any
    const data = targetSchema.parse(req.body)

    const target = await prisma.salesTarget.upsert({
      where: { zoneId_period: { zoneId: data.zoneId, period: data.period } },
      update: {
        targetRevenue:      data.targetRevenue,
        targetListings:     data.targetListings,
        targetNewFarmers:   data.targetNewFarmers,
        targetTransactions: data.targetTransactions,
        setById: user.id,
      },
      create: { ...data, setById: user.id },
    })

    // Get zone name for response
    const zone = await prisma.zone.findUnique({ where: { id: data.zoneId } })
    const tdrCount = await prisma.user.count({ where: { zoneId: data.zoneId, role: 'tdr' } })

    res.json({
      success: true,
      message: `Targets set for ${zone?.name} — ${tdrCount} TDRs each assigned K${Math.round(data.targetRevenue / Math.max(tdrCount, 1)).toLocaleString()}`,
      data: { ...target, tdrCount, perTdrRevenue: Math.round(data.targetRevenue / Math.max(tdrCount, 1)) }
    })
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors })
    console.error(err)
    res.status(500).json({ error: 'Failed to save targets' })
  }
})

// ── POST /sales/activity — TDR: log activity ─────────────────────────────────
const activitySchema = z.object({
  type:        z.enum(['listing_posted', 'farmer_onboarded', 'transaction_completed', 'revenue_recorded']),
  amount:      z.number().optional(),
  description: z.string().optional(),
})

router.post('/activity', authenticate, requireRole(['tdr']), async (req: Request, res: Response) => {
  try {
    const { user } = req as any
    const data = activitySchema.parse(req.body)
    const period = currentPeriod()

    if (!user.zoneId) return res.status(400).json({ error: 'TDR not assigned to a zone' })

    // Log the individual activity
    await prisma.salesActivityLog.create({
      data: {
        tdrId:       user.id,
        type:        data.type,
        amount:      data.amount ?? 0,
        description: data.description,
      }
    })

    // Update aggregate
    const delta: any = {}
    if (data.type === 'listing_posted')         { delta.listings = { increment: 1 } }
    if (data.type === 'farmer_onboarded')        { delta.newFarmers = { increment: 1 } }
    if (data.type === 'transaction_completed')   { delta.transactions = { increment: 1 } }
    if (data.type === 'revenue_recorded')        { delta.revenue = { increment: data.amount ?? 0 } }

    const activity = await prisma.salesActivity.upsert({
      where: { tdrId_period: { tdrId: user.id, period } },
      update: delta,
      create: {
        tdrId:  user.id,
        zoneId: user.zoneId,
        period,
        listings:     data.type === 'listing_posted'       ? 1 : 0,
        newFarmers:   data.type === 'farmer_onboarded'      ? 1 : 0,
        transactions: data.type === 'transaction_completed' ? 1 : 0,
        revenue:      data.type === 'revenue_recorded'      ? (data.amount ?? 0) : 0,
      }
    })

    res.json({ success: true, message: 'Activity logged', data: activity })
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors })
    console.error(err)
    res.status(500).json({ error: 'Failed to log activity' })
  }
})

// ── GET /sales/leaderboard — ZBM/HSD ─────────────────────────────────────────
router.get('/leaderboard', authenticate, requireRole(['hsd', 'zbm']), async (req: Request, res: Response) => {
  try {
    const { user } = req as any
    const period = currentPeriod()
    const zoneId = user.role === 'zbm' ? user.zoneId : (req.query.zoneId as string | undefined)

    const where = zoneId ? { zoneId, role: 'tdr' as const } : { role: 'tdr' as const }
    const tdrs = await prisma.user.findMany({
      where,
      select: { id: true, name: true, phone: true, territory: true, zoneId: true }
    })

    const activities = await prisma.salesActivity.findMany({
      where: { period, ...(zoneId ? { zoneId } : {}) }
    })

    const result = tdrs.map(tdr => {
      const act = activities.find(a => a.tdrId === tdr.id)
      return {
        tdrId: tdr.id, tdrName: tdr.name, tdrPhone: tdr.phone,
        territory: tdr.territory, zoneId: tdr.zoneId,
        revenue:      act?.revenue      ?? 0,
        listings:     act?.listings     ?? 0,
        newFarmers:   act?.newFarmers   ?? 0,
        transactions: act?.transactions ?? 0,
      }
    }).sort((a, b) => b.revenue - a.revenue)
      .map((t, i) => ({ ...t, rank: i + 1 }))

    res.json({ success: true, data: result, period })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

// ── GET /sales/history/:tdrId — monthly history ───────────────────────────────
router.get('/history/:tdrId', authenticate, requireRole(['hsd', 'zbm', 'tdr']), async (req: Request, res: Response) => {
  try {
    const { user } = req as any
    const { tdrId } = req.params

    // TDR can only see their own history
    if (user.role === 'tdr' && user.id !== tdrId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const logs = await prisma.salesActivityLog.findMany({
      where: { tdrId },
      orderBy: { recordedAt: 'desc' },
      take: 200,
    })

    const monthly = await prisma.salesActivity.findMany({
      where: { tdrId },
      orderBy: { period: 'asc' },
    })

    res.json({ success: true, data: { monthly, logs } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

// ── GET /sales/export — HSD CSV export ───────────────────────────────────────
router.get('/export', authenticate, requireRole(['hsd']), async (_req: Request, res: Response) => {
  try {
    const period = currentPeriod()
    const zones  = await prisma.zone.findMany({ include: { zbm: true } })
    const tdrs   = await prisma.user.findMany({ where: { role: 'tdr' } })
    const acts   = await prisma.salesActivity.findMany({ where: { period } })
    const targets = await prisma.salesTarget.findMany({ where: { period } })

    const rows = [
      ['Zone','ZBM','TDR Name','Phone','Territory','Period',
       'Target Revenue','Target Listings','Target Farmers','Target Txns',
       'Actual Revenue','Actual Listings','Actual Farmers','Actual Txns',
       'Revenue %','Overall Score'].join(',')
    ]

    for (const tdr of tdrs) {
      const zone   = zones.find(z => z.id === tdr.zoneId)
      const target = targets.find(t => t.zoneId === tdr.zoneId)
      const tdrCount = tdrs.filter(t => t.zoneId === tdr.zoneId).length || 1
      const act    = acts.find(a => a.tdrId === tdr.id)
      const tgtRev = target ? Math.round(target.targetRevenue / tdrCount) : 0
      const aRev   = act?.revenue ?? 0
      const revPct = tgtRev > 0 ? Math.round((aRev / tgtRev) * 100) : 0

      rows.push([
        zone?.name ?? '', zone?.zbm?.name ?? '', tdr.name, tdr.phone, tdr.territory ?? '',
        period,
        tgtRev,
        target ? Math.round(target.targetListings / tdrCount) : 0,
        target ? Math.round(target.targetNewFarmers / tdrCount) : 0,
        target ? Math.round(target.targetTransactions / tdrCount) : 0,
        act?.revenue ?? 0, act?.listings ?? 0, act?.newFarmers ?? 0, act?.transactions ?? 0,
        `${revPct}%`, `${revPct}%`,
      ].join(','))
    }

    const csv = rows.join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="zamgrow-sales-${period}.csv"`)
    res.send(csv)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Export failed' })
  }
})

// ── GET /sales/zones/setup — seed zones + ZBMs (admin only) ──────────────────
router.post('/setup/zones', authenticate, requireRole(['hsd', 'admin']), async (_req: Request, res: Response) => {
  const ZONE_DATA = [
    { name: 'Lusaka Zone',        province: 'Lusaka' },
    { name: 'Copperbelt Zone',    province: 'Copperbelt' },
    { name: 'Northern Zone',      province: 'Northern' },
    { name: 'Eastern Zone',       province: 'Eastern' },
    { name: 'Southern Zone',      province: 'Southern' },
    { name: 'Western Zone',       province: 'Western' },
    { name: 'Luapula Zone',       province: 'Luapula' },
    { name: 'Muchinga Zone',      province: 'Muchinga' },
    { name: 'North-Western Zone', province: 'North-Western' },
    { name: 'Central Zone',       province: 'Central' },
  ]
  try {
    for (const z of ZONE_DATA) {
      await prisma.zone.upsert({
        where: { name: z.name },
        update: {},
        create: z,
      })
    }
    res.json({ success: true, message: `${ZONE_DATA.length} zones created/updated` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Zone setup failed' })
  }
})

export default router
