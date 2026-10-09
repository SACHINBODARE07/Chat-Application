'use client'

import { FormEvent, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { Check, MessageCircle } from 'lucide-react'
import { authApi } from '@/lib/api-client'

function AuthInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const authMutation = useMutation({
    mutationFn: (payload: { name?: string; email: string; password: string }) =>
      mode === 'login'
        ? authApi.login(payload)
        : authApi.signup({ ...payload, name: payload.name || '' }),
    onSuccess: (data) => {
      const role = data.user?.role ?? 'user'
      router.replace(role === 'admin' ? '/admin' : '/user')
      router.refresh()
    },
    onError: (err: Error) => setError(err.message),
  })

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        <div className="aurora aurora-one" /><div className="aurora aurora-two" />
        <div className="auth-brand-content">
          <Link href="/" className="brand-lockup">
            <span className="brand-mark"><MessageCircle size={19} /></span>
            <span>Luma</span>
            <span className="brand-badge">SUPPORT OS</span>
          </Link>

          <div className="brand-copy">
            <p className="eyebrow">A BETTER WAY TO CONNECT</p>
            <h1>Support that feels<br /><em>human again.</em></h1>
            <p>One beautifully simple space for meaningful conversations, quick answers, and teams that care about every reply.</p>
            <div className="hero-stats">
              <span><strong>24/7</strong><small>always-on support</small></span>
              <span><strong>2 min</strong><small>average response</small></span>
              <span><strong>98%</strong><small>happy customers</small></span>
            </div>
          </div>

          <div className="orbital-scene" aria-hidden="true">
            <div className="orbit orbit-large" /><div className="orbit orbit-small" />
            <div className="scene-core"><MessageCircle size={30} /></div>
            <div className="orbit-dot dot-one" /><div className="orbit-dot dot-two" /><div className="orbit-dot dot-three" />
            <div className="floating-card card-top">
              <span className="mini-icon"><Check size={13} /></span>
              <span><strong>Reply sent</strong><small>Just now</small></span>
            </div>
            <div className="floating-card card-bottom">
              <span className="avatar avatar-purple">AM</span>
              <span><strong>Ava is online</strong><small>Ready to help</small></span>
              <i className="online-dot" />
            </div>
          </div>

          <div className="auth-quote">
            <div className="avatar avatar-purple">AM</div>
            <div>
              <p>“Luma makes support feel like talking to a real person — because it is.”</p>
              <span>— Ava Morgan, Customer Success</span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <Link href="/" className="mobile-brand brand-lockup">
            <span className="brand-mark"><MessageCircle size={19} /></span>
            <span>Luma</span>
          </Link>

          <div className="auth-heading">
            <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</p>
            <h2>{mode === 'login' ? 'Sign in to your account' : 'Create your account'}</h2>
            <p>{mode === 'login' ? 'Enter your details to continue to Luma.' : 'Join your support workspace in a few seconds.'}</p>
          </div>

          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault()
              setError('')
              const form = new FormData(e.currentTarget)
              authMutation.mutate({
                name: String(form.get('name') || ''),
                email: String(form.get('email') || ''),
                password: String(form.get('password') || ''),
              })
            }}
            className="auth-form"
          >
            <label>
              Email address
              <input name="email" type="email" placeholder="you@company.com" required autoComplete="email" />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            {mode === 'signup' && (
              <label>
                Full name
                <input name="name" type="text" placeholder="Jamie Wilson" required autoComplete="name" />
              </label>
            )}

            {mode === 'login' && (
              <div className="form-row">
                <label className="check-label"><input type="checkbox" /> Remember me</label>
                <button type="button" className="text-button">Forgot password?</button>
              </div>
            )}

            {error && <p className="demo-note" role="alert">{error}</p>}

            <button className="primary-button" type="submit" disabled={authMutation.isPending}>
              {authMutation.isPending ? 'Connecting…' : mode === 'login' ? 'Sign in' : 'Create account'}
              <span>→</span>
            </button>
          </form>

          <p className="switch-auth">
            {mode === 'login' ? 'New to Luma?' : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setError('')
                setMode(mode === 'login' ? 'signup' : 'login')
              }}
            >
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>

          <p className="demo-note">
            <Link href="/" className="text-button">← Back to home</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="auth-shell"><div style={{ padding: 40 }}>Loading…</div></main>}>
      <AuthInner />
    </Suspense>
  )
}