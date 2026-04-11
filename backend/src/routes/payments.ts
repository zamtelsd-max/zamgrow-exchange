import { Router, Response, Request } from 'express'
import Joi from 'joi'
import { authenticate, AuthRequest } from '../middleware/auth'
import { sendSuccess, sendError } from '../utils/helpers'
import { logger } from '../utils/logger'

const router = Router()

/**
 * @swagger
 * /payments/subscribe:
 *   post:
 *     summary: Initiate subscription payment (mobile money)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.post('/subscribe', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const schema = Joi.object({
    plan: Joi.string().valid('MONTHLY', 'ANNUAL').required(),
    method: Joi.string().valid('AIRTEL', 'MTN', 'ZAMTEL', 'CARD').required(),
    phone: Joi.string().optional(),
  })

  const { error, value } = schema.validate(req.body)
  if (error) { sendError(res, error.details[0].message); return }

  const amount = value.plan === 'ANNUAL' ? 300 : 20

  // In production: call Airtel Money / MTN MoMo API
  const payment = {
    id: `pay-${Date.now()}`,
    userId: req.user!.userId,
    plan: value.plan,
    amount,
    method: value.method,
    status: 'PENDING',
    reference: `ZGE-${Date.now()}`,
    message: `A USSD push was sent to ${value.phone || 'your phone'}. Enter your PIN to confirm K${amount} payment.`,
    createdAt: new Date().toISOString(),
  }

  logger.info(`Payment initiated: ${JSON.stringify(payment)}`)
  sendSuccess(res, payment, 'Payment initiated. Check your phone for USSD prompt.', 201)
})

/**
 * @swagger
 * /payments/webhook/airtel:
 *   post:
 *     summary: Airtel Money payment webhook
 *     tags: [Payments]
 */
router.post('/webhook/airtel', async (req: Request, res: Response): Promise<void> => {
  const { transaction_id, status, amount, phone } = req.body
  logger.info(`Airtel webhook: ${JSON.stringify(req.body)}`)

  if (status === 'SUCCESS') {
    // Update subscription in DB
    logger.info(`Payment confirmed: ${transaction_id} for ${phone}, amount: ${amount}`)
  }

  res.status(200).json({ message: 'Webhook received' })
})

/**
 * @swagger
 * /payments/webhook/mtn:
 *   post:
 *     summary: MTN MoMo payment webhook
 *     tags: [Payments]
 */
router.post('/webhook/mtn', async (req: Request, res: Response): Promise<void> => {
  logger.info(`MTN MoMo webhook: ${JSON.stringify(req.body)}`)
  res.status(200).json({ message: 'Webhook received' })
})

/**
 * @swagger
 * /payments/history:
 *   get:
 *     summary: Get user payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/history', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  // Mock payment history
  const history = [
    { id: 'pay-001', plan: 'MONTHLY', amount: 20, method: 'AIRTEL', status: 'COMPLETED', date: '2025-04-01' },
    { id: 'pay-002', plan: 'MONTHLY', amount: 20, method: 'AIRTEL', status: 'COMPLETED', date: '2025-03-01' },
  ]
  sendSuccess(res, history)
})

export default router
