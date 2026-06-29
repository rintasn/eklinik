'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Bed,
  Plus,
  CheckCircle,
  Clock,
  User,
  Activity,
  Heart,
  Thermometer,
  FileText,
} from 'lucide-react'
import {
  getInpatients,
  addInpatientVisit,
  dischargeInpatient,
  InpatientRecord,
} from '@/lib/medicalStore'

export default function InpatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [patient, setPatient] = useState<InpatientRecord | null>(null)
  const [loading, setLoading] = useState(true)

  // Visit Form States
  const [subjektif, setSubjektif] = useState('')
  const [objektif, setObjektif] = useState('')
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  const [pemeriksa, setPemeriksa] = useState('dr. Sarah Sp.A')

  // Discharge Form States
  const [showDischargeForm, setShowDischargeForm] = useState(false)
  const [daysStayed, setDaysStayed] = useState(3)
  const [dailyRate, setDailyRate] = useState(450000)
  const [treatmentFee, setTreatmentFee] = useState(250000)

  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const list = getInpatients()
    const p = list.find(pat => pat.id === id)
    if (p) {
      setPatient(p)
    }
    setLoading(false)
  }, [id])

  const refreshPatient = () => {
    const list = getInpatients()
    const p = list.find(pat => pat.id === id)
    if (p) setPatient(p)
  }

  const handleAddVisit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjektif || !objektif || !assessment || !plan) return

    const newVisit = {
      tanggal: new Date().toLocaleString('id-ID'),
      subjektif,
      objektif,
      assessment,
      plan,
      pemeriksa,
    }

    addInpatientVisit(id, newVisit)
    setSubjektif('')
    setObjektif('')
    setAssessment('')
    setPlan('')
    setSuccessMsg('Catatan visit pemeriksaan harian berhasil disimpan!')
    refreshPatient()
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleDischargeTrigger = (e: React.FormEvent) => {
    e.preventDefault()
    dischargeInpatient(id, daysStayed, dailyRate, treatmentFee)
    setSuccessMsg('Pasien berhasil dipulangkan! Tagihan rawat inap telah dikirim ke Kasir.')
    refreshPatient()
    setTimeout(() => {
      setSuccessMsg('')
      router.push('/rawat-inap')
    }, 1500)
  }

  if (loading) return <div className="text-zinc-500 text-sm text-center py-12">Memuat detail pasien...</div>
  if (!patient) return <div className="text-zinc-500 text-sm text-center py-12">Pasien tidak ditemukan.</div>

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/rawat-inap')}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"
            aria-label="Kembali ke Rawat Inap"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-display dark:text-white">{patient.pasienNama}</h2>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-500">{patient.noRM}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Kamar: {patient.ruangNama} &bull; Kelas: <span className="text-indigo-650 dark:text-indigo-400 font-bold">{patient.kelas.replace('_', ' ')}</span> &bull; Bed: {patient.bedNo} &bull; DPJP: {patient.dokterNama}
            </p>
          </div>
        </div>

        {patient.status === 'DIRAWAT' && (
          <button
            onClick={() => setShowDischargeForm(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-600/10"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Discharge Pasien</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs p-4 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Discharge Form Modal */}
      {showDischargeForm && (
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
            <button type="button" onClick={() => setShowDischargeForm(false)} className="text-xs text-slate-400 hover:text-slate-600 px-3">Batal</button>
          </div>
        </form>
      )}

      {/* Grid: Left - entry visit, Right - visit lists */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <form onSubmit={handleAddVisit} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
            <h3 className="font-bold text-sm dark:text-white">Tambah Catatan Visit Pemeriksaan</h3>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Subjective (Keluhan)</label>
              <textarea required value={subjektif} onChange={e => setSubjektif(e.target.value)} rows={3} placeholder="Masukkan keluhan subjektif pasien saat visit harian..." className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none resize-none" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Objective (Hasil Pemeriksaan / Vital Signs)</label>
              <textarea required value={objektif} onChange={e => setObjektif(e.target.value)} rows={2} placeholder="E.g. Tensi: 110/70, Suhu: 36.5 C, Kesadaran: Compos Mentis" className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Assessment (Perkembangan Diagnosa)</label>
                <input type="text" required value={assessment} onChange={e => setAssessment(e.target.value)} placeholder="E.g. Keadaan Membaik" className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Pemeriksa / DPJP Visit</label>
                <input type="text" required value={pemeriksa} onChange={e => setPemeriksa(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Plan (Terapi / Tindakan Harian)</label>
              <textarea required value={plan} onChange={e => setPlan(e.target.value)} rows={2} placeholder="E.g. Ganti cairan infus, resep obat oral..." className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none resize-none" />
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-all">Posting Catatan Visit</button>
          </form>
        </div>

        {/* Visit history lists */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-bold font-display dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            <span>Riwayat Rekam Medis Visit Pasien ({patient.visits.length})</span>
          </h3>

          {patient.visits.length === 0 ? (
            <div className="glass-panel p-8 text-center text-xs text-slate-400 dark:text-zinc-500 rounded-2xl">
              Belum ada catatan visit untuk rawat inap ini.
            </div>
          ) : (
            <div className="space-y-4">
              {patient.visits.map((vis, i) => (
                <div key={i} className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3 animate-fade-in">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                    <span className="font-bold text-indigo-650 dark:text-indigo-400">{vis.pemeriksa}</span>
                    <span className="text-slate-400 dark:text-zinc-500 font-mono">{vis.tanggal}</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Subjective</span>
                      <p className="text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-950/40 p-2 rounded-lg">{vis.subjektif}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Objective</span>
                      <p className="text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-950/40 p-2 rounded-lg">{vis.objektif}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Assessment</span>
                      <p className="font-bold text-slate-900 dark:text-zinc-150 bg-slate-50 dark:bg-zinc-950/40 p-2 rounded-lg">{vis.assessment}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Plan</span>
                      <p className="text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-950/40 p-2 rounded-lg">{vis.plan}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
