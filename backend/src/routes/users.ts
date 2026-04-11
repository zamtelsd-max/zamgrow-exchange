import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { sendSuccess, sendError } from '../utils/helpers'

const router = Router()

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  sendSuccess(res, {
    id: req.user!.userId,
    phone: req.user!.phone,
    role: req.user!.role,
    creditsBalance: 10,
    isVerified: true,
  })
})

/**
 * @swagger
 * /users/{id}/profile:
 *   get:
 *     summary: Get public user profile
 *     tags: [Users]
 */
router.get('/:id/profile', async (req, res) => {
  sendSuccess(res, {
    id: req.params.id,
    name: 'Joseph Mwale',
    role: 'SELLER',
    province: 'Eastern',
    rating: 4.8,
    reviewCount: 23,
    completedTransactions: 31,
    isVerified: true,
    createdAt: '2024-01-15T10:00:00Z',
  })
})

/**
 * @swagger
 * /users/watchlist/{listingId}:
 *   post:
 *     summary: Toggle listing in watchlist
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/watchlist/:listingId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  sendSuccess(res, { listingId: req.params.listingId, saved: true }, 'Watchlist updated')
})

/**
 * @swagger
 * /users/watchlist:
 *   get:
 *     summary: Get user watchlist
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/watchlist', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  sendSuccess(res, [])
})

export default router
