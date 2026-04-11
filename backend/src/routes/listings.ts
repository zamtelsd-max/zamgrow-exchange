import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate, AuthRequest, optionalAuth } from '../middleware/auth'
import { requireCredits } from '../middleware/credits'
import { paginate, calculateExpiryDate } from '../utils/helpers'
import { z } from 'zod'

const router = Router()

const listingSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().optional(),
  type: z.enum(['sell', 'buy']),
  price: z.number().positive(),
  unit: z.string().min(1),
  quantity: z.number().positive(),
  productId: z.number().int().positive(),
  province: z.string(),
  district: z.string().optional(),
  photos: z.array(z.string()).optional(),
})

router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { category, province, district, type, price_min, price_max, search, sort, page = '1', limit = '12' } = req.query as Record<string, string>
    const where: Record<string, unknown> = { status: 'active' }
    if (province) where.province = province
    if (district) where.district = district
    if (type) where.type = type
    if (search) where.title = { contains: search, mode: 'insensitive' }
    if (price_min || price_max) {
      where.price = {}
      if (price_min) (where.price as Record<string, number>).gte = parseFloat(price_min)
      if (price_max) (where.price as Record<string, number>).lte = parseFloat(price_max)
    }
    const orderBy: Record<string, string> = sort === 'price_asc' ? { price: 'asc' } : sort === 'price_desc' ? { price: 'desc' } : { createdAt: 'desc' }
    const { skip, take } = paginate(parseInt(page), parseInt(limit))
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { photos: { take: 1 }, seller: { select: { name: true, rating: true, verified: true } }, product: { include: { category: true } } }
      }),
      prisma.listing.count({ where })
    ])
    res.json({ listings, total, totalPages: Math.ceil(total / take), page: parseInt(page) })
  } catch {
    res.status(500).json({ error: 'Failed to fetch listings' })
  }
})

router.post('/', authenticate, requireCredits(1), async (req: AuthRequest, res: Response) => {
  try {
    const data = listingSchema.parse(req.body)
    const listing = await prisma.$transaction(async (tx) => {
      const l = await tx.listing.create({
        data: {
          ...data,
          sellerId: req.user!.userId,
          expiresAt: calculateExpiryDate(90),
          photos: data.photos ? { createMany: { data: data.photos.map((url, order) => ({ url, order })) } } : undefined,
        },
        include: { photos: true, product: { include: { category: true } } }
      })
      await tx.user.update({ where: { id: req.user!.userId }, data: { credits: { decrement: 1 } } })
      await tx.creditsLog.create({ data: { userId: req.user!.userId, amount: -1, type: 'spent', description: `Listed: ${data.title}` } })
      return l
    })
    res.status(201).json(listing)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid data', details: err.errors })
    res.status(500).json({ error: 'Failed to create listing' })
  }
})

router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: { photos: true, seller: { select: { id: true, name: true, phone: true, rating: true, totalReviews: true, verified: true, province: true, district: true, createdAt: true } }, product: { include: { category: true } }, offers: { include: { buyer: { select: { name: true } } } } }
    })
    if (!listing) return res.status(404).json({ error: 'Listing not found' })
    await prisma.listing.update({ where: { id: req.params.id }, data: { views: { increment: 1 } } })
    res.json(listing)
  } catch {
    res.status(500).json({ error: 'Failed to fetch listing' })
  }
})

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } })
    if (!listing) return res.status(404).json({ error: 'Listing not found' })
    if (listing.sellerId !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' })
    }
    const updated = await prisma.listing.update({ where: { id: req.params.id }, data: req.body })
    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to update listing' })
  }
})

router.post('/:id/offers', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } })
    if (!listing) return res.status(404).json({ error: 'Listing not found' })
    if (listing.sellerId === req.user!.userId) return res.status(400).json({ error: 'Cannot offer on your own listing' })
    const offer = await prisma.offer.create({
      data: { listingId: req.params.id, buyerId: req.user!.userId, price: req.body.price, message: req.body.message },
      include: { buyer: { select: { name: true, phone: true } } }
    })
    res.status(201).json(offer)
  } catch {
    res.status(500).json({ error: 'Failed to create offer' })
  }
})

router.get('/:id/offers', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { listingId: req.params.id },
      include: { buyer: { select: { name: true, phone: true, rating: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(offers)
  } catch {
    res.status(500).json({ error: 'Failed to fetch offers' })
  }
})

export default router
