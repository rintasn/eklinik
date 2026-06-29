'use client'

import { useState } from 'react'
import { BookOpen, Calendar, Search, Filter, Plus, CheckCircle, Clock, XCircle, MoreVertical } from 'lucide-react'

interface Reservation {
  id: string
  pasienNama: string
  telepon: string
  poliNama: string
  dokterNama: string
  tanggal: string
  jam: string
  status: 'TERJADWAL' | 'SELESAI' | 'BATAL'
  sumber: 'ONLINE' | 'OFFLINE'
}

export default function ReservasiPage() {
  const [reservations, setReservations] = useState<Reservation[]>([
    { id: '1', pasienNama: 'Ahmad Syarif', telepon: '081234567890', poliNama: 'Poli Umum', dokterNama: 'dr. Rian Hidayat', tanggal: '2026-06-30', jam: '09:00', status: 'TERJADWAL', sumber: 'ONLINE' },
    { id: '2', pasienNama: 'Budi Santoso', telepon: '081234567891', poliNama: 'Poli Gigi', dokterNama: 'drg. Amelia Putri', tanggal: '2026-06-30', jam: '10:30', status: 'TERJADWAL', sumber: 'OFFLINE' },
    { id: '3', pasienNama: 'Siti Rahma', telepon: '081234567892', poliNama: 'Poli Anak', dokterNama: 'dr. Sarah Sp.A', tanggal: '2026-06-29', jam: '08:00', status: 'SELESAI', sumber: 'ONLINE' },
    { id: '4', pasienNama: 'Dewi Lestari', telepon: '081234567893', poliNama: 'Poli Kandungan', dokterNama: 'dr. Hendra Sp.OG', tanggal: '2026-06-29', jam: '13:00', status: 'BATAL', sumber: 'ONLINE' },
  ])

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA')

  // Form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [nama, setNama] = useState('')
  const [telp, setTelp] = useState('')
  const [poli, setPoli] = useState('Poli Umum')
  const [dokter, setDokter] = useState('dr. Rian Hidayat')
  const [tgl, setTgl] = useState('')
  const [jam, setJam] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama || !tgl || !jam) return

    const newRes: Reservation = {
      id: Date.now().toString(),
      pasienNama: nama,
      telepon: telp,
      poliNama: poli,
      dokterNama: dokter,
      tanggal: tgl,
      jam: jam,
      status: 'TERJADWAL',
      sumber: 'OFFLINE',
    }

    setReservations([newRes, ...reservations])
    setShowAddForm(false)
    setNama('')
    setTelp('')
    setTgl('')
    setJam('')
  }

  const handleStatusChange = (id: string, newStatus: 'TERJADWAL' | 'SELESAI' | 'BATAL') => {
    setReservations(reservations.map(r => r.id === id ? { ...r, status: newStatus } : r))
  }

  const filtered = reservations.filter(r => {
    const matchSearch = r.pasienNama.toLowerCase().includes(search.toLowerCase()) || r.telepon.includes(search)
    const matchStatus = filterStatus === 'SEMUA' || r.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white">Modul Reservasi</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Kelola reservasi jadwal pasien baik pendaftaran online maupun walk-in.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Reservasi Baru</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 max-w-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-zinc-800">
            <span className="font-bold text-sm dark:text-white">Pendaftaran Reservasi Baru</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white">Batal</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nama Pasien</label>
              <input type="text" required value={nama} onChange={e => setNama(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nomor Telepon</label>
              <input type="text" required value={telp} onChange={e => setTelp(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Poliklinik</label>
              <select value={poli} onChange={e => setPoli(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="Poli Umum">Poli Umum</option>
                <option value="Poli Gigi">Poli Gigi</option>
                <option value="Poli Anak">Poli Anak</option>
                <option value="Poli Kandungan">Poli Kandungan</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Dokter Sesi</label>
              <select value={dokter} onChange={e => setDokter(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="dr. Rian Hidayat">dr. Rian Hidayat</option>
                <option value="drg. Amelia Putri">drg. Amelia Putri</option>
                <option value="dr. Sarah Sp.A">dr. Sarah Sp.A</option>
                <option value="dr. Hendra Sp.OG">dr. Hendra Sp.OG</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Tanggal Kunjungan</label>
              <input type="date" required value={tgl} onChange={e => setTgl(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Jam Sesi</label>
              <input type="time" required value={jam} onChange={e => setJam(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all">Submit Reservasi</button>
        </form>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari Nama Pasien atau Telepon..."
            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-2.5 px-3 pl-10 text-xs focus:outline-none focus:border-indigo-500 transition-all"
          />
          <Search className="h-4 w-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-3.5" />
        </div>
        <div className="flex gap-2">
          {['SEMUA', 'TERJADWAL', 'SELESAI', 'BATAL'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={[
                'text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all cursor-pointer',
                filterStatus === st
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              ].join(' ')}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Reservations */}
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map(res => (
          <div key={res.id} className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                  res.status === 'TERJADWAL' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50' :
                  res.status === 'SELESAI' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50' :
                  'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50'
                }`}>
                  {res.status}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-2 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                  {res.sumber}
                </span>
              </div>
              
              <div className="flex gap-1.5">
                {res.status === 'TERJADWAL' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(res.id, 'SELESAI')}
                      title="Selesaikan"
                      className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(res.id, 'BATAL')}
                      title="Batalkan"
                      className="p-1 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-base dark:text-white">{res.pasienNama}</h4>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-mono mt-0.5">{res.telepon}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-zinc-800/80 text-xs">
              <div>
                <span className="text-slate-400 block">Klinik & Dokter</span>
                <span className="font-semibold dark:text-zinc-300">{res.poliNama} &bull; {res.dokterNama}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Jadwal Sesi</span>
                <span className="font-semibold flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {res.tanggal} ({res.jam})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
