import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ authenticated: false, configured: true, user: null })
  return NextResponse.json({ authenticated: true, configured: true, user })
}