'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Activity,
  QrCode,
  UserPlus,
  ArrowLeft,
  Search,
  CheckCircle,
  Printer,
  ChevronRight,
  Sparkles,
  Heart,
  Smile,
  Baby,
} from 'lucide-react'

interface KioskTicket {
  nomorAntrian: number
  pasienNama: string
  poliNama: string
  dokterNama: string
  estimasiMenit: number
  tanggal: string
}

export default function AnjunganMandiri() {
  const [mode, setMode] = useState<'home' | 'checkin' | 'daftar-baru' | 'ticket'>('home')
  const [nikInput, setNikInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ticket, setTicket] = useState<KioskTicket | null>(null)

  // Auto back to home after 45 seconds on ticket screen
  useEffect(() => {
    if (mode === 'ticket') {
      const timer = setTimeout(() => {
        handleReset()
      }, 45000)
      return () => clearTimeout(timer)
    }
  }, [mode])

  const handleReset = () => {
    setMode('home')
    setNikInput('')
    setError('')
    setTicket(null)
  }

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nikInput || nikInput.length < 12) {
      setError('Masukkan NIK yang valid (16 digit).')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Simulate booking lookup or create rapid registration
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Simulate a random patient checkin
      const mockNames = ['Ahmad Syarif', 'Budi Santoso', 'Siti Rahma', 'Dewi Lestari', 'Joko Widodo']
      const mockPolis = ['Poli Umum', 'Poli Gigi', 'Poli Anak', 'Poli Kandungan']
      const mockDokters = ['dr. Rian Hidayat', 'drg. Amelia Putri', 'dr. Sarah Sp.A', 'dr. Hendra Sp.OG']

      const idx = Math.floor(Math.random() * mockNames.length)

      setTicket({
        nomorAntrian: Math.floor(Math.random() * 50) + 1,
        pasienNama: mockNames[idx],
        poliNama: mockPolis[idx % mockPolis.length],
        dokterNama: mockDokters[idx % mockDokters.length],
        estimasiMenit: 30 + (idx * 15),
        tanggal: new Date().toISOString()
      })
      setMode('ticket')
    } catch (err) {
      setError('Pendaftaran tidak ditemukan. Silakan hubungi meja informasi.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickRegister = async (poliName: string, dokterName: string) => {
    setLoading(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setTicket({
        nomorAntrian: Math.floor(Math.random() * 80) + 1,
        pasienNama: 'PASIEN MANDIRI (APM)',
        poliNama: poliName,
        dokterNama: dokterName,
        estimasiMenit: 45,
        tanggal: new Date().toISOString()
      })
      setMode('ticket')
    } catch (err) {
      setError('Gagal membuat antrian. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="px-8 py-6 border-b border-slate-200 dark:border-zinc-800 bg-white/75 dark:bg-zinc-900/40 backdrop-blur-md flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Activity className="h-7 w-7 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight dark:text-white leading-none">Anjungan Pendaftaran Mandiri</h1>
            <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-semibold tracking-wider uppercase">Kiosk Layanan Mandiri Pasien</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">Kiosk #01 &bull; Siaga Medis</p>
          </div>
          <Link
            href="/front-office"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"
          >
            Dashboard Staff
          </Link>
        </div>
      </header>

      {/* Main Kiosk Interface Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col justify-center items-center z-10">
        {mode === 'home' && (
          <div className="w-full text-center space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider animate-pulse">
                <Sparkles className="h-4 w-4" />
                <span>Selamat Datang di Klinik Pratama</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight dark:text-white leading-tight">
                Pilih Jenis Layanan Mandiri Anda
              </h2>
              <p className="text-slate-500 dark:text-zinc-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Silakan ketuk salah satu opsi di bawah ini untuk check-in online atau mengambil nomor antrian periksa baru.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
              {/* Button check-in */}
              <button
                onClick={() => setMode('checkin')}
                className="group flex flex-col justify-between items-start text-left p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/5 active:scale-[0.98] transition-all duration-300"
              >
                <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform mb-8 shadow-inner">
                  <QrCode className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-display dark:text-white mb-2 flex items-center gap-2">
                    Check-in Booking Online
                    <ChevronRight className="h-5 w-5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
                    Sudah melakukan pendaftaran online di rumah? Gunakan NIK atau Scan QR Anda di sini untuk mencetak karcis antrian poli.
                  </p>
                </div>
              </button>

              {/* Button register new */}
              <button
                onClick={() => setMode('daftar-baru')}
                className="group flex flex-col justify-between items-start text-left p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-cyan-500 dark:hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/5 active:scale-[0.98] transition-all duration-300"
              >
                <div className="h-16 w-16 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform mb-8 shadow-inner">
                  <UserPlus className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-display dark:text-white mb-2 flex items-center gap-2">
                    Pendaftaran Langsung (Walk-In)
                    <ChevronRight className="h-5 w-5 text-cyan-500 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
                    Baru datang dan belum booking online? Ambil antrian pelayanan periksa secara langsung di sini tanpa antre di front office.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {mode === 'checkin' && (
          <div className="w-full max-w-lg space-y-6">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </button>

            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-display dark:text-white">Check-in Booking Online</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Masukkan 16 digit NIK Anda yang digunakan saat mendaftar online.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-2xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleCheckin} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
                    Nomor NIK Pasien
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={nikInput}
                      onChange={(e) => setNikInput(e.target.value.replace(/\D/g, ''))}
                      maxLength={16}
                      placeholder="Contoh: 3271xxxxxxxxxxxx"
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl py-4 px-5 text-lg font-mono text-center tracking-wider focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 font-display">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        if (nikInput.length < 16) setNikInput(prev => prev + num)
                      }}
                      className="py-3 text-lg font-bold bg-slate-100 dark:bg-zinc-850 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-xl transition-all"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNikInput(prev => prev.slice(0, -1))}
                    className="col-span-2 py-3 text-sm font-bold bg-red-50 dark:bg-red-950/20 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                  >
                    Hapus
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer text-center text-sm"
                >
                  {loading ? 'Mengecek Database...' : 'Konfirmasi Check-in & Cetak'}
                </button>
              </form>
            </div>
          </div>
        )}

        {mode === 'daftar-baru' && (
          <div className="w-full max-w-4xl space-y-6">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </button>

            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black font-display dark:text-white">Pilih Sesi Layanan Poli</h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed mt-1">
                  Ketuk salah satu pilihan poli di bawah ini untuk didaftarkan secara otomatis sebagai pasien hari ini.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 w-full">
                <button
                  onClick={() => handleQuickRegister('Poli Umum', 'dr. Rian Hidayat')}
                  className="p-6 text-left rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 flex items-center gap-5 hover:shadow-xl active:scale-[0.98] transition-all"
                >
                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Heart className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg dark:text-white">Poli Umum</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Pemeriksaan medis umum, flu, demam, rujukan BPJS</p>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickRegister('Poli Gigi', 'drg. Amelia Putri')}
                  className="p-6 text-left rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 flex items-center gap-5 hover:shadow-xl active:scale-[0.98] transition-all"
                >
                  <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Smile className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg dark:text-white">Poli Gigi</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Cabut gigi, scaling karang gigi, tambal gigi, checkup rutin</p>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickRegister('Poli Anak', 'dr. Sarah Sp.A')}
                  className="p-6 text-left rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 flex items-center gap-5 hover:shadow-xl active:scale-[0.98] transition-all"
                >
                  <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Baby className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg dark:text-white">Poli Anak</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Kesehatan balita, imunisasi berkala, nutrisi & tumbuh kembang</p>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickRegister('Poli Kandungan', 'dr. Hendra Sp.OG')}
                  className="p-6 text-left rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 flex items-center gap-5 hover:shadow-xl active:scale-[0.98] transition-all"
                >
                  <div className="h-14 w-14 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/50 flex items-center justify-center text-pink-600 dark:text-pink-400">
                    <Activity className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg dark:text-white">Poli Kandungan</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Pemeriksaan kehamilan, USG abdomen, KB & KIA</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'ticket' && ticket && (
          <div className="w-full max-w-md space-y-6 text-center animate-fade-in">
            <div className="inline-flex h-16 w-16 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <CheckCircle className="h-9 w-9 animate-bounce" />
            </div>
            
            <h2 className="text-3xl font-black font-display dark:text-white">Pendaftaran Sukses!</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              Karcis antrian sedang dicetak. Silakan ambil tiket di bagian bawah mesin anjungan.
            </p>

            {/* Ticket Card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 text-left shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-full" />
              
              <div className="text-center pb-4 border-b border-slate-200 dark:border-zinc-800 border-dashed">
                <h4 className="font-display font-bold text-slate-800 dark:text-white">KLINIK PRATAMA</h4>
                <span className="text-[9px] text-slate-400 dark:text-zinc-500 tracking-wider uppercase font-semibold">Struk Antrian Mandiri (APM)</span>
              </div>

              <div className="py-6 text-center">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest block font-bold mb-1">Nomor Antrian</span>
                <span className="text-6xl font-black font-display text-indigo-600 dark:text-indigo-400 tracking-tighter">
                  #{ticket.nomorAntrian}
                </span>
              </div>

              <div className="space-y-3.5 text-xs pt-4 border-t border-slate-200 dark:border-zinc-800 border-dashed">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama Pasien</span>
                  <span className="font-bold text-slate-800 dark:text-white">{ticket.pasienNama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Poli Tujuan</span>
                  <span className="font-bold text-slate-800 dark:text-white">{ticket.poliNama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dokter</span>
                  <span className="font-bold text-slate-800 dark:text-white">{ticket.dokterNama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimasi Pelayanan</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ~ {new Date(new Date().getTime() + (ticket.nomorAntrian * 15 * 60000)).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </span>
                </div>
              </div>

              <p className="text-[9px] text-center text-slate-400 dark:text-zinc-500 mt-6 leading-relaxed">
                Silakan duduk di ruang tunggu utama. Nomor antrian Anda akan dipanggil melalui speaker digital poli. Terima kasih.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-2xl text-xs shadow-md transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Simpan Karcis</span>
              </button>
              <button
                onClick={handleReset}
                className="bg-slate-100 hover:bg-slate-250 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 text-slate-600 dark:text-zinc-300 font-semibold py-3 px-6 rounded-2xl text-xs transition-all cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer / Status bar */}
      <footer className="px-8 py-4 border-t border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/10 text-center text-[10px] text-slate-400 dark:text-zinc-500 z-10 shrink-0">
        &copy; {new Date().getFullYear()} Klinik Pratama &bull; Sistem Layanan Mandiri Terintegrasi &bull; Tekan &apos;Selesai&apos; untuk kembali ke menu awal
      </footer>
    </div>
  )
}
