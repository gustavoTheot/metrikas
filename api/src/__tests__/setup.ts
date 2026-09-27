import { beforeAll, afterAll, vi } from 'vitest'

// Mock do Prisma para testes unitários
vi.mock('../../infra/database/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    goal: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
    milestone: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), updateMany: vi.fn() },
    task: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    notification: { findMany: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    refreshToken: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
    $disconnect: vi.fn(),
  },
}))

beforeAll(() => {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
  process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars-long-ok'
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars-long'
  process.env.JWT_EXPIRES_IN = '15m'
  process.env.JWT_REFRESH_EXPIRES_IN = '7d'
  process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
  process.env.PORT = '3334'
  process.env.NODE_ENV = 'test'
  process.env.CORS_ORIGINS = 'http://localhost:8081'
})

afterAll(() => {
  vi.clearAllMocks()
})
