'use client'

import { useState } from 'react'
import { FolderHeart, Search, FileText, Clipboard, Heart, ArrowUpRight } from 'lucide-react'

interface MedicalHistory {
  tanggal: string
  poli: string
  dokter: string
  subjektif: string
  objektif: string
  assessment: string
  plan: string
  icd10: string[]
  resep: string[]
}

interface PatientArchive {
  id: string
  nama: string
  noRM: string
  nik: string
  tanggalLahir: string
  jenisKelamin: string
  riwayat: MedicalHistory[]
}

export default function RekamMedikPage() {
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<PatientArchive | null>(null)

  const [patients] = useState<PatientArchive[]>([
    {
      id: '1',
      nama: 'Ahmad Syarif',
      noRM: 'RM-000101',
      nik: '3271039847190001',
      tanggalLahir: '1990-08-12',
      jenisKelamin: 'LAKI_LAKI',
      riwayat: [
        {
          tanggal: '2026-06-25',
          poli: 'Poli Umum',
          dokter: 'dr. Rian Hidayat',
          subjektif: 'Nyeri perut sebelah kanan bawah, mual (+) sejak kemarin malam.',
          objektif: 'Nyeri tekan titik McBurney (+), Suhu 38.2 C.',
          assessment: 'Appendicitis Akut',
          plan: 'Rujuk ke Bedah Sentral untuk Appendectomy.',
          icd10: ['K35.8 (Appendicitis)'],
          resep: ['Paracetamol 500mg (3x1 tab)', 'Metronidazole 500mg (3x1 tab)']
        },
        {
          tanggal: '2026-05-10',
          poli: 'Poli Umum',
          dokter: 'dr. Rian Hidayat',
          subjektif: 'Batuk berdahak dan pilek disertai bersin sejak 3 hari.',
          objektif: 'Faring hiperemis (+), ronki (-). Suhu 37.1 C.',
          assessment: 'Common Cold / ISPA',
          plan: 'Edukasi istirahat cukup, hindari minuman dingin.',
          icd10: ['J00 (Common Cold)', 'J06.9 (ISPA)'],
          resep: ['Ambroxol 30mg (3x1 tab)', 'Cetirizine 10mg (1x1 tab)']
        }
      ]
    },
    {
      id: '2',
      nama: 'Budi Santoso',
      noRM: 'RM-000102',
      nik: '3271039847190002',
      tanggalLahir: '1985-03-24',
      jenisKelamin: 'LAKI_LAKI',
      riwayat: [
        {
          tanggal: '2026-06-20',
          poli: 'Poli Gigi',
          dokter: 'drg. Amelia Putri',
          subjektif: 'Gigi geraham belakang kiri bawah ngilu bila minum air dingin.',
          objektif: 'Karies profunda pada gigi 36.',
          assessment: 'Pulpitis Reversibel',
          plan: 'Lakukan perawatan saluran akar gigi (PSA) & tumpatan komposit.',
          icd10: ['K04.0 (Pulpitis)'],
          resep: ['Asam Mefenamat 500mg (3x1 tab)', 'Clindamycin 150mg (3x1 tab)']
        }
      ]
    }
  ])

  const handleSearch = () => {
    const found = patients.find(p => p.noRM.toLowerCase() === search.toLowerCase() || p.nik === search || p.nama.toLowerCase().includes(search.toLowerCase()))
    if (found) {
      setSelectedPatient(found)
    } else {
      setSelectedPatient(null)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold font-display dark:text-white">Arsip Rekam Medik Elektronik</h2>
        <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Pencarian rekam sejarah medis pasien (EHR), riwayat kunjungan poli, serta kodifikasi catatan SOAP & resep.</p>
      </div>

      {/* Lookup search bar */}
      <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Cari Pasien (Nama, NIK, atau No. Rekam Medis)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Contoh: RM-000101 atau Ahmad Syarif..."
              className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-indigo-500 transition-all font-mono"
            />
            <button
              onClick={handleSearch}
              className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold text-xs px-4 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Cari Arsip</span>
            </button>
          </div>
        </div>
      </div>

      {selectedPatient ? (
        <div className="grid lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Patient demographic profile (4 cols) */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-5 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FolderHeart className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm dark:text-white leading-tight">{selectedPatient.nama}</h4>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5 block">{selectedPatient.noRM}</span>
              </div>
            </div>

            <div className="space-y-3.5 border-t border-slate-100 dark:border-zinc-800/80 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-400">NIK:</span>
                <span className="font-semibold dark:text-zinc-300 font-mono">{selectedPatient.nik}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal Lahir:</span>
                <span className="font-semibold dark:text-zinc-300">{selectedPatient.tanggalLahir}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jenis Kelamin:</span>
                <span className="font-semibold dark:text-zinc-300">{selectedPatient.jenisKelamin.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Patient SOAP history logs (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-lg font-bold font-display dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              <span>Kronologis Rekam Medis</span>
            </h3>

            <div className="space-y-6">
              {selectedPatient.riwayat.map((riw, idx) => (
                <div key={idx} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-zinc-800 text-xs">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{riw.poli} &bull; {riw.dokter}</span>
                    <span className="text-slate-400 dark:text-zinc-500 font-semibold">{riw.tanggal}</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[9px] mb-0.5">S (Subjective)</span>
                      <p className="text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/80">{riw.subjektif}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[9px] mb-0.5">O (Objective)</span>
                      <p className="text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/80">{riw.objektif}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[9px] mb-0.5">A (Assessment)</span>
                      <p className="text-slate-750 dark:text-zinc-300 font-bold bg-indigo-500/5 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-500/10 text-indigo-750 dark:text-indigo-400">{riw.assessment}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[9px] mb-0.5">P (Plan)</span>
                      <p className="text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/80">{riw.plan}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[9px] mb-1">Diagnosa ICD-10</span>
                      <div className="flex flex-wrap gap-1.5">
                        {riw.icd10.map((icd, i) => (
                          <span key={i} className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded font-mono text-[10px]">{icd}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[9px] mb-1">E-Resep Elektronik</span>
                      <div className="flex flex-wrap gap-1.5">
                        {riw.resep.map((res, i) => (
                          <span key={i} className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 px-2 py-0.5 rounded text-[10px]">{res}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-3xl text-slate-400 dark:text-zinc-500 text-sm">
          Gunakan kolom pencarian di atas untuk memanggil arsip rekam medis pasien.
        </div>
      )}
    </div>
  )
}
