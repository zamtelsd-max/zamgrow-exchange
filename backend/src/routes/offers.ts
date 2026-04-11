import { Router, Response } from 'express'
import Joi from 'joi'
import { authenticate, AuthRequest } from '../middleware/auth'
import { sendSuccess, sendError } from '../utils/helpers'

const router = Router()

const offers: Record<string, object[]> = {}

/**
 * @swagger
 * /offers/listing/{listingId}:
 *   post:
 *     summary: Make an offer on a listing
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 */
router.post('/listing/:listingId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const schema = Joi.object({
    offeredPrice: Joi.number().positive().required(),
    quantity: Joi.number().positive().optional(),
    message: Joi.string().max(500).optional(),
  })

  const { error, value } = schema.validate(req.body)
  if (error) { sendError(res, error.details[0].message); return }

  const offer = {
    id: `offer-${Date.now()}`,
    listingId: req.params.listingId,
    initiatorId: req.user!.userId,
    ...value,
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  }

  const listingOffers = offers[req.params.listingId] || []
  listingOffers.push(offer)
  offers[req.params.listingId] = listingOffers

  sendSuccess(res, offer, 'Offer sent successfully. 1 credit deducted.', 201)
})

/**
 * @swagger
 * /offers/{offerId}/respond:
 *   post:
 *     summary: Accept, reject, or counter an offer
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:offerId/respond', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const schema = Joi.object({
    action: Joi.string().valid('ACCEPT', 'REJECT', 'COUNTER').required(),
    counterPrice: Joi.number().positive().when('action', { is: 'COUNTER', then: Joi.required() }),
    message: Joi.string().max(500).optional(),
  })

  const { error, value } = schema.validate(req.body)
  if (error) { sendError(res, error.details[0].message); return }

  sendSuccess(res, {
    offerId: req.params.offerId,
    status: value.action === 'ACCEPT' ? 'ACCEPTED' : value.action === 'REJECT' ? 'REJECTED' : 'COUNTERED',
    ...value,
    updatedAt: new Date().toISOString(),
  }, `Offer ${value.action.toLowerCase()}ed successfully`)
})

/**
 * @swagger
 * /offers/listing/{listingId}:
 *   get:
 *     summary: Get all offers for a listing
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/listing/:listingId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  sendSuccess(res, offers[req.params.listingId] || [])
})

export default router
