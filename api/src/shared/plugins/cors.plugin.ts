import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import { FastifyInstance } from 'fastify'
import { env } from '../../config/env'

export const corsPlugin = fp(async function (fastify: FastifyInstance): Promise<void> {
  const origins = env.CORS_ORIGINS.split(',').map((o) => o.trim())

  await fastify.register(cors, {
    origin: origins.includes('*') ? true : origins.length === 1 ? origins[0] : origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
})
