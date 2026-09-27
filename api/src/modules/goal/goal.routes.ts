import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { goalController } from './goal.controller'

export async function goalRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', authMiddleware)

  // GET /goals
  fastify.get('/goals', goalController.list)

  // GET /goals/:id
  fastify.get('/goals/:id', goalController.getById)

  // POST /goals
  fastify.post('/goals', goalController.create)

  // PUT /goals/:id
  fastify.put('/goals/:id', goalController.update)

  // DELETE /goals/:id
  fastify.delete('/goals/:id', goalController.delete)

  // GET /goals/:id/metrics
  fastify.get('/goals/:id/metrics', goalController.getMetrics)
}
