'use client'

import { useState, useEffect } from 'react'
import { Activity, Clipboard, CheckCircle, AlertCircle, RefreshCw, Play, Pause, CheckSquare, Sparkles, BellRing, Hourglass, Search } from 'lucide-react'

interface ResepItem {
  id: string
  obatId: string
  jumlah: number
  aturan: string
  catatan?: string
  obat: { nama: string; kode: string; stok: number; satuan: string }
}

interface Resep {
  id: string
  status: string
  dipanggil?: string
  createdAt: string
  rekamMedis: {
    pendaftaranId: string
    pasien: { nama: string; noRekamMedis: string; nik?: string; telepon?: string }
    dokter: { nama: string }
    pendaftaran: { poli: { nama: string } }
  }
  items: ResepItem[]
}

export default function ApotekPage() {
  const [prescriptions, setPrescriptions] = useState<Resep[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedResep, setSelectedResep] = useState<Resep | null>(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load all prescriptions
  const loadPrescriptions = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/resep')
      const data = await res.json()
      if (data.success) {
        setPrescriptions(data.data)
        // Keep selected resep reference updated with fresh data
        if (selectedResep) {
          const updated = data.data.find((r: Resep) => r.id === selectedResep.id)
          if (updated) {
            setSelectedResep(updated)
          }
        }
      }
    } catch (err) {
      console.error(err)
      setError('Gagal memuat daftar resep.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrescriptions()
  }, [])

  // Update status (e.g. to DIPROSES, PENDING)
  const handleUpdateStatus = async (resepId: string, newStatus: string) => {
    setError('')
    setSuccess('')
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/v1/resep', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resepId, status: newStatus })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal mengubah status resep.')
      } else {
        setSuccess(`Status resep berhasil diperbarui menjadi ${newStatus}.`)
        loadPrescriptions()
      }
    } catch (err) {
      setError('Kesalahan jaringan saat memperbarui status resep.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Finalize / Dispense & Complete prescription
  const handleDispense = async () => {
    if (!selectedResep) return

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    // Pre-check stocks on client-side
    for (const item of selectedResep.items) {
      if (item.obat.stok < item.jumlah) {
        setError(`Stok obat ${item.obat.nama} kurang! Tersedia: ${item.obat.stok}, dibutuhkan: ${item.jumlah}.`)
        setIsSubmitting(false)
        return
      }
    }

    try {
      const res = await fetch('/api/v1/resep', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resepId: selectedResep.id, status: 'SELESAI' })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal menyelesaikan resep.')
      } else {
        setSuccess(`Resep untuk ${selectedResep.rekamMedis.pasien.nama} berhasil diselesaikan, stok dipotong, dan siap diambil.`)
        loadPrescriptions()
      }
    } catch (err) {
      setError('Kesalahan jaringan saat menyelesaikan resep.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Trigger loudspeaker call / recall
  const handleCallPatient = async (resepId: string) => {
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/v1/resep', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resepId, call: true })
      })
      if (res.ok) {
        setSuccess('Panggilan penyerahan obat dikirim ke monitor lobi.')
        loadPrescriptions()
      } else {
        const data = await res.json()
        setError(data.error || 'Gagal memanggil pasien.')
      }
    } catch (err) {
      setError('Kesalahan jaringan saat memanggil pasien.')
    }
  }

  // Filter lists by status and search query
  const filteredPrescriptions = prescriptions.filter(r => {
    const query = searchQuery.toLowerCase()
    return (
      r.rekamMedis.pasien.nama.toLowerCase().includes(query) ||
      r.rekamMedis.pasien.noRekamMedis.toLowerCase().includes(query) ||
      (r.rekamMedis.pasien.nik && r.rekamMedis.pasien.nik.toLowerCase().includes(query)) ||
      (r.rekamMedis.pasien.telepon && r.rekamMedis.pasien.telepon.toLowerCase().includes(query))
    )
  })

  const listMenunggu = filteredPrescriptions.filter(r => r.status === 'MENUNGGU')
  const listDiproses = filteredPrescriptions.filter(r => r.status === 'DIPROSES')
  const listPending = filteredPrescriptions.filter(r => r.status === 'PENDING')
  const listSelesai = filteredPrescriptions.filter(r => r.status === 'SELESAI')

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'MENUNGGU': return 'Belum Diproses'
      case 'DIPROSES': return 'Sedang Diracik'
      case 'PENDING': return 'Tertunda (Pending)'
      case 'SELESAI': return 'Selesai / Dapat Diambil'
      default: return status
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Layanan Farmasi & Apotik</h2>
          <p className="text-zinc-400 text-sm mt-1">Kelola peracikan resep obat dari ruang periksa dokter, pantau antrian obat, dan lakukan panggilan suara lobi.</p>
        </div>
        <button
          onClick={loadPrescriptions}
          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-3 py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Action Feedbacks */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-4 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Workspace */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Grouped Prescriptions lists (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Search Input Filter */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama, No. RM, NIK, atau Telp..."
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 pl-9 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Search className="h-3.5 w-3.5" />
            </div>
          </div>
          
          {/* SECTION 1: BELUM DIPROSES */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span>Belum Diproses ({listMenunggu.length})</span>
            </h4>
            {listMenunggu.length === 0 ? (
              <div className="text-xs text-zinc-600 border border-dashed border-zinc-850 p-4 rounded-xl italic">Tidak ada resep baru.</div>
            ) : (
              <div className="space-y-2">
                {listMenunggu.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResep(r)}
                    className={`w-full p-3.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                      selectedResep?.id === r.id ? 'bg-indigo-500/5 border-indigo-500' : 'bg-zinc-900/10 border-zinc-850 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-white block">{r.rekamMedis.pasien.nama}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{r.rekamMedis.pasien.noRekamMedis} &bull; {r.rekamMedis.pendaftaran.poli.nama}</span>
                    </div>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider shrink-0">Baru</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: SEDANG DIRACIK */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              <span>Sedang Diracik ({listDiproses.length})</span>
            </h4>
            {listDiproses.length === 0 ? (
              <div className="text-xs text-zinc-600 border border-dashed border-zinc-850 p-4 rounded-xl italic">Tidak ada resep diracik.</div>
            ) : (
              <div className="space-y-2">
                {listDiproses.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResep(r)}
                    className={`w-full p-3.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                      selectedResep?.id === r.id ? 'bg-indigo-500/5 border-indigo-500' : 'bg-zinc-900/10 border-zinc-850 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-white block">{r.rekamMedis.pasien.nama}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{r.rekamMedis.pasien.noRekamMedis} &bull; {r.rekamMedis.pendaftaran.poli.nama}</span>
                    </div>
                    <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider shrink-0">Proses</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: PENDING */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Tertunda / Masalah ({listPending.length})</span>
            </h4>
            {listPending.length === 0 ? (
              <div className="text-xs text-zinc-600 border border-dashed border-zinc-850 p-4 rounded-xl italic">Tidak ada resep tertunda.</div>
            ) : (
              <div className="space-y-2">
                {listPending.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResep(r)}
                    className={`w-full p-3.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                      selectedResep?.id === r.id ? 'bg-indigo-500/5 border-indigo-500' : 'bg-zinc-900/10 border-zinc-850 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-white block">{r.rekamMedis.pasien.nama}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{r.rekamMedis.pasien.noRekamMedis} &bull; {r.rekamMedis.pendaftaran.poli.nama}</span>
                    </div>
                    <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider shrink-0">Pending</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 4: SELESAI */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Selesai & Siap Diambil ({listSelesai.length})</span>
            </h4>
            {listSelesai.length === 0 ? (
              <div className="text-xs text-zinc-600 border border-dashed border-zinc-850 p-4 rounded-xl italic">Belum ada resep selesai.</div>
            ) : (
              <div className="space-y-2">
                {listSelesai.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResep(r)}
                    className={`w-full p-3.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                      selectedResep?.id === r.id ? 'bg-indigo-500/5 border-indigo-500' : 'bg-zinc-900/10 border-zinc-850 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-white block">{r.rekamMedis.pasien.nama}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{r.rekamMedis.pasien.noRekamMedis}</span>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider shrink-0">Selesai</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Prescription review & actions (7 columns) */}
        <div className="lg:col-span-7">
          {selectedResep ? (
            <div className="glass-panel p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-6 animate-fade-in">
              
              {/* Prescription Header */}
              <div className="pb-4 border-b border-zinc-800 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {getStatusLabel(selectedResep.status)}
                    </span>
                    {selectedResep.dipanggil && (
                      <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                        <Activity className="h-3 w-3 animate-ping" />
                        <span>Pernah Dipanggil</span>
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-bold text-lg text-white mt-2">{selectedResep.rekamMedis.pasien.nama} ({selectedResep.rekamMedis.pasien.noRekamMedis})</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Poli: {selectedResep.rekamMedis.pendaftaran.poli.nama} &bull; Dokter: {selectedResep.rekamMedis.dokter.nama}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedResep(null)}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  Tutup
                </button>
              </div>

              {/* Items List Table */}
              <div className="space-y-4">
                <h5 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>Daftar Dispensing Obat</span>
                </h5>

                <div className="bg-zinc-950/60 rounded-2xl border border-zinc-850 overflow-hidden text-xs">
                  <table className="w-full text-left divide-y divide-zinc-850">
                    <thead className="bg-zinc-900 text-zinc-400">
                      <tr>
                        <th className="p-3 font-semibold">Nama & Kode Obat</th>
                        <th className="p-3 font-semibold text-center">Stok Klinik</th>
                        <th className="p-3 font-semibold text-center">Dibutuhkan</th>
                        <th className="p-3 font-semibold">Aturan Pakai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {selectedResep.items.map((item) => {
                        const isShort = item.obat.stok < item.jumlah
                        return (
                          <tr key={item.id} className={`hover:bg-zinc-900/40 ${isShort ? 'bg-red-500/5' : ''}`}>
                            <td className="p-3 font-semibold text-white">
                              <span>{item.obat.nama}</span>
                              <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">{item.obat.kode}</span>
                            </td>
                            <td className={`p-3 text-center font-mono font-bold ${isShort ? 'text-red-400' : 'text-zinc-300'}`}>
                              {item.obat.stok} {item.obat.satuan}
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-indigo-400">
                              {item.jumlah} {item.obat.satuan}
                            </td>
                            <td className="p-3 text-zinc-300">
                              <span>{item.aturan}</span>
                              {item.catatan && (
                                <span className="block text-[10px] text-zinc-500 italic mt-0.5">Note: &quot;{item.catatan}&quot;</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action buttons based on status */}
              <div className="border-t border-zinc-850 pt-5 space-y-3">
                
                {/* Voice Page Button (Available at any state to call/recall patient) */}
                <button
                  type="button"
                  onClick={() => handleCallPatient(selectedResep.id)}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-2xl text-xs active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  <BellRing className="h-4 w-4" />
                  <span>Panggil Pasien ke Apotik (Suara Speaker)</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Status update buttons */}
                  {selectedResep.status === 'MENUNGGU' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedResep.id, 'DIPROSES')}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 rounded-xl text-xs transition-all cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Mulai Diracik</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedResep.id, 'PENDING')}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl text-xs transition-all cursor-pointer"
                      >
                        <Hourglass className="h-3.5 w-3.5" />
                        <span>Tunda / Masalah</span>
                      </button>
                    </>
                  )}

                  {(selectedResep.status === 'DIPROSES' || selectedResep.status === 'PENDING') && (
                    <>
                      <button
                        type="button"
                        onClick={handleDispense}
                        disabled={isSubmitting}
                        className="col-span-2 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-semibold py-4 rounded-xl text-xs active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <CheckSquare className="h-4 w-4" />
                        <span>Dispense & Nyatakan Selesai (Dapat Diambil)</span>
                      </button>

                      {selectedResep.status !== 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(selectedResep.id, 'PENDING')}
                          disabled={isSubmitting}
                          className="col-span-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl text-xs transition-all cursor-pointer"
                        >
                          Tandai sebagai Pending / Ditangguhkan
                        </button>
                      )}
                    </>
                  )}

                  {selectedResep.status === 'SELESAI' && (
                    <div className="col-span-2 text-center text-xs text-zinc-500 py-3 bg-zinc-950/40 rounded-xl border border-zinc-850">
                      Resep ini sudah selesai diracik, diserahkan, dan stok obat sudah dikurangi.
                    </div>
                  )}

                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 text-center rounded-3xl bg-zinc-900/10 border border-zinc-800 text-zinc-500 text-sm">
              <Clipboard className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
              Pilih salah satu resep dokter di kolom sebelah kiri untuk mengkaji stok obat, meracik dosis, dan memanggil pasien lobi.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
