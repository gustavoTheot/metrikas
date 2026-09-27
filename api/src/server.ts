import Fastify from 'fastify'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

import { env } from './config/env'
import { corsPlugin } from './shared/plugins/cors.plugin'
import { jwtPlugin } from './shared/plugins/jwt.plugin'
import { errorHandler } from './shared/middlewares/error-handler.middleware'

import { authRoutes } from './modules/auth/auth.routes'
import { userRoutes } from './modules/user/user.routes'
import { goalRoutes } from './modules/goal/goal.routes'
import { milestoneRoutes } from './modules/milestone/milestone.routes'
import { taskRoutes } from './modules/task/task.routes'
import { dashboardRoutes } from './modules/dashboard/dashboard.routes'
import { notificationRoutes } from './modules/notification/notification.routes'

// ─── Cria instância do Fastify ────────────────────────────────────────────────
const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'warn' : 'info',
    transport:
      env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
})

// ─── Plugins ──────────────────────────────────────────────────────────────────
async function registerPlugins(): Promise<void> {
  // CORS
  await fastify.register(corsPlugin)

  // JWT
  await fastify.register(jwtPlugin)

  // Rate Limit — 100 requests por minuto por IP
  await fastify.register(rateLimit, {
    max: 1000,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      statusCode: 429,
      success: false,
      error: 'Muitas requisições. Tente novamente em instantes.',
      code: 'RATE_LIMIT_EXCEEDED',
    }),
  })

  // Swagger / OpenAPI
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'MetriKas API',
        description: 'API REST do MetriKas — gerenciamento de metas pessoais',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  })

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: false },
  })
}

// ─── Rotas ────────────────────────────────────────────────────────────────────
async function registerRoutes(): Promise<void> {
  fastify.register(authRoutes, { prefix: '/api/auth' })
  fastify.register(userRoutes, { prefix: '/api/users' })
  fastify.register(goalRoutes, { prefix: '/api' })
  fastify.register(milestoneRoutes, { prefix: '/api' })
  fastify.register(taskRoutes, { prefix: '/api' })
  fastify.register(dashboardRoutes, { prefix: '/api' })
  fastify.register(notificationRoutes, { prefix: '/api' })
}

// ─── Health Check ─────────────────────────────────────────────────────────────
fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  environment: env.NODE_ENV,
}))

// ─── Error Handler ────────────────────────────────────────────────────────────
fastify.setErrorHandler(errorHandler)

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function start(): Promise<void> {
  try {
    await registerPlugins()
    await registerRoutes()
    await fastify.listen({ port: env.PORT, host: '0.0.0.0' })
    fastify.log.info(`🚀 MetriKas API rodando na porta ${env.PORT}`)
    fastify.log.info(`📄 Documentação disponível em http://localhost:${env.PORT}/docs`)
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
signals.forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, closing server...`)
    await fastify.close()
    process.exit(0)
  })
})

start()
