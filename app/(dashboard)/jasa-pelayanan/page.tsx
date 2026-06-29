'use client'

import { useState } from 'react'
import { Coins, Plus, Search, CheckCircle, FileText, Landmark, User, Award } from 'lucide-react'

interface MedicalFee {
  id: string
  tindakanNama: string
  tarifTotal: number
  porsiDokterPercent: number
  porsiPerawatPercent: number
  porsiKlinikPercent: number
}

interface DoctorLedger {
  id: string
  dokterNama: string
  totalJasaMedis: number
  jumlahTindakan: number
  statusBayar: 'LUNAS' | 'PENDING'
}

export default function JasaPelayananPage() {
  const [fees, setFees] = useState<MedicalFee[]>([
    { id: '1', tindakanNama: 'Konsultasi Medis Dokter Spesialis', tarifTotal: 150000, porsiDokterPercent: 60, porsiPerawatPercent: 10, porsiKlinikPercent: 30 },
    { id: '2', tindakanNama: 'Ekstraksi Gigi Minor (Cabut Gigi)', tarifTotal: 250000, porsiDokterPercent: 55, porsiPerawatPercent: 15, porsiKlinikPercent: 30 },
    { id: '3', tindakanNama: 'Pemasangan EKG Jantung & Baca Hasil', tarifTotal: 120000, porsiDokterPercent: 50, porsiPerawatPercent: 20, porsiKlinikPercent: 30 },
  ])

  const [ledger, setLedger] = useState<DoctorLedger[]>([
    { id: '1', dokterNama: 'dr. Sarah Sp.A', totalJasaMedis: 3450000, jumlahTindakan: 38, statusBayar: 'PENDING' },
    { id: '2', dokterNama: 'drg. Amelia Putri', totalJasaMedis: 2850000, jumlahTindakan: 19, statusBayar: 'LUNAS' },
    { id: '3', dokterNama: 'dr. Rian Hidayat', totalJasaMedis: 4120000, jumlahTindakan: 52, statusBayar: 'PENDING' },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [tindakan, setTindakan] = useState('')
  const [total, setTotal] = useState(100000)
  const [dokterP, setDokterP] = useState(60)
  const [perawatP, setPerawatP] = useState(10)
  const [klinikP, setKlinikP] = useState(30)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tindakan) return

    const newFee: MedicalFee = {
      id: Date.now().toString(),
      tindakanNama: tindakan,
      tarifTotal: total,
      porsiDokterPercent: dokterP,
      porsiPerawatPercent: perawatP,
      porsiKlinikPercent: klinikP,
    }

    setFees([...fees, newFee])
    setShowAddForm(false)
    setTindakan('')
  }

  const handleDisburse = (id: string) => {
    setLedger(ledger.map(l => l.id === id ? { ...l, statusBayar: 'LUNAS' } : l))
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white">Modul Jasa Pelayanan</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Sistem bagi hasil Jasa Medis (JM) dokter spesialis, perawat penunjang, serta fee tindakan rawat jalan.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Config Porsi JM</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 max-w-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-zinc-800">
            <span className="font-bold text-sm dark:text-white">Konfigurasi Pembagian Jasa Medis Baru</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white">Batal</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nama Tindakan / Layanan</label>
              <input type="text" required value={tindakan} onChange={e => setTindakan(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Tarif Layanan Total (Rp)</label>
              <input type="number" required value={total} onChange={e => setTotal(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Porsi Dokter (%)</label>
              <input type="number" required value={dokterP} onChange={e => setDokterP(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Porsi Perawat (%)</label>
              <input type="number" required value={perawatP} onChange={e => setPerawatP(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Porsi Klinik (%)</label>
              <input type="number" required value={klinikP} onChange={e => setKlinikP(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all">Simpan Config</button>
        </form>
      )}

      {/* Grid displays for Action distributions */}
      <div className="grid md:grid-cols-3 gap-6">
        {fees.map(f => (
          <div key={f.id} className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block">Tarif Bagi Hasil</span>
              <h4 className="font-bold text-xs dark:text-white mt-1 h-8 line-clamp-2">{f.tindakanNama}</h4>
              <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mt-2">Rp {f.tarifTotal.toLocaleString('id-ID')}</p>
            </div>
            
            <div className="space-y-1.5 text-xs border-t border-slate-100 dark:border-zinc-800/80 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Share Dokter:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">{f.porsiDokterPercent}% (Rp {((f.porsiDokterPercent / 100) * f.tarifTotal).toLocaleString('id-ID')})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Share Perawat:</span>
                <span className="font-semibold text-cyan-600 dark:text-cyan-400 font-mono">{f.porsiPerawatPercent}% (Rp {((f.porsiPerawatPercent / 100) * f.tarifTotal).toLocaleString('id-ID')})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Klinik:</span>
                <span className="font-semibold text-slate-600 dark:text-zinc-400 font-mono">{f.porsiKlinikPercent}% (Rp {((f.porsiKlinikPercent / 100) * f.tarifTotal).toLocaleString('id-ID')})</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor fee ledger */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display dark:text-white flex items-center gap-2">
          <Coins className="h-5 w-5 text-indigo-500" />
          <span>Rekap Akumulasi Jasa Medis (Bulan Ini)</span>
        </h3>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950 text-slate-400 dark:text-zinc-500 border-b border-slate-200 dark:border-zinc-800">
                <th className="p-4 font-bold uppercase">Nama Tenaga Medis</th>
                <th className="p-4 font-bold uppercase">Jumlah Tindakan</th>
                <th className="p-4 font-bold uppercase">Total Jasa Medis</th>
                <th className="p-4 font-bold uppercase">Status Pencairan</th>
                <th className="p-4 font-bold uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/85">
              {ledger.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/20 transition-all">
                  <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    {l.dokterNama}
                  </td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-zinc-300">{l.jumlahTindakan} Tindakan</td>
                  <td className="p-4 font-bold text-slate-800 dark:text-white">Rp {l.totalJasaMedis.toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                      l.statusBayar === 'LUNAS' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                    }`}>
                      {l.statusBayar}
                    </span>
                  </td>
                  <td className="p-4">
                    {l.statusBayar === 'PENDING' && (
                      <button
                        onClick={() => handleDischarge(l.id)} // reusing disburse callback
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        Cairkan Jasa Medis
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
  
  // disburse helper matching disburse function name
  function handleDischarge(id: string) {
    handleDisburse(id)
  }
}
