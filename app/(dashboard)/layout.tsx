import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import {
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
} from 'lucide-react'
import SidebarLayout from '@/components/layout/SidebarLayout'

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
  const allowedMenu = MENU_ITEMS
    .filter(item => item.roles.includes(session.role))
    .map(({ href, label, icon }) => ({ href, label, icon }))

  return (
    <SidebarLayout
      menuItems={allowedMenu}
      userName={session.nama}
      userRole={session.role}
    >
      {children}
    </SidebarLayout>
  )
}
