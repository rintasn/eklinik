'use client'

export interface PatientVisit {
  tanggal: string
  subjektif: string
  objektif: string
  assessment: string
  plan: string
  pemeriksa: string
}

export interface IGDRecord {
  id: string
  pasienNama: string
  noRM: string
  triage: 'MERAH' | 'KUNING' | 'HIJAU' | 'HITAM'
  keluhan: string
  suhu: number
  tensi: string
  nadi: number
  bed: string
  dokterNama: string
  waktuMasuk: string
  status: 'DIRAWAT' | 'TRANSFER' | 'PULANG'
  visits: PatientVisit[]
}

export interface InpatientRecord {
  id: string
  pasienNama: string
  noRM: string
  ruangNama: string
  kelas: 'VIP' | 'KELAS_1' | 'KELAS_2' | 'KELAS_3'
  bedNo: string
  dokterNama: string
  tanggalMasuk: string
  status: 'DIRAWAT' | 'PULANG'
  sumber: 'MANUAL' | 'IGD' | 'RAWAT_JALAN'
  visits: PatientVisit[]
}

export interface BillingRecord {
  id: string
  pasienNama: string
  noRM: string
  tipeLayanan: 'RAWAT_JALAN' | 'RAWAT_DARURAT' | 'RAWAT_INAP'
  detailLayanan: string
  dokterNama: string
  tanggal: string
  polyFee: number
  medicineFee: number
  treatmentFee: number
  totalBill: number
  status: 'BELUM_BAYAR' | 'LUNAS'
  noKuitansi?: string
  metodePembayaran?: string
  nomorKartu?: string
  asuransiProvider?: string
}

// Helper to check if window is defined (SSR safety)
const isBrowser = typeof window !== 'undefined'

// ─── GETTERS ───
export function getIGDPatients(): IGDRecord[] {
  if (!isBrowser) return []
  try {
    const data = localStorage.getItem('eklinik-igd-patients')
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error(e)
  }
  // Default Seed Data
  const defaultSeed: IGDRecord[] = [
    { id: 'igd-1', pasienNama: 'Handoko Putra', noRM: 'RM-260004', triage: 'MERAH', keluhan: 'Nyeri dada mendadak & sesak napas berat', suhu: 36.5, tensi: '150/95', nadi: 110, bed: 'Bed Resusitasi A', dokterNama: 'dr. Sarah Sp.A', waktuMasuk: '10 menit yang lalu', status: 'DIRAWAT', visits: [] },
    { id: 'igd-2', pasienNama: 'Lilis Indah', noRM: 'RM-260005', triage: 'KUNING', keluhan: 'Fraktur tertutup tibia sinistra', suhu: 37.2, tensi: '120/80', nadi: 85, bed: 'Bed Tindakan 1', dokterNama: 'dr. Budi Setiawan', waktuMasuk: '35 menit yang lalu', status: 'DIRAWAT', visits: [] },
    { id: 'igd-3', pasienNama: 'Arief Budiman', noRM: 'RM-260006', triage: 'HIJAU', keluhan: 'Demam tinggi mendadak disertai mual muntah', suhu: 39.1, tensi: '115/75', nadi: 90, bed: 'Bed Observasi 2', dokterNama: 'dr. Budi Setiawan', waktuMasuk: '1 jam yang lalu', status: 'DIRAWAT', visits: [] },
  ]
  localStorage.setItem('eklinik-igd-patients', JSON.stringify(defaultSeed))
  return defaultSeed
}

export function getInpatients(): InpatientRecord[] {
  if (!isBrowser) return []
  try {
    const data = localStorage.getItem('eklinik-inpatients')
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error(e)
  }
  // Default Seed Data
  const defaultSeed: InpatientRecord[] = [
    { id: 'inp-1', pasienNama: 'Bambang Wijaya', noRM: 'RM-260001', ruangNama: 'Ruang Melati', kelas: 'VIP', bedNo: 'A1', dokterNama: 'dr. Sarah Sp.A', tanggalMasuk: '2026-06-25', status: 'DIRAWAT', sumber: 'MANUAL', visits: [] },
    { id: 'inp-2', pasienNama: 'Siti Aminah', noRM: 'RM-260002', ruangNama: 'Ruang Flamboyan', kelas: 'KELAS_2', bedNo: 'B3', dokterNama: 'drg. Siti Aminah', tanggalMasuk: '2026-06-27', status: 'DIRAWAT', sumber: 'MANUAL', visits: [] },
  ]
  localStorage.setItem('eklinik-inpatients', JSON.stringify(defaultSeed))
  return defaultSeed
}

export function getBillingRecords(): BillingRecord[] {
  if (!isBrowser) return []
  try {
    const data = localStorage.getItem('eklinik-billing')
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error(e)
  }
  return []
}

// ─── SETTERS ───
export function setIGDPatients(data: IGDRecord[]) {
  if (!isBrowser) return
  localStorage.setItem('eklinik-igd-patients', JSON.stringify(data))
}

export function setInpatients(data: InpatientRecord[]) {
  if (!isBrowser) return
  localStorage.setItem('eklinik-inpatients', JSON.stringify(data))
}

export function setBillingRecords(data: BillingRecord[]) {
  if (!isBrowser) return
  localStorage.setItem('eklinik-billing', JSON.stringify(data))
}

// ─── BUSINESS LOGIC ACTIONS ───

// 1. Add IGD Visit Entry
export function addIGDVisit(patientId: string, visit: PatientVisit) {
  const patients = getIGDPatients()
  const updated = patients.map(p => {
    if (p.id === patientId) {
      return {
        ...p,
        visits: [visit, ...p.visits]
      }
    }
    return p
  })
  setIGDPatients(updated)
}

