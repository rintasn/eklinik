'use client'

import { useState } from 'react'
import { FlaskConical, Plus, Search, CheckCircle, FileText, Activity, ShieldAlert } from 'lucide-react'

interface LabOrder {
  id: string
  pasienNama: string
  noRM: string
  tipeTes: 'LABORATORIUM' | 'RADIOLOGI'
  namaTes: string
  nilaiHasil?: string
  status: 'MENUNGGU_SAMPEL' | 'PROSES' | 'SELESAI'
  dokterPerujuk: string
  tanggalOrder: string
}

export default function PenunjangPage() {
  const [orders, setOrders] = useState<LabOrder[]>([
    { id: '1', pasienNama: 'Ahmad Syarif', noRM: 'RM-000101', tipeTes: 'LABORATORIUM', namaTes: 'Darah Rutin (Hb, Leukosit, Trombosit)', nilaiHasil: '', status: 'PROSES', dokterPerujuk: 'dr. Rian Hidayat', tanggalOrder: '2026-06-29' },
    { id: '2', pasienNama: 'Budi Santoso', noRM: 'RM-000102', tipeTes: 'RADIOLOGI', namaTes: 'Rontgen Thorax AP/PA', nilaiHasil: 'Cor & Pulmo dalam batas normal, tidak tampak infiltrat.', status: 'SELESAI', dokterPerujuk: 'dr. Sarah Sp.A', tanggalOrder: '2026-06-28' },
    { id: '3', pasienNama: 'Lilis Indah', noRM: 'RM-000105', tipeTes: 'LABORATORIUM', namaTes: 'Urine Lengkap', nilaiHasil: '', status: 'MENUNGGU_SAMPEL', dokterPerujuk: 'dr. Hendra Sp.OG', tanggalOrder: '2026-06-29' },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [nama, setNama] = useState('')
  const [noRM, setNoRM] = useState('')
  const [tipe, setTipe] = useState<'LABORATORIUM' | 'RADIOLOGI'>('LABORATORIUM')
  const [tes, setTes] = useState('Darah Rutin')
  const [dokter, setDokter] = useState('dr. Rian Hidayat')

  const [showResultFormId, setShowResultFormId] = useState<string | null>(null)
  const [resultInput, setResultInput] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama || !noRM || !tes) return

    const newOrder: LabOrder = {
      id: Date.now().toString(),
      pasienNama: nama,
      noRM,
      tipeTes: tipe,
      namaTes: tes,
      status: 'MENUNGGU_SAMPEL',
      dokterPerujuk: dokter,
      tanggalOrder: new Date().toISOString().split('T')[0],
    }

    setOrders([newOrder, ...orders])
    setShowAddForm(false)
    setNama('')
    setNoRM('')
  }

  const handleSaveResult = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, nilaiHasil: resultInput, status: 'SELESAI' } : o))
    setShowResultFormId(null)
    setResultInput('')
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white">Modul Penunjang (Lab & Radiologi)</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Laboratory Information System (LIS), antrian radiologi, penginputan nilai kritis, serta pengarsipan hasil scan/rontgen.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Order Penunjang</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 max-w-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-zinc-800">
            <span className="font-bold text-sm dark:text-white">Order Penunjang Baru</span>
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
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Jenis Penunjang</label>
              <select value={tipe} onChange={e => setTipe(e.target.value as any)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="LABORATORIUM">LABORATORIUM</option>
                <option value="RADIOLOGI">RADIOLOGI</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Pemeriksaan Yang Diorder</label>
              <input type="text" required value={tes} onChange={e => setTes(e.target.value)} placeholder="Hb / Leukosit / Thorax AP" className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Dokter Perujuk</label>
            <select value={dokter} onChange={e => setDokter(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
              <option value="dr. Rian Hidayat">dr. Rian Hidayat</option>
              <option value="dr. Sarah Sp.A">dr. Sarah Sp.A</option>
              <option value="dr. Hendra Sp.OG">dr. Hendra Sp.OG</option>
            </select>
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all">Submit Order</button>
        </form>
      )}

      {/* Grid of active orders */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display dark:text-white flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-indigo-500" />
          <span>Monitor Antrian Hasil Penunjang</span>
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {orders.map(o => (
            <div key={o.id} className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    o.tipeTes === 'LABORATORIUM' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50' : 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/50'
                  }`}>
                    {o.tipeTes}
                  </span>
                  <h4 className="font-bold text-base dark:text-white mt-2">{o.pasienNama}</h4>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">RM: {o.noRM} &bull; Order: {o.tanggalOrder}</span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                  o.status === 'SELESAI' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                  o.status === 'PROSES' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 animate-pulse' :
                  'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                }`}>
                  {o.status.replace('_', ' ')}
                </span>
              </div>

              <div className="text-xs">
                <span className="text-slate-400 block font-bold">Pemeriksaan</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300">{o.namaTes}</span>
              </div>

              {o.nilaiHasil ? (
                <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 text-xs">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold mb-1">Hasil Rilis</span>
                  <p className="font-mono text-slate-700 dark:text-zinc-300">{o.nilaiHasil}</p>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/50 text-xs text-slate-400 text-center italic">
                  Belum ada hasil yang diunggah
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/80 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Perujuk: {o.dokterPerujuk}</span>

                {o.status !== 'SELESAI' && showResultFormId !== o.id && (
                  <button
                    onClick={() => { setShowResultFormId(o.id); setResultInput(o.nilaiHasil || '') }}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    Input Hasil
                  </button>
                )}
              </div>

              {showResultFormId === o.id && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <textarea
                    value={resultInput}
                    onChange={e => setResultInput(e.target.value)}
                    placeholder="Ketik nilai laboratorium atau catatan radiologi..."
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowResultFormId(null)} className="text-[10px] font-bold text-slate-400 px-2 py-1">Batal</button>
                    <button onClick={() => handleSaveResult(o.id)} className="text-[10px] font-bold text-white bg-indigo-650 hover:bg-indigo-500 px-3 py-1 rounded-lg">Rilis Hasil</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
