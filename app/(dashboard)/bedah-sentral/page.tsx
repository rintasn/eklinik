'use client'

import { useState } from 'react'
import { Scissors, Plus, Search, Calendar, CheckCircle, Clock, Heart, Award, Eye, Clipboard, FileText } from 'lucide-react'

interface SurgeryCheckLog {
  kategori: 'PRE_OP' | 'ANESTESI' | 'TINDAKAN_BEDAH' | 'PASCA_OP'
  waktu: string
  pemeriksa: string
  hasil: string
}

interface Surgery {
  id: string
  pasienNama: string
  noRM: string
  jenisTindakan: string
  kategori: 'MAYOR' | 'MINOR' | 'MODERAT'
  ruangBedah: string
  dokterBedah: string
  dokterAnestesi: string
  tanggal: string
  jam: string
  status: 'DIPERSIAPKAN' | 'SEDANG_BERLANGSUNG' | 'SELESAI'
  checks: SurgeryCheckLog[]
}

export default function BedahSentralPage() {
  const [surgeries, setSurgeries] = useState<Surgery[]>([
    {
      id: '1',
      pasienNama: 'Budi Santoso',
      noRM: 'RM-000101',
      jenisTindakan: 'Appendectomy (Usus Buntu)',
      kategori: 'MODERAT',
      ruangBedah: 'OK-01 (Kamar Bedah Utama)',
      dokterBedah: 'dr. Sarah Sp.A',
      dokterAnestesi: 'dr. Hendra Sp.OG',
      tanggal: '2026-06-30',
      jam: '08:00',
      status: 'DIPERSIAPKAN',
      checks: [
        { kategori: 'PRE_OP', waktu: '2026-06-30 07:30', pemeriksa: 'Ners Dian', hasil: 'Pasien telah puasa 8 jam. Tanda vital stabil. Inform consent lengkap.' }
      ]
    },
    {
      id: '2',
      pasienNama: 'Dewi Lestari',
      noRM: 'RM-000103',
      jenisTindakan: 'Herniotomy unilateral',
      kategori: 'MINOR',
      ruangBedah: 'OK-02 (Kamar Bedah Minor)',
      dokterBedah: 'dr. Rian Hidayat',
      dokterAnestesi: 'dr. Hendra Sp.OG',
      tanggal: '2026-06-30',
      jam: '10:30',
      status: 'DIPERSIAPKAN',
      checks: []
    },
  ])

  const [selectedSurgeryId, setSelectedSurgeryId] = useState<string | null>(null)

  // Surgery Form States
  const [showAddForm, setShowAddForm] = useState(false)
  const [nama, setNama] = useState('')
  const [noRM, setNoRM] = useState('')
  const [tindakan, setTindakan] = useState('')
  const [katBedah, setKatBedah] = useState<'MAYOR' | 'MINOR' | 'MODERAT'>('MODERAT')
  const [ruang, setRuang] = useState('OK-01')
  const [dokterB, setDokterB] = useState('dr. Rian Hidayat')
  const [dokterA, setDokterA] = useState('dr. Hendra Sp.OG')
  const [tgl, setTgl] = useState('')
  const [jam, setJam] = useState('')

  // Check Log Form States
  const [checkKat, setCheckKat] = useState<'PRE_OP' | 'ANESTESI' | 'TINDAKAN_BEDAH' | 'PASCA_OP'>('PRE_OP')
  const [checkPemeriksa, setCheckPemeriksa] = useState('dr. Sarah Sp.A')
  const [checkHasil, setCheckHasil] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama || !tgl || !jam || !tindakan) return

    const newSurgery: Surgery = {
      id: Date.now().toString(),
      pasienNama: nama,
      noRM,
      jenisTindakan: tindakan,
      kategori: katBedah,
      ruangBedah: ruang,
      dokterBedah: dokterB,
      dokterAnestesi: dokterA,
      tanggal: tgl,
      jam: jam,
      status: 'DIPERSIAPKAN',
      checks: []
    }

    setSurgeries([newSurgery, ...surgeries])
    setShowAddForm(false)
    setNama('')
    setNoRM('')
    setTindakan('')
  }

  const handleStatusChange = (id: string, newStatus: 'SEDANG_BERLANGSUNG' | 'SELESAI') => {
    setSurgeries(surgeries.map(s => s.id === id ? { ...s, status: newStatus } : s))
  }

  const handleAddCheck = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSurgeryId || !checkHasil) return

    const newCheck: SurgeryCheckLog = {
      kategori: checkKat,
      waktu: new Date().toISOString().replace('T', ' ').substring(0, 16),
      pemeriksa: checkPemeriksa,
      hasil: checkHasil
    }

    setSurgeries(surgeries.map(s => {
      if (s.id === selectedSurgeryId) {
        return {
          ...s,
          checks: [...s.checks, newCheck]
        }
      }
      return s
    }))

    setCheckHasil('')
  }

  const selectedSurgery = surgeries.find(s => s.id === selectedSurgeryId)

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-zinc-100">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white">Modul Bedah Sentral</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Penjadwalan operasi, monitoring ruang bedah (OK), alokasi tim bedah & anestesi secara real-time.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Jadwalkan Operasi</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 max-w-2xl animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-zinc-800">
            <span className="font-bold text-sm dark:text-white">Jadwal Operasi Baru</span>
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
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Jenis Tindakan Bedah</label>
              <input type="text" required value={tindakan} onChange={e => setTindakan(e.target.value)} placeholder="Appendectomy / Hernia / dll." className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Kategori Bedah</label>
              <select value={katBedah} onChange={e => setKatBedah(e.target.value as any)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="MINOR">MINOR (Risiko Rendah)</option>
                <option value="MODERAT">MODERAT (Risiko Sedang)</option>
                <option value="MAYOR">MAYOR (Risiko Tinggi)</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Ruang Operasi (OK)</label>
              <select value={ruang} onChange={e => setRuang(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="OK-01 (Bedah Utama)">OK-01</option>
                <option value="OK-02 (Bedah Minor)">OK-02</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Dokter Operator (Bedah)</label>
              <select value={dokterB} onChange={e => setDokterB(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="dr. Rian Hidayat">dr. Rian Hidayat</option>
                <option value="dr. Sarah Sp.A">dr. Sarah Sp.A</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Dokter Anestesi</label>
              <select value={dokterA} onChange={e => setDokterA(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="dr. Hendra Sp.OG">dr. Hendra Sp.OG</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Tanggal Operasi</label>
              <input type="date" required value={tgl} onChange={e => setTgl(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Jam Mulai</label>
              <input type="time" required value={jam} onChange={e => setJam(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <button type="submit" className="bg-indigo-650 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all">Submit Jadwal Bedah</button>
        </form>
      )}

      {/* Grid: Left schedules, Right detailed check logging */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Live Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-bold font-display dark:text-white flex items-center gap-2">
            <Scissors className="h-5 w-5 text-indigo-500" />
            <span>Jadwal Ruang Bedah Aktif</span>
          </h3>

          <div className="space-y-4">
            {surgeries.map(s => (
              <div
                key={s.id}
                onClick={() => setSelectedSurgeryId(s.id)}
                className={`glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all duration-300 flex flex-col justify-between space-y-4 hover:shadow-lg cursor-pointer ${
                  selectedSurgeryId === s.id
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : 'border-slate-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
                    s.kategori === 'MAYOR' ? 'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/50 text-red-650 dark:text-red-400 animate-pulse' :
                    s.kategori === 'MODERAT' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400' :
                    'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    Kategori {s.kategori}
                  </span>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                    s.status === 'SELESAI' ? 'bg-zinc-100 dark:bg-zinc-800 text-slate-500' :
                    s.status === 'SEDANG_BERLANGSUNG' ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' :
                    'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50'
                  }`}>
                    {s.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base dark:text-white">{s.pasienNama}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">RM: {s.noRM}</p>
                  <div className="text-xs font-semibold text-indigo-650 dark:text-indigo-400 mt-2 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                    Tindakan: {s.jenisTindakan}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-zinc-800/80 text-[11px] text-slate-500">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-400">Tim Medis Bedah</span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">Op: {s.dokterBedah}</span>
                    <span className="block text-slate-500">An: {s.dokterAnestesi}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-400">Ruangan & Waktu</span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-300 block">{s.ruangBedah}</span>
                    <span className="text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {s.tanggal} ({s.jam})
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-205 dark:border-zinc-800/50 flex justify-between items-center text-xs">
                  <span className="text-slate-400">{s.checks.length} Catatan Pemeriksaan</span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedSurgeryId(s.id) }}
                      className="text-[10px] font-bold text-indigo-650 hover:text-indigo-550 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 rounded-lg"
                    >
                      <Eye className="h-3.5 w-3.5" /> Catatan & Laporan
                    </button>
                    {s.status === 'DIPERSIAPKAN' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(s.id, 'SEDANG_BERLANGSUNG') }}
                        className="text-[10px] font-bold text-red-655 hover:text-red-500 bg-red-50 dark:bg-red-950/20 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        Mulai Bedah
                      </button>
                    )}
                    {s.status === 'SEDANG_BERLANGSUNG' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(s.id, 'SELESAI') }}
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

        {/* Right Side: Catatan/Pemeriksaan log (5 cols) */}
        <div className="lg:col-span-5">
          {selectedSurgery ? (
            <div className="space-y-6">
              
              {/* Form to insert new check log */}
              {selectedSurgery.status !== 'SELESAI' && (
                <form onSubmit={handleAddCheck} className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 animate-fade-in text-xs">
                  <h4 className="font-bold text-sm dark:text-white flex items-center gap-2">
                    <Clipboard className="h-4.5 w-4.5 text-indigo-500" />
                    <span>Laporan Tindakan / Anestesi</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Tahap Pemeriksaan</label>
                      <select value={checkKat} onChange={e => setCheckKat(e.target.value as any)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                        <option value="PRE_OP">Pre-Operatif Checklist</option>
                        <option value="ANESTESI">Catatan Anestesi</option>
                        <option value="TINDAKAN_BEDAH">Laporan Tindakan Bedah</option>
                        <option value="PASCA_OP">Pasca-Operatif (Recovery)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Pemeriksa</label>
                      <input type="text" required value={checkPemeriksa} onChange={e => setCheckPemeriksa(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Keterangan / Temuan Medis</label>
                    <textarea required value={checkHasil} onChange={e => setCheckHasil(e.target.value)} rows={3} placeholder="Tanda vital selama anestesi, detail insisi, temuan jaringan patologis, dsb..." className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none resize-none" />
                  </div>

                  <button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl">Posting Laporan Medis</button>
                </form>
              )}

              {/* History list of checks */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm dark:text-white flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-indigo-500" />
                  <span>Histori Laporan Bedah ({selectedSurgery.pasienNama})</span>
                </h4>

                {selectedSurgery.checks.length === 0 ? (
                  <div className="glass-panel p-6 text-center text-xs text-slate-400 dark:text-zinc-500 rounded-2xl">
                    Belum ada laporan medis tercatat untuk operasi ini.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {selectedSurgery.checks.map((chk, i) => (
                      <div key={i} className="glass-panel p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 space-y-2 text-[11px] animate-fade-in">
                        <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-zinc-800/80">
                          <span className="font-bold text-indigo-650 dark:text-indigo-400">{chk.pemeriksa}</span>
                          <span className="text-[10px] font-mono text-slate-400">{chk.waktu}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border inline-block ${
                          chk.kategori === 'PRE_OP' ? 'bg-zinc-100 dark:bg-zinc-800 text-slate-600' :
                          chk.kategori === 'ANESTESI' ? 'bg-cyan-500/10 text-cyan-400' :
                          chk.kategori === 'TINDAKAN_BEDAH' ? 'bg-red-500/10 text-red-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {chk.kategori.replace('_', ' ')}
                        </span>
                        <p className="text-slate-700 dark:text-zinc-300 font-medium whitespace-pre-line mt-1 bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-850/80">
                          {chk.hasil}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center rounded-3xl bg-slate-50 dark:bg-zinc-900/10 border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 text-sm">
              <Clipboard className="h-10 w-10 text-slate-350 dark:text-zinc-700 mx-auto mb-4" />
              Pilih salah satu jadwal operasi di sebelah kiri untuk melihat catatan medis tindakan atau menginput laporan pembedahan/anestesi baru.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
