import { Router } from 'express'
import { sendSuccess } from '../utils/helpers'

const router = Router()

// Mock price data for all provinces
const PRICE_DATA = [
  { productId: 'maize', product: 'Maize', provinceId: 3, province: 'Eastern', avgPrice: 315, minPrice: 280, maxPrice: 360, suggestedPrice: 310, confidenceScore: 0.87, dataPoints: 142, unit: 'per 50kg bag', currency: 'ZMW', trend: 'UP', changePercent: 3.2 },
  { productId: 'maize', product: 'Maize', provinceId: 1, province: 'Central', avgPrice: 300, minPrice: 270, maxPrice: 340, suggestedPrice: 298, confidenceScore: 0.91, dataPoints: 189, unit: 'per 50kg bag', currency: 'ZMW', trend: 'STABLE', changePercent: 0.5 },
  { productId: 'soya', product: 'Soya Beans', provinceId: 3, province: 'Eastern', avgPrice: 430, minPrice: 390, maxPrice: 490, suggestedPrice: 425, confidenceScore: 0.82, dataPoints: 76, unit: 'per 50kg bag', currency: 'ZMW', trend: 'UP', changePercent: 5.1 },
  { productId: 'wheat', product: 'Wheat', provinceId: 1, province: 'Central', avgPrice: 375, minPrice: 340, maxPrice: 420, suggestedPrice: 372, confidenceScore: 0.79, dataPoints: 54, unit: 'per 50kg bag', currency: 'ZMW', trend: 'STABLE', changePercent: 0.8 },
]

/**
 * @swagger
 * /pricing/suggest:
 *   get:
 *     summary: Get AI price suggestion for a product/location
 *     tags: [Pricing]
 *     parameters:
 *       - in: query
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: province_id
 *         schema:
 *           type: integer
 */
router.get('/suggest', (req, res) => {
  const { product_id, province_id } = req.query

  let match = PRICE_DATA.find(p =>
    p.productId === product_id &&
    (!province_id || p.provinceId === Number(province_id))
  )

  if (!match) match = PRICE_DATA.find(p => p.productId === product_id)

  if (!match) {
    // Generate a plausible response for any product
    const basePrice = 200 + Math.random() * 300
    match = {
      productId: String(product_id),
      product: String(product_id),
      provinceId: Number(province_id) || 1,
      province: 'All',
      avgPrice: Math.round(basePrice),
      minPrice: Math.round(basePrice * 0.85),
      maxPrice: Math.round(basePrice * 1.2),
      suggestedPrice: Math.round(basePrice * 0.97),
      confidenceScore: 0.65,
      dataPoints: Math.floor(Math.random() * 40 + 10),
      unit: 'per 50kg bag',
      currency: 'ZMW',
      trend: 'STABLE',
      changePercent: 0,
    }
  }

  sendSuccess(res, { ...match, lastUpdated: new Date().toISOString() })
})

/**
 * @swagger
 * /pricing/heatmap:
 *   get:
 *     summary: Get province price heatmap data
 *     tags: [Pricing]
 */
router.get('/heatmap', (req, res) => {
  const heatmap = [
    { provinceId: 1, provinceName: 'Central', avgPrice: 300, listingCount: 47, intensity: 0.65 },
    { provinceId: 2, provinceName: 'Copperbelt', avgPrice: 340, listingCount: 31, intensity: 0.55 },
    { provinceId: 3, provinceName: 'Eastern', avgPrice: 315, listingCount: 89, intensity: 0.92 },
    { provinceId: 4, provinceName: 'Luapula', avgPrice: 280, listingCount: 23, intensity: 0.40 },
    { provinceId: 5, provinceName: 'Lusaka', avgPrice: 360, listingCount: 112, intensity: 1.0 },
    { provinceId: 6, provinceName: 'Muchinga', avgPrice: 270, listingCount: 18, intensity: 0.30 },
    { provinceId: 7, provinceName: 'Northern', avgPrice: 285, listingCount: 27, intensity: 0.45 },
    { provinceId: 8, provinceName: 'North-Western', avgPrice: 295, listingCount: 19, intensity: 0.35 },
    { provinceId: 9, provinceName: 'Southern', avgPrice: 295, listingCount: 58, intensity: 0.75 },
    { provinceId: 10, provinceName: 'Western', avgPrice: 275, listingCount: 21, intensity: 0.37 },
  ]
  sendSuccess(res, heatmap)
})

/**
 * @swagger
 * /pricing/market:
 *   get:
 *     summary: Get all market prices
 *     tags: [Pricing]
 */
router.get('/market', (req, res) => {
  sendSuccess(res, PRICE_DATA.map(p => ({ ...p, lastUpdated: new Date().toISOString() })))
})

export default router
