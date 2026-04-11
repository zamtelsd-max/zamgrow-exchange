import { Response } from 'express'

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200, meta?: object) => {
  res.status(statusCode).json({ success: true, data, message, meta })
}

export const sendError = (res: Response, message: string, statusCode = 400) => {
  res.status(statusCode).json({ success: false, message })
}

export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const formatZMW = (amount: number): string => {
  return `K ${amount.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const getPaginationParams = (query: Record<string, string>) => {
  const page = Math.max(1, parseInt(query.page || '1'))
  const limit = Math.min(50, Math.max(1, parseInt(query.limit || '12')))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}
