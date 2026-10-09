import type { UserRole } from './db/schema'

export const roles = {
  user: 'user',
  admin: 'admin',
} as const satisfies Record<UserRole, UserRole>

export function isAdmin(role: UserRole) {
  return role === roles.admin
}

export function canManageConversation(role: UserRole) {
  return role === roles.admin
}

export function canStartCall(role: UserRole) {
  return role === roles.user || role === roles.admin
}

// Runtime Better Auth configuration is intentionally deferred until BETTER_AUTH_SECRET is configured.
export type SessionUser = {
  id: string
  name: string
  email: string
  role: UserRole
}
