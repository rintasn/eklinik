'use client'

import { useState, useEffect } from 'react'
import { Settings, Key, Shield, Wifi, CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff, Save, Activity } from 'lucide-react'

export default function AdminConfigPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingBpjs, setTestingBpjs] = useState(false)
  const [testingAsuransi, setTestingAsuransi] = useState(false)

  const [bpjsApiKey, setBpjsApiKey] = useState('')
  const [bpjsApiUrl, setBpjsApiUrl] = useState('https://api.bpjs-kesehatan.go.id/vclaim-rest')
  const [asuransiApiKey, setAsuransiApiKey] = useState('')
  const [asuransiApiUrl, setAsuransiApiUrl] = useState('https://api.asuransi-provider.com/v1')

  const [showBpjsKey, setShowBpjsKey] = useState(false)
  const [showAsuransiKey, setShowAsuransiKey] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [bpjsTestResult, setBpjsTestResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [asuransiTestResult, setAsuransiTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const loadConfig = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/config')
      const data = await res.json()
      if (data.success) {
        setBpjsApiKey(data.data.bpjs_api_key)
        setBpjsApiUrl(data.data.bpjs_api_url)
        setAsuransiApiKey(data.data.asuransi_api_key)
        setAsuransiApiUrl(data.data.asuransi_api_url)
      } else {
        setError(data.error || 'Gagal memuat konfigurasi.')
      }
    } catch {
      setError('Kesalahan jaringan saat memuat konfigurasi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/v1/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bpjs_api_key: bpjsApiKey,
          bpjs_api_url: bpjsApiUrl,
          asuransi_api_key: asuransiApiKey,
          asuransi_api_url: asuransiApiUrl
        })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Konfigurasi API berhasil disimpan dan diperbarui ke database.')
      } else {
        setError(data.error || 'Gagal menyimpan konfigurasi.')
      }
    } catch {
      setError('Kesalahan jaringan saat menyimpan konfigurasi.')
    } finally {
      setSaving(false)
    }
  }

  const handleTestBpjs = async () => {
    setTestingBpjs(true)
    setBpjsTestResult(null)
    try {
      const res = await fetch('/api/v1/config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'BPJS' })
      })
      const data = await res.json()
      setBpjsTestResult({ ok: data.success, msg: data.message || data.error })
    } catch {
      setBpjsTestResult({ ok: false, msg: 'Koneksi gagal. Server tidak merespon.' })
    } finally {
      setTestingBpjs(false)
    }
  }

  const handleTestAsuransi = async () => {
    setTestingAsuransi(true)
    setAsuransiTestResult(null)
    try {
      const res = await fetch('/api/v1/config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'ASURANSI' })
      })
      const data = await res.json()
      setAsuransiTestResult({ ok: data.success, msg: data.message || data.error })
    } catch {
      setAsuransiTestResult({ ok: false, msg: 'Koneksi gagal. Server tidak merespon.' })
    } finally {
      setTestingAsuransi(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-zinc-500 text-sm">Memuat konfigurasi sistem...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Konfigurasi Sistem</h2>
          <p className="text-zinc-400 text-sm mt-1">Kelola API key dan endpoint untuk integrasi BPJS Kesehatan dan jaringan asuransi mitra klinik.</p>
        </div>
        <button
          onClick={loadConfig}
          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-3 py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Security Warning */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">Peringatan Keamanan</p>
          <p className="text-zinc-400 text-xs">
            API key yang disimpan di sini bersifat rahasia dan disimpan terenkripsi di database. Jangan bagikan key ini kepada siapapun. Akses halaman ini dibatasi hanya untuk pengguna dengan role <span className="font-bold text-white">ADMIN</span>.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-4 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* ─── BPJS SECTION ─────────────────────────────── */}
        <div className="glass-panel p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-5">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600/15 flex items-center justify-center border border-blue-500/20">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-white font-display">BPJS Kesehatan</h3>
                <p className="text-[11px] text-zinc-500">Integrasi V-Claim REST API 2.0</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTestBpjs}
              disabled={testingBpjs}
              className="flex items-center gap-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all disabled:opacity-50"
            >
              {testingBpjs
                ? <><span className="h-3 w-3 rounded-full border border-blue-400 border-t-transparent animate-spin" />Menguji...</>
                : <><Wifi className="h-3.5 w-3.5" />Test Koneksi</>
              }
            </button>
          </div>

          {/* Test Result */}
          {bpjsTestResult && (
            <div className={`flex items-start gap-2 text-xs p-3 rounded-xl border ${bpjsTestResult.ok ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {bpjsTestResult.ok ? <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
              <span>{bpjsTestResult.msg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {/* API Endpoint */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                URL Endpoint API
              </label>
              <input
                type="url"
                value={bpjsApiUrl}
                onChange={(e) => setBpjsApiUrl(e.target.value)}
                placeholder="https://api.bpjs-kesehatan.go.id/vclaim-rest"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all"
              />
              <p className="text-[10px] text-zinc-600 mt-1">Endpoint resmi V-Claim BPJS: <span className="font-mono">https://api.bpjs-kesehatan.go.id/vclaim-rest</span></p>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Key className="h-3 w-3" />
                API Key / Consumer Key
              </label>
              <div className="relative">
                <input
                  type={showBpjsKey ? 'text' : 'password'}
                  value={bpjsApiKey}
                  onChange={(e) => setBpjsApiKey(e.target.value)}
                  placeholder="Masukkan Consumer Key dari BPJS Developer Portal"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowBpjsKey(!showBpjsKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showBpjsKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-zinc-600 mt-1">Dapatkan Consumer Key di: <span className="font-mono text-blue-500">developer.bpjs-kesehatan.go.id</span></p>
            </div>
          </div>
        </div>

        {/* ─── ASURANSI SECTION ──────────────────────────── */}
        <div className="glass-panel p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-5">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600/15 flex items-center justify-center border border-emerald-500/20">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white font-display">Asuransi Kesehatan Swasta</h3>
                <p className="text-[11px] text-zinc-500">Integrasi API Gateway jaringan asuransi mitra</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTestAsuransi}
              disabled={testingAsuransi}
              className="flex items-center gap-1.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all disabled:opacity-50"
            >
              {testingAsuransi
                ? <><span className="h-3 w-3 rounded-full border border-emerald-400 border-t-transparent animate-spin" />Menguji...</>
                : <><Wifi className="h-3.5 w-3.5" />Test Koneksi</>
              }
            </button>
          </div>

          {/* Test Result */}
          {asuransiTestResult && (
            <div className={`flex items-start gap-2 text-xs p-3 rounded-xl border ${asuransiTestResult.ok ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {asuransiTestResult.ok ? <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
              <span>{asuransiTestResult.msg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {/* API Endpoint */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                URL Endpoint API Gateway
              </label>
              <input
                type="url"
                value={asuransiApiUrl}
                onChange={(e) => setAsuransiApiUrl(e.target.value)}
                placeholder="https://api.asuransi-provider.com/v1"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* API Key */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Key className="h-3 w-3" />
                API Key / Bearer Token
              </label>
              <div className="relative">
                <input
                  type={showAsuransiKey ? 'text' : 'password'}
                  value={asuransiApiKey}
                  onChange={(e) => setAsuransiApiKey(e.target.value)}
                  placeholder="Masukkan API Key dari provider asuransi"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowAsuransiKey(!showAsuransiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showAsuransiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-semibold py-4 rounded-2xl text-sm active:scale-[0.98] transition-all cursor-pointer"
        >
          {saving ? (
            <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Menyimpan Konfigurasi...</>
          ) : (
            <><Save className="h-4 w-4" />Simpan Semua Konfigurasi</>
          )}
        </button>
      </form>
    </div>
  )
}
