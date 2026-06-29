'use client'

import { useState } from 'react'
import { Droplet, Plus, Search, CheckCircle, Clock, ShieldAlert, Heart, Clipboard, Eye, FileText } from 'lucide-react'

interface HDCheckLog {
  waktu: string
  tensi: string
  qb: number // mL/min
  qd: number // mL/min
  tmp: number // mmHg
  ufVolume: number // Liters
  catatan: string
}

interface DialysisSession {
  id: string
  pasienNama: string
  noRM: string
  mesinId: string
  frekuensiMingguan: number
  targetUFR: number // Ultrafiltration Rate in liters
  durasiJam: number
  status: 'BERJALAN' | 'SELESAI'
  dokterNama: string
  jamMulai: string
  checks: HDCheckLog[]
}

export default function HemodialisaPage() {
  const [sessions, setSessions] = useState<DialysisSession[]>([
    {
      id: '1',
      pasienNama: 'Joko Widodo',
      noRM: 'RM-000108',
      mesinId: 'Mesin HD-01',
      frekuensiMingguan: 2,
      targetUFR: 2.5,
      durasiJam: 4,
      status: 'BERJALAN',
      dokterNama: 'dr. Sarah Sp.A',
      jamMulai: '08:00 WIB',
      checks: [
        { waktu: '08:15 WIB', tensi: '130/85', qb: 200, qd: 500, tmp: 100, ufVolume: 0.2, catatan: 'Sesi mulai berjalan lancar, pasien nyaman.' },
        { waktu: '09:15 WIB', tensi: '125/80', qb: 220, qd: 500, tmp: 95, ufVolume: 0.8, catatan: 'Keadaan umum baik.' }
      ]
    },
    {
      id: '2',
      pasienNama: 'Megawati Soekarno',
      noRM: 'RM-000109',
      mesinId: 'Mesin HD-03',
      frekuensiMingguan: 3,
      targetUFR: 3.0,
      durasiJam: 5,
      status: 'BERJALAN',
      dokterNama: 'dr. Sarah Sp.A',
      jamMulai: '08:30 WIB',
      checks: []
    },
  ])

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  // Sesi baru form
  const [showAddForm, setShowAddForm] = useState(false)
  const [nama, setNama] = useState('')
  const [noRM, setNoRM] = useState('')
  const [mesin, setMesin] = useState('Mesin HD-01')
  const [frek, setFrek] = useState(2)
  const [ufr, setUfr] = useState(2.0)
  const [durasi, setDurasi] = useState(4)

  // Cek Log form
  const [checkTensi, setCheckTensi] = useState('120/80')
  const [checkQb, setCheckQb] = useState(200)
  const [checkQd, setCheckQd] = useState(500)
  const [checkTmp, setCheckTmp] = useState(90)
  const [checkUf, setCheckUf] = useState(0.5)
  const [checkCatatan, setCheckCatatan] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama || !noRM) return

    const newSession: DialysisSession = {
      id: Date.now().toString(),
      pasienNama: nama,
      noRM,
      mesinId: mesin,
      frekuensiMingguan: frek,
      targetUFR: ufr,
      durasiJam: durasi,
      status: 'BERJALAN',
      dokterNama: 'dr. Sarah Sp.A',
      jamMulai: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      checks: []
    }

    setSessions([newSession, ...sessions])
    setShowAddForm(false)
    setNama('')
    setNoRM('')
  }

  const handleComplete = (id: string) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, status: 'SELESAI' } : s))
  }

  const handleAddCheck = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSessionId) return

    const newCheck: HDCheckLog = {
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      tensi: checkTensi,
      qb: checkQb,
      qd: checkQd,
      tmp: checkTmp,
      ufVolume: checkUf,
      catatan: checkCatatan
    }

    setSessions(sessions.map(s => {
      if (s.id === selectedSessionId) {
        return {
          ...s,
          checks: [...s.checks, newCheck]
        }
      }
      return s
    }))

    setCheckCatatan('')
  }

  const selectedSession = sessions.find(s => s.id === selectedSessionId)

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-zinc-100">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white">Modul Hemodialisa</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Jadwal cuci darah, pencatatan parameter ultrafiltrasi (UFR), QB (flow rate), dan status hemodinamik pasien.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-indigo-650 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Sesi Dialisis Baru</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 max-w-2xl animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-zinc-800">
            <span className="font-bold text-sm dark:text-white">Formulir Sesi Hemodialisis</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white">Batal</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nama Pasien</label>
              <input type="text" required value={nama} onChange={e => setNama(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nomor RM Pasien</label>
              <input type="text" required value={noRM} onChange={e => setNoRM(e.target.value)} placeholder="RM-xxxxxx" className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Alokasi Mesin</label>
              <select value={mesin} onChange={e => setMesin(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="Mesin HD-01">Mesin HD-01</option>
                <option value="Mesin HD-02">Mesin HD-02</option>
                <option value="Mesin HD-03">Mesin HD-03</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Frek / Minggu</label>
              <input type="number" required value={frek} onChange={e => setFrek(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Target UF (L)</label>
              <input type="number" step="0.1" required value={ufr} onChange={e => setUfr(parseFloat(e.target.value))} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Durasi (Jam)</label>
              <input type="number" required value={durasi} onChange={e => setDurasi(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <button type="submit" className="bg-indigo-650 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all">Mulai Sesi HD</button>
        </form>
      )}

      {/* Grid: Left lists, Right detailed checks */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Sessions log (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-bold font-display dark:text-white flex items-center gap-2">
            <Droplet className="h-5 w-5 text-indigo-500" />
            <span>Monitor Sesi Hemodialisa Hari Ini</span>
          </h3>

          <div className="space-y-4">
            {sessions.map(s => (
              <div
                key={s.id}
                onClick={() => setSelectedSessionId(s.id)}
                className={`glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all duration-300 flex flex-col justify-between space-y-4 hover:shadow-lg cursor-pointer ${
                  selectedSessionId === s.id
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : 'border-slate-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base dark:text-white">{s.pasienNama}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">RM: {s.noRM} &bull; {s.mesinId}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      s.status === 'BERJALAN' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse' : 'bg-zinc-100 dark:bg-zinc-800 text-slate-500'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/50">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase">Target UF</span>
                    <span className="font-bold dark:text-zinc-300">{s.targetUFR} Liter</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase">Durasi</span>
                    <span className="font-bold dark:text-zinc-300">{s.durasiJam} Jam</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase">Cek Keamanan</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{s.checks.length} Cek Terdaftar</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Supervisor: {s.dokterNama}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedSessionId(s.id) }}
                      className="text-[10px] font-bold text-indigo-650 hover:text-indigo-550 flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1.5 rounded-lg"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Cek & Pantau
                    </button>
                    {s.status === 'BERJALAN' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleComplete(s.id) }}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        Selesai
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Detailed parameter log & entry form (5 cols) */}
        <div className="lg:col-span-5">
          {selectedSession ? (
            <div className="space-y-6">
              
              {/* Form to insert new check log */}
              {selectedSession.status === 'BERJALAN' && (
                <form onSubmit={handleAddCheck} className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 animate-fade-in text-xs">
                  <h4 className="font-bold text-sm dark:text-white flex items-center gap-2">
                    <Clipboard className="h-4.5 w-4.5 text-indigo-500" />
                    <span>Input Cek Hemodialisa Baru</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500">Catat parameter mesin HD & hemodinamik pasien secara periodik.</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Tekanan Darah</label>
                      <input type="text" required value={checkTensi} onChange={e => setCheckTensi(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">QB (mL/min)</label>
                      <input type="number" required value={checkQb} onChange={e => setCheckQb(parseInt(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">QD (mL/min)</label>
                      <input type="number" required value={checkQd} onChange={e => setCheckQd(parseInt(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">TMP (mmHg)</label>
                      <input type="number" required value={checkTmp} onChange={e => setCheckTmp(parseInt(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">UF Vol (L)</label>
                      <input type="number" step="0.1" required value={checkUf} onChange={e => setCheckUf(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Catatan Observasi</label>
                    <input type="text" value={checkCatatan} onChange={e => setCheckCatatan(e.target.value)} placeholder="Pasien tidak ada keluhan / pusing" className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
                  </div>

                  <button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl">Simpan Log Hasil Cek</button>
                </form>
              )}

              {/* History list of checks */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm dark:text-white flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-indigo-500" />
                  <span>Histori Pemantauan ({selectedSession.pasienNama})</span>
                </h4>

                {selectedSession.checks.length === 0 ? (
                  <div className="glass-panel p-6 text-center text-xs text-slate-400 dark:text-zinc-500 rounded-2xl">
                    Belum ada log hasil cek untuk sesi ini.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {selectedSession.checks.map((chk, i) => (
                      <div key={i} className="glass-panel p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 space-y-2 text-[11px] animate-fade-in">
                        <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-zinc-800/80">
                          <span className="font-bold text-indigo-650 dark:text-indigo-400">{chk.waktu}</span>
                          <span className="text-slate-400 font-semibold">Tensi: {chk.tensi}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 font-mono text-[10px] text-slate-650 dark:text-zinc-300">
                          <div>QB: {chk.qb}</div>
                          <div>QD: {chk.qd}</div>
                          <div>TMP: {chk.tmp}</div>
                          <div>UF: {chk.ufVolume}L</div>
                        </div>
                        {chk.catatan && (
                          <p className="text-slate-500 dark:text-zinc-400 italic mt-1">&quot;{chk.catatan}&quot;</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center rounded-3xl bg-slate-50 dark:bg-zinc-900/10 border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 text-sm">
              <Clipboard className="h-10 w-10 text-slate-350 dark:text-zinc-700 mx-auto mb-4" />
              Pilih salah satu sesi dialisis di sebelah kiri untuk melihat hasil pemantauan parameter dialisis atau mencatat hasil pengecekan baru.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
