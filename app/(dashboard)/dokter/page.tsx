'use client'

import { useState, useEffect } from 'react'
import { Activity, Stethoscope, RefreshCw, CheckCircle, AlertCircle, Heart, Thermometer, User, Plus, Trash2, Search } from 'lucide-react'

interface Obat {
  id: string
  kode: string
  nama: string
  satuan: string
  stok: number
  hargaJual: number
}

interface Registration {
  id: string
  tanggal: string
  status: string
  keluhan?: string
  tensiSistolik?: number
  tensiDiastolik?: number
  beratBadan?: number
  tinggiBadan?: number
  suhuTubuh?: number
  nadi?: number
  triaseColor?: string
  pasien: {
    id: string
    nama: string
    noRekamMedis: string
    jenisKelamin: string
    tanggalLahir: string
    nik?: string
    telepon?: string
  }
  poli: { nama: string }
  dokter: { id: string; nama: string }
}

interface PrescriptionItem {
  obatId: string
  nama: string
  jumlah: number
  aturan: string
  catatan?: string
}

// Common ICD-10 codes seed
const COMMON_ICD10 = [
  { code: 'J06.9', name: 'Acute upper respiratory infection, unspecified (ISPA)' },
  { code: 'A09.9', name: 'Gastroenteritis and colitis of infectious origin (Diare)' },
  { code: 'K29.7', name: 'Gastritis, unspecified (Maag)' },
  { code: 'I10', name: 'Essential (primary) hypertension (Darah Tinggi)' },
  { code: 'E11.9', name: 'Type 2 diabetes mellitus without complications (Kencing Manis)' },
  { code: 'M79.1', name: 'Myalgia (Nyeri Otot)' },
  { code: 'H10.9', name: 'Conjunctivitis, unspecified (Sakit Mata)' },
  { code: 'L23.9', name: 'Allergic contact dermatitis, unspecified (Gatal/Alergi)' },
]

