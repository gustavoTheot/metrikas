import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { dashboardController } from './dashboard.controller'

export async function dashboardRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', authMiddleware)

  // GET /dashboard
  fastify.get('/dashboard', dashboardController.getDashboard)
}
