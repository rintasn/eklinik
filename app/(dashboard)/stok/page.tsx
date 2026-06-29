'use client'

import { useState, useEffect } from 'react'
import { Activity, Clipboard, CheckCircle, AlertCircle, RefreshCw, Package, Search, ChevronRight, Plus } from 'lucide-react'

interface Obat {
  id: string
  kode: string
  nama: string
  satuan: string
  stok: number
  stokMinimum: number
  hargaBeli: number
  hargaJual: number
  expiredDate?: string
  stokLogs?: { id: string; tipe: string; jumlah: number; keterangan: string; createdAt: string }[]
}

interface Alkes {
  id: string
  kode: string
  nama: string
  jumlah: number
  kondisi: string
  lastMaintenance?: string
  nextMaintenance?: string
}

export default function StokManagementPage() {
  const [tab, setTab] = useState<'obat' | 'alkes'>('obat')
  const [obats, setObats] = useState<Obat[]>([])
  const [alkesList, setAlkesList] = useState<Alkes[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // "all" | "low-stock" | "expired"

  // Restock form state
  const [selectedObat, setSelectedObat] = useState<Obat | null>(null)
  const [restockQty, setRestockQty] = useState(50)
  const [poNumber, setPoNumber] = useState('')
  
  // Add new drug form state
  const [showAddDrug, setShowAddDrug] = useState(false)
  const [newKode, setNewKode] = useState('')
  const [newNama, setNewNama] = useState('')
  const [newSatuan, setNewSatuan] = useState('Tablet')
  const [newStok, setNewStok] = useState(100)
  const [newMinStok, setNewMinStok] = useState(20)
  const [newBeli, setNewBeli] = useState(200)
  const [newJual, setNewJual] = useState(500)
  const [newExpired, setNewExpired] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      // 1. Fetch medicines
      const obatUrl = `/api/v1/obat?q=${query}&filter=${filterType !== 'all' ? filterType : ''}`
      const obatRes = await fetch(obatUrl)
      const obatData = await obatRes.json()
      if (obatData.success) {
        setObats(obatData.data)
      }

      // 2. Fetch alkes (mocked or load from dummy list since we didn't write an API, or write a quick fetch, in our DB we seeded AlatKesehatan)
      // Let's call standard prisma endpoint or query directly, wait, we can fetch from a mock endpoint or fetch it.
      // Let's fetch from our general backend. Since we didn't write `/api/v1/alkes` route, let's write a quick client fetch or mock list.
      // Wait, we can fetch from /api/v1/laporan or create a quick api endpoint for alkes.
      // Actually, let's write a quick API route `/api/v1/alkes/route.ts` next to retrieve alkes, or we can just fetch it directly! Let's do it in the background or fetch it. Let's make sure it handles alkes. We can create `/api/v1/alkes/route.ts` to query prisma.alatKesehatan.
      const alkesRes = await fetch('/api/v1/alkes')
      if (alkesRes.ok) {
        const alkesData = await alkesRes.json()
        if (alkesData.success) {
          setAlkesList(alkesData.data)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [query, filterType, tab])

  // Process restock PO
  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedObat) return

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    const payload = {
      id: selectedObat.id,
      restockQty,
      purchaseOrderNumber: poNumber
    }

    try {
      const res = await fetch('/api/v1/obat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setSuccess(`Stok obat ${selectedObat.nama} berhasil ditambah sebanyak ${restockQty} ${selectedObat.satuan}.`)
        setSelectedObat(null)
        setPoNumber('')
        setRestockQty(50)
        loadData()
      } else {
        const data = await res.json()
        setError(data.error || 'Gagal merestock obat.')
      }
    } catch (err) {
      setError('Kesalahan koneksi saat merestock.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Process Add New Drug
  const handleAddDrugSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    const payload = {
      kode: newKode,
      nama: newNama,
      satuan: newSatuan,
      stok: newStok,
      stokMinimum: newMinStok,
      hargaBeli: newBeli,
      hargaJual: newJual,
      expiredDate: newExpired || null
    }

    try {
      const res = await fetch('/api/v1/obat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan obat baru.')
      } else {
        setSuccess(`Obat baru ${data.data.nama} (${data.data.kode}) berhasil didaftarkan ke logistik.`)
        setShowAddDrug(false)
        setNewKode('')
        setNewNama('')
        setNewExpired('')
        loadData()
      }
    } catch (err) {
      setError('Kesalahan jaringan saat menyimpan obat.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Logistik Stok & Inventaris</h2>
          <p className="text-zinc-400 text-sm mt-1">Pantau stok obat farmasi klinik, catat PO barang masuk, lacak masa kadaluarsa, dan kelola kelayakan alat kesehatan.</p>
        </div>
        <div className="flex gap-2">
          {tab === 'obat' && (
            <button
              onClick={() => setShowAddDrug(true)}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Obat Baru</span>
            </button>
          )}
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-3 py-2.5 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setTab('obat')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
            tab === 'obat'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          💊 Stok Obat Farmasi
        </button>
        <button
          onClick={() => setTab('alkes')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
            tab === 'alkes'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          🩺 Inventaris Alat Medis
        </button>
      </div>

      {/* Alerts */}
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

      {tab === 'obat' ? (
        /* ======================== TAB 1: MEDICINES ======================== */
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Search & Medicine Table (8 columns) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Search and Filters */}
            <div className="grid md:grid-cols-12 gap-4">
              <div className="md:col-span-6 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari kode atau nama obat..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 pl-11 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-6 flex gap-2">
                {['all', 'low-stock', 'expired'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setFilterType(filter)}
                    className={`flex-1 py-3 px-3 rounded-2xl text-[10px] font-bold border uppercase tracking-wider transition-all cursor-pointer ${
                      filterType === filter
                        ? 'bg-indigo-600 border-indigo-400 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {filter === 'all' ? 'Semua Obat' : filter === 'low-stock' ? '⚠️ Stok Menipis' : '⌛ Hampir Expired'}
                  </button>
                ))}
              </div>
            </div>

            {/* List Table */}
            {loading ? (
              <div className="text-zinc-500 text-sm py-12 text-center">Memuat inventaris...</div>
            ) : obats.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-2xl text-zinc-500 text-sm">
                Tidak ada data obat yang cocok dengan filter.
              </div>
            ) : (
              <div className="bg-zinc-900/20 rounded-2xl border border-zinc-800 overflow-hidden text-xs">
                <table className="w-full text-left divide-y divide-zinc-800">
                  <thead className="bg-zinc-900/50 text-zinc-400">
                    <tr>
                      <th className="p-3.5 font-semibold">Nama & Kode</th>
                      <th className="p-3.5 font-semibold text-center">Stok Aktif</th>
                      <th className="p-3.5 font-semibold">Kadaluarsa</th>
                      <th className="p-3.5 font-semibold">Harga Jual</th>
                      <th className="p-3.5 font-semibold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {obats.map((o) => {
                      const isLow = o.stok <= o.stokMinimum
                      const today = new Date()
                      const exp = o.expiredDate ? new Date(o.expiredDate) : null
                      const isExpiring = exp && exp.getTime() - today.getTime() < (90 * 24 * 60 * 60 * 1000)
                      return (
                        <tr key={o.id} className="hover:bg-zinc-900/30">
                          <td className="p-3.5 font-semibold text-white">
                            <span>{o.nama}</span>
                            <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">{o.kode}</span>
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] ${
                              isLow ? 'bg-red-500/10 text-red-400' : 'bg-zinc-850 text-zinc-300'
                            }`}>
                              {o.stok} {o.satuan} {isLow && '⚠️'}
                            </span>
                          </td>
                          <td className={`p-3.5 font-semibold ${isExpiring ? 'text-amber-400' : 'text-zinc-300'}`}>
                            {o.expiredDate ? new Date(o.expiredDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: '2-digit' }) : '--'}
                            {isExpiring && <span className="block text-[8px] text-amber-500 font-medium tracking-wide uppercase mt-0.5">Exp Soon!</span>}
                          </td>
                          <td className="p-3.5 font-mono text-zinc-300">Rp {Number(o.hargaJual).toLocaleString()}</td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => setSelectedObat(o)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                            >
                              Restock &rarr;
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Restock Form / Stock logs (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            {selectedObat ? (
              <form onSubmit={handleRestockSubmit} className="glass-panel p-5 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-4">
                <div className="pb-2 border-b border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-white">📦 Sesi Restock (PO)</span>
                  <button
                    type="button"
                    onClick={() => setSelectedObat(null)}
                    className="text-xs text-zinc-500 hover:text-white"
                  >
                    Batal
                  </button>
                </div>

                <div className="bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 text-xs">
                  <span className="text-zinc-500 block">Nama Obat</span>
                  <span className="font-bold text-white block mt-0.5">{selectedObat.nama}</span>
                  <span className="text-zinc-400 block mt-1">Stok Saat Ini: {selectedObat.stok} {selectedObat.satuan}</span>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Jumlah Restock</label>
                  <input
                    type="number"
                    required
                    value={restockQty}
                    onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
                    min={1}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">No. Purchase Order (PO)</label>
                  <input
                    type="text"
                    required
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="PO-XXXXXX"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-semibold py-3 rounded-xl text-xs active:scale-95 transition-all cursor-pointer text-center"
                >
                  {isSubmitting ? 'Memproses PO...' : 'Simpan Intake Barang Masuk'}
                </button>
              </form>
            ) : showAddDrug ? (
              /* Add New Medicine Form */
              <form onSubmit={handleAddDrugSubmit} className="glass-panel p-5 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-4">
                <div className="pb-2 border-b border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-white">💊 Daftarkan Obat Baru</span>
                  <button
                    type="button"
                    onClick={() => setShowAddDrug(false)}
                    className="text-xs text-zinc-500 hover:text-white"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-semibold text-zinc-400 uppercase">Kode Obat</label>
                    <input
                      type="text"
                      required
                      value={newKode}
                      onChange={(e) => setNewKode(e.target.value)}
                      placeholder="OBT-00X"
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-zinc-400 uppercase">Nama Obat</label>
                    <input
                      type="text"
                      required
                      value={newNama}
                      onChange={(e) => setNewNama(e.target.value)}
                      placeholder="E.g. Paracetamol"
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-semibold text-zinc-400 uppercase">Satuan</label>
                    <input
                      type="text"
                      required
                      value={newSatuan}
                      onChange={(e) => setNewSatuan(e.target.value)}
                      placeholder="Tablet"
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-zinc-400 uppercase">Stok Awal</label>
                    <input
                      type="number"
                      value={newStok}
                      onChange={(e) => setNewStok(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-zinc-400 uppercase">Min Stok</label>
                    <input
                      type="number"
                      value={newMinStok}
                      onChange={(e) => setNewMinStok(parseInt(e.target.value) || 10)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-semibold text-zinc-400 uppercase">Harga Beli</label>
                    <input
                      type="number"
                      value={newBeli}
                      onChange={(e) => setNewBeli(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-zinc-400 uppercase">Harga Jual</label>
                    <input
                      type="number"
                      value={newJual}
                      onChange={(e) => setNewJual(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-zinc-400 uppercase">Tanggal Kadaluarsa</label>
                  <input
                    type="date"
                    value={newExpired}
                    onChange={(e) => setNewExpired(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-semibold py-3 rounded-xl text-xs active:scale-95 transition-all cursor-pointer text-center"
                >
                  {isSubmitting ? 'Mendaftarkan...' : 'Simpan Obat Baru'}
                </button>
              </form>
            ) : (
              /* General summary info */
              <div className="glass-panel p-5 rounded-3xl bg-zinc-900/10 border border-zinc-800 text-zinc-500 text-xs space-y-4">
                <h5 className="font-bold text-white flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-indigo-400" />
                  <span>Petunjuk Restock</span>
                </h5>
                <p className="leading-relaxed">
                  Pilih salah satu item obat di tabel sebelah kiri dan klik tombol <strong>Restock</strong> untuk menambahkan jumlah persediaan logistik berdasarkan Purchase Order resmi.
                </p>
                <div className="border-t border-zinc-800/80 pt-3 space-y-2">
                  <span className="block text-white font-semibold">Legend Warna Kadaluarsa:</span>
                  <span className="block text-amber-500">⌛ Hampir Kadaluarsa (≤ 90 Hari)</span>
                  <span className="block text-red-500">⚠️ Persediaan Habis / Di Bawah Minimum</span>
                </div>
              </div>
            )}

            {/* Display short stock logs list */}
            {selectedObat && selectedObat.stokLogs && selectedObat.stokLogs.length > 0 && (
              <div className="glass-panel p-4 rounded-2xl border border-zinc-850 text-xs space-y-3">
                <span className="font-bold text-white block">Riwayat Transaksi Stok Obat</span>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedObat.stokLogs.map(log => (
                    <div key={log.id} className="flex justify-between items-center py-1.5 border-b border-zinc-850">
                      <div>
                        <span className="font-semibold block text-zinc-300">{log.keterangan}</span>
                        <span className="text-[9px] text-zinc-500">{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className={`font-bold font-mono ${log.tipe === 'IN' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {log.tipe === 'IN' ? '+' : '-'}{log.jumlah}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* ======================== TAB 2: MEDICAL EQUIPMENTS ======================== */
        <div className="glass-panel p-6 rounded-3xl bg-zinc-900/20 border border-zinc-800">
          <h3 className="text-lg font-bold font-display text-white mb-4">📋 Inventaris Peralatan Medis Klinik</h3>

          {loading ? (
            <div className="text-zinc-500 text-sm py-12 text-center">Memuat inventaris alat medis...</div>
          ) : alkesList.length === 0 ? (
            <div className="text-zinc-500 text-center py-12">
              Tidak ada data inventaris alat kesehatan terdaftar.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alkesList.map((alkes) => (
                <div key={alkes.id} className="glass-panel p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-mono font-semibold">{alkes.kode}</span>
                      <h4 className="font-bold text-white text-sm mt-0.5">{alkes.nama}</h4>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      alkes.kondisi === 'BAIK'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : alkes.kondisi === 'PERLU_KALIBRASI'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {alkes.kondisi.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 border-t border-zinc-850 pt-3">
                    <div className="flex justify-between text-zinc-400">
                      <span>Jumlah Unit</span>
                      <span className="text-white font-bold">{alkes.jumlah} Pcs</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Kalibrasi Terakhir</span>
                      <span className="text-zinc-300 font-mono">
                        {alkes.lastMaintenance ? new Date(alkes.lastMaintenance).toLocaleDateString() : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Jadwal Kalibrasi Berikut</span>
                      <span className="text-zinc-300 font-mono">
                        {alkes.nextMaintenance ? new Date(alkes.nextMaintenance).toLocaleDateString() : '--'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
