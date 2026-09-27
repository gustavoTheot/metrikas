import { OAuth2Client } from 'google-auth-library'
import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { prisma } from '../../infra/database/prisma'
import { env } from '../../config/env'
import { UnauthorizedError, ConflictError } from '../../shared/errors/app-error'
import { generateSecureToken, getRefreshTokenExpiry } from '../../shared/utils/token'

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

// ─── Tipos internos ───────────────────────────────────────────────────────────
interface GoogleUserPayload {
  sub: string
  email: string
  name: string
  picture?: string
}

interface LoginResult {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
    avatarUrl: string | null
    language: string
    theme: string
  }
}

// ─── Verifica o idToken do Google ─────────────────────────────────────────────
async function verifyGoogleToken(idToken: string): Promise<GoogleUserPayload> {
  if (env.NODE_ENV === 'development') {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()
      if (!payload || !payload.sub || !payload.email) {
        throw new UnauthorizedError('Payload do Google inválido')
      }
      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email,
        picture: payload.picture,
      }
    } catch (err) {
      console.warn('⚠️  [DEV] Falha ao verificar token Google, usando decode bypass:', err)
      const parts = idToken.split('.')
      if (parts.length !== 3) throw new UnauthorizedError('Formato de token inválido')
      try {
        const payloadStr = Buffer.from(parts[1], 'base64url').toString('utf8')
        const decoded = JSON.parse(payloadStr) as Partial<GoogleUserPayload> & { email?: string }
        return {
          sub: decoded.sub ?? decoded.email ?? 'dev-user',
          email: decoded.email ?? 'dev@metrikas.app',
          name: decoded.name ?? 'Dev User',
          picture: decoded.picture,
        }
      } catch {
        throw new UnauthorizedError('Token Google inválido')
      }
    }
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  })
  const payload = ticket.getPayload()
  if (!payload || !payload.sub || !payload.email) {
    throw new UnauthorizedError('Token Google inválido')
  }
  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email,
    picture: payload.picture,
  }
}

// ─── Auth Service ─────────────────────────────────────────────────────────────
export const authService = {
  // 1. Registro tradicional (Sign Up)
  async register(
    fastify: FastifyInstance,
    data: { name: string; email: string; password: string; pushToken?: string },
  ): Promise<LoginResult> {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    })

    if (existing) {
      throw new ConflictError('Já existe uma conta cadastrada com este e-mail.')
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        pushToken: data.pushToken ?? null,
        language: 'pt-BR',
        theme: 'light',
      },
    })

    const accessToken = fastify.jwt.sign(
      { id: user.id, email: user.email },
      { expiresIn: env.JWT_EXPIRES_IN },
    )

    const rawRefreshToken = generateSecureToken()
    const expiresAt = getRefreshTokenExpiry()

    await prisma.refreshToken.create({
      data: {
        token: rawRefreshToken,
        userId: user.id,
        expiresAt,
      },
    })

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        language: user.language,
        theme: user.theme,
      },
    }
  },

  // 2. Login tradicional com email e senha (Sign In)
  async loginWithPassword(
    fastify: FastifyInstance,
    data: { email: string; password: string; pushToken?: string },
  ): Promise<LoginResult> {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    })

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('E-mail ou senha incorretos.')
    }

    const passwordMatch = await bcrypt.compare(data.password, user.passwordHash)

    if (!passwordMatch) {
      throw new UnauthorizedError('E-mail ou senha incorretos.')
    }

    if (data.pushToken && data.pushToken !== user.pushToken) {
      await prisma.user.update({
        where: { id: user.id },
        data: { pushToken: data.pushToken },
      })
    }

    const accessToken = fastify.jwt.sign(
      { id: user.id, email: user.email },
      { expiresIn: env.JWT_EXPIRES_IN },
    )

    const rawRefreshToken = generateSecureToken()
    const expiresAt = getRefreshTokenExpiry()

    await prisma.refreshToken.create({
      data: {
        token: rawRefreshToken,
        userId: user.id,
        expiresAt,
      },
    })

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        language: user.language,
        theme: user.theme,
      },
    }
  },

  // 3. Login com Google OAuth
  async loginWithGoogle(
    fastify: FastifyInstance,
    idToken: string,
    pushToken?: string,
  ): Promise<LoginResult> {
    const googleUser = await verifyGoogleToken(idToken)

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.sub }, { email: googleUser.email }],
      },
    })

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.sub,
          name: googleUser.name,
          avatarUrl: googleUser.picture ?? user.avatarUrl,
          ...(pushToken ? { pushToken } : {}),
        },
      })
    } else {
      user = await prisma.user.create({
        data: {
          googleId: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
          avatarUrl: googleUser.picture ?? undefined,
          pushToken: pushToken ?? null,
          language: 'pt-BR',
          theme: 'light',
        },
      })
    }

    const accessToken = fastify.jwt.sign(
      { id: user.id, email: user.email },
      { expiresIn: env.JWT_EXPIRES_IN },
    )

    const rawRefreshToken = generateSecureToken()
    const expiresAt = getRefreshTokenExpiry()

    await prisma.refreshToken.create({
      data: {
        token: rawRefreshToken,
        userId: user.id,
        expiresAt,
      },
    })

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        language: user.language,
        theme: user.theme,
      },
    }
  },

  async refreshAccessToken(
    fastify: FastifyInstance,
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!tokenRecord) throw new UnauthorizedError('Refresh token inválido')

    if (tokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: tokenRecord.id } })
      throw new UnauthorizedError('Refresh token expirado')
    }

    const accessToken = fastify.jwt.sign(
      { id: tokenRecord.user.id, email: tokenRecord.user.email },
      { expiresIn: env.JWT_EXPIRES_IN },
    )

    return { accessToken }
  },

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
  },
}
