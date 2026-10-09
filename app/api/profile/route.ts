import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { requireUser } from '@/lib/api-helpers'

export async function GET() {
  const { user: me, response } = await requireUser()
  if (response) return response
  const [row] = await db.select({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt })
    .from(user).where(eq(user.id, me!.id)).limit(1)
  return NextResponse.json({ profile: row })
}

export async function PATCH(request: Request) {
  const { user: me, response } = await requireUser()
  if (response) return response
  const body = (await request.json().catch(() => null)) as { name?: string } | null
  const name = body?.name?.trim()
  if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })

  const [updated] = await db.update(user)
    .set({ name, updatedAt: new Date() })
    .where(eq(user.id, me!.id))
    .returning({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt })

  return NextResponse.json({ profile: updated })
}