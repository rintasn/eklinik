import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import SidebarLayout from '@/components/layout/SidebarLayout'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <SidebarLayout
      userName={session.nama}
      userRole={session.role}
    >
      {children}
    </SidebarLayout>
  )
}

