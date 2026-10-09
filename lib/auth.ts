import 'server-only'
import { randomBytes, randomUUID, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { cookies } from 'next/headers'
import { and, eq, gt } from 'drizzle-orm'
import { db } from './db'
import { account, session, user } from './db/schema'

const scrypt = promisify(scryptCb)
export const SESSION_COOKIE_NAME = 'luma_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30
const KEY_LENGTH = 64

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  return `${salt}:${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string | null) {
  if (!stored) return false
  const [salt, key] = stored.split(':')
  if (!salt || !key) return false
  const expected = Buffer.from(key, 'hex')
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  if (expected.length !== derived.length) return false
  return timingSafeEqual(expected, derived)
}

export async function createSession(userId: string, request?: Request) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await db.insert(session).values({
    id: randomUUID(),
    token,
    userId,
    expiresAt,
    ipAddress: request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    userAgent: request?.headers.get('user-agent') ?? null,
  })
  return { token, expiresAt }
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  }
}

export async function getSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  const rows = await db
    .select({ id: user.id, name: user.name, email: user.email, role: user.role })
    .from(session)
    .innerJoin(user, eq(user.id, session.userId))
    .where(and(eq(session.token, token), gt(session.expiresAt, new Date())))
    .limit(1)
  return rows[0] ?? null
}

export async function destroySession() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value
  if (token) await db.delete(session).where(eq(session.token, token))
}