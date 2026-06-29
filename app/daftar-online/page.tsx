'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Activity, User, Calendar, MapPin, Phone, Mail, Award, CheckCircle, Printer } from 'lucide-react'

interface Schedule {
  id: string
  dokter: { id: string; nama: string; spesialisasi: string }
  poli: { id: string; nama: string }
  hari: string
  jamMulai: string
  jamSelesai: string
  kuota: number
}

interface QueueSlip {
  noRekamMedis: string
  pasienNama: string
  poliNama: string
  dokterNama: string
  tanggal: string
  nomorAntrian: number
  estimasiMenit: number
}

export default function DaftarOnlinePage() {
  // Step: 'form' | 'success'
  const [step, setStep] = useState<'form' | 'success'>('form')

  // Master lists
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [polis, setPolis] = useState<{ id: string; nama: string }[]>([])
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([])

  // Form states
  const [nik, setNik] = useState('')
  const [nama, setNama] = useState('')
  const [tanggalLahir, setTanggalLahir] = useState('')
  const [jenisKelamin, setJenisKelamin] = useState('LAKI_LAKI')
  const [telepon, setTelepon] = useState('')
  const [alamat, setAlamat] = useState('')
  const [email, setEmail] = useState('')
  
  const [selectedPoli, setSelectedPoli] = useState('')
  const [selectedJadwal, setSelectedJadwal] = useState('')
  const [tanggalKunjungan, setTanggalKunjungan] = useState('')
  const [keluhan, setKeluhan] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [queueSlip, setQueueSlip] = useState<QueueSlip | null>(null)

  // Load schedules on mount
  useEffect(() => {
    async function loadSchedules() {
      try {
        const res = await fetch('/api/v1/jadwal')
        const data = await res.json()
        if (data.success) {
          setSchedules(data.data)
          
          // Extract unique polis
          const uniquePolisMap: { [key: string]: string } = {}
          data.data.forEach((s: Schedule) => {
            uniquePolisMap[s.poli.id] = s.poli.nama
          })
          const uniquePolis = Object.keys(uniquePolisMap).map(id => ({
            id,
            nama: uniquePolisMap[id]
          }))
          setPolis(uniquePolis)
        }
      } catch (err) {
        console.error('Failed to load schedules', err)
      }
    }
    loadSchedules()
  }, [])

  // Filter schedules when selectedPoli changes
  useEffect(() => {
    if (selectedPoli) {
      const filtered = schedules.filter(s => s.poli.id === selectedPoli)
      setFilteredSchedules(filtered)
      setSelectedJadwal('') // Reset selected schedule
    } else {
      setFilteredSchedules([])
    }
  }, [selectedPoli, schedules])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJadwal || !tanggalKunjungan) {
      setError('Mohon pilih dokter dan tanggal kunjungan.')
      return
    }

    setError('')
    setLoading(true)

    const payload = {
      nik,
      nama,
      tanggalLahir,
      jenisKelamin,
      alamat,
      telepon,
      email,
      poliId: selectedPoli,
      dokterId: schedules.find(s => s.id === selectedJadwal)?.dokter.id,
      jadwalId: selectedJadwal,
      tanggal: tanggalKunjungan,
      keluhan
    }

    try {
      const res = await fetch('/api/v1/daftar-online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan saat pendaftaran.')
      } else {
        setQueueSlip(data.data)
        setStep('success')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi jaringan.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-6 relative overflow-hidden font-sans">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto z-10 relative">
        {/* Branding header */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Activity className="h-5 w-5 animate-pulse text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">Klinik Pratama</span>
              <span className="text-[10px] text-zinc-500 font-medium">Pendaftaran Mandiri</span>
            </div>
          </Link>
          <Link href="/" className="text-xs text-zinc-400 hover:text-white transition-colors">
            &larr; Kembali ke Beranda
          </Link>
        </div>

        {step === 'form' ? (
          <div className="glass-panel p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 shadow-2xl">
            <h1 className="text-3xl font-bold font-display tracking-tight text-white mb-2">Formulir Pendaftaran Pasien</h1>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              Silakan isi data identitas Anda sesuai KTP/KK dan pilih poli serta dokter yang dituju. Data Anda akan dienkripsi dengan aman dalam sistem rekam medis kami.
            </p>

            {error && (
              <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section 1: Personal Details */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-800/80">
                  <User className="h-5 w-5" />
                  <span>1. Data Identitas Pasien</span>
                </h3>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Nomor NIK (KTP/KK)</label>
                    <input
                      type="text"
                      required
                      value={nik}
                      onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                      maxLength={16}
                      placeholder="16 digit NIK"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Sesuai kartu identitas"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tanggal Lahir</label>
                    <input
                      type="date"
                      required
                      value={tanggalLahir}
                      onChange={(e) => setTanggalLahir(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Jenis Kelamin</label>
                    <select
                      value={jenisKelamin}
                      onChange={(e) => setJenisKelamin(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="LAKI_LAKI">LAKI-LAKI</option>
                      <option value="PEREMPUAN">PEREMPUAN</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Nomor Telepon (WhatsApp)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={telepon}
                        onChange={(e) => setTelepon(e.target.value.replace(/\D/g, ''))}
                        placeholder="Contoh: 08123456789"
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Email (Opsional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Alamat Lengkap</label>
                  <div className="relative">
                    <div className="absolute top-3 left-4 text-zinc-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <textarea
                      required
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      placeholder="Tuliskan nama jalan, RT/RW, kelurahan, kecamatan, kota"
                      rows={3}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Clinical Details */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-800/80">
                  <Award className="h-5 w-5" />
                  <span>2. Tujuan Layanan & Jadwal Sesi</span>
                </h3>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Pilih Poli Tujuan</label>
                    <select
                      required
                      value={selectedPoli}
                      onChange={(e) => setSelectedPoli(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="">-- Pilih Poli --</option>
                      {polis.map(p => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Pilih Dokter & Shift</label>
                    <select
                      required
                      disabled={!selectedPoli}
                      value={selectedJadwal}
                      onChange={(e) => setSelectedJadwal(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                    >
                      <option value="">-- Pilih Dokter --</option>
                      {filteredSchedules.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.dokter.nama} ({s.hari}, {s.jamMulai} - {s.jamSelesai})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tanggal Kunjungan</label>
                    <input
                      type="date"
                      required
                      value={tanggalKunjungan}
                      onChange={(e) => setTanggalKunjungan(e.target.value)}
                      min={new Date().toISOString().split('T')[0]} // Block past dates
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Keluhan Utama (Opsional)</label>
                    <input
                      type="text"
                      value={keluhan}
                      onChange={(e) => setKeluhan(e.target.value)}
                      placeholder="E.g. demam, batuk, sakit gigi"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all cursor-pointer text-center text-sm"
                >
                  {loading ? 'Sedang Memproses Pendaftaran...' : 'Kirim Pendaftaran & Ambil Antrian'}
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* Success Queue Slip Screen */
          <div className="space-y-8">
            <div className="glass-panel p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 text-center shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
              <div className="inline-flex h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mb-6 text-emerald-400 print:hidden">
                <CheckCircle className="h-10 w-10 animate-bounce" />
              </div>

              <h1 className="text-3xl font-bold font-display tracking-tight text-white mb-2 print:text-black">Pendaftaran Berhasil!</h1>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-md mx-auto print:hidden">
                Pendaftaran kunjungan Anda telah diverifikasi oleh sistem. Silakan simpan nomor antrian di bawah ini. Tunjukkan slip ini ke Front Office saat tiba.
              </p>

              {/* Printable Ticket Box */}
              <div className="max-w-md mx-auto bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 text-left shadow-lg relative print:border print:border-black print:bg-white print:text-black print:shadow-none">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-full print:hidden" />
                
                <div className="text-center pb-6 border-b border-zinc-800/80 border-dashed print:border-black">
                  <h3 className="font-display font-bold text-lg text-white print:text-black uppercase">Klinik Pratama</h3>
                  <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Digital Queue Slip</span>
                </div>

                <div className="py-6 text-center">
                  <span className="text-xs text-zinc-400 uppercase tracking-widest block mb-2 print:text-black">Nomor Antrian Anda</span>
                  <span className="text-6xl font-black font-display text-indigo-400 tracking-tight block print:text-black">
                    {queueSlip?.nomorAntrian}
                  </span>
                </div>

                <div className="space-y-4 text-sm border-t border-zinc-800/80 pt-6 border-dashed print:border-black">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Nama Pasien</span>
                    <span className="font-semibold text-white print:text-black">{queueSlip?.pasienNama}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">No. Rekam Medis (RM)</span>
                    <span className="font-mono font-semibold text-indigo-300 print:text-black">{queueSlip?.noRekamMedis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Poli Klinik</span>
                    <span className="font-semibold text-white print:text-black">{queueSlip?.poliNama}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Dokter Sesi</span>
                    <span className="font-semibold text-white print:text-black">{queueSlip?.dokterNama}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Tanggal Kunjungan</span>
                    <span className="font-semibold text-white print:text-black">
                      {queueSlip && new Date(queueSlip.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800/50 pt-4 print:border-black">
                    <span className="text-zinc-500">Estimasi Sesi</span>
                    <span className="font-semibold text-emerald-400 print:text-black">
                      ~ {queueSlip && new Date(new Date().getTime() + (queueSlip.nomorAntrian * 15 * 60000)).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                  </div>
                </div>

                <div className="mt-8 text-center text-[10px] text-zinc-500">
                  Harap datang 15 menit sebelum waktu estimasi untuk melakukan check-in di Front Office.
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex justify-center gap-4 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-2xl transition-all cursor-pointer text-sm shadow-md"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak Slip Antrian</span>
                </button>
                <button
                  onClick={() => setStep('form')}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-semibold py-3 px-6 rounded-2xl transition-all cursor-pointer text-sm"
                >
                  Daftar Kembali
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}
