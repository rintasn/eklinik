'use client'

import { useState } from 'react'
import { Landmark, Plus, Search, CheckCircle, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface JournalEntry {
  id: string
  tanggal: string
  keterangan: string
  referensi: string
  debet: number
  kredit: number
}

export default function GeneralLedgerPage() {
  const [journals, setJournals] = useState<JournalEntry[]>([
    { id: '1', tanggal: '2026-06-29', keterangan: 'Penerimaan Kasir - Pembayaran Pasien Umum', referensi: 'KK-000192', debet: 2450000, kredit: 0 },
    { id: '2', tanggal: '2026-06-29', keterangan: 'Pengeluaran Kas - Pembayaran Jasa Medis Dokter', referensi: 'JM-000104', debet: 0, kredit: 1500000 },
    { id: '3', tanggal: '2026-06-28', keterangan: 'Pembelian Stok Obat & Alat Kesehatan PO-02', referensi: 'PO-000082', debet: 0, kredit: 3200000 },
    { id: '4', tanggal: '2026-06-28', keterangan: 'Penerimaan Kasir - Klaim BPJS Terbayar', referensi: 'BP-000109', debet: 12500000, kredit: 0 },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [ket, setKet] = useState('')
  const [ref, setRef] = useState('')
  const [tipe, setTipe] = useState<'DEBET' | 'KREDIT'>('DEBET')
  const [nominal, setNominal] = useState(100000)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ket || !ref) return

    const newJournal: JournalEntry = {
      id: Date.now().toString(),
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: ket,
      referensi: ref,
      debet: tipe === 'DEBET' ? nominal : 0,
      kredit: tipe === 'KREDIT' ? nominal : 0,
    }

    setJournals([newJournal, ...journals])
    setShowAddForm(false)
    setKet('')
    setRef('')
    setNominal(100000)
  }

  const totalDebet = journals.reduce((sum, j) => sum + j.debet, 0)
  const totalKredit = journals.reduce((sum, j) => sum + j.kredit, 0)
  const saldoBersih = totalDebet - totalKredit

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white">Modul General Ledger (GL)</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Pencatatan jurnal keuangan klinik, buku besar otomatis, neraca saldo, serta laporan rugi-laba.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Jurnal Baru</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 max-w-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-zinc-800">
            <span className="font-bold text-sm dark:text-white">Input Jurnal Akuntansi Baru</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white">Batal</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Keterangan Transaksi</label>
              <input type="text" required value={ket} onChange={e => setKet(e.target.value)} placeholder="E.g. Pembelian ATK / Sewa Gedung" className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">No Referensi / Dokumen</label>
              <input type="text" required value={ref} onChange={e => setRef(e.target.value)} placeholder="Ref-xxx / PO-xxx" className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Posisi Akun</label>
              <select value={tipe} onChange={e => setTipe(e.target.value as any)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="DEBET">DEBET (Penerimaan/Kas Bertambah)</option>
                <option value="KREDIT">KREDIT (Pengeluaran/Kas Berkurang)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nominal Transaksi (Rp)</label>
              <input type="number" required value={nominal} onChange={e => setNominal(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all">Posting Jurnal</button>
        </form>
      )}

      {/* Financial statement summary banners */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase block">Total Pemasukan (Debet)</span>
            <span className="text-2xl font-bold font-display text-emerald-500 mt-1 block">Rp {totalDebet.toLocaleString('id-ID')}</span>
          </div>
          <ArrowUpRight className="h-8 w-8 text-emerald-500/20" />
        </div>
        <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase block">Total Pengeluaran (Kredit)</span>
            <span className="text-2xl font-bold font-display text-red-500 mt-1 block">Rp {totalKredit.toLocaleString('id-ID')}</span>
          </div>
          <ArrowDownRight className="h-8 w-8 text-red-500/20" />
        </div>
        <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase block">Kas Bersih (Net Cash)</span>
            <span className={`text-2xl font-bold font-display mt-1 block ${saldoBersih >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500'}`}>
              Rp {saldoBersih.toLocaleString('id-ID')}
            </span>
          </div>
          <Landmark className="h-8 w-8 text-indigo-500/20" />
        </div>
      </div>

      {/* Journal entries log */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display dark:text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-500" />
          <span>Buku Jurnal Umum Harian</span>
        </h3>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950 text-slate-400 dark:text-zinc-500 border-b border-slate-200 dark:border-zinc-800">
                <th className="p-4 font-bold uppercase">Tanggal</th>
                <th className="p-4 font-bold uppercase">Keterangan Jurnal</th>
                <th className="p-4 font-bold uppercase">Ref Doc</th>
                <th className="p-4 font-bold uppercase text-right">Debet (Rp)</th>
                <th className="p-4 font-bold uppercase text-right">Kredit (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {journals.map(j => (
                <tr key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/20 transition-all">
                  <td className="p-4 text-slate-500 dark:text-zinc-500">{j.tanggal}</td>
                  <td className="p-4 font-semibold text-slate-800 dark:text-zinc-300">{j.keterangan}</td>
                  <td className="p-4 font-mono text-slate-500 dark:text-zinc-500">{j.referensi}</td>
                  <td className="p-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {j.debet > 0 ? `Rp ${j.debet.toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className="p-4 text-right font-mono font-semibold text-red-500">
                    {j.kredit > 0 ? `Rp ${j.kredit.toLocaleString('id-ID')}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