export default function DokterConsolePage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [activeObats, setActiveObats] = useState<Obat[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null)

  // SOAP Form states
  const [subjektif, setSubjektif] = useState('')
  const [objektif, setObjektif] = useState('')
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  
  // Diagnosa ICD-10 states
  const [diagnosaICD, setDiagnosaICD] = useState<string[]>([])
  
  // Resep/Prescriptions states
  const [prescriptionList, setPrescriptionList] = useState<PrescriptionItem[]>([])
  const [currentObatId, setCurrentObatId] = useState('')
  const [currentJumlah, setCurrentJumlah] = useState(10)
  const [currentAturan, setCurrentAturan] = useState('3x1 sesudah makan')
  const [currentCatatan, setCurrentCatatan] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load User, Queues & Medicines
  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Get logged-in user profile
      const userRes = await fetch('/api/v1/auth/me')
      const userData = await userRes.json()
      if (userData.success) {
        setCurrentUser(userData.user)
        
        // 2. Load registrations
        const todayStr = new Date().toISOString().split('T')[0]
        const regRes = await fetch(`/api/v1/pendaftaran?tanggal=${todayStr}`)
        const regData = await regRes.json()
        if (regData.success) {
          // Filter registrations that are actively being examined (DIPERIKSA) and have vital signs taken by nurse
          setRegistrations(regData.data.filter((r: Registration) => r.status === 'DIPERIKSA' && r.tensiSistolik !== null))
        }
      }

      // 3. Load medicines for e-prescriptions
      const obatRes = await fetch('/api/v1/obat')
      const obatData = await obatRes.json()
      if (obatData.success) {
        setActiveObats(obatData.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Auto-fill form when selected patient changes
  useEffect(() => {
    if (selectedReg) {
      // Set Subjective to initial complaint from nurse triage
      setSubjektif(selectedReg.keluhan || '')
      
      // Construct objective from vital signs
      const vitals = []
      if (selectedReg.tensiSistolik && selectedReg.tensiDiastolik) {
        vitals.push(`Tensi: ${selectedReg.tensiSistolik}/${selectedReg.tensiDiastolik} mmHg`)
      }
      if (selectedReg.suhuTubuh) {
        vitals.push(`Suhu: ${selectedReg.suhuTubuh} °C`)
      }
      if (selectedReg.nadi) {
        vitals.push(`Nadi: ${selectedReg.nadi} bpm`)
      }
      if (selectedReg.beratBadan) {
        vitals.push(`BB: ${selectedReg.beratBadan} kg`)
      }
      if (selectedReg.tinggiBadan) {
        vitals.push(`TB: ${selectedReg.tinggiBadan} cm`)
      }
      setObjektif(vitals.join(', ') || 'Tanda vital belum dicatat.')
      setAssessment('')
      setPlan('')
      setDiagnosaICD([])
      setPrescriptionList([])
      
      // Update pendaftaran status to DIPERIKSA to update the queue display in real-time
      if (selectedReg.status === 'MENUNGGU') {
        fetch('/api/v1/pendaftaran', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedReg.id, status: 'DIPERIKSA' })
        })
      }
    }
  }, [selectedReg])

  // Handle adding a medicine item to prescription
  const handleAddPrescriptionItem = () => {
    if (!currentObatId) return
    const obat = activeObats.find(o => o.id === currentObatId)
    if (!obat) return

    // Prevent duplicates
    if (prescriptionList.some(item => item.obatId === currentObatId)) {
      setError('Obat sudah dimasukkan ke resep.')
      return
    }

    setPrescriptionList([
      ...prescriptionList,
      {
        obatId: currentObatId,
        nama: obat.nama,
        jumlah: currentJumlah,
        aturan: currentAturan,
        catatan: currentCatatan || undefined
      }
    ])

    // Reset current inputs
    setCurrentObatId('')
    setCurrentJumlah(10)
    setCurrentAturan('3x1 sesudah makan')
    setCurrentCatatan('')
    setError('')
  }

  // Handle removing a medicine from prescription
  const handleRemovePrescriptionItem = (obatId: string) => {
    setPrescriptionList(prescriptionList.filter(item => item.obatId !== obatId))
  }

  // Handle toggling ICD-10 diagnosa codes
  const handleToggleICD = (code: string) => {
    if (diagnosaICD.includes(code)) {
      setDiagnosaICD(diagnosaICD.filter(c => c !== code))
    } else {
      setDiagnosaICD([...diagnosaICD, code])
    }
  }

  // Submit SOAP + Prescription
  const handleSubmitSOAP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReg) return

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    // Build plan text combining plans and prescriptions
    let combinedPlan = plan
    if (prescriptionList.length > 0) {
      const resepTxt = prescriptionList.map(p => `- ${p.nama} (${p.jumlah} pcs): ${p.aturan} ${p.catatan ? `[${p.catatan}]` : ''}`).join('\n')
      combinedPlan = plan ? `${plan}\n\nResep Obat:\n${resepTxt}` : `Resep Obat:\n${resepTxt}`
    }

    const payload = {
      pasienId: selectedReg.pasien.id,
      pendaftaranId: selectedReg.id,
      dokterId: selectedReg.dokter.id,
      subjektif,
      objektif,
      assessment: assessment || (diagnosaICD.length > 0 ? diagnosaICD.join(', ') : 'Diagnosa umum'),
      plan: combinedPlan,
      diagnosaICD: diagnosaICD,
      resepItems: prescriptionList.map(p => ({
        obatId: p.obatId,
        jumlah: p.jumlah,
        aturan: p.aturan,
        catatan: p.catatan
      }))
    }

    try {
      const res = await fetch('/api/v1/rekam-medis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan rekam medis.')
      } else {
        setSuccess('Rekam medis (SOAP) dan e-resep berhasil disimpan.')
        setSelectedReg(null)
        loadData()
      }
    } catch (err) {
      setError('Kesalahan jaringan saat menyimpan SOAP.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAge = (dobString: string) => {
    const dob = new Date(dobString)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Konsol Ruang Dokter</h2>
          <p className="text-zinc-400 text-sm mt-1">Periksa pasien di antrian, catat rekam medis SOAP, diagnosa ICD-10, dan terbitkan resep obat elektronik.</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-3 py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-4 rounded-xl flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Patients list in queue (4 columns) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-lg font-bold font-display text-white">🩺 Antrian Pasien Anda</h3>

          {/* Search Input Filter */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama, No. RM, NIK, atau Telp..."
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 pl-9 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Search className="h-3.5 w-3.5" />
            </div>
          </div>

          {loading ? (
            <div className="text-zinc-500 text-sm py-12 text-center">Memuat antrian dokter...</div>
          ) : (() => {
            const filtered = registrations.filter(r => {
              const query = searchQuery.toLowerCase()
              return (
                r.pasien.nama.toLowerCase().includes(query) ||
                r.pasien.noRekamMedis.toLowerCase().includes(query) ||
                (r.pasien.nik && r.pasien.nik.toLowerCase().includes(query)) ||
                (r.pasien.telepon && r.pasien.telepon.toLowerCase().includes(query))
              )
            })

            if (filtered.length === 0) {
              return (
                <div className="glass-panel p-8 text-center rounded-2xl text-zinc-500 text-sm">
                  Tidak ada pasien yang cocok dengan pencarian.
                </div>
              )
            }

            return (
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
                {filtered.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReg(r)}
                    className={`w-full glass-panel p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                      selectedReg?.id === r.id
                        ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-600/5'
                        : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">{r.pasien.nama}</span>
                        <span className="text-[9px] text-zinc-500 font-mono shrink-0">({r.pasien.noRekamMedis})</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        Poli: {r.poli.nama} &bull; Dokter: {r.dokter.nama}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        Tensi: <span className="text-zinc-300 font-semibold">{r.tensiSistolik || '--'}/{r.tensiDiastolik || '--'}</span> &bull; Suhu: <span className="text-zinc-300 font-semibold">{r.suhuTubuh || '--'}&deg;C</span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded shrink-0 uppercase ${
                      r.triaseColor === 'MERAH'
                        ? 'bg-red-500/10 text-red-400'
                        : r.triaseColor === 'KUNING'
                        ? 'bg-amber-500/10 text-amber-400'
                        : r.triaseColor === 'BIRU'
                        ? 'bg-sky-500/10 text-sky-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {r.triaseColor || 'HIJAU'}
                    </span>
                  </button>
                ))}
              </div>
            )
          })()}
        </div>

        {/* Right column: SOAP EHR input form (8 columns) */}
        <div className="lg:col-span-8">
          {selectedReg ? (
            <form onSubmit={handleSubmitSOAP} className="glass-panel p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-6">
              {/* Patient Banner */}
              <div className="pb-4 border-b border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Lembar Rekam Medis (EHR)</span>
                  <h4 className="font-bold text-lg text-white">{selectedReg.pasien.nama} ({selectedReg.pasien.noRekamMedis})</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {selectedReg.pasien.jenisKelamin.replace('_', '-')} &bull; {getAge(selectedReg.pasien.tanggalLahir)} Tahun &bull; Triage: {selectedReg.triaseColor || 'HIJAU'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReg(null)}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  Tutup Form
                </button>
              </div>

              {/* Vitals Summary Badge panel */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-zinc-900/40 border border-zinc-850 p-3 rounded-2xl text-xs">
                <div>
                  <span className="text-zinc-500 block">Suhu Tubuh</span>
                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <Thermometer className="h-3.5 w-3.5 text-red-400" />
                    {selectedReg.suhuTubuh ? `${selectedReg.suhuTubuh} °C` : '--'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Tekanan Darah</span>
                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <Heart className="h-3.5 w-3.5 text-pink-400" />
                    {selectedReg.tensiSistolik && selectedReg.tensiDiastolik ? `${selectedReg.tensiSistolik}/${selectedReg.tensiDiastolik}` : '--'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Detak Nadi</span>
                  <span className="font-bold text-white mt-0.5 block">{selectedReg.nadi ? `${selectedReg.nadi} bpm` : '--'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Berat / Tinggi</span>
                  <span className="font-bold text-white mt-0.5 block">
                    {selectedReg.beratBadan || '--'}kg / {selectedReg.tinggiBadan || '--'}cm
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Poli / Dokter</span>
                  <span className="font-semibold text-indigo-400 mt-0.5 block truncate">{selectedReg.poli.nama}</span>
                </div>
              </div>

              {/* SOAP Textareas */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Subjective (S) - Keluhan Pasien</label>
                  <textarea
                    required
                    value={subjektif}
                    onChange={(e) => setSubjektif(e.target.value)}
                    placeholder="Masukkan keluhan subjektif pasien..."
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 px-4 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Objective (O) - Pemeriksaan Fisik</label>
                  <textarea
                    required
                    value={objektif}
                    onChange={(e) => setObjektif(e.target.value)}
                    placeholder="Hasil pemeriksaan objektif medis..."
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 px-4 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Assessment (A) - Diagnosa Dokter</label>
                  <textarea
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    placeholder="Diagnosa umum (atau biarkan kosong jika memilih ICD-10)..."
                    rows={3}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 px-4 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Plan (P) - Tindakan Medis</label>
                  <textarea
                    required
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    placeholder="E.g. disuntik analgesik, direkomendasikan tirah baring..."
                    rows={3}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 px-4 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              {/* ICD-10 Diagnoses Grid selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Kode Diagnosa ICD-10</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {COMMON_ICD10.map((icd) => (
                    <button
                      key={icd.code}
                      type="button"
                      onClick={() => handleToggleICD(icd.code)}
                      className={`p-3 rounded-xl border text-[10px] font-bold text-left transition-all ${
                        diagnosaICD.includes(icd.code)
                          ? 'bg-indigo-600 text-white border-indigo-400 scale-[1.02]'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <span className="block text-white font-mono">{icd.code}</span>
                      <span className="text-[8px] text-zinc-400 block truncate mt-0.5 leading-tight">{icd.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prescription Editor */}
              <div className="border-t border-zinc-850 pt-5 space-y-4">
                <h4 className="font-bold text-sm text-white">💊 Resep Elektronik (e-Prescription)</h4>
                
                {/* Entry fields */}
                <div className="grid md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-5">
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1.5">Nama Obat</label>
                    <select
                      value={currentObatId}
                      onChange={(e) => setCurrentObatId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    >
                      <option value="">-- Pilih Obat --</option>
                      {activeObats.map(o => (
                        <option key={o.id} value={o.id} disabled={o.stok <= 0}>
                          {o.nama} (Stok: {o.stok} {o.satuan})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1.5">Jumlah</label>
                    <input
                      type="number"
                      value={currentJumlah}
                      onChange={(e) => setCurrentJumlah(parseInt(e.target.value) || 1)}
                      min={1}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1.5">Aturan Pakai</label>
                    <input
                      type="text"
                      value={currentAturan}
                      onChange={(e) => setCurrentAturan(e.target.value)}
                      placeholder="3x1 sesudah makan"
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddPrescriptionItem}
                      disabled={!currentObatId}
                      className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah</span>
                    </button>
                  </div>
                </div>

                {/* Added Prescription Items Table */}
                {prescriptionList.length > 0 && (
                  <div className="bg-zinc-950/60 rounded-2xl border border-zinc-850 overflow-hidden text-xs">
                    <table className="w-full text-left divide-y divide-zinc-850">
                      <thead className="bg-zinc-900 text-zinc-400">
                        <tr>
                          <th className="p-3 font-semibold">Nama Obat</th>
                          <th className="p-3 font-semibold text-center">Jumlah</th>
                          <th className="p-3 font-semibold">Aturan Pakai</th>
                          <th className="p-3 font-semibold text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        {prescriptionList.map((item) => (
                          <tr key={item.obatId} className="hover:bg-zinc-900/40">
                            <td className="p-3 font-semibold text-white">{item.nama}</td>
                            <td className="p-3 text-center font-mono">{item.jumlah}</td>
                            <td className="p-3 text-zinc-300">{item.aturan}</td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePrescriptionItem(item.obatId)}
                                className="text-red-400 hover:text-red-300 transition-colors p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-semibold py-4 rounded-2xl text-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                {isSubmitting ? 'Menyimpan SOAP...' : 'Simpan Rekam Medis & Kirim Resep ke Apotik'}
              </button>

            </form>
          ) : (
            <div className="glass-panel p-12 text-center rounded-3xl bg-zinc-900/10 border border-zinc-800 text-zinc-500 text-sm">
              <Stethoscope className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
              Pilih pasien di kolom sebelah kiri untuk membuka Rekam Medis (EHR) elektronik pasien dan melakukan pemeriksaan medis.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  )
}
