import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { milestoneController } from './milestone.controller'

export async function milestoneRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', authMiddleware)

  // GET /goals/:goalId/milestones
  fastify.get('/goals/:goalId/milestones', milestoneController.listByGoal)

  // POST /goals/:goalId/milestones
  fastify.post('/goals/:goalId/milestones', milestoneController.create)

  // PUT /milestones/:id
  fastify.put('/milestones/:id', milestoneController.update)

  // DELETE /milestones/:id
  fastify.delete('/milestones/:id', milestoneController.delete)

  // PATCH /milestones/:id/complete
  fastify.patch('/milestones/:id/complete', milestoneController.complete)

  // PATCH /milestones/reorder
  fastify.patch('/milestones/reorder', milestoneController.reorder)
}
