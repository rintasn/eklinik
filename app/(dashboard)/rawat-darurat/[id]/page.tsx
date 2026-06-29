'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  HeartPulse,
  Plus,
  CheckCircle,
  Clock,
  ShieldAlert,
  User,
  Activity,
  Heart,
  Thermometer,
  ArrowRight,
  TrendingUp,
  FileText,
} from 'lucide-react'
import {
  getIGDPatients,
  addIGDVisit,
  dischargeIGDPatient,
  transferIGDToInpatient,
  IGDRecord,
} from '@/lib/medicalStore'

export default function IGDPatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [patient, setPatient] = useState<IGDRecord | null>(null)
  const [loading, setLoading] = useState(true)

  // Visit Form States
  const [subjektif, setSubjektif] = useState('')
  const [objektif, setObjektif] = useState('')
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  const [pemeriksa, setPemeriksa] = useState('dr. Sarah Sp.A')

  // Transfer Modals
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [ruangNama, setRuangNama] = useState('Ruang Melati')
  const [kelas, setKelas] = useState<'VIP' | 'KELAS_1' | 'KELAS_2' | 'KELAS_3'>('KELAS_3')
  const [bedNo, setBedNo] = useState('B1')
  const [transferFee, setTransferFee] = useState(350000)

  // Discharge Form
  const [showDischargeForm, setShowDischargeForm] = useState(false)
  const [dischargeFee, setDischargeFee] = useState(250000)

  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const list = getIGDPatients()
    const p = list.find(pat => pat.id === id)
    if (p) {
      setPatient(p)
    }
    setLoading(false)
  }, [id])

  const refreshPatient = () => {
    const list = getIGDPatients()
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

    addIGDVisit(id, newVisit)
    setSubjektif('')
    setObjektif('')
    setAssessment('')
    setPlan('')
    setSuccessMsg('Catatan pemeriksaan visit berhasil ditambahkan!')
    refreshPatient()
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleDischargeTrigger = (e: React.FormEvent) => {
    e.preventDefault()
    dischargeIGDPatient(id, dischargeFee)
    setSuccessMsg('Pasien berhasil dipulangkan! Tagihan IGD telah dikirim ke Kasir.')
    refreshPatient()
    setTimeout(() => {
      setSuccessMsg('')
      router.push('/rawat-darurat')
    }, 1500)
  }

  const handleTransferTrigger = (e: React.FormEvent) => {
    e.preventDefault()
    transferIGDToInpatient(id, ruangNama, kelas, bedNo, transferFee)
    setSuccessMsg('Pasien berhasil ditransfer ke Rawat Inap! Tagihan IGD telah dikirim ke Kasir.')
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
            onClick={() => router.push('/rawat-darurat')}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"
            aria-label="Kembali ke IGD"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-display dark:text-white">{patient.pasienNama}</h2>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-500">{patient.noRM}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Triage: <span className="font-bold text-red-500">{patient.triage}</span> &bull; Bed: {patient.bed} &bull; DPJP: {patient.dokterNama}
            </p>
          </div>
        </div>

        {patient.status === 'DIRAWAT' && (
          <div className="flex gap-2">
            <button
              onClick={() => { setShowTransferForm(true); setShowDischargeForm(false) }}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
            >
              <ArrowRight className="h-4 w-4" />
              <span>Transfer ke Rawat Inap</span>
            </button>
            <button
              onClick={() => { setShowDischargeForm(true); setShowTransferForm(false) }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-600/10"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Pulangkan / Discharge</span>
            </button>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs p-4 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Triage / Transfer Form Modal overlay */}
      {showTransferForm && (
        <form onSubmit={handleTransferTrigger} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 max-w-xl animate-fade-in">
          <h3 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">Transfer Pasien ke Rawat Inap</h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nama Ruangan</label>
              <select value={ruangNama} onChange={e => setRuangNama(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none">
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
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Tarif Tindakan IGD (Rp)</label>
            <input type="number" value={transferFee} onChange={e => setTransferFee(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl">Konfirmasi Transfer</button>
            <button type="button" onClick={() => setShowTransferForm(false)} className="text-xs text-slate-400 hover:text-slate-600 px-3">Batal</button>
          </div>
        </form>
      )}

      {/* Discharge Form Modal */}
      {showDischargeForm && (
        <form onSubmit={handleDischargeTrigger} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 max-w-xl animate-fade-in">
          <h3 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Pulangkan Pasien dari IGD</h3>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Total Biaya Tindakan & Obat IGD (Rp)</label>
            <input type="number" value={dischargeFee} onChange={e => setDischargeFee(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl">Pulangkan & Kirim Bill</button>
            <button type="button" onClick={() => setShowDischargeForm(false)} className="text-xs text-slate-400 hover:text-slate-600 px-3">Batal</button>
          </div>
        </form>
      )}

      {/* Grid: Left - entry SOAP, Right - visit history */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <form onSubmit={handleAddVisit} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
            <h3 className="font-bold text-sm dark:text-white">Tambah Catatan Visit / Pemeriksaan</h3>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Subjective (Keluhan)</label>
              <textarea required value={subjektif} onChange={e => setSubjektif(e.target.value)} rows={3} placeholder="Perkembangan keluhan pasien..." className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none resize-none" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Objective (Pemeriksaan Fisik / TTV)</label>
              <textarea required value={objektif} onChange={e => setObjektif(e.target.value)} rows={2} placeholder="E.g. Tensi: 120/80 mmHg, Suhu: 36.8 C" className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Assessment</label>
                <input type="text" required value={assessment} onChange={e => setAssessment(e.target.value)} placeholder="Diagnosa" className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Pemeriksa</label>
                <input type="text" required value={pemeriksa} onChange={e => setPemeriksa(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Plan</label>
              <textarea required value={plan} onChange={e => setPlan(e.target.value)} rows={2} placeholder="E.g. Terapi infus NaCl, lanjut observasi..." className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none resize-none" />
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-all">Posting Catatan Pemeriksaan</button>
          </form>
        </div>

        {/* Visit history */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-bold font-display dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            <span>Riwayat Pemeriksaan Pasien ({patient.visits.length})</span>
          </h3>

          {patient.visits.length === 0 ? (
            <div className="glass-panel p-8 text-center text-xs text-slate-400 dark:text-zinc-500 rounded-2xl">
              Belum ada catatan visit untuk kunjungan ini.
            </div>
          ) : (
            <div className="space-y-4">
              {patient.visits.map((vis, i) => (
                <div key={i} className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
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
