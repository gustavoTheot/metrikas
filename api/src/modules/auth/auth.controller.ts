import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { authService } from './auth.service'
import { GoogleAuthSchema, RefreshTokenSchema } from '../../../../shared/src/schemas/index'

const RegisterSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  pushToken: z.string().optional(),
})

const LoginPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
  pushToken: z.string().optional(),
})

export const authController = {
  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = RegisterSchema.parse(request.body)
    const result = await authService.register(request.server, data)
    reply.status(201).send({ success: true, data: result })
  },

  async loginWithPassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = LoginPasswordSchema.parse(request.body)
    const result = await authService.loginWithPassword(request.server, data)
    reply.status(200).send({ success: true, data: result })
  },

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { idToken, pushToken } = GoogleAuthSchema.parse(request.body)
    const result = await authService.loginWithGoogle(request.server, idToken, pushToken)
    reply.status(200).send({ success: true, data: result })
  },

  async refresh(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { refreshToken } = RefreshTokenSchema.parse(request.body)
    const result = await authService.refreshAccessToken(request.server, refreshToken)
    reply.status(200).send({ success: true, data: result })
  },

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { refreshToken } = RefreshTokenSchema.parse(request.body)
    await authService.logout(refreshToken)
    reply.status(200).send({ success: true, data: null })
  },
}
