import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { userController } from './user.controller'

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  // Todas as rotas requerem autenticação
  fastify.addHook('onRequest', authMiddleware)

  // GET /users/me — perfil do usuário logado
  fastify.get('/me', userController.getMe)

  // PUT /users/me — atualiza perfil
  fastify.put('/me', userController.updateMe)

  // PUT /users/me/push-token — atualiza push token
  fastify.put('/me/push-token', userController.updatePushToken)

  // DELETE /users/me — deleta conta
  fastify.delete('/me', userController.deleteAccount)
}
