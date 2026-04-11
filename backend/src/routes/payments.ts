import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { initiateMobileMoneyPayment } from '../services/payment'
import { generateReference } from '../utils/helpers'

const SUBSCRIPTION_PLANS: Record<string, { price: number; credits: number; tier: string }> = {
  basic: { price: 99, credits: 50, tier: 'basic' },
  pro: { price: 249, credits: 150, tier: 'pro' },
  premium: { price: 599, credits: 500, tier: 'premium' },
}

const router = Router()

router.post('/subscriptions/checkout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { planId, phone, provider = 'mtn' } = req.body
    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan) return res.status(400).json({ error: 'Invalid plan' })
    const reference = generateReference()
    const paymentResult = await initiateMobileMoneyPayment(phone, plan.price, `Zamgrow ${plan.tier} subscription`, provider)
    if (!paymentResult.success) return res.status(402).json({ error: 'Payment failed' })
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)
    await prisma.$transaction([
      prisma.user.update({ where: { id: req.user!.userId }, data: { subscription: plan.tier as 'basic' | 'pro' | 'premium', credits: { increment: plan.credits } } }),
      prisma.subscription.create({ data: { userId: req.user!.userId, tier: plan.tier as 'basic' | 'pro' | 'premium', endDate } }),
      prisma.transaction.create({ data: { userId: req.user!.userId, type: 'subscription', amount: plan.price, status: 'completed', reference, description: `${plan.tier} plan subscription` } }),
      prisma.creditsLog.create({ data: { userId: req.user!.userId, amount: plan.credits, type: 'purchased', description: `${plan.tier} plan credits` } }),
    ])
    res.json({ success: true, reference, message: `Successfully subscribed to ${plan.tier} plan` })
  } catch {
    res.status(500).json({ error: 'Checkout failed' })
  }
})

router.post('/webhook', async (req: AuthRequest, res: Response) => {
  // Handle mobile money webhook callbacks
  console.log('Payment webhook received:', req.body)
  res.json({ received: true })
})

export default router
