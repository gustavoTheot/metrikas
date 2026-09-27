import { FastifyInstance } from 'fastify'
import { authController } from './auth.controller'

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /auth/register — Cadastro com email, nome e senha
  fastify.post('/register', authController.register)

  // POST /auth/login — Login com email e senha
  fastify.post('/login', authController.loginWithPassword)

  // POST /auth/google — Login/Registro com Google
  fastify.post('/google', authController.login)

  // POST /auth/refresh — Renova access token
  fastify.post('/refresh', authController.refresh)

  // DELETE /auth/logout — Encerra sessão
  fastify.delete('/logout', authController.logout)
}
