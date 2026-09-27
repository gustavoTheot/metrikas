import { FastifyRequest, FastifyReply } from 'fastify'
import { taskService } from './task.service'
import { CreateTaskSchema, UpdateTaskSchema } from '../../../../shared/src/schemas/index'
import { z } from 'zod'

const IdParamSchema = z.object({ id: z.string().uuid() })
const MilestoneIdParamSchema = z.object({ milestoneId: z.string().uuid() })

export const taskController = {
  async listByMilestone(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { milestoneId } = MilestoneIdParamSchema.parse(request.params)
    const tasks = await taskService.listByMilestone(milestoneId, request.user!.id)
    reply.status(200).send({ success: true, data: tasks })
  },

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { milestoneId } = MilestoneIdParamSchema.parse(request.params)
    const data = CreateTaskSchema.parse(request.body)
    const task = await taskService.create(milestoneId, request.user!.id, data)
    reply.status(201).send({ success: true, data: task })
  },

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = IdParamSchema.parse(request.params)
    const data = UpdateTaskSchema.parse(request.body)
    const task = await taskService.update(id, request.user!.id, data)
    reply.status(200).send({ success: true, data: task })
  },

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = IdParamSchema.parse(request.params)
    await taskService.delete(id, request.user!.id)
    reply.status(200).send({ success: true, data: null })
  },

  async complete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = IdParamSchema.parse(request.params)
    const task = await taskService.complete(id, request.user!.id)
    reply.status(200).send({ success: true, data: task })
  },
}
