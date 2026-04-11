import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { sendSuccess } from '../utils/helpers'

const router = Router()

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  sendSuccess(res, [
    { id: 'n1', type: 'OFFER', title: 'New Offer Received', message: 'You received a new offer on your Maize listing', isRead: false, createdAt: new Date().toISOString() },
    { id: 'n2', type: 'PRICE_ALERT', title: 'Price Alert', message: 'Maize prices in Eastern Province exceeded K320', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  ])
})

router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  sendSuccess(res, { id: req.params.id, isRead: true })
})

router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  sendSuccess(res, { updated: true })
})

export default router
