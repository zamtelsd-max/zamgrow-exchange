import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { id: true, name: true, phone: true, email: true, role: true, province: true, district: true, credits: true, subscription: true, verified: true, rating: true, totalReviews: true, createdAt: true } })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

router.get('/:id/profile', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, name: true, role: true, province: true, district: true, rating: true, totalReviews: true, verified: true, createdAt: true } })
    if (!user) return res.status(404).json({ error: 'User not found' })
    const listings = await prisma.listing.findMany({ where: { sellerId: req.params.id, status: 'active' }, take: 6, include: { photos: { take: 1 }, product: true } })
    res.json({ ...user, listings })
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

router.post('/watchlist/:listingId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.watchlistItem.findUnique({ where: { userId_listingId: { userId: req.user!.userId, listingId: req.params.listingId } } })
    if (existing) {
      await prisma.watchlistItem.delete({ where: { id: existing.id } })
      return res.json({ saved: false })
    }
    await prisma.watchlistItem.create({ data: { userId: req.user!.userId, listingId: req.params.listingId } })
    res.json({ saved: true })
  } catch {
    res.status(500).json({ error: 'Failed to update watchlist' })
  }
})

router.get('/watchlist', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.watchlistItem.findMany({ where: { userId: req.user!.userId }, include: { listing: { include: { photos: { take: 1 }, product: true, seller: { select: { name: true, rating: true } } } } }, orderBy: { createdAt: 'desc' } })
    res.json(items.map(i => i.listing))
  } catch {
    res.status(500).json({ error: 'Failed to fetch watchlist' })
  }
})

export default router
