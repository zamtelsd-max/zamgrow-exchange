import crypto from 'crypto'

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateReference(): string {
  return 'ZMG' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase()
}

export function formatZMW(amount: number): string {
  return `K${amount.toLocaleString('en-ZM', { minimumFractionDigits: 2 })}`
}

export function paginate(page: number, limit: number) {
  const skip = (page - 1) * limit
  return { skip, take: limit }
}

export function calculateExpiryDate(days: number = 90): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}
