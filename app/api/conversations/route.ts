import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { conversation, message, user } from '@/lib/db/schema'
import { requireUser } from '@/lib/api-helpers'

export async function GET() {
  const { user: me, response } = await requireUser()
  if (response) return response
  const isAdmin = me!.role === 'admin'

  const base = db
    .select({
      id: conversation.id,
      subject: conversation.subject,
      lastMessageAt: conversation.lastMessageAt,
      userId: conversation.userId,
      adminId: conversation.adminId,
      customerName: user.name,
      customerEmail: user.email,
    })
    .from(conversation)
    .leftJoin(user, eq(user.id, conversation.userId))

  let rows = await (isAdmin ? base : base.where(eq(conversation.userId, me!.id)))
    .orderBy(desc(conversation.lastMessageAt))
    .limit(50)

  // Auto-bootstrap a conversation for a new regular user
  if (!isAdmin && rows.length === 0) {
    const [admin] = await db.select({ id: user.id, name: user.name }).from(user).where(eq(user.role, 'admin')).limit(1)
    const [created] = await db.insert(conversation).values({
      userId: me!.id,
      adminId: admin?.id ?? null,
      subject: 'Support conversation',
      lastMessageAt: new Date(),
    }).returning()

    if (admin) {
      await db.insert(message).values({
        conversationId: created.id,
        senderId: admin.id,
        body: 'Hi! Welcome to Luma Support. How can I help today?',
        type: 'text',
      })
    }
    rows = [{ ...created, customerName: me!.name, customerEmail: me!.email }]
  }

  return NextResponse.json({ conversations: rows })
}