'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, Phone, Search, BellRing, Clipboard, AlertCircle } from 'lucide-react'

interface Patient {
  id: string
  noRekamMedis: string
  nik: string
  nama: string
  tanggalLahir: string
  jenisKelamin: string
  alamat: string
  telepon: string
  email?: string
}

interface ActiveQueue {
  id: string
  nomorAntrian: number
  status: string
  pendaftaran: {
    id: string
    status: string
    keluhan?: string
    pasien: { nama: string; noRekamMedis: string }
    poli: { nama: string }
    dokter: { nama: string }
  }
}

interface Schedule {
  id: string
  dokter: { id: string; nama: string }
  poli: { id: string; nama: string }
  hari: string
  jamMulai: string
  jamSelesai: string
}

export default function FrontOfficePage() {
  const [queues, setQueues] = useState<ActiveQueue[]>([])
  const [metrics, setMetrics] = useState({ total: 0, waiting: 0, calling: 0, completed: 0 })
  const [loading, setLoading] = useState(true)

  // Search/Register states
  const [searchQuery, setSearchQuery] = useState('')
  const [queueSearchQuery, setQueueSearchQuery] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedSchedule, setSelectedJadwal] = useState('')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [keluhan, setKeluhan] = useState('')

  // New Patient registration form
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [nik, setNik] = useState('')
  const [nama, setNama] = useState('')
  const [tanggalLahir, setTanggalLahir] = useState('')
  const [jenisKelamin, setJenisKelamin] = useState('LAKI_LAKI')
  const [telepon, setTelepon] = useState('')
  const [alamat, setAlamat] = useState('')
  const [email, setEmail] = useState('')

  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load queues, patients search, schedules
  const loadQueues = async () => {
    try {
      const res = await fetch('/api/v1/antrian')
      const data = await res.json()
      if (data.success) {
        setQueues(data.data)
        setMetrics(data.metrics)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadSchedules = async () => {
    try {
      const res = await fetch('/api/v1/jadwal')
      const data = await res.json()
      if (data.success) {
        setSchedules(data.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadQueues()
    loadSchedules()
  }, [])

  // Handle patient lookup
  const handleSearchPatient = async () => {
    if (!searchQuery) return
    try {
      const res = await fetch(`/api/v1/pasien?q=${searchQuery}`)
      const data = await res.json()
      if (data.success) {
        setPatients(data.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Handle new patient registration
  const handleAddPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError('')
    setActionSuccess('')
    setIsSubmitting(true)

    const payload = { nik, nama, tanggalLahir, jenisKelamin, alamat, telepon, email }
    try {
      const res = await fetch('/api/v1/pasien', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error || 'Gagal menyimpan data pasien.')
      } else {
        setActionSuccess(`Pasien ${data.data.nama} (${data.data.noRekamMedis}) berhasil ditambahkan.`)
        setSelectedPatient(data.data)
        // Reset patient form
        setNik('')
        setNama('')
        setTanggalLahir('')
        setTelepon('')
        setAlamat('')
        setEmail('')
        setShowAddPatient(false)
      }
    } catch (err) {
      setActionError('Kesalahan jaringan saat mendaftarkan pasien.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle check-in walk-in pendaftaran
  const handleRegisterWalkIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient || !selectedSchedule) {
      setActionError('Pilih pasien dan jadwal dokter.')
      return
    }

    setActionError('')
    setActionSuccess('')
    setIsSubmitting(true)

    const schedule = schedules.find(s => s.id === selectedSchedule)

    const payload = {
      pasienId: selectedPatient.id,
      poliId: schedule?.poli.id,
      dokterId: schedule?.dokter.id,
      jadwalId: selectedSchedule,
      tanggal: visitDate,
      sumber: 'OFFLINE',
      keluhan
    }

    try {
      const res = await fetch('/api/v1/pendaftaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error || 'Gagal mendaftarkan kunjungan.')
      } else {
        setActionSuccess(`Pendaftaran walk-in berhasil! No. Antrian: #${data.data.antrian.nomorAntrian}`)
        setSelectedPatient(null)
        setSelectedJadwal('')
        setKeluhan('')
        setSearchQuery('')
        setPatients([])
        loadQueues()
      }
    } catch (err) {
      setActionError('Kesalahan jaringan saat memproses pendaftaran.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle calling a patient (Update queue status to DIPANGGIL / DIPERIKSA)
  const handleCallPatient = async (pendaftaranId: string, currentStatus: string) => {
    setActionError('')
    setActionSuccess('')
    const targetStatus = currentStatus === 'MENUNGGU' ? 'DIPERIKSA' : 'SELESAI'
    try {
      const res = await fetch('/api/v1/pendaftaran', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pendaftaranId, status: targetStatus })
      })
      if (res.ok) {
        setActionSuccess(`Status antrian diperbarui menjadi ${targetStatus === 'DIPERIKSA' ? 'PANGGIL' : 'SELESAI'}.`)
        loadQueues()
      } else {
        const data = await res.json()
        setActionError(data.error || 'Gagal memperbarui status antrian.')
      }
    } catch (err) {
      setActionError('Kesalahan koneksi saat memperbarui status.')
    }
  }

  // Handle recalling a patient to Poli or Front Office
  const handleRecallPatient = async (pendaftaranId: string) => {
    setActionError('')
    setActionSuccess('')
    try {
      const res = await fetch('/api/v1/pendaftaran', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pendaftaranId, status: 'DIPERIKSA' })
      })
      if (res.ok) {
        setActionSuccess('Antrian berhasil dipanggil ulang.')
        loadQueues()
      } else {
        const data = await res.json()
        setActionError(data.error || 'Gagal memanggil ulang antrian.')
      }
    } catch (err) {
      setActionError('Kesalahan koneksi saat memanggil ulang.')
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Title */}
      <div>
        <h2 className="text-3xl font-bold font-display text-white">Front Office Dashboard</h2>
        <p className="text-zinc-400 text-sm mt-1">Kelola kedatangan pasien offline, monitor antrian hari ini, dan panggil pasien.</p>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl bg-zinc-900/20 border border-zinc-800">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Total Antrian Hari Ini</span>
          <span className="text-3xl font-bold font-display text-white mt-1 block">{metrics.total} Pasien</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl bg-zinc-900/20 border border-zinc-800">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Menunggu Pemeriksaan</span>
          <span className="text-3xl font-bold font-display text-indigo-400 mt-1 block">{metrics.waiting} Pasien</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl bg-zinc-900/20 border border-zinc-800">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Sedang Diperiksa</span>
          <span className="text-3xl font-bold font-display text-cyan-400 mt-1 block">{metrics.calling} Pasien</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl bg-zinc-900/20 border border-zinc-800">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Selesai Pelayanan</span>
          <span className="text-3xl font-bold font-display text-emerald-400 mt-1 block">{metrics.completed} Pasien</span>
        </div>
      </div>

      {/* Action status feedbacks */}
      {actionError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-4 rounded-xl flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Today's Queues List (8 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-bold font-display text-white">📋 Monitor Antrian Aktif</h3>

          {/* Search Input Filter for Queue */}
          <div className="relative">
            <input
              type="text"
              value={queueSearchQuery}
              onChange={(e) => setQueueSearchQuery(e.target.value)}
              placeholder="Cari Nama atau No. RM Pasien di Antrian..."
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 pl-9 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Search className="h-3.5 w-3.5" />
            </div>
          </div>

          {loading ? (
            <div className="text-zinc-500 text-sm py-12 text-center">Memuat antrian klinik...</div>
          ) : (() => {
            const filtered = queues.filter(q => {
              const query = queueSearchQuery.toLowerCase()
              return (
                q.pendaftaran.pasien.nama.toLowerCase().includes(query) ||
                q.pendaftaran.pasien.noRekamMedis.toLowerCase().includes(query)
              )
            })

            if (filtered.length === 0) {
              return (
                <div className="glass-panel p-8 text-center rounded-2xl text-zinc-500 text-sm">
                  Tidak ada antrian yang cocok dengan pencarian.
                </div>
              )
            }

            return (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filtered.map((q) => (
                <div
                  key={q.id}
                  className={`glass-panel p-5 rounded-2xl border transition-all flex items-center justify-between ${
                    q.status === 'DIPANGGIL'
                      ? 'border-cyan-500/30 bg-cyan-900/5'
                      : q.status === 'SELESAI'
                      ? 'border-zinc-800 bg-zinc-950 opacity-60'
                      : 'border-zinc-800 bg-zinc-900/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Big Queue Number */}
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-display font-black text-lg ${
                      q.status === 'DIPANGGIL'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : q.status === 'SELESAI'
                        ? 'bg-zinc-800 text-zinc-500'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      #{q.nomorAntrian}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{q.pendaftaran.pasien.nama}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">({q.pendaftaran.pasien.noRekamMedis})</span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {q.pendaftaran.poli.nama} &bull; {q.pendaftaran.dokter.nama}
                      </div>
                      {q.pendaftaran.keluhan && (
                        <p className="text-[10px] text-zinc-500 truncate max-w-sm mt-1 italic">
                          &quot;{q.pendaftaran.keluhan}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2">
                    {q.status === 'MENUNGGU' && (
                      <button
                        onClick={() => handleCallPatient(q.pendaftaran.id, 'MENUNGGU')}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl active:scale-95 transition-all cursor-pointer"
                      >
                        <BellRing className="h-3.5 w-3.5" />
                        <span>Panggil</span>
                      </button>
                    )}
                    {q.status === 'DIPANGGIL' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCallPatient(q.pendaftaran.id, 'DIPANGGIL')}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl active:scale-95 transition-all cursor-pointer shrink-0"
                        >
                          <span>Selesaikan</span>
                        </button>
                        <button
                          onClick={() => handleRecallPatient(q.pendaftaran.id)}
                          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-semibold text-xs px-3 py-2 rounded-xl active:scale-95 transition-all cursor-pointer shrink-0"
                        >
                          <BellRing className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Panggil Ulang</span>
                        </button>
                      </div>
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                      q.status === 'DIPANGGIL'
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : q.status === 'SELESAI'
                        ? 'bg-zinc-800 text-zinc-500'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {q.status === 'DIPANGGIL' ? 'Dipanggil' : q.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
        </div>

        {/* Right Side: Register Walk-In visits (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-bold font-display text-white">➕ Pendaftaran Walk-In</h3>

          {!showAddPatient ? (
            /* Search Patient UI */
            <div className="glass-panel p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Cari Nama / No. RM Pasien</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Masukkan nama atau no rekam medis"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchPatient}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 rounded-2xl cursor-pointer active:scale-95 transition-all"
                  >
                    Cari
                  </button>
                </div>
              </div>

              {/* Searched Results */}
              {patients.length > 0 && (
                <div className="bg-zinc-950/60 rounded-2xl border border-zinc-850 p-2 max-h-40 overflow-y-auto divide-y divide-zinc-850">
                  {patients.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setSelectedPatient(p); setPatients([]); setSearchQuery('') }}
                      className="w-full text-left p-3 text-xs flex justify-between items-center hover:bg-zinc-900 rounded-xl transition-all"
                    >
                      <div>
                        <span className="font-bold text-white block">{p.nama}</span>
                        <span className="text-[10px] text-zinc-500">Telepon: {p.telepon}</span>
                      </div>
                      <span className="font-mono text-[10px] bg-zinc-800 text-indigo-300 px-2 py-1 rounded">
                        {p.noRekamMedis}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Register a New Patient Toggle */}
              <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-zinc-500">Pasien baru belum terdaftar?</span>
                <button
                  type="button"
                  onClick={() => setShowAddPatient(true)}
                  className="flex items-center gap-1 text-indigo-400 font-semibold hover:text-indigo-300 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Daftarkan Baru</span>
                </button>
              </div>

              {/* Visit booking parameters if patient is selected */}
              {selectedPatient && (
                <form onSubmit={handleRegisterWalkIn} className="space-y-4 border-t border-zinc-850 pt-5 mt-4">
                  <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Pasien Terpilih</span>
                      <span className="text-sm font-bold text-white">{selectedPatient.nama}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPatient(null)}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold"
                    >
                      Batal
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Pilih Dokter & Poli Sesi</label>
                    <select
                      required
                      value={selectedSchedule}
                      onChange={(e) => setSelectedJadwal(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 px-4 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="">-- Pilih Dokter --</option>
                      {schedules.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.poli.nama} - {s.dokter.nama} ({s.hari}, {s.jamMulai} - {s.jamSelesai})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tanggal Kunjungan</label>
                      <input
                        type="date"
                        required
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 px-4 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Keluhan Utama</label>
                      <input
                        type="text"
                        value={keluhan}
                        onChange={(e) => setKeluhan(e.target.value)}
                        placeholder="E.g. pusing"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 px-4 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-semibold py-3.5 rounded-2xl text-xs active:scale-95 transition-all cursor-pointer"
                  >
                    {isSubmitting ? 'Memproses...' : 'Daftarkan & Cetak Antrian'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Register Patient Form UI */
            <form onSubmit={handleAddPatientSubmit} className="glass-panel p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                <span className="text-sm font-bold text-white">Identitas Pasien Baru</span>
                <button
                  type="button"
                  onClick={() => setShowAddPatient(false)}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  Batal
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">NIK (16 Digit)</label>
                <input
                  type="text"
                  required
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  maxLength={16}
                  placeholder="NIK KTP"
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Nama Lengkap Pasien</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama sesuai KTP"
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    required
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Gender</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  >
                    <option value="LAKI_LAKI">Laki-Laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Nomor Telepon (WhatsApp)</label>
                <input
                  type="text"
                  required
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value.replace(/\D/g, ''))}
                  placeholder="E.g. 0812..."
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Alamat Lengkap</label>
                <textarea
                  required
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Alamat domisili"
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">Email (Opsional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E.g. pasien@email.com"
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
              >
                {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Pasien Baru'}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  )
}

// Inline Icon Helper since lucide-react CheckCircle might cause bundle resolve issues
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
