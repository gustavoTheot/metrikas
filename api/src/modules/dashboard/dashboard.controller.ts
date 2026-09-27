import { FastifyRequest, FastifyReply } from 'fastify'
import { dashboardService } from './dashboard.service'

export const dashboardController = {
  async getDashboard(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = await dashboardService.getDashboard(request.user!.id)
    reply.status(200).send({ success: true, data })
  },
}
