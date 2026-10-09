'use client'

export type SessionUser = { id: string; name: string; email: string; role: 'user' | 'admin' }
export type AuthPayload = { email: string; password: string }
export type SignupPayload = AuthPayload & { name: string }
export type AuthResponse = { authenticated?: boolean; configured?: boolean; user?: SessionUser | null; error?: string }

export type ConversationDTO = {
  id: string
  subject: string
  lastMessageAt: string | null
  userId: string
  adminId: string | null
  customerName: string | null
  customerEmail: string | null
}
export type MessageDTO = {
  id: string
  body: string
  type: 'text' | 'emoji' | 'system'
  createdAt: string
  senderId: string
  senderName: string | null
  senderRole: 'user' | 'admin' | null
}
export type NotificationDTO = { id: string; title: string; body: string; message: string; read: boolean; createdAt: string }
export type CallDTO = { id: string; conversationId: string; type: 'audio' | 'video'; status: string; startedAt: string | null; endedAt: string | null }
export type ProfileDTO = { id: string; name: string; email: string; role: 'user' | 'admin'; createdAt: string }

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string }
  if (!response.ok) throw new Error(payload.error || 'Something went wrong. Please try again.')
  return payload
}

export const authApi = {
  login: (p: AuthPayload) => request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(p) }),
  signup: (p: SignupPayload) => request<AuthResponse>('/api/auth/signup', { method: 'POST', body: JSON.stringify(p) }),
  session: () => request<AuthResponse>('/api/auth/session'),
  logout: () => request<{ success?: boolean }>('/api/auth/logout', { method: 'POST' }),
}

export const api = {
  conversations: () => request<{ conversations: ConversationDTO[] }>('/api/conversations'),
  messages: (id: string) => request<{ messages: MessageDTO[] }>(`/api/conversations/${id}/messages`),
  sendMessage: (id: string, body: string) =>
    request<{ message: MessageDTO }>(`/api/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ body }) }),
  notifications: () => request<{ unread: number; notifications: NotificationDTO[] }>('/api/notifications'),
  markNotificationsRead: () => request<{ ok: boolean }>('/api/notifications', { method: 'PATCH' }),
  calls: () => request<{ calls: CallDTO[] }>('/api/calls'),
  startCall: (conversationId: string, type: 'audio' | 'video') =>
    request<{ call: CallDTO }>('/api/calls', { method: 'POST', body: JSON.stringify({ conversationId, type }) }),
  profile: () => request<{ profile: ProfileDTO }>('/api/profile'),
  updateProfile: (name: string) =>
    request<{ profile: ProfileDTO }>('/api/profile', { method: 'PATCH', body: JSON.stringify({ name }) }),
}