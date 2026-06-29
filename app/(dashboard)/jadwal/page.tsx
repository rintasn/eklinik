'use client'

import { useState, useEffect } from 'react'
import { Activity, Clipboard, RefreshCw, Calendar, Clock, User } from 'lucide-react'

interface Schedule {
  id: string
  dokter: { nama: string; spesialisasi: string }
  poli: { nama: string }
  hari: string
  jamMulai: string
  jamSelesai: string
  kuota: number
  aktif: boolean
}

const HARI_ORDER = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU']

export default function JadwalKerjaPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

  const loadSchedules = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/jadwal')
      const data = await res.json()
      if (data.success) {
        setSchedules(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedules()
  }, [])

  // Group schedules by weekday
  const groupedSchedules = HARI_ORDER.reduce((acc: { [key: string]: Schedule[] }, hari) => {
    acc[hari] = schedules.filter(s => s.hari === hari)
    return acc
  }, {})

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Jadwal Sesi Tenaga Medis</h2>
          <p className="text-zinc-400 text-sm mt-1">Lihat dan audit jadwal konsultasi dokter spesialis mingguan serta alokasi shift pelayanan klinik.</p>
        </div>
        <button
          onClick={loadSchedules}
          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-3 py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="text-zinc-500 text-sm py-12 text-center">Memuat jadwal kerja...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {HARI_ORDER.map((hari) => {
            const daySchedules = groupedSchedules[hari] || []
            return (
              <div key={hari} className="glass-panel p-5 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-800/80">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  <h3 className="font-display font-black text-sm text-white tracking-wider">{hari}</h3>
                </div>

                {daySchedules.length === 0 ? (
                  <p className="text-[10px] text-zinc-600 italic py-4 text-center">Tidak ada jadwal dokter hari ini.</p>
                ) : (
                  <div className="space-y-3.5">
                    {daySchedules.map((s) => (
                      <div key={s.id} className="p-3 bg-zinc-950/50 border border-zinc-850 rounded-2xl text-xs space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-zinc-500" />
                          <span className="font-bold text-white block truncate leading-tight">{s.dokter.nama}</span>
                        </div>
                        
                        <div className="text-[10px] text-zinc-400 pl-5">
                          {s.poli.nama} &bull; {s.dokter.spesialisasi}
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-indigo-400 pl-5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{s.jamMulai} - {s.jamSelesai} WIB</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-[9px] text-zinc-500 border-t border-zinc-850 pt-2 pl-5">
                          <span>Sesi Kuota</span>
                          <span className="font-bold text-zinc-300 font-mono">{s.kuota} Pasien</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
