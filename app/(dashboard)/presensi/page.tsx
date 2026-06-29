'use client'

import { useState } from 'react'
import { Clock, Plus, Search, CheckCircle, Award, ShieldAlert, Calendar } from 'lucide-react'

interface Timesheet {
  id: string
  karyawanNama: string
  role: string
  shift: 'PAGI' | 'SIANG' | 'MALAM'
  jamMasuk: string
  jamKeluar?: string
  status: 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT'
  tanggal: string
}

export default function PresensiPage() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([
    { id: '1', karyawanNama: 'dr. Sarah Sp.A', role: 'DOKTER', shift: 'PAGI', jamMasuk: '07:45 WIB', jamKeluar: '14:00 WIB', status: 'HADIR', tanggal: '2026-06-29' },
    { id: '2', karyawanNama: 'Apoteker Rian', role: 'APOTEKER', shift: 'PAGI', jamMasuk: '08:15 WIB', status: 'TERLAMBAT', tanggal: '2026-06-29' },
    { id: '3', karyawanNama: 'Kasir Budi', role: 'KASIR', shift: 'SIANG', jamMasuk: '13:50 WIB', status: 'HADIR', tanggal: '2026-06-29' },
  ])

  const [clockedIn, setClockedIn] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleClockIn = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newEntry: Timesheet = {
      id: Date.now().toString(),
      karyawanNama: 'ADMIN UTAMA (ANDA)',
      role: 'ADMIN',
      shift: 'PAGI',
      jamMasuk: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      status: 'HADIR',
      tanggal: new Date().toISOString().split('T')[0]
    }

    setTimesheets([newEntry, ...timesheets])
    setClockedIn(true)
    setLoading(false)
  }

  const handleClockOut = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setTimesheets(timesheets.map(t => t.karyawanNama === 'ADMIN UTAMA (ANDA)' ? {
      ...t,
      jamKeluar: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    } : t))
    setClockedIn(false)
    setLoading(false)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white">Modul Presensi Karyawan</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Clock-in/out karyawan, monitoring keterlambatan shift, rekap absensi bulanan, dan integrasi jadwal kerja.</p>
        </div>
      </div>

      {/* Clocking controls card */}
      <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 max-w-md mx-auto text-center space-y-6">
        <div>
          <h3 className="text-lg font-bold font-display dark:text-white">🕒 Portal Presensi Anda</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Pastikan GPS & kamera aktif untuk presensi presisi.</p>
        </div>

        <div className="py-4">
          <span className="text-2xl font-mono font-bold block dark:text-white">Shift Pagi</span>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold block uppercase tracking-wider mt-1">Jadwal: 08:00 - 14:00 WIB</span>
        </div>

        <div className="flex justify-center gap-4">
          {!clockedIn ? (
            <button
              onClick={handleClockIn}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer active:scale-95 shadow-md shadow-emerald-600/10"
            >
              {loading ? 'Clocking In...' : 'Clock In / Hadir'}
            </button>
          ) : (
            <button
              onClick={handleClockOut}
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer active:scale-95 shadow-md shadow-red-600/10"
            >
              {loading ? 'Clocking Out...' : 'Clock Out / Pulang'}
            </button>
          )}
        </div>
      </div>

      {/* Attendance log lists */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display dark:text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-500" />
          <span>Riwayat Presensi Hari Ini</span>
        </h3>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950 text-slate-400 dark:text-zinc-500 border-b border-slate-200 dark:border-zinc-800">
                <th className="p-4 font-bold uppercase">Nama Karyawan</th>
                <th className="p-4 font-bold uppercase">Role</th>
                <th className="p-4 font-bold uppercase">Shift</th>
                <th className="p-4 font-bold uppercase">Jam Masuk</th>
                <th className="p-4 font-bold uppercase">Jam Keluar</th>
                <th className="p-4 font-bold uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {timesheets.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/20 transition-all">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{t.karyawanNama}</td>
                  <td className="p-4 text-slate-500 dark:text-zinc-500">{t.role}</td>
                  <td className="p-4 text-slate-500 dark:text-zinc-500">{t.shift}</td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-zinc-300 font-mono">{t.jamMasuk}</td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-zinc-300 font-mono">{t.jamKeluar || '-'}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      t.status === 'HADIR' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                      t.status === 'TERLAMBAT' ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' :
                      'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
