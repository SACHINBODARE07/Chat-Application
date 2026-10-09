import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { account, user } from '@/lib/db/schema'
import { createSession, hashPassword, SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/auth'

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { name?: string; email?: string; password?: string } | null
  const name = body?.name?.trim()
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password

  if (!name || !email || !password) return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 })
  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })

  const exists = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1)
  if (exists.length) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })

  const userId = randomUUID()
  const now = new Date()
  const passwordHash = await hashPassword(password)

  await db.transaction(async (tx) => {
    await tx.insert(user).values({ id: userId, name, email, emailVerified: false, role: 'user', createdAt: now, updatedAt: now })
    await tx.insert(account).values({ id: randomUUID(), accountId: userId, providerId: 'credential', userId, password: passwordHash, createdAt: now, updatedAt: now })
  })

  const { token, expiresAt } = await createSession(userId, request)
  const response = NextResponse.json({
    authenticated: true, configured: true,
    user: { id: userId, name, email, role: 'user' as const },
  })
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(expiresAt))
  return response
}