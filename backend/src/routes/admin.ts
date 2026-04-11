import { Router, Response } from 'express'
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth'
import { sendSuccess } from '../utils/helpers'

const router = Router()
router.use(authenticate, requireAdmin)

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get admin KPI statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', (req: AuthRequest, res: Response) => {
  sendSuccess(res, {
    totalUsers: 14823,
    totalListings: 3241,
    activeListings: 2187,
    monthlyRevenue: 148420,
    totalTransactions: 8934,
    pendingKyc: 47,
    newUsersToday: 23,
    newListingsToday: 61,
  })
})

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users (admin)
 *     tags: [Admin]
 */
router.get('/users', (req: AuthRequest, res: Response) => {
  sendSuccess(res, [
    { id: 'u1', name: 'Joseph Mwale', phone: '+260971234567', role: 'SELLER', isVerified: true, creditsBalance: 8, createdAt: '2024-01-15' },
    { id: 'u2', name: 'Grace Banda', phone: '+260961234567', role: 'BUYER', isVerified: true, creditsBalance: 10, createdAt: '2024-02-10' },
  ])
})

/**
 * @swagger
 * /admin/users/{id}/ban:
 *   post:
 *     summary: Ban/suspend a user
 *     tags: [Admin]
 */
router.post('/users/:id/ban', (req: AuthRequest, res: Response) => {
  sendSuccess(res, { userId: req.params.id, banned: true }, 'User banned')
})

/**
 * @swagger
 * /admin/users/{id}/verify-kyc:
 *   post:
 *     summary: Approve KYC for user
 *     tags: [Admin]
 */
router.post('/users/:id/verify-kyc', (req: AuthRequest, res: Response) => {
  sendSuccess(res, { userId: req.params.id, isVerified: true }, 'KYC approved')
})

export default router
