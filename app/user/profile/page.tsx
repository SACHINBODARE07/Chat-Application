'use client'

import { DashboardShell } from '@/components/dashboard-shell'
import { ProfileCard } from '@/components/profile-card'

export default function UserProfilePage() {
  return (
    <DashboardShell role="user">
      <ProfileCard role="user" />
    </DashboardShell>
  )
}