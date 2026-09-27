import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { taskController } from './task.controller'

export async function taskRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', authMiddleware)

  // GET /milestones/:milestoneId/tasks
  fastify.get('/milestones/:milestoneId/tasks', taskController.listByMilestone)

  // POST /milestones/:milestoneId/tasks
  fastify.post('/milestones/:milestoneId/tasks', taskController.create)

  // PUT /tasks/:id
  fastify.put('/tasks/:id', taskController.update)

  // DELETE /tasks/:id
  fastify.delete('/tasks/:id', taskController.delete)

  // PATCH /tasks/:id/complete
  fastify.patch('/tasks/:id/complete', taskController.complete)
}
