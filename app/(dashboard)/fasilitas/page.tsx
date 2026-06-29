'use client'

import { useState, useEffect } from 'react'
import { Activity, Clipboard, CheckCircle, AlertCircle, RefreshCw, Building, PenTool, CheckSquare } from 'lucide-react'

interface Room {
  id: string
  namaRuangan: string
  status: string
  logKerusakan?: string
}

export default function FasilitasPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  // Status update states
  const [status, setStatus] = useState('TERSEDIA')
  const [logKerusakan, setLogKerusakan] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadRooms = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/fasilitas')
      const data = await res.json()
      if (data.success) {
        setRooms(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])

  // Auto-fill forms when room is selected
  useEffect(() => {
    if (selectedRoom) {
      setStatus(selectedRoom.status)
      setLogKerusakan(selectedRoom.logKerusakan || '')
    } else {
      setStatus('TERSEDIA')
      setLogKerusakan('')
    }
  }, [selectedRoom])

  // Submit status update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoom) return

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    const payload = {
      id: selectedRoom.id,
      status,
      logKerusakan
    }

    try {
      const res = await fetch('/api/v1/fasilitas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal mengubah status fasilitas.')
      } else {
        setSuccess(`Status ruangan ${selectedRoom.namaRuangan} berhasil diperbarui menjadi ${status}.`)
        setSelectedRoom(null)
        loadRooms()
      }
    } catch (err) {
      setError('Kesalahan jaringan saat memperbarui status fasilitas.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Title */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Manajemen Fasilitas & Ruangan</h2>
          <p className="text-zinc-400 text-sm mt-1">Pantau hunian dan status kebersihan ruangan poli, ruang apotek, kasir, serta catat laporan perbaikan aset klinik.</p>
        </div>
        <button
          onClick={loadRooms}
          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-3 py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Action feedbacks */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-4 rounded-xl flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Grid split */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Room Grid (8 columns) */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-lg font-bold font-display text-white">🏢 Denah Lokasi & Status Ruangan</h3>

          {loading ? (
            <div className="text-zinc-500 text-sm py-12 text-center">Memuat denah fasilitas...</div>
          ) : rooms.length === 0 ? (
            <div className="text-zinc-500 text-center py-12">Tidak ada data ruangan terdaftar.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {rooms.map((room) => {
                const colorMap: { [key: string]: string } = {
                  'TERSEDIA': 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
                  'DIGUNAKAN': 'border-sky-500/30 bg-sky-500/5 text-sky-400',
                  'PEMELIHARAAN': 'border-red-500/30 bg-red-500/5 text-red-400'
                }
                const activeColor = colorMap[room.status] || 'border-zinc-800 text-zinc-400'
                return (
                  <div
                    key={room.id}
                    className={`glass-panel p-6 rounded-3xl border flex flex-col justify-between h-44 transition-all hover:scale-[1.01] hover:shadow-lg`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white text-base leading-tight">{room.namaRuangan}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${activeColor}`}>
                          {room.status.toLowerCase()}
                        </span>
                      </div>
                      
                      {room.logKerusakan && (
                        <p className="text-[10px] text-zinc-500 italic mt-3 line-clamp-2">
                          Damage Log: &quot;{room.logKerusakan}&quot;
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center border-t border-zinc-800/80 pt-3 text-xs">
                      <span className="text-[10px] text-zinc-600">ID: {room.id.substring(0, 8)}</span>
                      <button
                        onClick={() => setSelectedRoom(room)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                      >
                        Ubah Status &rarr;
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Update forms (4 columns) */}
        <div className="lg:col-span-4">
          {selectedRoom ? (
            <form onSubmit={handleSubmit} className="glass-panel p-5 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-4 animate-fade-in">
              <div className="pb-2 border-b border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-bold text-white">⚙️ Set Ruangan</span>
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  Batal
                </button>
              </div>

              <div className="bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 text-xs">
                <span className="text-zinc-500 block">Nama Ruangan</span>
                <span className="font-bold text-white block mt-0.5">{selectedRoom.namaRuangan}</span>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Status Kamar</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                >
                  <option value="TERSEDIA">🟢 TERSEDIA (Kosong/Bersih)</option>
                  <option value="DIGUNAKAN">🔵 DIGUNAKAN (Aktif Layanan)</option>
                  <option value="PEMELIHARAAN">🔴 PEMELIHARAAN (Rusak/Sterilisasi)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Log Kerusakan / Pemeliharaan (Opsional)</label>
                <textarea
                  value={logKerusakan}
                  onChange={(e) => setLogKerusakan(e.target.value)}
                  placeholder="E.g. lampu redup, AC bocor, dental unit air mampet..."
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-semibold py-3 rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
              >
                <CheckSquare className="h-4 w-4" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>

            </form>
          ) : (
            <div className="glass-panel p-5 rounded-3xl bg-zinc-900/10 border border-zinc-800 text-zinc-500 text-xs space-y-4">
              <h5 className="font-bold text-white flex items-center gap-1.5">
                <Building className="h-4 w-4 text-indigo-400" />
                <span>Petunjuk Fasilitas</span>
              </h5>
              <p className="leading-relaxed">
                Pilih salah satu ruangan pada grid di sebelah kiri dan klik <strong>Ubah Status</strong> untuk memperbarui hunian ruangan atau melaporkan insiden kerusakan alat/ruangan pada logistik pemeliharaan.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  )
}
