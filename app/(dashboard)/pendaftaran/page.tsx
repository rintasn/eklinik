'use client'

import { useState, useEffect } from 'react'
import { Activity, Clipboard, CheckCircle, AlertCircle, RefreshCw, Search } from 'lucide-react'

interface Registration {
  id: string
  tanggal: string
  status: string
  sumber: string
  keluhan?: string
  tensiSistolik?: number
  tensiDiastolik?: number
  beratBadan?: number
  tinggiBadan?: number
  suhuTubuh?: number
  nadi?: number
  triaseColor?: string
  pasien: {
    id: string
    nama: string
    noRekamMedis: string
    jenisKelamin: string
    tanggalLahir: string
    nik?: string
    telepon?: string
  }
  poli: { nama: string }
  dokter: { nama: string }
}

export default function PendaftaranTriagePage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null)

  // Vital signs form states
  const [keluhan, setKeluhan] = useState('')
  const [tensiSistolik, setTensiSistolik] = useState('')
  const [tensiDiastolik, setTensiDiastolik] = useState('')
  const [beratBadan, setBeratBadan] = useState('')
  const [tinggiBadan, setTinggiBadan] = useState('')
  const [suhuTubuh, setSuhuTubuh] = useState('')
  const [nadi, setNadi] = useState('')
  const [triaseColor, setTriaseColor] = useState('HIJAU') // Default Green (non-urgent)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load today's registrations
  const loadRegistrations = async () => {
    setLoading(true)
    try {
      const todayStr = new Date().toISOString().split('T')[0]
      const res = await fetch(`/api/v1/pendaftaran?tanggal=${todayStr}`)
      const data = await res.json()
      if (data.success) {
        // Filter those who are MENUNGGU or DIPERIKSA but haven't completed triage yet
        setRegistrations(data.data.filter((r: Registration) => 
          r.status === 'MENUNGGU' || (r.status === 'DIPERIKSA' && !r.tensiSistolik)
        ))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRegistrations()
  }, [])

  // Auto-fill form when selected pendaftaran changes
  useEffect(() => {
    if (selectedReg) {
      setKeluhan(selectedReg.keluhan || '')
      setTensiSistolik(selectedReg.tensiSistolik?.toString() || '')
      setTensiDiastolik(selectedReg.tensiDiastolik?.toString() || '')
      setBeratBadan(selectedReg.beratBadan?.toString() || '')
      setTinggiBadan(selectedReg.tinggiBadan?.toString() || '')
      setSuhuTubuh(selectedReg.suhuTubuh?.toString() || '')
      setNadi(selectedReg.nadi?.toString() || '')
      setTriaseColor(selectedReg.triaseColor || 'HIJAU')
    } else {
      setKeluhan('')
      setTensiSistolik('')
      setTensiDiastolik('')
      setBeratBadan('')
      setTinggiBadan('')
      setSuhuTubuh('')
      setNadi('')
      setTriaseColor('HIJAU')
    }
  }, [selectedReg])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReg) return

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    const payload = {
      id: selectedReg.id,
      keluhan,
      tensiSistolik: tensiSistolik ? parseInt(tensiSistolik) : null,
      tensiDiastolik: tensiDiastolik ? parseInt(tensiDiastolik) : null,
      beratBadan: beratBadan ? parseFloat(beratBadan) : null,
      tinggiBadan: tinggiBadan ? parseFloat(tinggiBadan) : null,
      suhuTubuh: suhuTubuh ? parseFloat(suhuTubuh) : null,
      nadi: nadi ? parseInt(nadi) : null,
      triaseColor
    }

    try {
      const res = await fetch('/api/v1/pendaftaran', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan tanda vital.')
      } else {
        setSuccess('Tanda vital dan triage pasien berhasil disimpan.')
        setSelectedReg(null)
        loadRegistrations()
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi jaringan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAge = (dobString: string) => {
    const dob = new Date(dobString)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Title */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Triage & Tanda Vital</h2>
          <p className="text-zinc-400 text-sm mt-1">Periksa keluhan fisik awal pasien, catat tanda vital (vital signs), dan arahkan tingkat darurat triase.</p>
        </div>
        <button
          onClick={loadRegistrations}
          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-3 py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Alerts feedback */}
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

      {/* Triage Workspace */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Waiting queue list (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-bold font-display text-white">⏳ Pasien Menunggu Triage</h3>

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

          {loading ? (
            <div className="text-zinc-500 text-sm py-12 text-center">Memuat daftar antrian...</div>
          ) : (() => {
            const filtered = registrations.filter(r => {
              const query = searchQuery.toLowerCase()
              return (
                r.pasien.nama.toLowerCase().includes(query) ||
                r.pasien.noRekamMedis.toLowerCase().includes(query) ||
                (r.pasien.nik && r.pasien.nik.toLowerCase().includes(query)) ||
                (r.pasien.telepon && r.pasien.telepon.toLowerCase().includes(query))
              )
            })
            
            if (filtered.length === 0) {
              return (
                <div className="glass-panel p-8 text-center rounded-2xl text-zinc-500 text-sm">
                  Tidak ada pasien yang cocok dengan pencarian.
                </div>
              )
            }

            return (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filtered.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReg(r)}
                    className={`w-full glass-panel p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                      selectedReg?.id === r.id
                        ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-600/5'
                        : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{r.pasien.nama}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">({r.pasien.noRekamMedis})</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        Poli: <span className="text-indigo-400 font-semibold">{r.poli.nama}</span> &bull; {r.dokter.nama}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        {r.pasien.jenisKelamin.replace('_', '-')} &bull; {getAge(r.pasien.tanggalLahir)} Tahun
                      </div>
                    </div>
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded uppercase tracking-wider font-mono">
                      {r.sumber}
                    </span>
                  </button>
                ))}
              </div>
            )
          })()}
        </div>

        {/* Right Column: Vitals entry form (7 columns) */}
        <div className="lg:col-span-7">
          {selectedReg ? (
            <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-6">
              <div className="pb-3 border-b border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Pemeriksaan Tanda Vital</span>
                  <h4 className="font-bold text-lg text-white">{selectedReg.pasien.nama} ({selectedReg.pasien.noRekamMedis})</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReg(null)}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  Tutup Form
                </button>
              </div>

              {/* Chief Complaint */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Keluhan Utama Pasien</label>
                <textarea
                  required
                  value={keluhan}
                  onChange={(e) => setKeluhan(e.target.value)}
                  placeholder="Keluhan fisik awal / alasan kedatangan"
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Vital Signs Grid */}
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tensi Sistolik (mmHg)</label>
                  <input
                    type="number"
                    value={tensiSistolik}
                    onChange={(e) => setTensiSistolik(e.target.value)}
                    placeholder="E.g. 120"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 px-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tensi Diastolik (mmHg)</label>
                  <input
                    type="number"
                    value={tensiDiastolik}
                    onChange={(e) => setTensiDiastolik(e.target.value)}
                    placeholder="E.g. 80"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 px-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Suhu Tubuh (&deg;C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={suhuTubuh}
                    onChange={(e) => setSuhuTubuh(e.target.value)}
                    placeholder="E.g. 36.8"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 px-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Berat Badan (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={beratBadan}
                    onChange={(e) => setBeratBadan(e.target.value)}
                    placeholder="E.g. 65.5"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 px-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tinggi Badan (Cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tinggiBadan}
                    onChange={(e) => setTinggiBadan(e.target.value)}
                    placeholder="E.g. 170"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 px-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Detak Nadi (bpm)</label>
                  <input
                    type="number"
                    value={nadi}
                    onChange={(e) => setNadi(e.target.value)}
                    placeholder="E.g. 80"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 px-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Triage Category Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Tingkat Kegawatdaruratan Triase</label>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <button
                    type="button"
                    onClick={() => setTriaseColor('MERAH')}
                    className={`py-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      triaseColor === 'MERAH'
                        ? 'bg-red-500 text-white border-red-400 scale-[1.03] shadow-md shadow-red-500/10'
                        : 'bg-red-500/5 text-red-400 border-red-500/10 hover:bg-red-500/10'
                    }`}
                  >
                    🟥 MERAH (Gawat Darurat)
                  </button>

                  <button
                    type="button"
                    onClick={() => setTriaseColor('KUNING')}
                    className={`py-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      triaseColor === 'KUNING'
                        ? 'bg-amber-500 text-white border-amber-400 scale-[1.03] shadow-md shadow-amber-500/10'
                        : 'bg-amber-500/5 text-amber-400 border-amber-500/10 hover:bg-amber-500/10'
                    }`}
                  >
                    🟨 KUNING (Mendesak)
                  </button>

                  <button
                    type="button"
                    onClick={() => setTriaseColor('HIJAU')}
                    className={`py-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      triaseColor === 'HIJAU'
                        ? 'bg-emerald-500 text-white border-emerald-400 scale-[1.03] shadow-md shadow-emerald-500/10'
                        : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10 hover:bg-emerald-500/10'
                    }`}
                  >
                    🟩 HIJAU (Non-Mendesak)
                  </button>

                  <button
                    type="button"
                    onClick={() => setTriaseColor('BIRU')}
                    className={`py-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      triaseColor === 'BIRU'
                        ? 'bg-sky-500 text-white border-sky-400 scale-[1.03] shadow-md shadow-sky-500/10'
                        : 'bg-sky-500/5 text-sky-400 border-sky-500/10 hover:bg-sky-500/10'
                    }`}
                  >
                    🟦 BIRU (Pemeriksaan)
                  </button>
                </div>
              </div>

              {/* Submit Triage */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-semibold py-4 rounded-2xl text-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Tanda Vital & Lanjutkan ke Antrian Dokter'}
              </button>
            </form>
          ) : (
            <div className="glass-panel p-12 text-center rounded-3xl bg-zinc-900/10 border border-zinc-800 text-zinc-500 text-sm">
              <Clipboard className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
              Pilih pasien di kolom sebelah kiri untuk mulai melakukan pemeriksaan tanda vital dan triage awal.
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
