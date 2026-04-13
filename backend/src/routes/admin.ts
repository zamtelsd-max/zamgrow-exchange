import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate, AuthRequest, requireRole } from '../middleware/auth'

const router = Router()
router.use(authenticate, requireRole(['admin', 'hsd']))

router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, activeListings, totalTransactions] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: 'active' } }),
      prisma.transaction.count({ where: { status: 'completed' } }),
    ])
    const revenue = await prisma.transaction.aggregate({ where: { status: 'completed' }, _sum: { amount: true } })
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const [newUsersThisWeek, listingsThisWeek, pendingModeration] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.listing.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.listing.count({ where: { status: 'pending' } }),
    ])
    res.json({ totalUsers, activeListings, totalTransactions, revenue: revenue._sum.amount || 0, newUsersThisWeek, listingsThisWeek, pendingModeration })
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', role, search } = req.query as Record<string, string>
    const where: Record<string, unknown> = {}
    if (role) where.role = role
    if (search) where.name = { contains: search, mode: 'insensitive' }
    const users = await prisma.user.findMany({ where, take: parseInt(limit), skip: (parseInt(page) - 1) * parseInt(limit), orderBy: { createdAt: 'desc' }, select: { id: true, name: true, phone: true, role: true, province: true, subscription: true, verified: true, banned: true, credits: true, createdAt: true } })
    const total = await prisma.user.count({ where })
    res.json({ users, total })
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

router.post('/users/:id/ban', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { banned: true } })
    res.json({ success: true, user })
  } catch {
    res.status(500).json({ error: 'Failed to ban user' })
  }
})

router.get('/moderation', async (_req: AuthRequest, res: Response) => {
  try {
    const listings = await prisma.listing.findMany({ where: { status: 'pending' }, include: { photos: { take: 1 }, seller: { select: { name: true, phone: true } }, product: true }, orderBy: { createdAt: 'asc' } })
    res.json(listings)
  } catch {
    res.status(500).json({ error: 'Failed to fetch moderation queue' })
  }
})

router.post('/listings/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const listing = await prisma.listing.update({ where: { id: req.params.id }, data: { status: 'active' } })
    res.json(listing)
  } catch {
    res.status(500).json({ error: 'Failed to approve listing' })
  }
})

router.post('/listings/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const listing = await prisma.listing.update({ where: { id: req.params.id }, data: { status: 'rejected' } })
    res.json(listing)
  } catch {
    res.status(500).json({ error: 'Failed to reject listing' })
  }
})

export default router
