import { NextResponse } from 'next/server'
import { destroySession, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  await destroySession()
  const response = NextResponse.json({ success: true })
  response.cookies.set(SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 })
  return response
}