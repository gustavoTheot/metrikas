import { FastifyRequest, FastifyReply } from 'fastify'
import { notificationService } from './notification.service'
import { z } from 'zod'

const IdParamSchema = z.object({ id: z.string().uuid() })

export const notificationController = {
  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const notifications = await notificationService.listByUser(request.user!.id)
    reply.status(200).send({ success: true, data: notifications })
  },

  async markAsRead(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = IdParamSchema.parse(request.params)
    const notification = await notificationService.markAsRead(id, request.user!.id)
    reply.status(200).send({ success: true, data: notification })
  },

  async markAllAsRead(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await notificationService.markAllAsRead(request.user!.id)
    reply.status(200).send({ success: true, data: null })
  },
}
