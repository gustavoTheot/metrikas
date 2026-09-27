import { FastifyRequest, FastifyReply } from 'fastify'
import { ZodError } from 'zod'
import { AppError } from '../errors/app-error'

export async function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // Erros customizados da aplicação
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: error.message,
      code: error.code,
    })
  }

  // Erros de validação do Zod
  if (error instanceof ZodError) {
    return reply.status(422).send({
      success: false,
      error: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      details: error.flatten().fieldErrors,
    })
  }

  // Erros do Fastify JWT
  if (error.message === 'Authorization token is missing' || error.message === 'Invalid token') {
    return reply.status(401).send({
      success: false,
      error: 'Token inválido ou expirado',
      code: 'UNAUTHORIZED',
    })
  }

  // Erros não tratados — logar e retornar 500
  request.log.error(error)
  return reply.status(500).send({
    success: false,
    error: 'Erro interno do servidor',
    code: 'INTERNAL_SERVER_ERROR',
  })
}
