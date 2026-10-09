import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { callSession, conversation } from '@/lib/db/schema'
import { requireUser } from '@/lib/api-helpers'

export async function GET() {
  const { user: me, response } = await requireUser()
  if (response) return response

  const rows = me!.role === 'admin'
    ? await db.select().from(callSession).orderBy(desc(callSession.createdAt)).limit(50)
    : await db.select({ c: callSession })
        .from(callSession)
        .innerJoin(conversation, eq(conversation.id, callSession.conversationId))
        .where(eq(conversation.userId, me!.id))
        .orderBy(desc(callSession.createdAt))
        .limit(50)
        .then(r => r.map(x => x.c))

  return NextResponse.json({ calls: rows })
}

export async function POST(request: Request) {
  const { user: me, response } = await requireUser()
  if (response) return response
  const body = (await request.json().catch(() => null)) as { conversationId?: string; type?: 'audio' | 'video' } | null
  if (!body?.conversationId || !body.type) return NextResponse.json({ error: 'conversationId and type are required.' }, { status: 400 })

  const [created] = await db.insert(callSession).values({
    conversationId: body.conversationId,
    initiatorId: me!.id,
    type: body.type,
    status: 'ringing',
    startedAt: new Date(),
  }).returning()

  return NextResponse.json({ call: created })
}