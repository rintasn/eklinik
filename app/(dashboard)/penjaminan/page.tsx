'use client'

import { useState } from 'react'
import { ShieldCheck, Plus, Search, CheckCircle, Clock, ShieldAlert, Award } from 'lucide-react'

interface InsuranceProvider {
  id: string
  nama: string
  kategori: 'PJS' | 'ASURANSI_SWASTA' | 'KORPORASI'
  plafonLimit: number
  status: 'AKTIF' | 'SUSPENDED'
  teleponHotline: string
}

export default function PenjaminanPage() {
  const [providers, setProviders] = useState<InsuranceProvider[]>([
    { id: '1', nama: 'BPJS Kesehatan KC Jakarta', kategori: 'PJS', plafonLimit: 0, status: 'AKTIF', teleponHotline: '1500400' },
    { id: '2', nama: 'PT Prudential Life Assurance', kategori: 'ASURANSI_SWASTA', plafonLimit: 50000000, status: 'AKTIF', teleponHotline: '021-1500085' },
    { id: '3', nama: 'PT Astra International (COOP Karyawan)', kategori: 'KORPORASI', plafonLimit: 20000000, status: 'AKTIF', teleponHotline: '021-6521818' },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [nama, setNama] = useState('')
  const [kat, setKat] = useState<'PJS' | 'ASURANSI_SWASTA' | 'KORPORASI'>('ASURANSI_SWASTA')
  const [plafon, setPlafon] = useState(10000000)
  const [telp, setTelp] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama) return

    const newProvider: InsuranceProvider = {
      id: Date.now().toString(),
      nama,
      kategori: kat,
      plafonLimit: plafon,
      status: 'AKTIF',
      teleponHotline: telp,
    }

    setProviders([...providers, newProvider])
    setShowAddForm(false)
    setNama('')
    setTelp('')
  }

  const toggleStatus = (id: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, status: p.status === 'AKTIF' ? 'SUSPENDED' : 'AKTIF' } : p))
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white">Modul Penjaminan</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Konfigurasi pihak penjamin pasien (asuransi swasta, korporasi rekanan, BPJS) serta verifikasi limit plafon otomatis.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Penjamin</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 max-w-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-zinc-800">
            <span className="font-bold text-sm dark:text-white">Tambah Provider Penjamin Baru</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white">Batal</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nama Provider / Korporasi</label>
              <input type="text" required value={nama} onChange={e => setNama(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Kategori Penjamin</label>
              <select value={kat} onChange={e => setKat(e.target.value as any)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="ASURANSI_SWASTA">ASURANSI SWASTA</option>
                <option value="KORPORASI">KORPORASI (Coop Perusahaan)</option>
                <option value="PJS">PJS (Asuransi Sosial/Pemerintah)</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Plafon Max per Kunjungan (Rp)</label>
              <input type="number" required value={plafon} onChange={e => setPlafon(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Hotline Verifikasi</label>
              <input type="text" value={telp} onChange={e => setTelp(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all">Simpan Provider</button>
        </form>
      )}

      {/* Insurance lists */}
      <div className="grid md:grid-cols-3 gap-6">
        {providers.map(p => (
          <div key={p.id} className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                  p.kategori === 'PJS' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' :
                  p.kategori === 'ASURANSI_SWASTA' ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400' :
                  'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                }`}>
                  {p.kategori.replace('_', ' ')}
                </span>
                <h4 className="font-bold text-base dark:text-white mt-2">{p.nama}</h4>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                p.status === 'AKTIF' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
              }`}>
                {p.status}
              </span>
            </div>

            <div className="text-xs space-y-1.5 border-t border-slate-100 dark:border-zinc-800/80 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Plafon Per Sesi:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-300">
                  {p.plafonLimit === 0 ? 'UNLIMITED' : `Rp ${p.plafonLimit.toLocaleString('id-ID')}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hotline:</span>
                <span className="font-semibold text-slate-850 dark:text-zinc-300 font-mono">{p.teleponHotline}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/50 flex justify-end">
              <button
                onClick={() => toggleStatus(p.id)}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                  p.status === 'AKTIF' ? 'text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                }`}
              >
                {p.status === 'AKTIF' ? 'Suspend Provider' : 'Aktifkan Kembali'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
