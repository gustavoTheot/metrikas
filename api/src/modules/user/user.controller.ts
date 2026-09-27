import { FastifyRequest, FastifyReply } from 'fastify'
import { userService } from './user.service'
import { UpdateUserSchema } from '../../../../shared/src/schemas/index'
import { z } from 'zod'

const PushTokenBodySchema = z.object({
  pushToken: z.string().nullable(),
})

export const userController = {
  async getMe(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = await userService.findById(request.user!.id)
    reply.status(200).send({ success: true, data: user })
  },

  async updateMe(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = UpdateUserSchema.parse(request.body)
    const user = await userService.update(request.user!.id, data)
    reply.status(200).send({ success: true, data: user })
  },

  async updatePushToken(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { pushToken } = PushTokenBodySchema.parse(request.body)
    await userService.updatePushToken(request.user!.id, pushToken)
    reply.status(200).send({ success: true, data: null })
  },

  async deleteAccount(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await userService.deleteAccount(request.user!.id)
    reply.status(200).send({ success: true, data: null })
  },
}
