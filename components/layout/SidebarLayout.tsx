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
  BookOpen,
  HeartPulse,
  Bed,
  Scissors,
  FileSpreadsheet,
  Droplet,
  FlaskConical,
  Utensils,
  ShieldCheck,
  Link as LinkIcon,
  Coins,
  Landmark,
  Clock,
  FolderHeart,
  MessageSquare,
} from 'lucide-react'
import LogoutButton from '@/components/layout/LogoutButton'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

interface MenuItem {
  href: string
  label: string
  roles: string[]
  icon: React.ElementType
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Layanan Utama',
    items: [
      { href: '/front-office', label: 'Front Office', roles: ['ADMIN', 'FRONT_OFFICE'], icon: Users },
      { href: '/pendaftaran', label: 'Poli Pendaftaran', roles: ['ADMIN', 'FRONT_OFFICE', 'PERAWAT'], icon: ClipboardList },
      { href: '/dokter', label: 'Ruang Dokter', roles: ['ADMIN', 'DOKTER'], icon: Stethoscope },
      { href: '/reservasi', label: 'Reservasi', roles: ['ADMIN', 'FRONT_OFFICE'], icon: BookOpen },
      { href: '/rawat-darurat', label: 'Rawat Darurat (IGD)', roles: ['ADMIN', 'DOKTER', 'PERAWAT'], icon: HeartPulse },
      { href: '/rawat-inap', label: 'Rawat Inap', roles: ['ADMIN', 'DOKTER', 'PERAWAT'], icon: Bed },
      { href: '/bedah-sentral', label: 'Bedah Sentral', roles: ['ADMIN', 'DOKTER'], icon: Scissors },
      { href: '/mcu', label: 'MCU', roles: ['ADMIN', 'DOKTER', 'PERAWAT'], icon: FileSpreadsheet },
      { href: '/hemodialisa', label: 'Hemodialisa', roles: ['ADMIN', 'DOKTER', 'PERAWAT'], icon: Droplet },
    ],
  },
  {
    title: 'Penunjang & Logistik',
    items: [
      { href: '/apotik', label: 'Apotik', roles: ['ADMIN', 'APOTEKER'], icon: Pill },
      { href: '/penunjang', label: 'Penunjang (Lab & Rad)', roles: ['ADMIN', 'DOKTER', 'APOTEKER'], icon: FlaskConical },
      { href: '/stok', label: 'Stok Obat & Alkes', roles: ['ADMIN', 'MANAJER_STOK', 'APOTEKER'], icon: Package },
      { href: '/pelayanan-gizi', label: 'Pelayanan Gizi', roles: ['ADMIN', 'MANAJER_STOK'], icon: Utensils },
    ],
  },
  {
    title: 'Administrasi & Keuangan',
    items: [
      { href: '/pembayaran', label: 'Pembayaran (Kasir)', roles: ['ADMIN', 'KASIR'], icon: CreditCard },
      { href: '/penjaminan', label: 'Penjaminan', roles: ['ADMIN', 'KASIR'], icon: ShieldCheck },
      { href: '/bpjs-bridging', label: 'BPJS Bridging', roles: ['ADMIN', 'KASIR', 'FRONT_OFFICE'], icon: LinkIcon },
      { href: '/jasa-pelayanan', label: 'Jasa Pelayanan', roles: ['ADMIN'], icon: Coins },
      { href: '/general-ledger', label: 'General Ledger', roles: ['ADMIN'], icon: Landmark },
    ],
  },
  {
    title: 'Operasional & Karyawan',
    items: [
      { href: '/jadwal', label: 'Jadwal Kerja', roles: ['ADMIN', 'FRONT_OFFICE', 'DOKTER', 'PERAWAT', 'APOTEKER', 'KASIR', 'MANAJER_STOK'], icon: Calendar },
      { href: '/presensi', label: 'Presensi', roles: ['ADMIN', 'FRONT_OFFICE', 'DOKTER', 'PERAWAT', 'APOTEKER', 'KASIR', 'MANAJER_STOK'], icon: Clock },
      { href: '/fasilitas', label: 'Fasilitas Klinik', roles: ['ADMIN', 'MANAJER_STOK'], icon: Building },
    ],
  },
  {
    title: 'Analisis & Pelanggan',
    items: [
      { href: '/rekam-medik', label: 'Arsip Rekam Medik', roles: ['ADMIN', 'DOKTER', 'PERAWAT'], icon: FolderHeart },
      { href: '/dashboard-direksi', label: 'Dashboard Direksi', roles: ['ADMIN'], icon: BarChart3 },
      { href: '/crm', label: 'CRM', roles: ['ADMIN', 'FRONT_OFFICE'], icon: MessageSquare },
      { href: '/laporan', label: 'Laporan & Analisis', roles: ['ADMIN', 'KASIR', 'MANAJER_STOK'], icon: BarChart3 },
      { href: '/konfigurasi', label: 'Konfigurasi Sistem', roles: ['ADMIN'], icon: Settings },
    ],
  },
]

interface SidebarLayoutProps {
  userName: string
  userRole: string
  children: React.ReactNode
}

export default function SidebarLayout({
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

  // Filter sections by role
  const filteredSections = MENU_SECTIONS.map(section => {
    const allowedItems = section.items.filter(item => item.roles.includes(userRole))
    return {
      ...section,
      items: allowedItems,
    }
  }).filter(section => section.items.length > 0)

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-300">

      {/* ── Overlay backdrop (mobile only) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 dark:bg-black/60 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar Panel ── */}
      <aside
        className={[
          // Base
          'fixed inset-y-0 left-0 z-40 w-72 flex flex-col justify-between',
          'bg-white dark:bg-zinc-900',
          'border-r border-slate-200 dark:border-zinc-800',
          'transition-all duration-300 ease-in-out',
          // Mobile: slide in/out
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
          // Desktop: always visible, relative position
          'md:relative md:translate-x-0 md:w-64 md:shrink-0 md:shadow-none',
        ].join(' ')}
        aria-label="Navigasi Utama"
      >
        {/* Header Branding */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/30 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/25">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-none truncate">
                Klinik Pratama
              </h1>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">SIM KLINIK v1.0</span>
            </div>
            {/* Close button — mobile only */}
            <button
              onClick={closeSidebar}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Tutup sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Grouped Navigation Links Area with Custom Scroll */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6" role="navigation">
            {filteredSections.map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                <h4 className="px-3 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                  {section.title}
                </h4>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={[
                          'flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all duration-200 group',
                          isActive
                            ? 'text-indigo-700 dark:text-white bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30'
                            : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50 border border-transparent',
                        ].join(' ')}
                      >
                        <Icon
                          className={[
                            'h-4 w-4 transition-colors shrink-0',
                            isActive
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-400 dark:text-zinc-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400',
                          ].join(' ')}
                        />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/20 shrink-0">
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-300 shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-tight">{userName}</p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium tracking-wide uppercase mt-0.5">
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
        <header className="h-16 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/20 backdrop-blur-sm flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-20 transition-colors duration-300">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Buka menu navigasi"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold hidden sm:inline">
                Sistem Siaga Medis Online
              </span>
            </div>
          </div>

          {/* Right section: date + theme toggle + APM Link */}
          <div className="flex items-center gap-3">
            <Link
              href="/anjungan-mandiri"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 transition-all shrink-0"
            >
              APM Mandiri
            </Link>
            <div className="text-xs text-slate-400 dark:text-zinc-500 hidden sm:block">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50 dark:bg-zinc-950 relative transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  )
}
