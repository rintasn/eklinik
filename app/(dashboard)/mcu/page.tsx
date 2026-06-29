'use client'

import { useState } from 'react'
import { FileSpreadsheet, Plus, Search, CheckCircle, FileText, User, Award, ShieldAlert } from 'lucide-react'

interface MCUPackage {
  id: string
  nama: string
  harga: number
  itemTes: string[]
}

interface MCUPatient {
  id: string
  pasienNama: string
  noRM: string
  paketNama: string
  statusLaboratorium: 'PENDING' | 'SELESAI'
  statusRadiologi: 'PENDING' | 'SELESAI' | 'TIDAK_ADA'
  statusFisik: 'PENDING' | 'SELESAI'
  kesimpulan: string
  tanggalTes: string
  statusSelesai: boolean
}

export default function MCUPage() {
  const [packages] = useState<MCUPackage[]>([
    { id: '1', nama: 'Paket Basic Healthy', harga: 250000, itemTes: ['Pemeriksaan Fisik', 'Darah Rutin', 'Urine Lengkap'] },
    { id: '2', nama: 'Paket Executive Gold', harga: 750000, itemTes: ['Pemeriksaan Fisik', 'Darah Rutin', 'Kolesterol Lengkap', 'Gula Darah', 'EKG Jantung', 'Rontgen Thorax'] },
    { id: '3', nama: 'Paket Premium Platinum', harga: 1500000, itemTes: ['Pemeriksaan Fisik', 'Lab Lengkap', 'Rontgen Thorax', 'USG Abdomen', 'EKG & Treadmill Jantung'] },
  ])

  const [patients, setPatients] = useState<MCUPatient[]>([
    { id: '1', pasienNama: 'Ahmad Syarif', noRM: 'RM-000101', paketNama: 'Paket Basic Healthy', statusLaboratorium: 'SELESAI', statusRadiologi: 'TIDAK_ADA', statusFisik: 'SELESAI', kesimpulan: 'Sehat secara klinis, kolesterol terpantau batas normal atas.', tanggalTes: '2026-06-28', statusSelesai: true },
    { id: '2', pasienNama: 'Budi Santoso', noRM: 'RM-000102', paketNama: 'Paket Executive Gold', statusLaboratorium: 'PENDING', statusRadiologi: 'SELESAI', statusFisik: 'SELESAI', kesimpulan: 'Menunggu hasil lab darah lengkap.', tanggalTes: '2026-06-29', statusSelesai: false },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [nama, setNama] = useState('')
  const [noRM, setNoRM] = useState('')
  const [selectedPaket, setSelectedPaket] = useState('Paket Basic Healthy')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama || !noRM) return

    const newMCU: MCUPatient = {
      id: Date.now().toString(),
      pasienNama: nama,
      noRM,
      paketNama: selectedPaket,
      statusLaboratorium: 'PENDING',
      statusRadiologi: selectedPaket === 'Paket Basic Healthy' ? 'TIDAK_ADA' : 'PENDING',
      statusFisik: 'PENDING',
      kesimpulan: 'Proses pemeriksaan fisik & penunjang.',
      tanggalTes: new Date().toISOString().split('T')[0],
      statusSelesai: false,
    }

    setPatients([newMCU, ...patients])
    setShowAddForm(false)
    setNama('')
    setNoRM('')
  }

  const handleCompleteMCU = (id: string, kesimpulan: string) => {
    setPatients(patients.map(p => p.id === id ? {
      ...p,
      statusLaboratorium: 'SELESAI',
      statusRadiologi: p.statusRadiologi === 'PENDING' ? 'SELESAI' : p.statusRadiologi,
      statusFisik: 'SELESAI',
      kesimpulan,
      statusSelesai: true
    } : p))
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white">Modul Medical Check Up (MCU)</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Kelola paket skrining kesehatan, input hasil pemeriksaan fisik/penunjang, dan cetak sertifikat fit/unfit.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Registrasi MCU Baru</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 max-w-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-zinc-800">
            <span className="font-bold text-sm dark:text-white">Registrasi Skrining MCU Baru</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white">Batal</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nama Lengkap Pasien</label>
              <input type="text" required value={nama} onChange={e => setNama(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nomor RM Pasien</label>
              <input type="text" required value={noRM} onChange={e => setNoRM(e.target.value)} placeholder="RM-xxxxxx" className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Paket Pemeriksaan MCU</label>
            <select value={selectedPaket} onChange={e => setSelectedPaket(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.nama}>{pkg.nama} - Rp {pkg.harga.toLocaleString('id-ID')}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all">Submit MCU</button>
        </form>
      )}

      {/* Package grid lists */}
      <div className="grid md:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div key={pkg.id} className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Paket Skrining</span>
              <h4 className="font-bold text-base dark:text-white mt-1">{pkg.nama}</h4>
              <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mt-2">Rp {pkg.harga.toLocaleString('id-ID')}</p>
            </div>
            <div className="space-y-1 text-xs">
              <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase block tracking-wider">Item Pemeriksaan:</span>
              <ul className="list-disc pl-4 text-slate-500 dark:text-zinc-400 space-y-0.5">
                {pkg.itemTes.map((tes, i) => <li key={i}>{tes}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Inpatient checkups list */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-indigo-500" />
          <span>Monitor Status Pasien MCU</span>
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {patients.map(p => (
            <div key={p.id} className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-base dark:text-white">{p.pasienNama}</h4>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">RM: {p.noRM} &bull; {p.paketNama}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  p.statusSelesai ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                }`}>
                  {p.statusSelesai ? 'Selesai & Fit' : 'Dalam Proses'}
                </span>
              </div>

              {/* Status parameters */}
              <div className="grid grid-cols-3 gap-2 text-[10px] border-y border-slate-100 dark:border-zinc-800/80 py-3">
                <div>
                  <span className="text-slate-400 block font-bold">Fisik</span>
                  <span className={`font-bold ${p.statusFisik === 'SELESAI' ? 'text-emerald-500' : 'text-slate-400'}`}>{p.statusFisik}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Lab Darah</span>
                  <span className={`font-bold ${p.statusLaboratorium === 'SELESAI' ? 'text-emerald-500' : 'text-slate-400'}`}>{p.statusLaboratorium}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Radiologi</span>
                  <span className={`font-bold ${p.statusRadiologi === 'SELESAI' ? 'text-emerald-500' : p.statusRadiologi === 'TIDAK_ADA' ? 'text-slate-500' : 'text-slate-400'}`}>{p.statusRadiologi}</span>
                </div>
              </div>

              <div className="text-xs">
                <span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Kesimpulan Klinis / Rujukan</span>
                <p className="text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/50">
                  {p.kesimpulan}
                </p>
              </div>

              {!p.statusSelesai && (
                <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/50 flex justify-end">
                  <button
                    onClick={() => handleCompleteMCU(p.id, 'Pasien dinyatakan sehat / FIT TO WORK untuk posisi administrasi.')}
                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    Rilis Hasil & Cetak Fit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
