'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export function ProfileCard({ role }: { role: 'admin' | 'user' }) {
  const qc = useQueryClient()
  const profile = useQuery({ queryKey: ['profile'], queryFn: api.profile })
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (profile.data?.profile.name) setName(profile.data.profile.name) }, [profile.data])

  const update = useMutation({
    mutationFn: () => api.updateProfile(name.trim()),
    onSuccess: () => {
      setSaved(true)
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['session'] })
      setTimeout(() => setSaved(false), 2000)
    },
  })

  if (profile.isLoading) return <div className="dashboard-content"><p>Loading profile…</p></div>

  const p = profile.data?.profile
  const initials = (p?.name ?? '??').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="dashboard-content">
      <div className="profile-page">
        <header className="profile-header">
          <span className="avatar avatar-purple avatar-xl">{initials}</span>
          <div>
            <h2>{p?.name}</h2>
            <p>{p?.email} · <span className="admin-badge">{role === 'admin' ? 'ADMIN' : 'CUSTOMER'}</span></p>
          </div>
        </header>

        <form
          className="profile-form"
          onSubmit={(e) => { e.preventDefault(); if (name.trim()) update.mutate() }}
        >
          <label>
            Display name
            <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </label>
          <label>
            Email
            <input value={p?.email ?? ''} disabled />
          </label>
          <label>
            Member since
            <input value={p ? new Date(p.createdAt).toLocaleDateString() : ''} disabled />
          </label>

          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={update.isPending || !name.trim() || name === p?.name}>
              {update.isPending ? 'Saving…' : 'Save changes'}
            </button>
            {saved && <span className="save-toast">Saved</span>}
          </div>
        </form>
      </div>
    </div>
  )
}