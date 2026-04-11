import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { sendError } from '../utils/helpers'

export interface AuthRequest extends Request {
  user?: { userId: string; role: string; phone: string }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'Authentication required', 401)
    return
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch {
    sendError(res, 'Invalid or expired token', 401)
  }
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
    sendError(res, 'Admin access required', 403)
    return
  }
  next()
}

export const requireSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  // For MVP: just check credits > 0 or subscription active
  // Full implementation would check DB
  next()
}
