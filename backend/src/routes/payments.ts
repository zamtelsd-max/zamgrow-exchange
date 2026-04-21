/**
 * Zamgrow Exchange — Mobile Money Payments API
 *
 * Routes:
 *   POST /api/v1/payments/initiate            Initiate any mobile money payment
 *   POST /api/v1/payments/subscriptions       Subscribe to a Zamgrow plan via mobile money
 *   GET  /api/v1/payments/status/:reference   Poll payment status
 *   GET  /api/v1/payments/history             User payment history
 *   POST /api/v1/payments/webhook/zamtel      Zamtel Money callback
 *   POST /api/v1/payments/webhook/airtel      Airtel Money callback
 *   POST /api/v1/payments/webhook/mtn         MTN MoMo callback
 *   GET  /api/v1/payments/providers           List supported providers + status
 */

import { Router, Request, Response } from 'express'
import prisma from '../prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import {
  initiateMobileMoneyPayment,
  verifyWebhookSignature,
  MobileMoneyProvider,
} from '../services/payment'
import { generateReference } from '../utils/helpers'

const router = Router()

// ─── Provider Metadata ────────────────────────────────────────────────────────

const PROVIDERS = {
  zamtel: {
    name: 'Zamtel Money',
    code: 'zamtel',
    prefixes: ['095', '096'],        // Zamtel MSISDN prefixes in Zambia
    logo: 'https://zamtelsd-max.github.io/zamgrow-exchange/assets/zamtel-money.png',
    color: '#00843D',
    description: 'Pay with Zamtel Money — Zambia\'s national mobile money',
    ussd: '*115#',
  },
  airtel: {
    name: 'Airtel Money',
    code: 'airtel',
    prefixes: ['097', '077'],
    logo: 'https://zamtelsd-max.github.io/zamgrow-exchange/assets/airtel-money.png',
    color: '#FF0000',
    description: 'Pay with Airtel Money',
    ussd: '*778#',
  },
  mtn: {
    name: 'MTN Mobile Money',
    code: 'mtn',
    prefixes: ['096', '076'],
    logo: 'https://zamtelsd-max.github.io/zamgrow-exchange/assets/mtn-momo.png',
    color: '#FFCC00',
    description: 'Pay with MTN Mobile Money (MoMo)',
    ussd: '*303#',
  },
}

// ─── Subscription Plans ───────────────────────────────────────────────────────

const PLANS = {
  basic:   { id: 'basic',   name: 'Basic',   price: 99,  credits: 50,  tier: 'basic'   as const, description: '50 listing credits, standard support' },
  pro:     { id: 'pro',     name: 'Pro',     price: 249, credits: 150, tier: 'pro'     as const, description: '150 listing credits, priority support, analytics' },
  premium: { id: 'premium', name: 'Premium', price: 599, credits: 500, tier: 'premium' as const, description: '500 listing credits, dedicated support, API access' },
}

// ─── Auto-detect provider from phone number ───────────────────────────────────

function detectProvider(phone: string): MobileMoneyProvider {
  const digits = phone.replace(/\D/g, '')
  const local = digits.startsWith('260') ? digits.slice(3) : digits.startsWith('0') ? digits.slice(1) : digits
  const prefix3 = local.slice(0, 3)
  // Zambia network prefixes (2025):
  // Zamtel: 095, 096 (some 096 shared with MTN)
  // Airtel: 097, 077
  // MTN: 076, 078, 096 (some)
  if (['095'].includes(prefix3)) return 'zamtel'
  if (['097', '077'].includes(prefix3)) return 'airtel'
  if (['076', '078'].includes(prefix3)) return 'mtn'
  if (prefix3 === '096') return 'zamtel' // default 096 to Zamtel
  return 'airtel' // fallback
}

// ─── GET /api/v1/payments/providers ──────────────────────────────────────────

router.get('/payments/providers', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: Object.values(PROVIDERS),
  })
})

