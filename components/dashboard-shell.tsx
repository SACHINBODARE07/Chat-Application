'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell, CalendarDays, ChevronDown, Inbox, LayoutDashboard, LogOut,
  MessageCircle, Moon, Search, Settings, Sun, User as UserIcon, Users, Video, X,
} from 'lucide-react'
import { api, authApi, type ConversationDTO, type SessionUser } from '@/lib/api-client'

type Role = 'admin' | 'user'
type NavItem = { label: string; href: string; icon: typeof Inbox; badge?: number }

type RoleConfig = {
  workspaceName: string
  workspaceSub: string
  workspaceInitial: string
  headerTitle: string
  headerBreadcrumb: string
  nav: (unread: number) => NavItem[]
  tools: NavItem[]
  profileRoleLabel: string
}

const configs: Record<Role, RoleConfig> = {
  admin: {
    workspaceName: 'Luma Admin',
    workspaceSub: 'Team workspace',
    workspaceInitial: 'L',
    headerTitle: 'Admin dashboard',
    headerBreadcrumb: 'Admin',
    nav: () => [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard },
      { label: 'Inbox', href: '/admin?view=inbox', icon: Inbox },
      { label: 'Customers', href: '/admin?view=customers', icon: Users },
      { label: 'Calls', href: '/admin?view=calls', icon: Video },
    ],
    tools: [
      { label: 'Calendar', href: '/admin?view=calendar', icon: CalendarDays },
      { label: 'Profile', href: '/admin/profile', icon: UserIcon },
      { label: 'Settings', href: '/admin?view=settings', icon: Settings },
    ],
    profileRoleLabel: 'Administrator',
  },
  user: {
    workspaceName: 'Acme workspace',
    workspaceSub: 'Personal inbox',
    workspaceInitial: 'J',
    headerTitle: 'Your conversations',
    headerBreadcrumb: 'My space',
    nav: () => [
      { label: 'Overview', href: '/user', icon: LayoutDashboard },
      { label: 'My conversations', href: '/user?view=conversations', icon: MessageCircle },
      { label: 'Video calls', href: '/user?view=calls', icon: Video },
    ],
    tools: [
      { label: 'Calendar', href: '/user?view=calendar', icon: CalendarDays },
      { label: 'Profile', href: '/user/profile', icon: UserIcon },
      { label: 'Settings', href: '/user?view=settings', icon: Settings },
    ],
    profileRoleLabel: 'Customer',
  },
}

function isActive(href: string, pathname: string, search: string) {
  const [path, query] = href.split('?')
  if (pathname !== path) return false
  if (!query) return !search
  return new URLSearchParams(query).get('view') === new URLSearchParams(search).get('view')
}

