import { FastifyRequest, FastifyReply } from 'fastify'
import { UnauthorizedError } from '../errors/app-error'

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify()
  } catch {
    throw new UnauthorizedError('Token inválido ou expirado')
  }
}
