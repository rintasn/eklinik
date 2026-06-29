'use client'

import { useState, useEffect } from 'react'
import { Activity, Clipboard, CheckCircle, AlertCircle, RefreshCw, Printer, CreditCard, DollarSign, Search } from 'lucide-react'

interface PatientBill {
  pendaftaranId: string
  pasien: { id: string; noRekamMedis: string; nama: string; telepon: string; alamat: string }
  dokterNama: string
  poliNama: string
  tanggal: string
  statusPendaftaran: string
  polyFee: number
  medicineFee: number
  medicineItems: { id: string; nama: string; jumlah: number; satuan: string; hargaSatuan: number; subtotal: number }[]
  totalBill: number
  pembayaran?: { id: string; status: string; metodePembayaran: string; noKuitansi: string }
}

interface PembayaranListItem {
  id: string
  pendaftaranId: string
  totalTagihan: number
  metodePembayaran: string
  status: string
  noKuitansi: string
  createdAt: string
  pendaftaran: {
    pasien: { nama: string; noRekamMedis: string }
    poli: { nama: string }
  }
}

export default function KasirPembayaranPage() {
  const [activeVisits, setActiveVisits] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBill, setSelectedBill] = useState<PatientBill | null>(null)
  const [loading, setLoading] = useState(true)

  // Payment process states
  const [metodePembayaran, setMetodePembayaran] = useState('TUNAI')
  const [nomorKartu, setNomorKartu] = useState('')
  const [rujukanNo, setRujukanNo] = useState('')
  const [asuransiProvider, setAsuransiProvider] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Receipt modal state
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)

  // Load patient visits for cashier MTD
  const loadVisits = async () => {
    setLoading(true)
    setError('')
    try {
      const todayStr = new Date().toISOString().split('T')[0]
      const res = await fetch(`/api/v1/pendaftaran?tanggal=${todayStr}`)
      const data = await res.json()
      if (data.success) {
        // We show all visits today
        setActiveVisits(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVisits()
  }, [])

  // Load detailed billing calculation when selected
  const handleSelectVisit = async (pendaftaranId: string) => {
    setError('')
    setSuccess('')
    setNomorKartu('')
    setRujukanNo('')
    setAsuransiProvider('')
    try {
      const res = await fetch(`/api/v1/pembayaran?pendaftaranId=${pendaftaranId}`)
      const data = await res.json()
      if (data.success) {
        setSelectedBill(data.data)
        // Auto set method if already paid
        if (data.data.pembayaran) {
          setMetodePembayaran(data.data.pembayaran.metodePembayaran)
        } else {
          setMetodePembayaran('TUNAI')
        }
      } else {
        setError(data.error || 'Gagal menghitung tagihan.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Execute payment checkout
  const handleCheckoutPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBill) return

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    const payload: any = {
      pendaftaranId: selectedBill.pendaftaranId,
      metodePembayaran,
      totalTagihan: selectedBill.totalBill
    }

    if (metodePembayaran === 'BPJS') {
      if (!nomorKartu) {
        setError('Nomor Kartu BPJS wajib diisi.')
        setIsSubmitting(false)
        return
      }
      payload.nomorKartu = nomorKartu
      payload.rujukanNo = rujukanNo
    } else if (metodePembayaran === 'ASURANSI') {
      if (!asuransiProvider || !nomorKartu) {
        setError('Nama Provider dan Nomor Polis/Kartu Asuransi wajib diisi.')
        setIsSubmitting(false)
        return
      }
      payload.asuransiProvider = asuransiProvider
      payload.nomorKartu = nomorKartu
    }

    try {
      const res = await fetch('/api/v1/pembayaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal memproses pembayaran.')
      } else {
        setSuccess(`Pembayaran invoice ${data.data.noKuitansi} sebesar Rp ${selectedBill.totalBill.toLocaleString()} berhasil diproses.`)
        
        // Save for printing receipt
        setReceiptData({
          ...selectedBill,
          noKuitansi: data.data.noKuitansi,
          metodePembayaran: data.data.metodePembayaran,
          nomorKartu: data.data.nomorKartu,
          rujukanNo: data.data.rujukanNo,
          asuransiProvider: data.data.asuransiProvider,
          kasirNama: 'Kiki (Kasir)' // Default staff cashier
        })
        setShowReceipt(true)

        setSelectedBill(null)
        loadVisits()
      }
    } catch (err) {
      setError('Kesalahan jaringan saat memproses pembayaran.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Receipt Print Overlay Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 print:p-0 print:bg-white print:static print:h-full">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-left shadow-2xl relative print:border print:border-black print:bg-white print:text-black print:shadow-none print:p-0">
            
            <div className="text-center pb-6 border-b border-zinc-800 border-dashed print:border-black">
              <h3 className="font-display font-bold text-lg text-white print:text-black uppercase">Klinik Pratama</h3>
              <p className="text-[10px] text-zinc-500 font-medium">Jl. Kesehatan Medika No. 8 &bull; Jakarta</p>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block mt-2 print:text-black">Kuitansi Pembayaran Lunas</span>
            </div>

            <div className="py-4 space-y-2 text-xs border-b border-zinc-800 print:border-black">
              <div className="flex justify-between">
                <span className="text-zinc-500">No. Kuitansi</span>
                <span className="font-mono font-bold text-white print:text-black">{receiptData.noKuitansi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tanggal</span>
                <span className="text-zinc-300 print:text-black">{new Date().toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Pasien</span>
                <span className="font-bold text-white print:text-black">{receiptData.pasien.nama} ({receiptData.pasien.noRekamMedis})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Poli / Dokter</span>
                <span className="text-zinc-300 print:text-black">{receiptData.poliNama} / {receiptData.dokterNama}</span>
              </div>
            </div>

            {/* Bill Details */}
            <div className="py-4 space-y-3 text-xs border-b border-zinc-800 print:border-black">
              <div className="flex justify-between font-semibold">
                <span>Rincian Layanan</span>
                <span>Subtotal</span>
              </div>
              
              <div className="flex justify-between text-zinc-400 print:text-black">
                <span>Registrasi & Jasa Konsultasi Poli</span>
                <span>Rp {receiptData.polyFee.toLocaleString()}</span>
              </div>

              {receiptData.medicineItems.map((item: any) => (
                <div key={item.id} className="flex justify-between text-zinc-400 print:text-black">
                  <span>{item.nama} ({item.jumlah} {item.satuan} @ Rp {item.hargaSatuan.toLocaleString()})</span>
                  <span>Rp {item.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between text-sm font-black text-white print:text-black">
                <span>TOTAL TAGIHAN</span>
                <span>Rp {receiptData.totalBill.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Metode Pembayaran</span>
                <span className="font-bold uppercase text-indigo-400 print:text-black">{receiptData.metodePembayaran}</span>
              </div>
              {receiptData.metodePembayaran === 'BPJS' && (
                <>
                  <div className="flex justify-between text-zinc-500">
                    <span>No. Kartu BPJS</span>
                    <span className="font-semibold text-zinc-300 print:text-black">{receiptData.nomorKartu}</span>
                  </div>
                  {receiptData.rujukanNo && (
                    <div className="flex justify-between text-zinc-500">
                      <span>No. Rujukan BPJS</span>
                      <span className="font-semibold text-zinc-300 print:text-black">{receiptData.rujukanNo}</span>
                    </div>
                  )}
                </>
              )}
              {receiptData.metodePembayaran === 'ASURANSI' && (
                <>
                  <div className="flex justify-between text-zinc-500">
                    <span>Provider Asuransi</span>
                    <span className="font-semibold text-zinc-300 print:text-black">{receiptData.asuransiProvider}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>No. Polis/Kartu</span>
                    <span className="font-semibold text-zinc-300 print:text-black">{receiptData.nomorKartu}</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 text-center text-[10px] text-zinc-500 border-t border-zinc-800/50 pt-4 border-dashed print:border-black">
              Terima kasih atas kunjungan Anda.<br/>Semoga lekas sembuh!
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex gap-3 print:hidden">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 rounded-xl cursor-pointer shadow-md"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Kuitansi</span>
              </button>
              <button
                onClick={() => { setShowReceipt(false); setReceiptData(null) }}
                className="flex-1 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs py-3 rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Page Layout */}
      <div className="print:hidden">
        {/* Title */}
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Kasir & Pembayaran</h2>
          <p className="text-zinc-400 text-sm mt-1">Kalkulasikan tagihan kunjungan pasien, terima pembayaran multi-metode, dan cetak struk kuitansi.</p>
        </div>

        {/* Action alerts feedback */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-center gap-2 my-4">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-4 rounded-xl flex items-center gap-2 my-4">
            <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start mt-6">
          
          {/* Left Column: List of today's registrations (5 columns) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-lg font-bold font-display text-white">💳 Daftar Kunjungan Hari Ini</h3>

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
              <div className="text-zinc-500 text-sm py-12 text-center">Memuat data kunjungan...</div>
            ) : (() => {
              const filtered = activeVisits.filter(visit => {
                const query = searchQuery.toLowerCase()
                return (
                  visit.pasien.nama.toLowerCase().includes(query) ||
                  visit.pasien.noRekamMedis.toLowerCase().includes(query) ||
                  (visit.pasien.nik && visit.pasien.nik.toLowerCase().includes(query)) ||
                  (visit.pasien.telepon && visit.pasien.telepon.toLowerCase().includes(query))
                )
              })

              if (filtered.length === 0) {
                return (
                  <div className="glass-panel p-8 text-center rounded-2xl text-zinc-500 text-sm">
                    Tidak ada kunjungan yang cocok dengan pencarian.
                  </div>
                )
              }

              return (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {filtered.map((visit) => {
                    const isPaid = visit.pembayaran?.status === 'LUNAS'
                    const hasRecord = visit.rekamMedis !== null
                    return (
                      <button
                        key={visit.id}
                        onClick={() => handleSelectVisit(visit.id)}
                        className={`w-full glass-panel p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                          selectedBill?.pendaftaranId === visit.id
                            ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-600/5'
                            : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{visit.pasien.nama}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">({visit.pasien.noRekamMedis})</span>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-1">
                            Poli: {visit.poli.nama} &bull; Dokter: {visit.dokter.nama}
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-1">
                            Pemeriksaan: <span className="font-semibold text-zinc-300">{visit.status}</span>
                          </div>
                        </div>
                        
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {isPaid ? 'Lunas' : 'Belum Bayar'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            })()}
          </div>

          {/* Right Column: Billing checkout sheet (7 columns) */}
          <div className="lg:col-span-7">
            {selectedBill ? (
              <form onSubmit={handleCheckoutPayment} className="glass-panel p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-6">
                
                {/* Billing Header */}
                <div className="pb-4 border-b border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Lembar Kasir / Checkout</span>
                    <h4 className="font-bold text-lg text-white">{selectedBill.pasien.nama} ({selectedBill.pasien.noRekamMedis})</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Poli: {selectedBill.poliNama} &bull; Dokter: {selectedBill.dokterNama}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBill(null)}
                    className="text-xs text-zinc-500 hover:text-white"
                  >
                    Tutup
                  </button>
                </div>

                {/* Billing Summary List */}
                <div className="space-y-4">
                  <h5 className="font-bold text-sm text-white">Item Billing Tagihan</h5>
                  
                  <div className="space-y-3">
                    {/* Poly consulting fee */}
                    <div className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-xl border border-zinc-850 text-xs">
                      <div>
                        <span className="font-bold text-white block">Jasa Konsultasi & Registrasi</span>
                        <span className="text-[10px] text-zinc-500">{selectedBill.poliNama}</span>
                      </div>
                      <span className="font-mono font-bold text-zinc-300">
                        Rp {selectedBill.polyFee.toLocaleString()}
                      </span>
                    </div>

                    {/* Prescription items */}
                    {selectedBill.medicineItems.length > 0 ? (
                      <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-850 text-xs space-y-3">
                        <span className="font-bold text-white block border-b border-zinc-800 pb-2">Rincian Obat Apotik</span>
                        
                        {selectedBill.medicineItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <div>
                              <span>{item.nama}</span>
                              <span className="text-[10px] text-zinc-500 block">
                                {item.jumlah} {item.satuan} @ Rp {item.hargaSatuan.toLocaleString()}
                              </span>
                            </div>
                            <span className="font-mono text-zinc-300">
                              Rp {item.subtotal.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-zinc-500 text-xs italic bg-zinc-950/20 p-4 rounded-xl text-center border border-zinc-850 border-dashed">
                        Tidak ada resep obat terbit untuk kunjungan ini.
                      </div>
                    )}
                  </div>
                </div>

                {/* Big Total billing box */}
                <div className="bg-indigo-600/10 border border-indigo-600/20 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Total yang Harus Dibayar</span>
                      <span className="text-xl font-black font-display text-white mt-0.5">
                        Rp {selectedBill.totalBill.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {selectedBill.pembayaran?.status === 'LUNAS' && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider">
                      Lunas
                    </span>
                  )}
                </div>

                {/* Payment process selectors */}
                {selectedBill.pembayaran?.status !== 'LUNAS' ? (
                  <div className="space-y-4 border-t border-zinc-850 pt-5">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Metode Pembayaran</label>
                      <div className="grid grid-cols-4 gap-3 text-center">
                        {['TUNAI', 'TRANSFER', 'BPJS', 'ASURANSI'].map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setMetodePembayaran(method)}
                            className={`py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              metodePembayaran === method
                                ? 'bg-indigo-600 text-white border-indigo-400 scale-[1.02]'
                                : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* BPJS Details */}
                    {metodePembayaran === 'BPJS' && (
                      <div className="space-y-3 bg-blue-950/20 border border-blue-500/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Data Kepesertaan BPJS</span>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                            No. Kartu BPJS <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={nomorKartu}
                            onChange={(e) => setNomorKartu(e.target.value)}
                            placeholder="0001xxxxxxxxxxxxxx (13 digit)"
                            maxLength={13}
                            required
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all font-mono tracking-widest"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                            No. Surat Rujukan <span className="text-zinc-600">(Opsional)</span>
                          </label>
                          <input
                            type="text"
                            value={rujukanNo}
                            onChange={(e) => setRujukanNo(e.target.value)}
                            placeholder="Contoh: 001/PKM/VI/2026"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all"
                          />
                        </div>
                        <p className="text-[10px] text-zinc-600 italic">
                          * Verifikasi eligibilitas BPJS dilakukan real-time via V-Claim API setelah checkout.
                        </p>
                      </div>
                    )}

                    {/* Asuransi Details */}
                    {metodePembayaran === 'ASURANSI' && (
                      <div className="space-y-3 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Data Asuransi Kesehatan</span>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                            Nama Provider Asuransi <span className="text-red-400">*</span>
                          </label>
                          <select
                            value={asuransiProvider}
                            onChange={(e) => setAsuransiProvider(e.target.value)}
                            required
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                          >
                            <option value="">-- Pilih Provider --</option>
                            <option value="Prudential">Prudential</option>
                            <option value="Allianz">Allianz</option>
                            <option value="AXA Mandiri">AXA Mandiri</option>
                            <option value="Manulife">Manulife</option>
                            <option value="Sinarmas">Sinarmas</option>
                            <option value="Jasa Raharja">Jasa Raharja</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                            No. Polis / Kartu Anggota <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={nomorKartu}
                            onChange={(e) => setNomorKartu(e.target.value)}
                            placeholder="Nomor polis atau kartu anggota"
                            required
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-all font-mono tracking-widest"
                          />
                        </div>
                        <p className="text-[10px] text-zinc-600 italic">
                          * Verifikasi keanggotaan asuransi dilakukan via API Gateway yang dikonfigurasi Admin.
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-semibold py-4 rounded-2xl text-xs active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {isSubmitting ? 'Memproses Transaksi...' : 'Bayar Lunas & Terbitkan Kuitansi'}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4 border-t border-zinc-850 pt-5">
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptData({
                          ...selectedBill,
                          noKuitansi: selectedBill.pembayaran!.noKuitansi,
                          metodePembayaran: selectedBill.pembayaran!.metodePembayaran,
                          kasirNama: 'Kiki (Kasir)'
                        })
                        setShowReceipt(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-semibold text-xs py-3 rounded-xl cursor-pointer border border-indigo-500/15"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Cetak Kuitansi Ulang</span>
                    </button>
                  </div>
                )}

              </form>
            ) : (
              <div className="glass-panel p-12 text-center rounded-3xl bg-zinc-900/10 border border-zinc-800 text-zinc-500 text-sm">
                <CreditCard className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
                Pilih kunjungan pasien di kolom sebelah kiri untuk memuat rincian tagihan obat & pemeriksaan dan memproses pembayaran kasir.
              </div>
            )}
          </div>

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
