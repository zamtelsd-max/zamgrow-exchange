import { Router, Request, Response } from 'express'
import prisma from '../prisma'
import axios from 'axios'

const router = Router()

router.get('/prices', async (req: Request, res: Response) => {
  try {
    const { product, province } = req.query
    try {
      const pricingUrl = process.env.PRICING_ENGINE_URL || 'http://localhost:8000'
      const { data } = await axios.get(`${pricingUrl}/pricing/suggest`, { params: { product_id: product, province_id: province }, timeout: 3000 })
      return res.json(data)
    } catch {
      // Fallback to database
    }
    const where: Record<string, unknown> = {}
    if (province) where.province = province
    const history = await prisma.priceHistory.findMany({
      where,
      include: { product: { select: { name: true } } },
      orderBy: { recordedAt: 'asc' },
      take: 180,
    })
    res.json(history)
  } catch {
    res.status(500).json({ error: 'Failed to fetch prices' })
  }
})

router.get('/heatmap', async (req: Request, res: Response) => {
  try {
    const { product } = req.query
    try {
      const pricingUrl = process.env.PRICING_ENGINE_URL || 'http://localhost:8000'
      const { data } = await axios.get(`${pricingUrl}/pricing/heatmap`, { params: { product_id: product }, timeout: 3000 })
      return res.json(data)
    } catch {
      // Fallback
    }
    const provinces = await prisma.listing.groupBy({
      by: ['province'],
      where: { status: 'active' },
      _avg: { price: true },
      _count: { id: true },
    })
    res.json(provinces.map(p => ({ province: p.province, avgPrice: p._avg.price || 0, totalListings: p._count.id, priceChange: (Math.random() - 0.5) * 10 })))
  } catch {
    res.status(500).json({ error: 'Failed to fetch heatmap' })
  }
})

export default router