// 2. Add Inpatient Visit Entry
export function addInpatientVisit(patientId: string, visit: PatientVisit) {
  const patients = getInpatients()
  const updated = patients.map(p => {
    if (p.id === patientId) {
      return {
        ...p,
        visits: [visit, ...p.visits]
      }
    }
    return p
  })
  setInpatients(updated)
}

// 3. Discharge IGD Patient (Pulang)
export function dischargeIGDPatient(patientId: string, treatmentFee = 350000) {
  const patients = getIGDPatients()
  const p = patients.find(pat => pat.id === patientId)
  if (!p) return

  // Update IGD Status
  const updated = patients.map(pat => pat.id === patientId ? { ...pat, status: 'PULANG' as const } : pat)
  setIGDPatients(updated)

  // Generate Pending Bill
  const bills = getBillingRecords()
  const newBill: BillingRecord = {
    id: `bill-igd-${patientId}`,
    pasienNama: p.pasienNama,
    noRM: p.noRM,
    tipeLayanan: 'RAWAT_DARURAT',
    detailLayanan: `Tindakan IGD Triage ${p.triage} (${p.keluhan})`,
    dokterNama: p.dokterNama,
    tanggal: new Date().toISOString().split('T')[0],
    polyFee: 50000, // IGD Base fee
    medicineFee: 0,
    treatmentFee,
    totalBill: 50000 + treatmentFee,
    status: 'BELUM_BAYAR'
  }
  setBillingRecords([newBill, ...bills])
}

// 4. Transfer IGD Patient to Inpatient (Rawat Inap)
export function transferIGDToInpatient(patientId: string, ruangNama = 'Ruang Melati', kelas: 'VIP' | 'KELAS_1' | 'KELAS_2' | 'KELAS_3' = 'KELAS_3', bedNo = 'B-IGD', treatmentFee = 350000) {
  const patients = getIGDPatients()
  const p = patients.find(pat => pat.id === patientId)
  if (!p) return

  // Update IGD Status
  const updated = patients.map(pat => pat.id === patientId ? { ...pat, status: 'TRANSFER' as const } : pat)
  setIGDPatients(updated)

  // Add to Inpatient List
  const inpatients = getInpatients()
  const newInpatient: InpatientRecord = {
    id: `inp-tr-${Date.now()}`,
    pasienNama: p.pasienNama,
    noRM: p.noRM,
    ruangNama,
    kelas,
    bedNo,
    dokterNama: p.dokterNama,
    tanggalMasuk: new Date().toISOString().split('T')[0],
    status: 'DIRAWAT',
    sumber: 'IGD',
    visits: []
  }
  setInpatients([newInpatient, ...inpatients])

  // Generate Pending IGD Bill immediately
  const bills = getBillingRecords()
  const newBill: BillingRecord = {
    id: `bill-igd-${patientId}`,
    pasienNama: p.pasienNama,
    noRM: p.noRM,
    tipeLayanan: 'RAWAT_DARURAT',
    detailLayanan: `Tindakan Triage IGD ${p.triage} sebelum Transfer Rawat Inap`,
    dokterNama: p.dokterNama,
    tanggal: new Date().toISOString().split('T')[0],
    polyFee: 50000,
    medicineFee: 0,
    treatmentFee,
    totalBill: 50000 + treatmentFee,
    status: 'BELUM_BAYAR'
  }
  setBillingRecords([newBill, ...bills])
}

// 5. Discharge Inpatient (Pulang)
export function dischargeInpatient(patientId: string, daysStayed = 1, dailyRate = 450000, treatmentFee = 250000) {
  const inpatients = getInpatients()
  const p = inpatients.find(pat => pat.id === patientId)
  if (!p) return

  // Update Inpatient Status
  const updated = inpatients.map(pat => pat.id === patientId ? { ...pat, status: 'PULANG' as const } : pat)
  setInpatients(updated)

  // Generate Pending Inpatient Bill
  const bills = getBillingRecords()
  const roomCost = dailyRate * daysStayed
  const newBill: BillingRecord = {
    id: `bill-inp-${patientId}`,
    pasienNama: p.pasienNama,
    noRM: p.noRM,
    tipeLayanan: 'RAWAT_INAP',
    detailLayanan: `Menginap di ${p.ruangNama} (${p.kelas.replace('_', ' ')}) selama ${daysStayed} hari`,
    dokterNama: p.dokterNama,
    tanggal: new Date().toISOString().split('T')[0],
    polyFee: roomCost, // Use polyFee slot for room cost
    medicineFee: 0,
    treatmentFee,
    totalBill: roomCost + treatmentFee,
    status: 'BELUM_BAYAR'
  }
  setBillingRecords([newBill, ...bills])
}

// 6. Recommend Inpatient from Outpatient (Doctor SOAP decision)
export function recommendInpatientFromOutpatient(pasienNama: string, noRM: string, dokterNama: string) {
  const inpatients = getInpatients()
  
  // Check if patient already active in Inpatient
  const exists = inpatients.some(pat => pat.noRM === noRM && pat.status === 'DIRAWAT')
  if (exists) return

  const newInpatient: InpatientRecord = {
    id: `inp-rec-${Date.now()}`,
    pasienNama,
    noRM,
    ruangNama: 'Ruang Melati', // default admissions ward
    kelas: 'KELAS_3', // default class
    bedNo: 'A-REK', // recommendation bed
    dokterNama,
    tanggalMasuk: new Date().toISOString().split('T')[0],
    status: 'DIRAWAT',
    sumber: 'RAWAT_JALAN',
    visits: []
  }
  setInpatients([newInpatient, ...inpatients])
}
