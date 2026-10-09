'use client'

import { DashboardShell } from '@/components/dashboard-shell'
import { ProfileCard } from '@/components/profile-card'

export default function AdminProfilePage() {
  return (
    <DashboardShell role="admin">
      <ProfileCard role="admin" />
    </DashboardShell>
  )
}