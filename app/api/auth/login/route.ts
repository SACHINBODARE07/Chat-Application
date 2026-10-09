import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { account, user } from '@/lib/db/schema'
import { createSession, SESSION_COOKIE_NAME, sessionCookieOptions, verifyPassword } from '@/lib/auth'

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })

  const rows = await db
    .select({ id: user.id, name: user.name, email: user.email, role: user.role, password: account.password })
    .from(user)
    .leftJoin(account, and(eq(account.userId, user.id), eq(account.providerId, 'credential')))
    .where(eq(user.email, email))
    .limit(1)

  const record = rows[0]
  const ok = record ? await verifyPassword(password, record.password) : false
  if (!record || !ok) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })

  const { token, expiresAt } = await createSession(record.id, request)
  const response = NextResponse.json({
    authenticated: true, configured: true,
    user: { id: record.id, name: record.name, email: record.email, role: record.role },
  })
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(expiresAt))
  return response
}