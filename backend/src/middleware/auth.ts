import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import prisma from '../prisma'

export interface AuthRequest extends Request {
  user?: {
    id: string
    userId: string
    role: string
    zoneId?: string | null
    zbmId?: string | null
    territory?: string | null
    name: string
    phone: string
  }
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const payload = verifyToken(token) as any
    // Fetch fresh user data so roles/zone are always current
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, phone: true, role: true, zoneId: true, zbmId: true, territory: true, banned: true }
    })
    if (!user || user.banned) return res.status(401).json({ error: 'Account not found or suspended' })
    req.user = { ...user, userId: user.id }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// requireRole(['hsd', 'zbm']) — accepts array
export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` })
    }
    next()
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const payload = verifyToken(token) as any
      req.user = payload
    } catch { /* ignore */ }
  }
  next()
}
