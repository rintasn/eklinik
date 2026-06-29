import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Link from 'next/link'
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
  LogOut,
  User
} from 'lucide-react'
import LogoutButton from '@/components/layout/LogoutButton'

const MENU_ITEMS = [
  { href: '/front-office', label: 'Front Office', roles: ['ADMIN', 'FRONT_OFFICE'], icon: Users },
  { href: '/pendaftaran', label: 'Poli Pendaftaran', roles: ['ADMIN', 'FRONT_OFFICE', 'PERAWAT'], icon: ClipboardList },
  { href: '/dokter', label: 'Ruang Dokter', roles: ['ADMIN', 'DOKTER'], icon: Stethoscope },
  { href: '/apotik', label: 'Apotik', roles: ['ADMIN', 'APOTEKER'], icon: Pill },
  { href: '/pembayaran', label: 'Pembayaran', roles: ['ADMIN', 'KASIR'], icon: CreditCard },
  { href: '/stok', label: 'Stok Obat & Alkes', roles: ['ADMIN', 'MANAJER_STOK', 'APOTEKER'], icon: Package },
  { href: '/fasilitas', label: 'Fasilitas Klinik', roles: ['ADMIN', 'MANAJER_STOK'], icon: Building },
  { href: '/jadwal', label: 'Jadwal Kerja', roles: ['ADMIN', 'FRONT_OFFICE', 'DOKTER', 'PERAWAT', 'APOTEKER', 'KASIR', 'MANAJER_STOK'], icon: Calendar },
  { href: '/laporan', label: 'Laporan & Analisis', roles: ['ADMIN', 'KASIR', 'MANAJER_STOK'], icon: BarChart3 },
  { href: '/konfigurasi', label: 'Konfigurasi Sistem', roles: ['ADMIN'], icon: Settings },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Filter menu items by user role
  const allowedMenu = MENU_ITEMS.filter(item => item.roles.includes(session.role))

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar Panel */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col justify-between shrink-0">
        <div>
          {/* Header Branding */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-800 bg-zinc-900/30">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm tracking-tight text-white leading-none">Klinik Pratama</h1>
              <span className="text-[10px] text-zinc-500 font-medium">SIM KLINIK v1.0</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {allowedMenu.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 rounded-xl hover:text-white hover:bg-zinc-800/50 transition-all group"
                >
                  <Icon className="h-4 w-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/20">
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <User className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate leading-tight">{session.nama}</p>
              <p className="text-[10px] text-indigo-400 font-medium tracking-wide uppercase mt-0.5">{session.role.replace('_', ' ')}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/20 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs text-zinc-400 font-semibold">Sistem Siaga Medis Online</span>
          </div>
          <div className="text-xs text-zinc-500">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 p-8 overflow-y-auto bg-zinc-950 relative">
          {children}
        </main>
      </div>
    </div>
  )
}
