'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Check, MessageCircle, Play, Sparkles, Video, Zap } from 'lucide-react'
import { authApi } from '@/lib/api-client'

const features = [
  { icon: MessageCircle, title: 'Human conversations', text: 'Keep every customer reply warm, clear, and in one beautiful place.' },
  { icon: Video, title: 'Calls when it matters', text: 'Jump from chat to audio or video without losing the conversation.' },
  { icon: Zap, title: 'Fast by default', text: 'Give your team context, notifications, and quick answers instantly.' },
]

export default function HomePage() {
  const router = useRouter()
  const session = useQuery({ queryKey: ['session'], queryFn: authApi.session, retry: false })

  // If already signed in, bounce to the right dashboard.
  useEffect(() => {
    if (session.data?.authenticated && session.data.user) {
      router.replace(session.data.user.role === 'admin' ? '/admin' : '/user')
    }
  }, [session.data, router])

  return (
    <main className="marketing-shell">
      <nav className="marketing-nav">
        <a href="/" className="brand-lockup">
          <span className="brand-mark"><MessageCircle size={18} /></span>
          <span>Luma</span>
          <span className="brand-badge">SUPPORT OS</span>
        </a>
        <div className="marketing-links">
          <a href="#why-luma">Why Luma</a>
          <a href="#features">Features</a>
          <a href="#team">For teams</a>
        </div>
        <div className="marketing-actions">
          <a href="/login" className="nav-login">Sign in</a>
          <a href="/login?mode=signup" className="primary-button nav-cta">
            Start chatting <ArrowRight size={16} />
          </a>
        </div>
      </nav>

      <section className="marketing-hero" id="why-luma">
        <div className="hero-glow glow-a" /><div className="hero-glow glow-b" />
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={14} /> THE SUPPORT SPACE FOR MODERN TEAMS</p>
          <h1>Make every<br /><em>conversation</em> count.</h1>
          <p className="hero-lede">Luma brings your customers and your team closer with support that feels personal, immediate, and beautifully simple.</p>
          <div className="hero-actions">
            <a href="/login?mode=signup" className="primary-button large-button">
              Create your workspace <ArrowRight size={17} />
            </a>
            <a href="#features" className="secondary-button">
              <span className="play-icon"><Play size={12} fill="currentColor" /></span> See how it works
            </a>
          </div>
          <div className="trust-row">
            <div className="trust-avatars"><span>AM</span><span>JW</span><span>RK</span><span>+</span></div>
            <span>Trusted by teams who care<br /><strong>about every reply.</strong></span>
          </div>
        </div>

        <div className="hero-stage" aria-label="Luma chat preview">
          <div className="stage-orbit orbit-one" /><div className="stage-orbit orbit-two" />
          <div className="stage-card stage-main">
            <div className="stage-header">
              <div className="avatar avatar-purple">AM</div>
              <div><strong>Ava Morgan</strong><small><i className="online-dot" /> Online now</small></div>
              <span className="stage-menu">•••</span>
            </div>
            <div className="stage-messages">
              <div className="stage-message admin-message">Hey Jamie, welcome to Luma. How can I help today?<small>10:24 AM</small></div>
              <div className="stage-message user-message">I have a question about my workspace upgrade.</div>
              <div className="stage-message admin-message">Of course — I&apos;ll take a look for you.</div>
            </div>
            <div className="stage-input">Write a message... <span><MessageCircle size={15} /></span></div>
          </div>
          <div className="floating-stat stat-top">
            <span className="stat-icon"><Check size={14} /></span>
            <span><strong>98% satisfaction</strong><small>from real conversations</small></span>
          </div>
          <div className="floating-stat stat-bottom">
            <span className="stat-icon stat-blue"><Zap size={14} /></span>
            <span><strong>2 min response</strong><small>your team is on it</small></span>
          </div>
        </div>
      </section>

      <section className="feature-section" id="features">
        <div className="section-heading">
          <p className="eyebrow">EVERYTHING IN ONE PLACE</p>
          <h2>Support, without the busywork.</h2>
          <p>Give your customers a direct line to people who can help — and give your team the tools to make every interaction matter.</p>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <article className="feature-card" key={title}>
              <span className="feature-icon"><Icon size={19} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
              <a href="/login?mode=signup">Explore feature <ArrowRight size={14} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-bottom" id="team">
        <div>
          <p className="eyebrow">READY WHEN YOU ARE</p>
          <h2>Let&apos;s make support<br /><em>feel human.</em></h2>
        </div>
        <a href="/login?mode=signup" className="primary-button large-button">
          Get started free <ArrowRight size={17} />
        </a>
      </section>

      <footer className="marketing-footer">
        <a href="/" className="brand-lockup"><span className="brand-mark"><MessageCircle size={15} /></span><span>Luma</span></a>
        <span>© 2026 Luma Support OS</span>
        <span>Built for better conversations.</span>
      </footer>
    </main>
  )
}