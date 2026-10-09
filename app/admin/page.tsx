'use client'

import { useQuery } from '@tanstack/react-query'
import { DashboardShell, DashboardStats } from '@/components/dashboard-shell'
import { ChatPanel } from '@/components/chat-panel'
import { api, authApi } from '@/lib/api-client'

export default function AdminDashboardPage() {
  const session = useQuery({ queryKey: ['session'], queryFn: authApi.session })
  const conversations = useQuery({ queryKey: ['conversations'], queryFn: api.conversations })

  return (
    <DashboardShell role="admin">
      <div className="dashboard-content">
        <DashboardStats conversations={conversations.data?.conversations ?? []} role="admin" />
        {session.data?.user && conversations.data?.conversations[0] ? (
          <ChatPanel conversation={conversations.data.conversations[0]} me={session.data.user} />
        ) : (
          <p>No conversations yet.</p>
        )}
      </div>
    </DashboardShell>
  )
}