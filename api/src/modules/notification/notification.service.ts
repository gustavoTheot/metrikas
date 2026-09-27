import { prisma } from '../../infra/database/prisma'
import { NotFoundError } from '../../shared/errors/app-error'
import type { Notification } from '@prisma/client'

export const notificationService = {
  async listByUser(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await prisma.notification.findUnique({ where: { id } })
    if (!notification) throw new NotFoundError('Notificação')
    if (notification.userId !== userId) throw new NotFoundError('Notificação')

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })
  },

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
  },
}