// ─── GET /api/v1/payments/plans ──────────────────────────────────────────────

router.get('/payments/plans', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: Object.values(PLANS),
  })
})

// ─── POST /api/v1/payments/initiate ──────────────────────────────────────────
// General-purpose payment initiation — used for listing fees, escrow, direct trades

router.post('/payments/initiate', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phone, amount, description, provider: reqProvider, orderId } = req.body

    if (!phone || !amount || !description) {
      res.status(400).json({ success: false, message: 'phone, amount, and description are required' })
      return
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({ success: false, message: 'amount must be a positive number' })
      return
    }

    const provider: MobileMoneyProvider = reqProvider || detectProvider(phone)
    if (!['zamtel', 'airtel', 'mtn'].includes(provider)) {
      res.status(400).json({ success: false, message: 'provider must be zamtel | airtel | mtn' })
      return
    }

    const reference = generateReference()

    // Create pending transaction record first
    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user!.userId,
        type: 'listing_fee',
        amount: Number(amount),
        currency: 'ZMW',
        status: 'pending',
        reference,
        description,
      },
    })

    // Initiate with provider
    const result = await initiateMobileMoneyPayment(
      phone,
      Number(amount),
      description,
      provider,
      reference,
    )

    // Update transaction with provider reference
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: result.success ? 'pending' : 'failed',
        reference: result.reference || reference,
      },
    })

    if (!result.success) {
      res.status(402).json({ success: false, message: result.message, reference })
      return
    }

    res.json({
      success: true,
      message: result.message,
      data: {
        reference,
        providerReference: result.reference,
        provider,
        providerName: PROVIDERS[provider].name,
        amount: Number(amount),
        currency: 'ZMW',
        status: 'pending',
        orderId: orderId || null,
        ussd: PROVIDERS[provider].ussd,
        instructions: `Open your dialer, call ${PROVIDERS[provider].ussd} to confirm payment of K${amount}`,
      },
    })
  } catch (err) {
    console.error('[POST /payments/initiate]', err)
    res.status(500).json({ success: false, message: 'Payment initiation failed' })
  }
})

// ─── POST /api/v1/payments/subscriptions ─────────────────────────────────────

router.post('/payments/subscriptions', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planId, phone, provider: reqProvider } = req.body

    const plan = PLANS[planId as keyof typeof PLANS]
    if (!plan) {
      res.status(400).json({ success: false, message: `Invalid plan. Choose: ${Object.keys(PLANS).join(', ')}` })
      return
    }
    if (!phone) {
      res.status(400).json({ success: false, message: 'phone is required' })
      return
    }

    const provider: MobileMoneyProvider = reqProvider || detectProvider(phone)
    const reference = generateReference()

    const result = await initiateMobileMoneyPayment(
      phone,
      plan.price,
      `Zamgrow ${plan.name} subscription`,
      provider,
      reference,
    )

    if (!result.success) {
      res.status(402).json({ success: false, message: result.message })
      return
    }

    // For sandbox / immediate completion — update subscription right away
    // Sandbox when: explicit flag OR no real API keys configured
    const isPaymentSandbox = process.env.PAYMENT_SANDBOX === 'true' ||
      (process.env.PAYMENT_SANDBOX !== 'false' && !process.env.ZAMTEL_MONEY_API_KEY && !process.env.AIRTEL_CLIENT_ID && !process.env.MTN_SUBSCRIPTION_KEY)
    if (isPaymentSandbox) {
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)
      await prisma.$transaction([
        prisma.user.update({
          where: { id: req.user!.userId },
          data: { subscription: plan.tier, credits: { increment: plan.credits } },
        }),
        prisma.subscription.create({
          data: { userId: req.user!.userId, tier: plan.tier, endDate },
        }),
        prisma.transaction.create({
          data: {
            userId: req.user!.userId,
            type: 'subscription',
            amount: plan.price,
            currency: 'ZMW',
            status: 'completed',
            reference,
            description: `${plan.name} plan subscription`,
          },
        }),
        prisma.creditsLog.create({
          data: {
            userId: req.user!.userId,
            amount: plan.credits,
            type: 'purchased',
            description: `${plan.name} plan credits`,
          },
        }),
      ])
      res.json({
        success: true,
        message: `Successfully subscribed to ${plan.name} plan`,
        data: { reference, plan: plan.name, credits: plan.credits, status: 'completed' },
      })
      return
    }

    // Production: payment is async — webhook will complete subscription
    await prisma.transaction.create({
      data: {
        userId: req.user!.userId,
        type: 'subscription',
        amount: plan.price,
        currency: 'ZMW',
        status: 'pending',
        reference,
        description: `${plan.name} plan subscription — awaiting ${PROVIDERS[provider].name} confirmation`,
      },
    })

    res.json({
      success: true,
      message: `Payment prompt sent via ${PROVIDERS[provider].name}. Subscription activates after payment confirmation.`,
      data: {
        reference,
        providerReference: result.reference,
        provider,
        plan: plan.name,
        amount: plan.price,
        status: 'pending',
        ussd: PROVIDERS[provider].ussd,
      },
    })
  } catch (err) {
    console.error('[POST /payments/subscriptions]', err)
    res.status(500).json({ success: false, message: 'Subscription payment failed' })
  }
})

