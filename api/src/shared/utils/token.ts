import crypto from 'crypto'

// ─── Gera token seguro para uso como Refresh Token ───────────────────────────
export function generateSecureToken(): string {
  return crypto.randomBytes(64).toString('hex')
}

// ─── Retorna data de expiração do refresh token (7 dias) ─────────────────────
export function getRefreshTokenExpiry(): Date {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date
}
