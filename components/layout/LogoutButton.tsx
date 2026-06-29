'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/logout', { method: 'POST' })
      if (res.ok) {
        router.refresh()
        router.push('/login')
      } else {
        console.error('Logout request failed')
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-zinc-400 rounded-xl hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer group disabled:opacity-50"
    >
      <LogOut className="h-4 w-4 text-zinc-500 group-hover:text-red-400 transition-colors" />
      <span>{loading ? 'Keluar...' : 'Keluar Aplikasi'}</span>
    </button>
  )
}
