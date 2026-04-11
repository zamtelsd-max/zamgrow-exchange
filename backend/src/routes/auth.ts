import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../prisma'
import { generateToken } from '../utils/jwt'
import { generateOtp, calculateExpiryDate } from '../utils/helpers'
import { sendOtpSms } from '../services/sms'
import { authLimiter, otpLimiter } from '../middleware/rateLimit'
import { z } from 'zod'

const router = Router()

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^\+260\d{9}$/),
  role: z.enum(['farmer', 'buyer', 'dealer']),
  province: z.string().min(1),
  district: z.string().optional(),
})

router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body)
    const existing = await prisma.user.findUnique({ where: { phone: data.phone } })
    if (existing) return res.status(409).json({ error: 'Phone number already registered' })
    const user = await prisma.user.create({
      data: {
        ...data,
        credits: 10,
        creditsLog: {
          create: { amount: 10, type: 'bonus', description: 'Welcome bonus credits' }
        }
      }
    })
    const token = generateToken({ userId: user.id, role: user.role })
    res.status(201).json({ user: { ...user, passwordHash: undefined }, token })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid data', details: err.errors })
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/otp/send', otpLimiter, async (req: Request, res: Response) => {
  try {
    const { phone } = req.body
    if (!phone) return res.status(400).json({ error: 'Phone required' })
    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    const user = await prisma.user.findUnique({ where: { phone } })
    await prisma.otpCode.create({
      data: { phone, code: otp, expiresAt, userId: user?.id }
    })
    await sendOtpSms(phone, otp)
    res.json({ success: true, message: `OTP sent to ${phone}` })
  } catch {
    res.status(500).json({ error: 'Failed to send OTP' })
  }
})

router.post('/otp/verify', authLimiter, async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body
    const otpRecord = await prisma.otpCode.findFirst({
      where: { phone, code: otp, used: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' }
    })
    if (!otpRecord) return res.status(400).json({ error: 'Invalid or expired OTP' })
    await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { used: true } })
    const user = await prisma.user.findUnique({ where: { phone } })
    if (!user) return res.status(404).json({ error: 'User not found. Please register first.' })
    const token = generateToken({ userId: user.id, role: user.role })
    res.json({ user: { ...user, passwordHash: undefined }, token })
  } catch {
    res.status(500).json({ error: 'OTP verification failed' })
  }
})

router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body
    const user = await prisma.user.findUnique({ where: { phone } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    if (user.banned) return res.status(403).json({ error: 'Account suspended' })
    if (password && user.passwordHash) {
      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = generateToken({ userId: user.id, role: user.role })
    res.json({ user: { ...user, passwordHash: undefined }, token })
  } catch {
    res.status(500).json({ error: 'Login failed' })
  }
})

export default router
