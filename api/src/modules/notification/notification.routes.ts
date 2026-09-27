import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { notificationController } from './notification.controller'

export async function notificationRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', authMiddleware)

  // GET /notifications
  fastify.get('/notifications', notificationController.list)

  // PATCH /notifications/:id/read
  fastify.patch('/notifications/:id/read', notificationController.markAsRead)

  // PATCH /notifications/read-all
  fastify.patch('/notifications/read-all', notificationController.markAllAsRead)
}
