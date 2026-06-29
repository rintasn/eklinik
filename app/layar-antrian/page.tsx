'use client'

import { useState, useEffect, useRef } from 'react'
import { Activity, Bell, Volume2, VolumeX, Sparkles, User, Monitor } from 'lucide-react'

interface QueueItem {
  id: string
  nomorAntrian: number
  status: string
  dipanggil?: string
  pendaftaran: {
    id: string
    sumber: string
    keluhan?: string
    tensiSistolik?: number
    pasien: { nama: string; noRekamMedis: string }
    poli: { nama: string }
    dokter: { nama: string }
  }
}

interface ApotikQueue {
  id: string
  status: string
  rekamMedis: {
    pasien: { nama: string; noRekamMedis: string }
  }
}

interface KasirQueue {
  id: string
  status: string
  pendaftaran: {
    pasien: { nama: string; noRekamMedis: string }
  }
}

export default function LayarAntrianTVPage() {
  const [queues, setQueues] = useState<QueueItem[]>([])
  const [apotikList, setApotikList] = useState<ApotikQueue[]>([])
  const [kasirList, setKasirList] = useState<KasirQueue[]>([])
  
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [lastAnnouncement, setLastAnnouncement] = useState<string>('')
  
  // Track spoken announcements in ref to persist across polls
  const spokenIds = useRef<Set<string>>(new Set())

  // Load active data
  const loadData = async () => {
    try {
      // 1. Load active lobby queues
      const queueRes = await fetch('/api/v1/antrian')
      const queueData = await queueRes.json()
      if (queueData.success) {
        setQueues(queueData.data)
        
        // Trigger voice calls for calling tickets
        if (soundEnabled) {
          const calling = queueData.data.filter((q: QueueItem) => q.status === 'DIPANGGIL')
          for (const item of calling) {
            const callTime = item.dipanggil ? new Date(item.dipanggil).getTime() : ''
            const announcementKey = `poli-${item.id}-${callTime}`
            if (!spokenIds.current.has(announcementKey)) {
              spokenIds.current.add(announcementKey)
              const dest = item.pendaftaran.tensiSistolik ? item.pendaftaran.poli.nama : 'Loket Pendaftaran'
              speakCall(`Nomor antrian ${item.nomorAntrian}. Silakan menuju ke ${dest}`)
            }
          }
        }
      }

      // 2. Load Apotik waiting prescriptions
      const apoRes = await fetch('/api/v1/resep')
      const apoData = await apoRes.json()
      if (apoData.success) {
        // Display prescriptions that are not fully dispensed yet
        setApotikList(apoData.data.filter((r: any) => r.status !== 'SELESAI'))
        
        // Trigger voice calls for drug collection using dipanggil timestamp
        if (soundEnabled) {
          for (const item of apoData.data) {
            if (item.dipanggil) {
              const callTime = new Date(item.dipanggil).getTime()
              const announcementKey = `apotik-${item.id}-${callTime}`
              if (!spokenIds.current.has(announcementKey)) {
                spokenIds.current.add(announcementKey)
                speakCall(`Resep obat atas nama ${item.rekamMedis.pasien.nama}. Silakan mengambil obat di Loket Apotik`)
              }
            }
          }
        }
      }

      // 3. Load Kasir waiting payments
      const kasirRes = await fetch('/api/v1/pembayaran?status=BELUM_BAYAR')
      const kasirData = await kasirRes.json()
      if (kasirData.success) {
        setKasirList(kasirData.data)
        
        // Trigger voice calls for cashier payment
        if (soundEnabled) {
          for (const item of kasirData.data) {
            const announcementKey = `kasir-${item.id}`
            if (!spokenIds.current.has(announcementKey)) {
              spokenIds.current.add(announcementKey)
              speakCall(`Pasien atas nama ${item.pendaftaran.pasien.nama}. Silakan melakukan pembayaran di Loket Kasir`)
            }
          }
        }
      }
    } catch (err) {
      console.error('Fetch layar antrian error:', err)
    }
  }

  // Poll database updates every 4 seconds
  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 4000)
    return () => clearInterval(interval)
  }, [soundEnabled])

  // Speech helper
  const speakCall = (text: string) => {
    if (!window.speechSynthesis) return
    setLastAnnouncement(text)

    // Stop current speech first
    window.speechSynthesis.cancel()

    // Prefix with bell sound-like intro phrase if needed, or directly speak
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'id-ID'
    utterance.rate = 0.82 // slightly slower for echo-ey clinic halls
    utterance.pitch = 1.0
    
    // Attempt to select an Indonesian voice
    const voices = window.speechSynthesis.getVoices()
    const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'))
    if (idVoice) {
      utterance.voice = idVoice
    }
    
    window.speechSynthesis.speak(utterance)
  }

  // Extract columns
  // Loket 1: Pendaftaran / Lobby registrations (not triaged yet)
  const lobbyQueues = queues.filter(q => q.status === 'MENUNGGU' && !q.pendaftaran.tensiSistolik)
  
  // Loket 2: Poli Umum (Calling or Active)
  const poliUmumQueue = queues.find(q => q.status === 'DIPANGGIL' && q.pendaftaran.poli.nama === 'Poli Umum')
  
  // Loket 3: Poli Gigi (Calling or Active)
  const poliGigiQueue = queues.find(q => q.status === 'DIPANGGIL' && q.pendaftaran.poli.nama === 'Poli Gigi')

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden flex flex-col justify-between">
      
      {/* Header Banner */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <Monitor className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-black text-lg tracking-tight uppercase">Monitor Antrian Utama</h1>
            <span className="text-xs text-zinc-500 font-semibold">Klinik Pratama &bull; Layanan Terintegrasi</span>
          </div>
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center gap-3">
          {lastAnnouncement && (
            <div className="hidden lg:flex items-center gap-2 bg-indigo-950/40 border border-indigo-900/50 px-4 py-2 rounded-xl text-xs text-indigo-400 animate-pulse">
              <Bell className="h-3.5 w-3.5" />
              <span>Panggilan: &quot;{lastAnnouncement}&quot;</span>
            </div>
          )}
          
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer select-none active:scale-95 transition-all ${
              soundEnabled
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span>{soundEnabled ? 'Suara Panggilan Aktif' : 'Aktifkan Suara Panggilan'}</span>
          </button>
        </div>
      </header>

      {/* Main Display Grid */}
      <main className="flex-1 p-8 grid lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Display: Active Big Calling Card (5 columns) */}
        <div className="lg:col-span-4 flex flex-col justify-between glass-panel p-8 rounded-3xl bg-indigo-600/5 border border-indigo-600/10 shadow-2xl relative overflow-hidden h-full min-h-[500px]">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/15 rounded-full blur-[100px]" />
          
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">Panggilan Aktif Saat Ini</span>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Real-time Broadcast</span>
          </div>

          {/* Big Calling display */}
          <div className="text-center py-12 space-y-6">
            <div className="inline-flex items-center justify-center gap-2 bg-indigo-600/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-indigo-400 text-xs font-bold animate-pulse">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Sedang Dipanggil</span>
            </div>
            
            {/* Find the latest calling ticket in system */}
            {queues.some(q => q.status === 'DIPANGGIL') ? (
              (() => {
                const active = queues.find(q => q.status === 'DIPANGGIL')!
                const dest = active.pendaftaran.tensiSistolik ? active.pendaftaran.poli.nama : 'Pendaftaran'
                return (
                  <div className="space-y-4">
                    <span className="text-8xl font-black font-display text-white tracking-tighter block drop-shadow-lg">
                      #{active.nomorAntrian}
                    </span>
                    <span className="text-lg font-bold text-zinc-300 block truncate max-w-xs mx-auto">
                      {active.pendaftaran.pasien.nama}
                    </span>
                    <span className="text-xs bg-indigo-600 text-white font-black px-4 py-2 rounded-xl uppercase tracking-widest inline-block shadow-md">
                      Menuju ke: {dest}
                    </span>
                  </div>
                )
              })()
            ) : (
              <div className="space-y-4">
                <span className="text-7xl font-black font-display text-zinc-700 block tracking-tight">--</span>
                <span className="text-zinc-500 text-xs max-w-xs mx-auto block">Belum ada panggilan antrian dokter aktif saat ini.</span>
              </div>
            )}
          </div>

          {/* Footer instruction */}
          <div className="border-t border-zinc-800/80 pt-4 text-[10px] text-zinc-500 leading-relaxed">
            * Harap membawa berkas pendaftaran/KTP dan bersiap di depan pintu ruangan yang ditentukan saat nomor antrian Anda dipanggil.
          </div>
        </div>

        {/* Right Display: Loket Grid (8 columns) */}
        <div className="lg:col-span-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* LOKET 1: PENDAFTARAN */}
          <div className="glass-panel p-6 rounded-3xl bg-zinc-900/20 border border-zinc-800 flex flex-col justify-between h-full min-h-[300px]">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-4">
                <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">Loket 1</h3>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded">PENDAFTARAN</span>
              </div>

              {lobbyQueues.length > 0 ? (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {lobbyQueues.slice(0, 4).map(item => (
                    <div key={item.id} className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block truncate max-w-[120px]">{item.pendaftaran.pasien.nama}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">{item.pendaftaran.pasien.noRekamMedis}</span>
                      </div>
                      <span className="font-display font-black text-sm text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-lg">
                        #{item.nomorAntrian}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-zinc-600 text-xs italic py-12 text-center">Tidak ada antrian pendaftaran.</div>
              )}
            </div>
            <div className="text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-3">
              Total antri: {lobbyQueues.length} Pasien
            </div>
          </div>

          {/* LOKET 2: POLI UMUM */}
          <div className="glass-panel p-6 rounded-3xl bg-zinc-900/20 border border-zinc-800 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-4">
                <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">Loket 2</h3>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 font-bold px-2 py-0.5 rounded">POLI UMUM</span>
              </div>

              {poliUmumQueue ? (
                <div className="text-center py-6 space-y-3">
                  <span className="text-zinc-500 text-[10px] uppercase block tracking-wider">Sedang Diperiksa</span>
                  <span className="text-4xl font-black font-display text-cyan-400 block">#{poliUmumQueue.nomorAntrian}</span>
                  <span className="text-xs font-semibold text-white block truncate">{poliUmumQueue.pendaftaran.pasien.nama}</span>
                  <span className="text-[10px] text-zinc-400 block truncate">{poliUmumQueue.pendaftaran.dokter.nama}</span>
                </div>
              ) : (
                <div className="text-zinc-600 text-xs italic py-12 text-center">Tidak ada pemeriksaan aktif.</div>
              )}
            </div>
            <div className="text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-3">
              Status: Aktif Layanan
            </div>
          </div>

          {/* LOKET 3: POLI GIGI */}
          <div className="glass-panel p-6 rounded-3xl bg-zinc-900/20 border border-zinc-800 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-4">
                <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">Loket 3</h3>
                <span className="text-[10px] bg-pink-500/10 text-pink-400 font-bold px-2 py-0.5 rounded">POLI GIGI</span>
              </div>

              {poliGigiQueue ? (
                <div className="text-center py-6 space-y-3">
                  <span className="text-zinc-500 text-[10px] uppercase block tracking-wider">Sedang Diperiksa</span>
                  <span className="text-4xl font-black font-display text-pink-400 block">#{poliGigiQueue.nomorAntrian}</span>
                  <span className="text-xs font-semibold text-white block truncate">{poliGigiQueue.pendaftaran.pasien.nama}</span>
                  <span className="text-[10px] text-zinc-400 block truncate">{poliGigiQueue.pendaftaran.dokter.nama}</span>
                </div>
              ) : (
                <div className="text-zinc-600 text-xs italic py-12 text-center">Tidak ada pemeriksaan aktif.</div>
              )}
            </div>
            <div className="text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-3">
              Status: Aktif Layanan
            </div>
          </div>

          {/* LOKET 4: APOTIK / FARMASI */}
          <div className="glass-panel p-6 rounded-3xl bg-zinc-900/20 border border-zinc-800 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-4">
                <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">Loket 4</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded">APOTIK / OBAT</span>
              </div>

              {apotikList.length > 0 ? (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {apotikList.slice(0, 4).map(item => (
                    <div key={item.id} className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block truncate max-w-[130px]">{item.rekamMedis.pasien.nama}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">{item.rekamMedis.pasien.noRekamMedis}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded">
                        RESEP
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-zinc-600 text-xs italic py-12 text-center">Tidak ada resep menanti.</div>
              )}
            </div>
            <div className="text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-3">
              Menunggu racik: {apotikList.length} Resep
            </div>
          </div>

          {/* LOKET 5: KASIR */}
          <div className="glass-panel p-6 rounded-3xl bg-zinc-900/20 border border-zinc-800 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-4">
                <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">Loket 5</h3>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded">KASIR / BILL</span>
              </div>

              {kasirList.length > 0 ? (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {kasirList.slice(0, 4).map(item => (
                    <div key={item.id} className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block truncate max-w-[130px]">{item.pendaftaran.pasien.nama}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">{item.pendaftaran.pasien.noRekamMedis}</span>
                      </div>
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 font-semibold px-2 py-0.5 rounded">
                        BILL
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-zinc-600 text-xs italic py-12 text-center">Tidak ada tagihan pembayaran.</div>
              )}
            </div>
            <div className="text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-3">
              Belum bayar: {kasirList.length} Transaksi
            </div>
          </div>

        </div>

      </main>

      {/* Footer marquee instruction */}
      <footer className="bg-zinc-900 border-t border-zinc-800 px-6 py-4 flex items-center gap-3 overflow-hidden shrink-0">
        <span className="text-xs bg-indigo-600 text-white font-black px-2.5 py-1 rounded uppercase tracking-wider shrink-0 select-none">Pengumuman</span>
        <div className="flex-1 w-full overflow-hidden relative">
          <p className="text-xs text-zinc-400 font-medium whitespace-nowrap animate-marquee">
            Selamat datang di Klinik Pratama. Bagi pasien yang sudah mendaftar secara online, dimohon untuk langsung melakukan check-in di Loket 1 Pendaftaran. Terima kasih atas kerja sama Anda.
          </p>
        </div>
      </footer>

      {/* Custom styles for marquee speed */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 25s linear infinite;
        }
      `}</style>

    </div>
  )
}
