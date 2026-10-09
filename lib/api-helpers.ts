import { NextResponse } from 'next/server'
import { getSessionUser } from './auth'

export async function requireUser() {
  const user = await getSessionUser()
  if (!user) return { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  return { user, response: null }
}

export async function requireAdmin() {
  const { user, response } = await requireUser()
  if (response) return { user: null, response }
  if (user!.role !== 'admin') return { user: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { user: user!, response: null }
}