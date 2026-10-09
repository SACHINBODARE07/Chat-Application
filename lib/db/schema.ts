import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const userRole = pgEnum('user_role', ['user', 'admin'])
export const messageType = pgEnum('message_type', ['text', 'emoji', 'system'])
export const callType = pgEnum('call_type', ['audio', 'video'])
export const callStatus = pgEnum('call_status', ['ringing', 'active', 'ended', 'missed'])

// Better Auth-compatible tables. Keep camelCase columns unchanged.
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  role: userRole('role').notNull().default('user'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
})

export const conversation = pgTable('conversation', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('userId').notNull(),
  adminId: text('adminId'),
  subject: text('subject').notNull().default('Support conversation'),
  lastMessageAt: timestamp('lastMessageAt', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
})

export const message = pgTable('message', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversationId').notNull(),
  senderId: text('senderId').notNull(),
  body: text('body').notNull(),
  type: messageType('type').notNull().default('text'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  editedAt: timestamp('editedAt', { withTimezone: true }),
})

export const messageReaction = pgTable('message_reaction', {
  id: uuid('id').defaultRandom().primaryKey(),
  messageId: uuid('messageId').notNull(),
  userId: text('userId').notNull(),
  emoji: text('emoji').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
})

export const callSession = pgTable('call_session', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversationId').notNull(),
  initiatorId: text('initiatorId').notNull(),
  type: callType('type').notNull(),
  status: callStatus('status').notNull().default('ringing'),
  startedAt: timestamp('startedAt', { withTimezone: true }),
  endedAt: timestamp('endedAt', { withTimezone: true }),
  durationSeconds: integer('durationSeconds'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
})

export const notification = pgTable('notification', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  readAt: timestamp('readAt', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
})

export type UserRole = typeof userRole.enumValues[number]
export type Message = typeof message.$inferSelect
export type NewMessage = typeof message.$inferInsert
export type Conversation = typeof conversation.$inferSelect
export type Notification = typeof notification.$inferSelect
export type CallSession = typeof callSession.$inferSelect

export const schema = { user, session, account, verification, conversation, message, messageReaction, callSession, notification }
