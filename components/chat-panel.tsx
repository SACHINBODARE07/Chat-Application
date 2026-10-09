'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Paperclip, Phone, Send, Smile, Video } from 'lucide-react'
import { api, type ConversationDTO, type MessageDTO, type SessionUser } from '@/lib/api-client'

export function ChatPanel({ conversation, me }: { conversation: ConversationDTO; me: SessionUser }) {
  const qc = useQueryClient()
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: () => api.messages(conversation.id),
    refetchInterval: 5000,
  })

  const send = useMutation({
    mutationFn: (body: string) => api.sendMessage(conversation.id, body),
    onSuccess: () => {
      setDraft('')
      qc.invalidateQueries({ queryKey: ['messages', conversation.id] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  const startCall = useMutation({
    mutationFn: (type: 'audio' | 'video') => api.startCall(conversation.id, type),
    onSuccess: (data) => alert(`Call started (${data.call.type})`),
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.data])

  const otherName = me.role === 'admin' ? conversation.customerName ?? 'Customer' : 'Luma Support'
  const initials = otherName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <>
      <div className="subbar">
        <div className="conversation-title">
          <span className="avatar avatar-purple">{initials}</span>
          <div><strong>{otherName}</strong><span><i className="online-dot" /> Online now</span></div>
        </div>
        <div className="conversation-actions">
          <button onClick={() => startCall.mutate('audio')} disabled={startCall.isPending}><Phone /> Audio</button>
          <button onClick={() => startCall.mutate('video')} disabled={startCall.isPending}><Video /> Video</button>
        </div>
      </div>

      <section className="chat-area" ref={scrollRef}>
        <div className="date-marker">Conversation</div>
        {messages.isLoading && <p>Loading…</p>}
        {messages.data?.messages.map((m: MessageDTO) => {
          const own = m.senderId === me.id
          const ini = (m.senderName ?? '??').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
          return (
            <div key={m.id} className={own ? 'message-row user-row' : 'message-row'}>
              {!own && <span className="avatar avatar-purple">{ini}</span>}
              <div className={`message-bubble ${own ? 'user-bubble' : 'admin-bubble'}`}>
                {m.body}
                <small>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
              </div>
              {own && <span className="avatar avatar-cyan">{ini}</span>}
            </div>
          )
        })}
      </section>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          const text = draft.trim()
          if (!text) return
          send.mutate(text)
        }}
      >
        <button type="button" className="composer-icon" aria-label="Attach"><Paperclip size={18} /></button>
        <button type="button" className="composer-icon" aria-label="Emoji" onClick={() => setDraft(d => d + ' 😊')}><Smile size={18} /></button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          aria-label="Message"
        />
        <button className="primary-button composer-send" type="submit" disabled={send.isPending}>
          <Send size={16} />
        </button>
      </form>
    </>
  )
}