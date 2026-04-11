import prisma from '../prisma'

export async function createNotification(
  userId: string,
  type: 'offer' | 'message' | 'price_alert' | 'system' | 'payment',
  title: string,
  message: string,
  linkTo?: string
) {
  return prisma.notification.create({
    data: { userId, type, title, message, linkTo },
  })
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  })
}
