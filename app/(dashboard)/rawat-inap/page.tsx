'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bed, Plus, Search, CheckCircle, Eye, User, Calendar } from 'lucide-react'
import {
  getInpatients,
  setInpatients,
  dischargeInpatient,
  InpatientRecord
} from '@/lib/medicalStore'

export default function RawatInapPage() {
  const [inpatients, setInpatientsList] = useState<InpatientRecord[]>([])

  useEffect(() => {
    setInpatientsList(getInpatients())
  }, [])

  const refreshList = () => {
    setInpatientsList(getInpatients())
  }

  const [showAddForm, setShowAddForm] = useState(false)
  const [nama, setNama] = useState('')
  const [noRM, setNoRM] = useState('')
  const [ruang, setRuang] = useState('Ruang Melati')
  const [kelas, setKelas] = useState<'VIP' | 'KELAS_1' | 'KELAS_2' | 'KELAS_3'>('VIP')
  const [bedNo, setBedNo] = useState('A1')
  const [dokter, setDokter] = useState('dr. Sarah Sp.A')

  // Discharge Form Modal
  const [dischargeId, setDischargeId] = useState<string | null>(null)
  const [daysStayed, setDaysStayed] = useState(3)
  const [dailyRate, setDailyRate] = useState(450000)
  const [treatmentFee, setTreatmentFee] = useState(250000)

  const [success, setSuccess] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama || !noRM) return

    const newInpatient: InpatientRecord = {
      id: `inp-${Date.now()}`,
      pasienNama: nama,
      noRM,
      ruangNama: ruang,
      kelas,
      bedNo,
      dokterNama: dokter,
      tanggalMasuk: new Date().toISOString().split('T')[0],
      status: 'DIRAWAT',
      sumber: 'MANUAL',
      visits: []
    }

    const updated = [newInpatient, ...getInpatients()]
    setInpatients(updated)
    refreshList()

    setShowAddForm(false)
    setNama('')
    setNoRM('')
    setSuccess('Admisi pasien rawat inap berhasil!')
    setTimeout(() => setSuccess(''), 4000)
  }

  const handleDischargeTrigger = (e: React.FormEvent) => {
    e.preventDefault()
    if (!dischargeId) return
    dischargeInpatient(dischargeId, daysStayed, dailyRate, treatmentFee)
    setDischargeId(null)
    refreshList()
    setSuccess('Pasien rawat inap dipulangkan. Tagihan dikirim ke kasir.')
    setTimeout(() => setSuccess(''), 4000)
  }

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-zinc-100">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white">Modul Rawat Inap</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Kelola admisi pasien rawat inap, alokasi bed, ketersediaan ruangan (BOR), dan visitasi dokter.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Admisi Pasien Baru</span>
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
            <span className="font-bold text-sm dark:text-white">Formulir Admisi Rawat Inap</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white">Batal</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nama Pasien</label>
              <input type="text" required value={nama} onChange={e => setNama(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nomor Rekam Medis (RM)</label>
              <input type="text" required value={noRM} onChange={e => setNoRM(e.target.value)} placeholder="RM-xxxxxx" className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Ruangan</label>
              <select value={ruang} onChange={e => setRuang(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="Ruang Melati">Ruang Melati</option>
                <option value="Ruang Flamboyan">Ruang Flamboyan</option>
                <option value="Ruang Bougenville">Ruang Bougenville</option>
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
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Dokter Penanggung Jawab (DPJP)</label>
            <select value={dokter} onChange={e => setDokter(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
              <option value="dr. Sarah Sp.A">dr. Sarah Sp.A</option>
              <option value="dr. Budi Setiawan">dr. Budi Setiawan</option>
              <option value="drg. Siti Aminah">drg. Siti Aminah</option>
            </select>
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all">Submit Admisi</button>
        </form>
      )}

      {/* Discharge Form Modal */}
      {dischargeId && (
        <form onSubmit={handleDischargeTrigger} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 max-w-xl animate-fade-in">
          <h3 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Rencana Pemulangan / Discharge Pasien</h3>
          
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Durasi Menginap (Hari)</label>
              <input type="number" required value={daysStayed} onChange={e => setDaysStayed(parseInt(e.target.value) || 1)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Tarif Kamar/Hari (Rp)</label>
              <input type="number" required value={dailyRate} onChange={e => setDailyRate(parseInt(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Biaya Tindakan Medis (Rp)</label>
              <input type="number" required value={treatmentFee} onChange={e => setTreatmentFee(parseInt(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl">Konfirmasi Pemulangan & Tagihan</button>
            <button type="button" onClick={() => setDischargeId(null)} className="text-xs text-slate-400 hover:text-slate-600 px-3">Batal</button>
          </div>
        </form>
      )}

      {/* Ward Occupancy Overview (BOR) */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider block">Total Kamar Tersedia</span>
          <span className="text-3xl font-bold font-display dark:text-white mt-1 block">24 Kamar</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider block">Pasien Aktif Rawat</span>
          <span className="text-3xl font-bold font-display text-indigo-650 dark:text-indigo-400 mt-1 block">
            {inpatients.filter(i => i.status === 'DIRAWAT').length} Pasien
          </span>
        </div>
        <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider block">Bed Occupancy Rate (BOR)</span>
          <span className="text-3xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1 block">
            {Math.round((inpatients.filter(i => i.status === 'DIRAWAT').length / 24) * 100)}%
          </span>
        </div>
        <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider block">Ketersediaan Bed VIP</span>
          <span className="text-3xl font-bold font-display text-cyan-600 dark:text-cyan-400 mt-1 block">4 Bed Kosong</span>
        </div>
      </div>

      {/* List of active inpatients */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display dark:text-white flex items-center gap-2">
          <Bed className="h-5 w-5 text-indigo-500" />
          <span>Daftar Aktif Pasien Rawat Inap</span>
        </h3>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-950 text-slate-400 dark:text-zinc-500 border-b border-slate-200 dark:border-zinc-800">
                  <th className="p-4 font-bold uppercase">Nama Pasien / RM</th>
                  <th className="p-4 font-bold uppercase">Kamar & Kelas</th>
                  <th className="p-4 font-bold uppercase">No Bed</th>
                  <th className="p-4 font-bold uppercase">DPJP</th>
                  <th className="p-4 font-bold uppercase">Tanggal Masuk</th>
                  <th className="p-4 font-bold uppercase">Sumber</th>
                  <th className="p-4 font-bold uppercase">Status</th>
                  <th className="p-4 font-bold uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {inpatients.filter(pat => pat.status === 'DIRAWAT').map(pat => (
                  <tr key={pat.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/20 transition-all">
                    <td className="p-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{pat.pasienNama}</span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{pat.noRM}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-zinc-300">
                      {pat.ruangNama} &bull; <span className="text-indigo-650 dark:text-indigo-400">{pat.kelas.replace('_', ' ')}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-700 dark:text-zinc-300">Bed {pat.bedNo}</td>
                    <td className="p-4 text-slate-650 dark:text-zinc-400 font-medium">{pat.dokterNama}</td>
                    <td className="p-4 text-slate-500 dark:text-zinc-500">{pat.tanggalMasuk}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        pat.sumber === 'IGD' ? 'bg-red-500/10 text-red-500' :
                        pat.sumber === 'RAWAT_JALAN' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-zinc-500/10 text-zinc-500'
                      }`}>
                        {pat.sumber.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                        {pat.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/rawat-inap/${pat.id}`}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-zinc-850 flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Visit</span>
                        </Link>
                        <button
                          onClick={() => setDischargeId(pat.id)}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-zinc-850"
                        >
                          Discharge
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
