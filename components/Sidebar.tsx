'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, BarChart2, Lightbulb, Bell, Settings, LogOut } from 'lucide-react'
import { LogoFull } from '@/components/Logo'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/nudges', label: 'Nudge History', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="w-60 shrink-0 flex flex-col h-screen sticky top-0 border-r"
      style={{
        background: 'rgba(9,9,11,0.3)',
        backdropFilter: 'blur(64px) saturate(200%) brightness(1.08)',
        WebkitBackdropFilter: 'blur(64px) saturate(200%) brightness(1.08)',
        borderRight: '1px solid rgba(255,255,255,0.09)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <LogoFull size={26} uid="sidebar" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
          Menu
        </p>
        {navItems.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150"
              style={{
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: active ? 500 : 400,
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Live status */}
      <div className="px-4 py-3 mx-3 mb-3 rounded-lg border" style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--risk-low)' }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--risk-low)' }} />
          </span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Extension active</span>
        </div>
      </div>

      {/* Sign out */}
      <div className="px-3 pb-5 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm lg-btn lg-btn-secondary"
          style={{ color: 'var(--text-secondary)' }}
        >
          <LogOut size={15} strokeWidth={2} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
