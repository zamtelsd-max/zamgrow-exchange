import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import Joi from 'joi'
import { sendSuccess, sendError, generateOtp } from '../utils/helpers'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt'
import { logger } from '../utils/logger'

const router = Router()

// In-memory OTP store (replace with Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: Date; userData?: object }>()

/**
 * @swagger
 * /auth/otp/send:
 *   post:
 *     summary: Send OTP to phone number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+260971234567"
 */
router.post('/otp/send', async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.body
  if (!phone) { sendError(res, 'Phone number required'); return }

  const otp = generateOtp()
  otpStore.set(phone, { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) })

  logger.info(`OTP for ${phone}: ${otp}`) // In production, send via Africa's Talking SMS

  sendSuccess(res, { phone, message: 'OTP sent successfully' }, 'OTP sent')
})

/**
 * @swagger
 * /auth/otp/verify:
 *   post:
 *     summary: Verify OTP code
 *     tags: [Auth]
 */
router.post('/otp/verify', async (req: Request, res: Response): Promise<void> => {
  const schema = Joi.object({
    phone: Joi.string().required(),
    otp: Joi.string().length(6).required(),
  })

  const { error, value } = schema.validate(req.body)
  if (error) { sendError(res, error.details[0].message); return }

  const stored = otpStore.get(value.phone)
  if (!stored || stored.otp !== value.otp || new Date() > stored.expiresAt) {
    sendError(res, 'Invalid or expired OTP', 400)
    return
  }

  otpStore.delete(value.phone)
  sendSuccess(res, { verified: true, phone: value.phone }, 'OTP verified successfully')
})

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^\+260[0-9]{9}$/).required(),
    role: Joi.string().valid('BUYER', 'SELLER', 'BOTH').default('SELLER'),
    provinceId: Joi.number().optional(),
    districtId: Joi.number().optional(),
    password: Joi.string().min(8).optional(),
  })

  const { error, value } = schema.validate(req.body)
  if (error) { sendError(res, error.details[0].message); return }

  // Mock registration (implement with Prisma in production)
  const mockUser = {
    id: `user-${Date.now()}`,
    ...value,
    creditsBalance: 10,
    isVerified: false,
    createdAt: new Date().toISOString(),
  }

  const accessToken = generateAccessToken({ userId: mockUser.id, role: value.role, phone: value.phone })
  const refreshToken = generateRefreshToken({ userId: mockUser.id, role: value.role, phone: value.phone })

  sendSuccess(res, {
    user: mockUser,
    accessToken,
    refreshToken,
  }, 'Account created successfully. 10 free credits added!', 201)
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with phone + OTP or password
 *     tags: [Auth]
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { phone, password, otp } = req.body
  if (!phone) { sendError(res, 'Phone number required'); return }

  // Mock login
  const mockUser = {
    id: 'demo-user',
    name: 'John Nkhoma',
    phone,
    role: 'SELLER',
    creditsBalance: 10,
    isVerified: true,
  }

  const accessToken = generateAccessToken({ userId: mockUser.id, role: mockUser.role, phone })
  const refreshToken = generateRefreshToken({ userId: mockUser.id, role: mockUser.role, phone })

  sendSuccess(res, { user: mockUser, accessToken, refreshToken }, 'Login successful')
})

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body
  if (!refreshToken) { sendError(res, 'Refresh token required', 401); return }

  try {
    const { verifyRefreshToken, generateAccessToken: genAccess } = await import('../utils/jwt')
    const payload = verifyRefreshToken(refreshToken)
    const newAccessToken = genAccess(payload)
    sendSuccess(res, { accessToken: newAccessToken })
  } catch {
    sendError(res, 'Invalid refresh token', 401)
  }
})

export default router
