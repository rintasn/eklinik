'use client'

import { useState } from 'react'
import { Utensils, Plus, Search, CheckCircle, Clock, ShieldAlert, Heart, Calendar } from 'lucide-react'

interface DietPlan {
  id: string
  pasienNama: string
  ruangNama: string
  bedNo: string
  diagnosaMedis: string
  jenisDiet: string
  teksturMakanan: 'NORMAL' | 'LUNAK' | 'CAIR'
  pagi: 'BELUM_DIKIRIM' | 'DIKIRIM'
  siang: 'BELUM_DIKIRIM' | 'DIKIRIM'
  sore: 'BELUM_DIKIRIM' | 'DIKIRIM'
  catatanAlergi: string
}

export default function PelayananGiziPage() {
  const [diets, setDiets] = useState<DietPlan[]>([
    { id: '1', pasienNama: 'Bambang Wijaya', ruangNama: 'Ruang Melati', bedNo: 'A1', diagnosaMedis: 'Diabetes Mellitus Tipe 2', jenisDiet: 'RG (Rendah Garam) & DM (Diet Diabetes) 1700 kkal', teksturMakanan: 'LUNAK', pagi: 'DIKIRIM', siang: 'DIKIRIM', sore: 'BELUM_DIKIRIM', catatanAlergi: 'Alergi Udang' },
    { id: '2', pasienNama: 'Siti Aminah', ruangNama: 'Ruang Flamboyan', bedNo: 'B3', diagnosaMedis: 'Hipertensi Grade II', jenisDiet: 'RG (Rendah Garam) II', teksturMakanan: 'NORMAL', pagi: 'DIKIRIM', siang: 'DIKIRIM', sore: 'BELUM_DIKIRIM', catatanAlergi: 'Tidak Ada' },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [nama, setNama] = useState('')
  const [ruang, setRuang] = useState('Ruang Melati')
  const [bed, setBed] = useState('A1')
  const [diagnosa, setDiagnosa] = useState('')
  const [diet, setDiet] = useState('Diet Normal')
  const [tekstur, setTekstur] = useState<'NORMAL' | 'LUNAK' | 'CAIR'>('NORMAL')
  const [alergi, setAlergi] = useState('Tidak Ada')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama || !diagnosa) return

    const newDiet: DietPlan = {
      id: Date.now().toString(),
      pasienNama: nama,
      ruangNama: ruang,
      bedNo: bed,
      diagnosaMedis: diagnosa,
      jenisDiet: diet,
      teksturMakanan: tekstur,
      pagi: 'BELUM_DIKIRIM',
      siang: 'BELUM_DIKIRIM',
      sore: 'BELUM_DIKIRIM',
      catatanAlergi: alergi,
    }

    setDiets([newDiet, ...diets])
    setShowAddForm(false)
    setNama('')
    setDiagnosa('')
    setDiet('Diet Normal')
  }

  const handleDelivery = (id: string, meal: 'pagi' | 'siang' | 'sore') => {
    setDiets(diets.map(d => d.id === id ? { ...d, [meal]: 'DIKIRIM' } : d))
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white">Modul Pelayanan Gizi</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Pengaturan diet harian pasien rawat inap, tracking pengiriman makanan, serta catatan alergi gizi klinis.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Setup Diet Baru</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 max-w-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-zinc-800">
            <span className="font-bold text-sm dark:text-white">Asesmen Gizi & Rencana Diet</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white">Batal</button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nama Pasien</label>
              <input type="text" required value={nama} onChange={e => setNama(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Ruangan</label>
              <select value={ruang} onChange={e => setRuang(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="Ruang Melati">Ruang Melati</option>
                <option value="Ruang Flamboyan">Ruang Flamboyan</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nomor Bed</label>
              <input type="text" required value={bed} onChange={e => setBed(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Diagnosa Medis</label>
              <input type="text" required value={diagnosa} onChange={e => setDiagnosa(e.target.value)} placeholder="E.g. Hipertensi / Diabetes" className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Rekomendasi Diet</label>
              <input type="text" required value={diet} onChange={e => setDiet(e.target.value)} placeholder="RG II / Diet Jantung / Rendah Karbo" className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Tekstur Makanan</label>
              <select value={tekstur} onChange={e => setTekstur(e.target.value as any)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-855 rounded-xl py-2 px-3 text-xs focus:outline-none">
                <option value="NORMAL">NORMAL (Nasi Biasa)</option>
                <option value="LUNAK">LUNAK (Bubur Kasar/Saring)</option>
                <option value="CAIR">CAIR (Susu / Jus)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Catatan Alergi</label>
              <input type="text" value={alergi} onChange={e => setAlergi(e.target.value)} placeholder="Susu sapi / telur / seafood / dll." className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
            </div>
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all">Simpan Diet Plan</button>
        </form>
      )}

      {/* Diet Plan grid boards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display dark:text-white flex items-center gap-2">
          <Utensils className="h-5 w-5 text-indigo-500" />
          <span>Monitor Pengiriman Menu Diet Inap</span>
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {diets.map(d => (
            <div key={d.id} className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-base dark:text-white">{d.pasienNama}</h4>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">{d.ruangNama} &bull; Bed {d.bedNo}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/45 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                  {d.teksturMakanan}
                </span>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="text-slate-400 block font-bold text-[9px] uppercase">Rencana Diet</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">{d.jenisDiet}</span>
                </div>
                {d.catatanAlergi && d.catatanAlergi !== 'Tidak Ada' && (
                  <div className="flex items-center gap-1.5 text-red-500 bg-red-500/5 border border-red-500/10 px-2 py-1 rounded-lg">
                    <span className="text-[9px] font-bold uppercase tracking-wider">Alergi:</span>
                    <span className="font-semibold text-[10px]">{d.catatanAlergi}</span>
                  </div>
                )}
              </div>

              {/* Delivery meal status */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                <div>
                  <span className="text-slate-400 block font-bold mb-1">Makan Pagi</span>
                  {d.pagi === 'DIKIRIM' ? (
                    <span className="text-emerald-500 font-bold bg-emerald-500/5 border border-emerald-500/15 py-1 rounded-md block">DIKIRIM</span>
                  ) : (
                    <button onClick={() => handleDelivery(d.id, 'pagi')} className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 py-1 rounded-md font-bold transition-all">Kirim</button>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block font-bold mb-1">Makan Siang</span>
                  {d.siang === 'DIKIRIM' ? (
                    <span className="text-emerald-500 font-bold bg-emerald-500/5 border border-emerald-500/15 py-1 rounded-md block">DIKIRIM</span>
                  ) : (
                    <button onClick={() => handleDelivery(d.id, 'siang')} className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 py-1 rounded-md font-bold transition-all">Kirim</button>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block font-bold mb-1">Makan Sore</span>
                  {d.sore === 'DIKIRIM' ? (
                    <span className="text-emerald-500 font-bold bg-emerald-500/5 border border-emerald-500/15 py-1 rounded-md block">DIKIRIM</span>
                  ) : (
                    <button onClick={() => handleDelivery(d.id, 'sore')} className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 py-1 rounded-md font-bold transition-all">Kirim</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
