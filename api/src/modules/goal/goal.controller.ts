import { FastifyRequest, FastifyReply } from 'fastify'
import { goalService } from './goal.service'
import {
  CreateGoalSchema,
  UpdateGoalSchema,
} from '../../../../shared/src/schemas/index'
import { z } from 'zod'

const IdParamSchema = z.object({ id: z.string().uuid() })

export const goalController = {
  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const goals = await goalService.listByUser(request.user!.id)
    reply.status(200).send({ success: true, data: goals })
  },

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = IdParamSchema.parse(request.params)
    const goal = await goalService.findByIdAndUser(id, request.user!.id)
    reply.status(200).send({ success: true, data: goal })
  },

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = CreateGoalSchema.parse(request.body)
    const goal = await goalService.create(request.user!.id, data)
    reply.status(201).send({ success: true, data: goal })
  },

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = IdParamSchema.parse(request.params)
    const data = UpdateGoalSchema.parse(request.body)
    const goal = await goalService.update(id, request.user!.id, data)
    reply.status(200).send({ success: true, data: goal })
  },

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = IdParamSchema.parse(request.params)
    await goalService.delete(id, request.user!.id)
    reply.status(200).send({ success: true, data: null })
  },

  async getMetrics(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = IdParamSchema.parse(request.params)
    const metrics = await goalService.getMetrics(id, request.user!.id)
    reply.status(200).send({ success: true, data: metrics })
  },
}