// ─── GET /api/v1/payments/status/:reference ──────────────────────────────────

router.get('/payments/status/:reference', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reference } = req.params
    const transaction = await prisma.transaction.findFirst({
      where: { reference, userId: req.user!.userId },
    })
    if (!transaction) {
      res.status(404).json({ success: false, message: 'Transaction not found' })
      return
    }
    res.json({
      success: true,
      data: {
        reference: transaction.reference,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        type: transaction.type,
        createdAt: transaction.createdAt,
      },
    })
  } catch (err) {
    console.error('[GET /payments/status]', err)
    res.status(500).json({ success: false, message: 'Failed to fetch payment status' })
  }
})

// ─── GET /api/v1/payments/history ────────────────────────────────────────────

router.get('/payments/history', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50)
    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { userId: req.user!.userId } }),
    ])

    res.json({
      success: true,
      data: {
        transactions,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    })
  } catch (err) {
    console.error('[GET /payments/history]', err)
    res.status(500).json({ success: false, message: 'Failed to fetch payment history' })
  }
})

// ─── Webhook Handler (shared logic) ──────────────────────────────────────────

async function handleWebhook(
  provider: MobileMoneyProvider,
  body: Record<string, unknown>,
  signature: string,
  rawPayload: string,
  res: Response,
): Promise<void> {
  // Verify signature
  if (process.env.NODE_ENV === 'production' && !verifyWebhookSignature(rawPayload, signature, provider)) {
    console.warn(`[Webhook] Invalid signature from ${provider}`)
    res.status(401).json({ error: 'Invalid signature' })
    return
  }

  // Normalize payload across providers
  let reference = ''
  let status: 'SUCCESSFUL' | 'FAILED' | 'PENDING' = 'PENDING'

  if (provider === 'zamtel') {
    reference = (body.reference || body.merchantRef) as string
    const s = String(body.status || '').toUpperCase()
    status = s === 'SUCCESS' || s === 'SUCCESSFUL' ? 'SUCCESSFUL' : s === 'FAILED' ? 'FAILED' : 'PENDING'
  } else if (provider === 'airtel') {
    const txn = (body.transaction || body.data) as Record<string, unknown> | undefined
    reference = (txn?.id || body.id) as string
    const s = String((txn?.status || body.status) || '').toUpperCase()
    status = s === 'TS' || s === 'SUCCESS' || s === 'SUCCESSFUL' ? 'SUCCESSFUL' : s === 'TF' || s === 'FAILED' ? 'FAILED' : 'PENDING'
  } else if (provider === 'mtn') {
    reference = (body.externalId || body.financialTransactionId) as string
    const s = String(body.status || '').toUpperCase()
    status = s === 'SUCCESSFUL' ? 'SUCCESSFUL' : s === 'FAILED' ? 'FAILED' : 'PENDING'
  }

  if (!reference) {
    res.status(400).json({ error: 'Missing reference in webhook payload' })
    return
  }

  const transaction = await prisma.transaction.findFirst({ where: { reference } })
  if (!transaction) {
    console.warn(`[Webhook ${provider}] Unknown reference: ${reference}`)
    res.json({ received: true }) // Acknowledge anyway
    return
  }

  if (status === 'SUCCESSFUL') {
    await prisma.transaction.update({ where: { id: transaction.id }, data: { status: 'completed' } })

    // Complete subscription if this was a subscription payment
    if (transaction.type === 'subscription') {
      const planMatch = Object.values(PLANS).find(p => transaction.description?.toLowerCase().includes(p.name.toLowerCase()))
      if (planMatch) {
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1)
        await prisma.user.update({
          where: { id: transaction.userId },
          data: { subscription: planMatch.tier, credits: { increment: planMatch.credits } },
        })
        await prisma.subscription.create({
          data: { userId: transaction.userId, tier: planMatch.tier, endDate },
        })
        await prisma.creditsLog.create({
          data: { userId: transaction.userId, amount: planMatch.credits, type: 'purchased', description: `${planMatch.name} plan credits via ${provider}` },
        })
      }
    }
    console.log(`[Webhook ${provider}] Payment COMPLETED: ${reference}`)
  } else if (status === 'FAILED') {
    await prisma.transaction.update({ where: { id: transaction.id }, data: { status: 'failed' } })
    console.log(`[Webhook ${provider}] Payment FAILED: ${reference}`)
  }

  res.json({ received: true, status })
}

