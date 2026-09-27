import { FastifyRequest, FastifyReply } from 'fastify'
import { milestoneService } from './milestone.service'
import {
  CreateMilestoneSchema,
  UpdateMilestoneSchema,
  ReorderMilestonesSchema,
} from '../../../../shared/src/schemas/index'
import { z } from 'zod'

const IdParamSchema = z.object({ id: z.string().uuid() })
const GoalIdParamSchema = z.object({ goalId: z.string().uuid() })

export const milestoneController = {
  async listByGoal(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { goalId } = GoalIdParamSchema.parse(request.params)
    const milestones = await milestoneService.listByGoal(goalId, request.user!.id)
    reply.status(200).send({ success: true, data: milestones })
  },

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { goalId } = GoalIdParamSchema.parse(request.params)
    const data = CreateMilestoneSchema.parse(request.body)
    const milestone = await milestoneService.create(goalId, request.user!.id, data)
    reply.status(201).send({ success: true, data: milestone })
  },

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = IdParamSchema.parse(request.params)
    const data = UpdateMilestoneSchema.parse(request.body)
    const milestone = await milestoneService.update(id, request.user!.id, data)
    reply.status(200).send({ success: true, data: milestone })
  },

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = IdParamSchema.parse(request.params)
    await milestoneService.delete(id, request.user!.id)
    reply.status(200).send({ success: true, data: null })
  },

  async complete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = IdParamSchema.parse(request.params)
    const milestone = await milestoneService.complete(id, request.user!.id)
    reply.status(200).send({ success: true, data: milestone })
  },

  async reorder(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { milestones } = ReorderMilestonesSchema.parse(request.body)
    await milestoneService.reorder(milestones, request.user!.id)
    reply.status(200).send({ success: true, data: null })
  },
}
