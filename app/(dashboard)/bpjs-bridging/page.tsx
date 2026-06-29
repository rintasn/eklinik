'use client'

import { useState } from 'react'
import { Link as LinkIcon, Search, Play, CheckCircle, RefreshCw, Server, FileText, Activity } from 'lucide-react'

export default function BPJSBridgingPage() {
  const [bpjsNo, setBpjsNo] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyResult, setVerifyResult] = useState<any>(null)

  // Tariff calculator simulator
  const [icd10Input, setIcd10Input] = useState('')
  const [inacbgResult, setInacbgResult] = useState<any>(null)

  // API logs simulator
  const [logs] = useState([
    { timestamp: '14:28:01', endpoint: 'GET /v2.0/Peserta/nokartu/000185938472', status: 200, latency: '120ms', response: 'SUCCESS - Peserta Aktif Mandiri' },
    { timestamp: '14:15:10', endpoint: 'POST /v2.0/SEP/insert', status: 200, latency: '240ms', response: 'SUCCESS - SEP No: 0301R0110626V000041' },
    { timestamp: '12:00:35', endpoint: 'POST /inacbg/api/v1/claim/create', status: 200, latency: '350ms', response: 'SUCCESS - Claim ID: CL-938217' },
  ])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bpjsNo || bpjsNo.length < 11) return
    setLoading(true)
    setVerifyResult(null)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const mockRes = {
      nokartu: bpjsNo,
      nik: '3271039847190001',
      nama: 'Handoko Putra',
      statusPeserta: 'AKTIF',
      jenisPeserta: 'PBI (Penerima Bantuan Iuran) APBN',
      fktp: 'Klinik Pratama Siaga Medis',
      hakKelas: 'Kelas II'
    }
    setVerifyResult(mockRes)
    setLoading(false)
  }

  const handleInacbgSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!icd10Input) return

    setInacbgResult({
      icd10: icd10Input.toUpperCase(),
      codeInaCBG: 'K-4-17-I',
      deskripsiGroup: 'Gastroenteritis Ringan & Infeksi Saluran Cerna Lain',
      tarifKelas1: 1450000,
      tarifKelas2: 1200000,
      tarifKelas3: 980000,
    })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold font-display dark:text-white">Bridging BPJS & INACBGS</h2>
        <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Sistem integrasi API BPJS Kesehatan (VClaim/P-Care) dan klaim INACBGS E-Klaim Kemenkes.</p>
      </div>

      {/* Connection Status panel */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase block">VClaim BPJS API</span>
            <span className="text-xs font-bold text-emerald-500 mt-1 block flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Connected (v2.0)
            </span>
          </div>
          <Server className="h-8 w-8 text-emerald-500/20" />
        </div>
        <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase block">P-Care BPJS API</span>
            <span className="text-xs font-bold text-emerald-500 mt-1 block flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Connected (v1.4)
            </span>
          </div>
          <Server className="h-8 w-8 text-emerald-500/20" />
        </div>
        <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase block">INACBGS E-Klaim</span>
            <span className="text-xs font-bold text-emerald-500 mt-1 block flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Ready (v6.0.1)
            </span>
          </div>
          <Server className="h-8 w-8 text-indigo-500/20" />
        </div>
        <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase block">Bridging Trust-Key</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">Valid & Active</span>
          </div>
          <LinkIcon className="h-8 w-8 text-indigo-500/20" />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left column: BPJS Eligibility Verifier (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
            <div>
              <h3 className="text-lg font-bold font-display dark:text-white">🔍 Verifikasi Kartu Peserta BPJS</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Cek kelayakan peserta dan validasi FKTP melalui bridging API BPJS VClaim.</p>
            </div>

            <form onSubmit={handleVerify} className="flex gap-2">
              <input
                type="text"
                required
                value={bpjsNo}
                onChange={e => setBpjsNo(e.target.value.replace(/\D/g, ''))}
                maxLength={13}
                placeholder="Masukkan 13 Digit Nomor BPJS Kesehatan..."
                className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-indigo-500 font-mono tracking-wider transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
              >
                {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                <span>Verifikasi</span>
              </button>
            </form>

            {verifyResult && (
              <div className="bg-slate-50 dark:bg-zinc-950/60 p-5 rounded-2xl border border-slate-200 dark:border-zinc-850 space-y-4 text-xs animate-fade-in">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-zinc-850">
                  <span className="font-bold text-slate-900 dark:text-white">Data Kepesertaan BPJS</span>
                  <span className="font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">PESERTA {verifyResult.statusPeserta}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  <div>
                    <span className="text-slate-400 block">Nama Lengkap</span>
                    <span className="font-bold dark:text-zinc-300">{verifyResult.nama}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">NIK KTP</span>
                    <span className="font-semibold dark:text-zinc-300 font-mono">{verifyResult.nik}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Faskes Rujukan I</span>
                    <span className="font-semibold dark:text-zinc-300">{verifyResult.fktp}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Hak Kelas Rawat</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{verifyResult.hakKelas}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INACBGS Tariff Calculator */}
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
            <div>
              <h3 className="text-lg font-bold font-display dark:text-white">💰 Estimasi Grouping INACBGS</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Cari tarif klaim berdasarkan kodifikasi diagnosa ICD-10.</p>
            </div>

            <form onSubmit={handleInacbgSearch} className="flex gap-2">
              <input
                type="text"
                required
                value={icd10Input}
                onChange={e => setIcd10Input(e.target.value)}
                placeholder="E.g. A09 (Gastroenteritis) atau J06.9 (ISPA)..."
                className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-indigo-500 transition-all font-mono"
              />
              <button type="submit" className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold text-xs px-4 rounded-xl cursor-pointer">Cari Tarif</button>
            </form>

            {inacbgResult && (
              <div className="bg-slate-50 dark:bg-zinc-950/60 p-5 rounded-2xl border border-slate-200 dark:border-zinc-850 space-y-4 text-xs animate-fade-in">
                <div>
                  <span className="text-slate-400 block font-bold text-[9px] uppercase">Group Diagnosa</span>
                  <span className="font-bold dark:text-zinc-300 block mt-0.5 text-sm">{inacbgResult.deskripsiGroup}</span>
                  <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 block">INA-CBG Code: {inacbgResult.codeInaCBG} (ICD10: {inacbgResult.icd10})</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-zinc-850 text-center">
                  <div className="bg-white dark:bg-zinc-900/30 p-2 rounded-lg border border-slate-100 dark:border-zinc-800">
                    <span className="text-[9px] text-slate-400 block">Kelas 3</span>
                    <span className="font-bold dark:text-zinc-300">Rp {inacbgResult.tarifKelas3.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900/30 p-2 rounded-lg border border-slate-100 dark:border-zinc-800">
                    <span className="text-[9px] text-slate-400 block">Kelas 2</span>
                    <span className="font-bold dark:text-zinc-300">Rp {inacbgResult.tarifKelas2.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900/30 p-2 rounded-lg border border-slate-100 dark:border-zinc-800">
                    <span className="text-[9px] text-slate-400 block">Kelas 1</span>
                    <span className="font-bold dark:text-zinc-300">Rp {inacbgResult.tarifKelas1.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Bridging API Log Console (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold font-display dark:text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500" />
                <span>Console API Live Log</span>
              </h3>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="font-mono text-[10px] space-y-3 bg-slate-950 text-emerald-400 p-4 rounded-2xl border border-zinc-850 h-80 overflow-y-auto">
              <div className="text-zinc-500">// Menghubungkan ke BPJS trust server... OK</div>
              {logs.map((log, i) => (
                <div key={i} className="space-y-1 pb-2 border-b border-zinc-900/50">
                  <div className="flex justify-between text-zinc-500">
                    <span>[{log.timestamp}]</span>
                    <span>{log.latency}</span>
                  </div>
                  <div className="font-bold text-white">{log.endpoint}</div>
                  <div className="text-emerald-300">HTTP {log.status} &bull; {log.response}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