// ─── POST /api/v1/payments/webhook/zamtel ────────────────────────────────────

router.post('/payments/webhook/zamtel', express_raw(), async (req: Request, res: Response): Promise<void> => {
  const rawPayload = req.body as unknown as Buffer
  const signature = req.headers['x-api-signature'] as string || ''
  try {
    const body = JSON.parse(rawPayload.toString())
    await handleWebhook('zamtel', body, signature, rawPayload.toString(), res)
  } catch {
    res.status(400).json({ error: 'Invalid JSON payload' })
  }
})

// ─── POST /api/v1/payments/webhook/airtel ────────────────────────────────────

router.post('/payments/webhook/airtel', express_raw(), async (req: Request, res: Response): Promise<void> => {
  const rawPayload = req.body as unknown as Buffer
  const signature = req.headers['x-signature'] as string || ''
  try {
    const body = JSON.parse(rawPayload.toString())
    await handleWebhook('airtel', body, signature, rawPayload.toString(), res)
  } catch {
    res.status(400).json({ error: 'Invalid JSON payload' })
  }
})

// ─── POST /api/v1/payments/webhook/mtn ───────────────────────────────────────

router.post('/payments/webhook/mtn', express_raw(), async (req: Request, res: Response): Promise<void> => {
  const rawPayload = req.body as unknown as Buffer
  const signature = req.headers['x-signature'] as string || ''
  try {
    const body = JSON.parse(rawPayload.toString())
    await handleWebhook('mtn', body, signature, rawPayload.toString(), res)
  } catch {
    res.status(400).json({ error: 'Invalid JSON payload' })
  }
})

// Helper: raw body middleware for webhook routes (preserves raw buffer for signature check)
function express_raw() {
  return (req: Request, _res: Response, next: () => void) => {
    const chunks: Buffer[] = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => {
      req.body = Buffer.concat(chunks)
      next()
    })
  }
}

export default router
