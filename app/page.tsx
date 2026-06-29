import Link from 'next/link'
import { Activity, Calendar, Lock, UserCheck, ShieldAlert } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-950 text-white relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="z-10 w-full max-w-4xl px-6 py-12 flex flex-col items-center text-center">
        {/* Clinic Logo/Title Header */}
        <div className="flex items-center gap-3 mb-4 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 animate-fade-in">
          <Activity className="h-6 w-6 text-indigo-400 animate-pulse" />
          <span className="text-sm font-semibold tracking-wide text-indigo-300 uppercase">Klinik Pratama</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-bold font-display tracking-tight text-white mb-6 max-w-2xl leading-[1.1] animate-fade-in">
          Sistem Informasi <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Pelayanan Klinik</span> Modern
        </h1>
        
        <p className="max-w-xl text-zinc-400 text-base sm:text-lg mb-12 leading-relaxed animate-fade-in">
          Solusi terintegrasi untuk pendaftaran online mandiri pasien, pemantauan nomor antrian real-time, rekam medis elektronik (EHR), apotik obat, kasir pembayaran, serta penjadwalan tenaga medis.
        </p>

        {/* Action Choice Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl animate-fade-in">
          
          {/* Patient Card */}
          <Link href="/daftar-online" className="group text-left p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-900/80 transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full group-hover:bg-indigo-500/10 transition-colors" />
            <div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold font-display text-white mb-2">Portal Pasien</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Lakukan pendaftaran online mandiri, pilih spesialisasi poli & jadwal dokter, serta dapatkan nomor antrian digital dengan estimasi waktu tunggu.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-400 group-hover:text-indigo-300">
              Daftar Online Sekarang &rarr;
            </div>
          </Link>

          {/* Staff Card */}
          <Link href="/login" className="group text-left p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-900/80 transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full group-hover:bg-cyan-500/10 transition-colors" />
            <div>
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold font-display text-white mb-2">Portal Staff & Medis</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Akses dashboard internal untuk front office, perawat triage, ruang periksa dokter (SOAP), apotek dispensasi obat, kasir pembayaran, logistik, dan laporan.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400 group-hover:text-cyan-300">
              Masuk Dashboard Medis &rarr;
            </div>
          </Link>
          
        </div>
        
        {/* Footer Info */}
        <div className="mt-16 text-zinc-600 text-xs flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          <span>Klinik Pratama Terakreditasi Paripurna &bull; Keamanan data rekam medis terenkripsi AES-256</span>
        </div>
      </main>
    </div>
  )
}
