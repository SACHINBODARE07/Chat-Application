import { NextResponse } from 'next/server'
import { desc, eq, isNull, and, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { notification } from '@/lib/db/schema'
import { requireUser } from '@/lib/api-helpers'

export async function GET() {
  const { user: me, response } = await requireUser()
  if (response) return response

  const rows = await db.select().from(notification)
    .where(eq(notification.userId, me!.id))
    .orderBy(desc(notification.createdAt))
    .limit(20)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notification)
    .where(and(eq(notification.userId, me!.id), isNull(notification.readAt)))

  return NextResponse.json({
    unread: count ?? 0,
    notifications: rows.map(n => ({
      id: n.id,
      title: n.title,
      body: n.body,
      message: n.body,             // legacy alias used by old UI
      read: Boolean(n.readAt),
      createdAt: n.createdAt,
    })),
  })
}

export async function PATCH() {
  const { user: me, response } = await requireUser()
  if (response) return response
  await db.update(notification)
    .set({ readAt: new Date() })
    .where(and(eq(notification.userId, me!.id), isNull(notification.readAt)))
  return NextResponse.json({ ok: true })
}