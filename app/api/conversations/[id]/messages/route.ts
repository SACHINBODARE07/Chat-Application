import { NextResponse } from 'next/server'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { conversation, message, user } from '@/lib/db/schema'
import { requireUser } from '@/lib/api-helpers'

async function loadConversation(id: string, me: { id: string; role: 'user' | 'admin' }) {
  const [row] = await db.select().from(conversation).where(eq(conversation.id, id)).limit(1)
  if (!row) return { row: null, forbidden: false }
  if (me.role !== 'admin' && row.userId !== me.id) return { row, forbidden: true }
  return { row, forbidden: false }
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user: me, response } = await requireUser()
  if (response) return response
  const { id } = await params

  const { row, forbidden } = await loadConversation(id, me!)
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const rows = await db
    .select({
      id: message.id,
      body: message.body,
      type: message.type,
      createdAt: message.createdAt,
      senderId: message.senderId,
      senderName: user.name,
      senderRole: user.role,
    })
    .from(message)
    .leftJoin(user, eq(user.id, message.senderId))
    .where(eq(message.conversationId, id))
    .orderBy(asc(message.createdAt))

  return NextResponse.json({ messages: rows })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user: me, response } = await requireUser()
  if (response) return response
  const { id } = await params

  const { row, forbidden } = await loadConversation(id, me!)
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = (await request.json().catch(() => null)) as { body?: string; type?: 'text' | 'emoji' | 'system' } | null
  const text = body?.body?.trim()
  if (!text) return NextResponse.json({ error: 'Message body is required.' }, { status: 400 })

  const [created] = await db.insert(message).values({
    conversationId: id,
    senderId: me!.id,
    body: text,
    type: body?.type ?? 'text',
  }).returning()

  await db.update(conversation).set({ lastMessageAt: new Date() }).where(eq(conversation.id, id))

  return NextResponse.json({
    message: {
      id: created.id,
      body: created.body,
      type: created.type,
      createdAt: created.createdAt,
      senderId: me!.id,
      senderName: me!.name,
      senderRole: me!.role,
    },
  })
}