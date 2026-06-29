'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Activity, Mail, Lock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const callbackUrl = searchParams.get('callbackUrl') || '/front-office'

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login gagal. Silakan coba lagi.')
      } else {
        setSuccess(true)
        router.refresh()
        setTimeout(() => {
          let targetPath = callbackUrl
          const role = data.user.role
          if (callbackUrl === '/front-office' || callbackUrl === '/') {
            if (role === 'FRONT_OFFICE') targetPath = '/front-office'
            else if (role === 'PERAWAT') targetPath = '/pendaftaran'
            else if (role === 'DOKTER') targetPath = '/dokter'
            else if (role === 'APOTEKER') targetPath = '/apotik'
            else if (role === 'KASIR') targetPath = '/pembayaran'
            else if (role === 'MANAJER_STOK') targetPath = '/stok'
            else if (role === 'ADMIN') targetPath = '/front-office'
          }
          router.push(targetPath)
        }, 800)
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi server.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Mohon isi email dan password.')
      return
    }
    performLogin(email, password)
  }

  const handleQuickLogin = (roleEmail: string, rolePass: string) => {
    if (loading || success) return
    setEmail(roleEmail)
    setPassword(rolePass)
    performLogin(roleEmail, rolePass)
  }

  return (
    <div className="w-full max-w-md glass-panel p-8 rounded-3xl z-10 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 shadow-3xl animate-fade-in text-slate-900 dark:text-zinc-100">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-650/10 border border-indigo-100 dark:border-indigo-600/20 items-center justify-center mb-4 text-indigo-650 dark:text-indigo-400">
          <Activity className="h-6 w-6 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">SIM Klinik Pratama</h1>
        <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1">Masuk untuk mengelola pelayanan medis</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-sm px-4 py-3.5 rounded-2xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm px-4 py-3.5 rounded-2xl text-center font-semibold">
          Login berhasil! Mengarahkan ke faskes...
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Email Staff</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              required
              disabled={loading || success}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@klinik.com"
              className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              required
              disabled={loading || success}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-indigo-655 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-zinc-800 text-white font-semibold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all duration-150 cursor-pointer text-sm"
        >
          {loading ? 'Memverifikasi...' : 'Masuk Sistem'}
        </button>
      </form>

      {/* Quick Demo Credentials */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800/80">
        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Sesi Uji Coba Cepat (Klik untuk memilih)</p>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <button
            onClick={() => handleQuickLogin('admin@klinik.com', 'AdminPass123!')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-200 dark:hover:border-zinc-700 text-left truncate cursor-pointer transition-all"
          >
            🔑 Admin
          </button>
          <button
            onClick={() => handleQuickLogin('dokter.budi@klinik.com', 'DokterPass123!')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-200 dark:hover:border-zinc-700 text-left truncate cursor-pointer transition-all"
          >
            🩺 dr. Budi (Poli Umum)
          </button>
          <button
            onClick={() => handleQuickLogin('perawat@klinik.com', 'PerawatPass123!')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-200 dark:hover:border-zinc-700 text-left truncate cursor-pointer transition-all"
          >
            👩‍⚕️ Ners Dian (Perawat)
          </button>
          <button
            onClick={() => handleQuickLogin('fo@klinik.com', 'StaffPass123!')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-200 dark:hover:border-zinc-700 text-left truncate cursor-pointer transition-all"
          >
            🖥 Front Office
          </button>
          <button
            onClick={() => handleQuickLogin('apoteker@klinik.com', 'ApotekerPass123!')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-200 dark:hover:border-zinc-700 text-left truncate cursor-pointer transition-all"
          >
            💊 Apoteker
          </button>
          <button
            onClick={() => handleQuickLogin('kasir@klinik.com', 'KasirPass123!')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-200 dark:hover:border-zinc-700 text-left truncate cursor-pointer transition-all"
          >
            💳 Kasir
          </button>
          <button
            onClick={() => handleQuickLogin('stok@klinik.com', 'StokPass123!')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-200 dark:hover:border-zinc-700 text-left truncate cursor-pointer transition-all col-span-2 text-center"
          >
            📦 Logistik Stok
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl z-10 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 shadow-3xl text-center py-12">
          <span className="text-sm text-slate-400 dark:text-zinc-500">Memuat Sesi...</span>
        </div>
      }>
        <LoginForm />
      </Suspense>

      <div className="mt-8 text-center text-xs text-slate-400 dark:text-zinc-600">
        <Link href="/" className="hover:text-slate-600 dark:hover:text-zinc-400 transition-colors">
          &larr; Kembali ke halaman utama
        </Link>
      </div>
    </div>
  )
}
