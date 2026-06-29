'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HeartPulse, Plus, Search, Heart, User, Clipboard, CheckCircle, ArrowRight, Eye } from 'lucide-react'
import {
  getIGDPatients,
  setIGDPatients,
  dischargeIGDPatient,
  transferIGDToInpatient,
  IGDRecord
} from '@/lib/medicalStore'

export default function RawatDaruratPage() {
  const [patients, setPatients] = useState<IGDRecord[]>([])
  
  useEffect(() => {
    setPatients(getIGDPatients())
  }, [])

  const refreshList = () => {
    setPatients(getIGDPatients())
  }

  const [showAddForm, setShowAddForm] = useState(false)
  const [nama, setNama] = useState('')
  const [triage, setTriage] = useState<'MERAH' | 'KUNING' | 'HIJAU' | 'HITAM'>('HIJAU')
  const [keluhan, setKeluhan] = useState('')
  const [suhu, setSuhu] = useState(36.5)
  const [tensi, setTensi] = useState('120/80')
  const [nadi, setNadi] = useState(80)
  const [bed, setBed] = useState('Bed Observasi 1')
  const [dokter, setDokter] = useState('dr. Budi Setiawan')

  // Transfer Form Modal
  const [transferId, setTransferId] = useState<string | null>(null)
  const [ruangNama, setRuangNama] = useState('Ruang Melati')
  const [kelas, setKelas] = useState<'VIP' | 'KELAS_1' | 'KELAS_2' | 'KELAS_3'>('KELAS_3')
  const [bedNo, setBedNo] = useState('B1')

  // Discharge Form Modal
  const [dischargeId, setDischargeId] = useState<string | null>(null)
  const [dischargeFee, setDischargeFee] = useState(250000)

  const [success, setSuccess] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama || !keluhan) return
    
    const newPat: IGDRecord = {
      id: `igd-${Date.now()}`,
      pasienNama: nama,
      noRM: `RM-2600${Math.floor(Math.random() * 90) + 10}`,
      triage,
      keluhan,
      suhu,
      tensi,
      nadi,
      bed,
      dokterNama: dokter,
      waktuMasuk: 'Baru saja',
      status: 'DIRAWAT',
      visits: []
    }

    const updated = [newPat, ...getIGDPatients()]
    setIGDPatients(updated)
    refreshList()

    setShowAddForm(false)
    setNama('')
    setKeluhan('')
    setSuccess('Registrasi pasien IGD berhasil!')
    setTimeout(() => setSuccess(''), 4000)
  }

  const handleDischargeTrigger = (e: React.FormEvent) => {
    e.preventDefault()
    if (!dischargeId) return
    dischargeIGDPatient(dischargeId, dischargeFee)
    setDischargeId(null)
    refreshList()
    setSuccess('Pasien IGD dipulangkan. Tagihan dikirim ke kasir.')
    setTimeout(() => setSuccess(''), 4000)
  }

  const handleTransferTrigger = (e: React.FormEvent) => {
    e.preventDefault()
    if (!transferId) return
    transferIGDToInpatient(transferId, ruangNama, kelas, bedNo, 350000)
    setTransferId(null)
    refreshList()
    setSuccess('Pasien ditransfer ke rawat inap. Tagihan IGD dikirim ke kasir.')
    setTimeout(() => setSuccess(''), 4000)
  }

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-zinc-100">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white">Rawat Darurat (IGD) & Penunjang</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Sistem triage digital IGD, monitoring pasien kritis, dan rujukan cepat.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-red-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Registrasi Pasien IGD</span>
        </button>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs p-4 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAdd} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 max-w-2xl animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-slate-205 dark:border-zinc-800">
            <span className="font-bold text-sm text-red-650 dark:text-red-400">Registrasi IGD / Triage Baru</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white">Batal</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nama Pasien</label>
              <input type="text" required value={nama} onChange={e => setNama(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Skala Triage</label>
              <select value={triage} onChange={e => setTriage(e.target.value as any)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold">
                <option value="MERAH">MERAH (Resusitasi/Gawat Darurat)</option>
                <option value="KUNING">KUNING (Urgent/Semi-Gawat)</option>
                <option value="HIJAU">HIJAU (Non-Urgent)</option>
                <option value="HITAM">HITAM (Meninggal)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Keluhan / Trauma Utama</label>
            <input type="text" required value={keluhan} onChange={e => setKeluhan(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Suhu (°C)</label>
              <input type="number" step="0.1" value={suhu} onChange={e => setSuhu(parseFloat(e.target.value))} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Tekanan Darah (mmHg)</label>
              <input type="text" value={tensi} onChange={e => setTensi(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nadi (BPM)</label>
              <input type="number" value={nadi} onChange={e => setNadi(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Alokasi Bed</label>
              <input type="text" value={bed} onChange={e => setBed(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Dokter Penanggung Jawab</label>
              <select value={dokter} onChange={e => setDokter(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="dr. Budi Setiawan">dr. Budi Setiawan</option>
                <option value="dr. Sarah Sp.A">dr. Sarah Sp.A</option>
              </select>
            </div>
          </div>
          <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all">Daftarkan & Triage</button>
        </form>
      )}

      {/* Transfer Form Modal */}
      {transferId && (
        <form onSubmit={handleTransferTrigger} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 max-w-xl animate-fade-in">
          <h3 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">Transfer Pasien ke Rawat Inap</h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nama Ruangan</label>
              <select value={ruangNama} onChange={e => setRuangNama(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="Ruang Melati">Ruang Melati</option>
                <option value="Ruang Flamboyan">Ruang Flamboyan</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Kelas Kamar</label>
              <select value={kelas} onChange={e => setKelas(e.target.value as any)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="VIP">VIP</option>
                <option value="KELAS_1">KELAS 1</option>
                <option value="KELAS_2">KELAS 2</option>
                <option value="KELAS_3">KELAS 3</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Bed No.</label>
              <input type="text" required value={bedNo} onChange={e => setBedNo(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl">Konfirmasi Transfer</button>
            <button type="button" onClick={() => setTransferId(null)} className="text-xs text-slate-400 hover:text-slate-600 px-3">Batal</button>
          </div>
        </form>
      )}

      {/* Discharge Form Modal */}
      {dischargeId && (
        <form onSubmit={handleDischargeTrigger} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 max-w-xl animate-fade-in">
          <h3 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Pulangkan Pasien dari IGD</h3>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Total Biaya Tindakan & Obat (Rp)</label>
            <input type="number" value={dischargeFee} onChange={e => setDischargeFee(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl">Pulangkan & Kirim Bill</button>
            <button type="button" onClick={() => setDischargeId(null)} className="text-xs text-slate-400 hover:text-slate-600 px-3">Batal</button>
          </div>
        </form>
      )}

      {/* Triage Live Board */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display dark:text-white flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-red-500 animate-pulse" />
          <span>Monitor Pasien IGD Aktif</span>
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {patients.filter(p => p.status === 'DIRAWAT').map(p => (
            <div
              key={p.id}
              className={[
                'glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all duration-300 flex flex-col justify-between space-y-4 hover:shadow-lg',
                p.triage === 'MERAH' ? 'border-red-500/30 dark:border-red-500/20 shadow-md shadow-red-500/5' :
                p.triage === 'KUNING' ? 'border-amber-500/30 dark:border-amber-500/20' :
                p.triage === 'HIJAU' ? 'border-emerald-500/30 dark:border-emerald-500/20' : 'border-zinc-800'
              ].join(' ')}
            >
              <div className="flex justify-between items-start">
                <span className={[
                  'text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border',
                  p.triage === 'MERAH' ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 animate-pulse' :
                  p.triage === 'KUNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' :
                  p.triage === 'HIJAU' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                  'bg-zinc-850 border-zinc-800 text-zinc-400'
                ].join(' ')}>
                  TRIAGE {p.triage}
                </span>

                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">{p.waktuMasuk}</span>
              </div>

              <div>
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-base dark:text-white flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    {p.pasienNama}
                  </h4>
                  <Link href={`/rawat-darurat/${p.id}`} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Detail & Visit
                  </Link>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                  {p.keluhan}
                </p>
              </div>

              {/* Vital signs */}
              <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/50">
                <div>
                  <span className="text-slate-400 block uppercase font-bold">TD</span>
                  <span className="font-bold dark:text-zinc-300">{p.tensi} mmHg</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold">Nadi</span>
                  <span className="font-bold dark:text-zinc-300">{p.nadi} BPM</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold">Suhu</span>
                  <span className="font-bold dark:text-zinc-300">{p.suhu} °C</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-400 gap-2">
                <div className="min-w-0">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Bed & DPJP</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300 block truncate">{p.bed} &bull; {p.dokterNama}</span>
                </div>
                
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => setTransferId(p.id)} className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-slate-100 dark:border-zinc-850" title="Transfer Ke Rawat Inap">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDischargeId(p.id)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-slate-100 dark:border-zinc-850" title="Pulangkan">
                    <CheckCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
