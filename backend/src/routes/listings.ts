import { Router, Response } from 'express'
import Joi from 'joi'
import { authenticate, AuthRequest } from '../middleware/auth'
import { sendSuccess, sendError, getPaginationParams } from '../utils/helpers'

const router = Router()

// Mock data (replace with Prisma queries in production)
const mockListings = [
  { id: 'l1', type: 'SELL', productName: 'Maize', quantity: 500, unit: '50kg Bag', priceZmw: 310, status: 'ACTIVE', province: 'Eastern', offersCount: 7, viewsCount: 143 },
  { id: 'l2', type: 'SELL', productName: 'Soya Beans', quantity: 200, unit: '50kg Bag', priceZmw: 420, status: 'ACTIVE', province: 'Southern', offersCount: 12, viewsCount: 287 },
  { id: 'l3', type: 'BUY', productName: 'Maize', quantity: 1000, unit: '50kg Bag', priceZmw: 300, status: 'ACTIVE', province: 'Lusaka', offersCount: 5, viewsCount: 198 },
]

/**
 * @swagger
 * /listings:
 *   get:
 *     summary: Get all listings with filters
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [BUY, SELL]
 *       - in: query
 *         name: price_min
 *         schema:
 *           type: number
 *       - in: query
 *         name: price_max
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 */
router.get('/', async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query as Record<string, string>)
  const { category, province, type, price_min, price_max, q } = req.query

  let filtered = [...mockListings]
  if (type) filtered = filtered.filter(l => l.type === type)
  if (province) filtered = filtered.filter(l => l.province === province)
  if (price_min) filtered = filtered.filter(l => l.priceZmw >= Number(price_min))
  if (price_max) filtered = filtered.filter(l => l.priceZmw <= Number(price_max))
  if (q) filtered = filtered.filter(l => l.productName.toLowerCase().includes(String(q).toLowerCase()))

  const total = filtered.length
  const paginated = filtered.slice(skip, skip + limit)

  sendSuccess(res, paginated, undefined, 200, {
    page, limit, total, totalPages: Math.ceil(total / limit)
  })
})

/**
 * @swagger
 * /listings/{id}:
 *   get:
 *     summary: Get a single listing by ID
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', async (req, res) => {
  const listing = mockListings.find(l => l.id === req.params.id)
  if (!listing) { sendError(res, 'Listing not found', 404); return }
  sendSuccess(res, listing)
})

/**
 * @swagger
 * /listings:
 *   post:
 *     summary: Create a new listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const schema = Joi.object({
    type: Joi.string().valid('BUY', 'SELL').required(),
    productName: Joi.string().required(),
    categoryId: Joi.number().optional(),
    quantity: Joi.number().positive().required(),
    unit: Joi.string().required(),
    priceZmw: Joi.number().positive().required(),
    provinceId: Joi.number().required(),
    districtId: Joi.number().optional(),
    description: Joi.string().max(1000).optional(),
    dateAvailable: Joi.date().optional(),
    deadline: Joi.date().optional(),
  })

  const { error, value } = schema.validate(req.body)
  if (error) { sendError(res, error.details[0].message); return }

  const newListing = {
    id: `listing-${Date.now()}`,
    userId: req.user!.userId,
    ...value,
    status: 'ACTIVE',
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    offersCount: 0,
    viewsCount: 0,
    createdAt: new Date().toISOString(),
  }

  mockListings.push(newListing as typeof mockListings[0])
  sendSuccess(res, newListing, 'Listing created successfully', 201)
})

/**
 * @swagger
 * /listings/{id}:
 *   put:
 *     summary: Update a listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const idx = mockListings.findIndex(l => l.id === req.params.id)
  if (idx === -1) { sendError(res, 'Listing not found', 404); return }

  const updated = { ...mockListings[idx], ...req.body, updatedAt: new Date().toISOString() }
  mockListings[idx] = updated
  sendSuccess(res, updated, 'Listing updated')
})

/**
 * @swagger
 * /listings/{id}:
 *   delete:
 *     summary: Delete / archive a listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const idx = mockListings.findIndex(l => l.id === req.params.id)
  if (idx === -1) { sendError(res, 'Listing not found', 404); return }
  mockListings[idx] = { ...mockListings[idx], status: 'EXPIRED' }
  sendSuccess(res, null, 'Listing removed')
})

export default router
