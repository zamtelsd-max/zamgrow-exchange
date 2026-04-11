import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({ where: { userId: req.user!.userId }, orderBy: { createdAt: 'desc' }, take: 50 })
    res.json(notifications)
  } catch {
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user!.userId }, data: { read: true } })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to update notification' })
  }
})

router.put('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user!.userId, read: false }, data: { read: true } })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to mark all read' })
  }
})

export default router
