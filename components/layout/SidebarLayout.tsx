'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  Users,
  ClipboardList,
  Stethoscope,
  Pill,
  CreditCard,
  Package,
  Building,
  Calendar,
  BarChart3,
  Settings,
  User,
  Menu,
  X,
} from 'lucide-react'
import LogoutButton from '@/components/layout/LogoutButton'

const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  ClipboardList,
  Stethoscope,
  Pill,
  CreditCard,
  Package,
  Building,
  Calendar,
  BarChart3,
  Settings,
}

interface MenuItem {
  href: string
  label: string
  icon: React.ElementType
}

interface SidebarLayoutProps {
  menuItems: MenuItem[]
  userName: string
  userRole: string
  children: React.ReactNode
}

export default function SidebarLayout({
  menuItems,
  userName,
  userRole,
  children,
}: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change (mobile nav)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Close sidebar on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), [])

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">

      {/* ── Overlay backdrop (mobile only) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar Panel ── */}
      <aside
        className={[
          // Base
          'fixed inset-y-0 left-0 z-40 w-72 flex flex-col justify-between',
          'bg-zinc-900 border-r border-zinc-800',
          'transition-transform duration-300 ease-in-out',
          // Mobile: slide in/out
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible, relative position
          'md:relative md:translate-x-0 md:w-64 md:shrink-0',
        ].join(' ')}
        aria-label="Navigasi Utama"
      >
        {/* Header Branding */}
        <div>
          <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-800 bg-zinc-900/30">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-sm tracking-tight text-white leading-none truncate">
                Klinik Pratama
              </h1>
              <span className="text-[10px] text-zinc-500 font-medium">SIM KLINIK v1.0</span>
            </div>
            {/* Close button — mobile only */}
            <button
              onClick={closeSidebar}
              className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Tutup sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1" role="navigation">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all group',
                    isActive
                      ? 'text-white bg-indigo-600/20 border border-indigo-500/30'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50',
                  ].join(' ')}
                >
                  <Icon
                    className={[
                      'h-4 w-4 transition-colors shrink-0',
                      isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-indigo-400',
                    ].join(' ')}
                  />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/20">
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate leading-tight">{userName}</p>
              <p className="text-[10px] text-indigo-400 font-medium tracking-wide uppercase mt-0.5">
                {userRole.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* ── Main Workspace Frame ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/20 flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Buka menu navigasi"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">
                Sistem Siaga Medis Online
              </span>
            </div>
          </div>

          <div className="text-xs text-zinc-500 hidden sm:block">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-zinc-950 relative">
          {children}
        </main>
      </div>
    </div>
  )
}
