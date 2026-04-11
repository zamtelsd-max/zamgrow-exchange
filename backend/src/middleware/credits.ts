import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import prisma from '../prisma'

export function requireCredits(amount: number = 1) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { credits: true } })
    if (!user || user.credits < amount) {
      return res.status(402).json({ error: `Insufficient credits. You need ${amount} credit(s). Visit /subscribe to top up.` })
    }
    next()
  }
}