export function DashboardShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const queryClient = useQueryClient()
  const cfg = configs[role]

  const [dark, setDark] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const session = useQuery({ queryKey: ['session'], queryFn: authApi.session, retry: false })

  useEffect(() => {
    if (session.isSuccess && !session.data.authenticated) router.replace('/')
  }, [session.isSuccess, session.data, router])

  const me: SessionUser | null = session.data?.user ?? null

  const notifications = useQuery({
    queryKey: ['notifications'],
    queryFn: api.notifications,
    enabled: !!me,
    refetchInterval: 30_000,
  })

  const conversations = useQuery({
    queryKey: ['conversations'],
    queryFn: api.conversations,
    enabled: !!me,
  })

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear()
      router.replace('/')
      router.refresh()
    },
  })

  if (!me) {
    return (
      <div className="app-shell">
        <div style={{ padding: 40 }}>Loading your workspace…</div>
      </div>
    )
  }

  const unread = notifications.data?.unread ?? 0
  const nav = cfg.nav(unread)
  const initials = me.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className={dark ? 'app-shell dark-app' : 'app-shell'}>
      <aside className={mobileOpen ? 'dashboard-sidebar mobile-open' : 'dashboard-sidebar'}>
        <div className="dashboard-sidebar-top">
          <Link href={role === 'admin' ? '/admin' : '/user'} className="sidebar-brand-lockup">
            <span className="brand-mark"><MessageCircle /></span><strong>Luma</strong>
          </Link>
          <button className="sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></button>
        </div>

        <div className="workspace-switch">
          <span className="workspace-icon">{cfg.workspaceInitial}</span>
          <div><strong>{cfg.workspaceName}</strong><small>{cfg.workspaceSub}</small></div>
          <ChevronDown />
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="dashboard-nav">
          {nav.map(({ label, href, icon: Icon, badge }) => (
            <Link
              key={label}
              href={href}
              className={isActive(href, pathname, search) ? 'nav-item active' : 'nav-item'}
              onClick={() => setMobileOpen(false)}
            >
              <Icon />
              {label}
              {label === 'Inbox' && unread > 0 && <span className="unread-dot" />}
              {badge ? <span className="nav-badge">{badge}</span> : null}
            </Link>
          ))}
        </nav>

        <p className="nav-label nav-spacer">TOOLS</p>
        <nav className="dashboard-nav">
          {cfg.tools.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={isActive(href, pathname, search) ? 'nav-item active' : 'nav-item'}
              onClick={() => setMobileOpen(false)}
            >
              <Icon />{label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <Link className="profile" href={`/${role}/profile`}>
            <span className="avatar avatar-purple">{initials}</span>
            <div><strong>{me.name}</strong><small>{cfg.profileRoleLabel}</small></div>
            <ChevronDown />
          </Link>
        </div>
      </aside>

      {mobileOpen && <button className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-leading">
            <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><MessageCircle /></button>
            <div>
              <p className="breadcrumb">Workspace <span>/</span> <strong>{cfg.headerBreadcrumb}</strong></p>
              <h1>{cfg.headerTitle}</h1>
            </div>
          </div>

          <div className="top-actions">
            <button className="icon-button search-button" aria-label="Search"><Search /><span>Search</span><kbd>⌘ K</kbd></button>

            <div className="notification-wrap">
              <button
                className="icon-button"
                aria-label="Notifications"
                onClick={() => {
                  setNotifOpen(o => !o)
                  if (!notifOpen && unread > 0) api.markNotificationsRead().then(() => notifications.refetch())
                }}
              >
                <Bell />{unread > 0 && <i />}
              </button>
              {notifOpen && (
                <div className="notification-popover">
                  <strong>Notifications</strong>
                  {(notifications.data?.notifications.length ?? 0) === 0 && <span>You are all caught up.</span>}
                  {notifications.data?.notifications.map(n => (
                    <span key={n.id}>
                      <b>{n.title}</b>
                      <small>{n.body}</small>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button className="icon-button" aria-label="Toggle dark mode" onClick={() => setDark(v => !v)}>
              {dark ? <Sun /> : <Moon />}
            </button>

            <div className="profile-wrap">
              <button className="top-profile" onClick={() => setProfileOpen(o => !o)}>
                <span className="avatar avatar-purple">{initials}</span>
                <ChevronDown />
              </button>
              {profileOpen && (
                <div className="popover profile-popover">
                  <strong>{me.name}</strong>
                  <small>{me.email}</small>
                  <Link href={`/${role}/profile`} onClick={() => setProfileOpen(false)}>
                    <UserIcon size={14} /> My profile
                  </Link>
                  <button onClick={() => logout.mutate()}><LogOut size={14} /> Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}

/* ---------- Sub-components reused by both dashboards ---------- */

export function DashboardStats({ conversations, role }: { conversations: ConversationDTO[]; role: Role }) {
  return (
    <div className="dashboard-stats">
      <article>
        <span>{role === 'admin' ? 'Open conversations' : 'Messages this week'}</span>
        <strong>{conversations.length}</strong>
        <small>Live from your database</small>
      </article>
      <article><span>Avg. response time</span><strong>2m 14s</strong><small>Faster than 86% of teams</small></article>
      <article><span>Satisfaction score</span><strong>98%</strong><small>Based on 142 replies</small></article>
    </div>
  )
}