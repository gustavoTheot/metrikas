import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import { FastifyInstance } from 'fastify'
import { env } from '../../config/env'

// ─── Estende o tipo do JWT payload ───────────────────────────────────────────
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; email: string }
    user: { id: string; email: string }
  }
}

export const jwtPlugin = fp(async function (fastify: FastifyInstance): Promise<void> {
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  })
})
