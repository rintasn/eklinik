'use client'

import { useState, useEffect } from 'react'
import { Activity, Clipboard, CheckCircle, AlertCircle, RefreshCw, Printer, CreditCard, DollarSign, Search } from 'lucide-react'
import { getBillingRecords, setBillingRecords, BillingRecord } from '@/lib/medicalStore'

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
  treatmentFee?: number
  isLocalBill?: boolean
  pembayaran?: { id: string; status: string; metodePembayaran: string; noKuitansi: string }
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
      
      let dbVisits = []
      if (data.success) {
        dbVisits = data.data
      }

      // Merge with local bills from medicalStore (IGD, Inpatient)
      const localBills = getBillingRecords()
      const formattedLocal = localBills.map(bill => ({
        id: bill.id,
        isLocalBill: true,
        pasien: {
          id: bill.id,
          nama: bill.pasienNama,
          noRekamMedis: bill.noRM,
          telepon: '',
          alamat: ''
        },
        poli: { nama: bill.tipeLayanan.replace('_', ' ') },
        dokter: { nama: bill.dokterNama },
        status: bill.tipeLayanan,
        pembayaran: bill.status === 'LUNAS' ? {
          status: 'LUNAS',
          metodePembayaran: bill.metodePembayaran || 'TUNAI',
          noKuitansi: bill.noKuitansi || ''
        } : null
      }))

      setActiveVisits([...dbVisits, ...formattedLocal])
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
  const handleSelectVisit = async (pendaftaranId: string, isLocal?: boolean) => {
    setError('')
    setSuccess('')
    setNomorKartu('')
    setRujukanNo('')
    setAsuransiProvider('')

    if (isLocal) {
      const localBills = getBillingRecords()
      const bill = localBills.find(b => b.id === pendaftaranId)
      if (bill) {
        const formatted: PatientBill = {
          pendaftaranId: bill.id,
          isLocalBill: true,
          pasien: { id: bill.id, noRekamMedis: bill.noRM, nama: bill.pasienNama, telepon: '', alamat: '' },
          dokterNama: bill.dokterNama,
          poliNama: bill.tipeLayanan.replace('_', ' '),
          tanggal: bill.tanggal,
          statusPendaftaran: bill.status,
          polyFee: bill.polyFee,
          medicineFee: bill.medicineFee,
          treatmentFee: bill.treatmentFee,
          medicineItems: [],
          totalBill: bill.totalBill,
          pembayaran: bill.status === 'LUNAS' ? {
            id: bill.id,
            status: 'LUNAS',
            metodePembayaran: bill.metodePembayaran || 'TUNAI',
            noKuitansi: bill.noKuitansi || ''
          } : undefined
        }
        setSelectedBill(formatted)
        if (bill.status === 'LUNAS') {
          setMetodePembayaran(bill.metodePembayaran || 'TUNAI')
        } else {
          setMetodePembayaran('TUNAI')
        }
      }
      return
    }

    try {
      const res = await fetch(`/api/v1/pembayaran?pendaftaranId=${pendaftaranId}`)
      const data = await res.json()
      if (data.success) {
        setSelectedBill({ ...data.data, isLocalBill: false })
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

    if (selectedBill.isLocalBill) {
      // Local bill checkout logic (IGD / Inpatient)
      const now = new Date()
      const yy = now.getFullYear().toString().substring(2, 4)
      const mm = (now.getMonth() + 1).toString().padStart(2, '0')
      const noKuitansi = `INV-LOC-${yy}${mm}${Math.floor(Math.random() * 9000) + 1000}`

      const localBills = getBillingRecords()
      const updated = localBills.map(b => {
        if (b.id === selectedBill.pendaftaranId) {
          return {
            ...b,
            status: 'LUNAS' as const,
            noKuitansi,
            metodePembayaran,
            nomorKartu: nomorKartu || undefined,
            asuransiProvider: asuransiProvider || undefined
          }
        }
        return b
      })
      setBillingRecords(updated)

      setSuccess(`Pembayaran invoice ${noKuitansi} sebesar Rp ${selectedBill.totalBill.toLocaleString()} berhasil diproses.`)
      setReceiptData({
        ...selectedBill,
        noKuitansi,
        metodePembayaran,
        nomorKartu,
        rujukanNo,
        asuransiProvider,
        kasirNama: 'Kiki (Kasir)'
      })
      setShowReceipt(true)
      setSelectedBill(null)
      loadVisits()
      setIsSubmitting(false)
      return
    }

    // DB bill checkout logic
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
        
        setReceiptData({
          ...selectedBill,
          noKuitansi: data.data.noKuitansi,
          metodePembayaran: data.data.metodePembayaran,
          nomorKartu: data.data.nomorKartu,
          rujukanNo: data.data.rujukanNo,
          asuransiProvider: data.data.asuransiProvider,
          kasirNama: 'Kiki (Kasir)'
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
    <div className="space-y-8 animate-fade-in relative text-slate-900 dark:text-zinc-100">
      
      {/* Receipt Print Overlay Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 print:p-0 print:bg-white print:static print:h-full">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left shadow-2xl relative print:border print:border-black print:bg-white print:text-black print:shadow-none print:p-0">
            
            <div className="text-center pb-6 border-b border-slate-200 dark:border-zinc-800 border-dashed print:border-black">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white print:text-black uppercase">Klinik Pratama</h3>
              <p className="text-[10px] text-slate-500 font-medium">Jl. Kesehatan Medika No. 8 &bull; Jakarta</p>
              <span className="text-[10px] text-indigo-650 dark:text-indigo-400 font-semibold uppercase tracking-wider block mt-2 print:text-black">Kuitansi Pembayaran Lunas</span>
            </div>

            <div className="py-4 space-y-2 text-xs border-b border-slate-200 dark:border-zinc-800 print:border-black">
              <div className="flex justify-between">
                <span className="text-slate-400">No. Kuitansi</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white print:text-black">{receiptData.noKuitansi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal</span>
                <span className="text-slate-700 dark:text-zinc-300 print:text-black">{new Date().toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pasien</span>
                <span className="font-bold text-slate-900 dark:text-white print:text-black">{receiptData.pasien.nama} ({receiptData.pasien.noRekamMedis})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Layanan / Dokter</span>
                <span className="text-slate-700 dark:text-zinc-300 print:text-black">{receiptData.poliNama} / {receiptData.dokterNama}</span>
              </div>
            </div>

            {/* Bill Details */}
            <div className="py-4 space-y-3 text-xs border-b border-slate-200 dark:border-zinc-800 print:border-black">
              <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                <span>Rincian Layanan</span>
                <span>Subtotal</span>
              </div>
              
              <div className="flex justify-between text-slate-600 dark:text-zinc-400 print:text-black">
                <span>Registrasi & Kamar / Jasa Konsultasi</span>
                <span>Rp {receiptData.polyFee.toLocaleString()}</span>
              </div>

              {receiptData.treatmentFee > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-zinc-400 print:text-black">
                  <span>Biaya Tindakan Medis</span>
                  <span>Rp {receiptData.treatmentFee.toLocaleString()}</span>
                </div>
              )}

              {receiptData.medicineItems.map((item: any) => (
                <div key={item.id} className="flex justify-between text-slate-600 dark:text-zinc-400 print:text-black">
                  <span>{item.nama} ({item.jumlah} {item.satuan} @ Rp {item.hargaSatuan.toLocaleString()})</span>
                  <span>Rp {item.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white print:text-black">
                <span>TOTAL TAGIHAN</span>
                <span>Rp {receiptData.totalBill.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Metode Pembayaran</span>
                <span className="font-bold uppercase text-indigo-650 dark:text-indigo-400 print:text-black">{receiptData.metodePembayaran}</span>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] text-slate-400 dark:text-zinc-500 border-t border-slate-200 dark:border-zinc-800/50 pt-4 border-dashed print:border-black">
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
                className="flex-1 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold text-xs py-3 rounded-xl cursor-pointer"
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
          <h2 className="text-3xl font-bold font-display dark:text-white">Kasir & Pembayaran</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Kalkulasikan tagihan kunjungan pasien (Rawat Jalan, IGD, & Rawat Inap), terima pembayaran, dan cetak kuitansi.</p>
        </div>

        {/* Action alerts feedback */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-sm p-4 rounded-xl flex items-center gap-2 my-4">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm p-4 rounded-xl flex items-center gap-2 my-4">
            <CheckCircle className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start mt-6">
          
          {/* Left Column: List of today's registrations (5 columns) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-lg font-bold font-display dark:text-white">💳 Daftar Kunjungan Hari Ini</h3>

            {/* Search Input Filter */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Nama, No. RM, NIK, atau Telp..."
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-205 dark:border-zinc-850 rounded-xl py-2 px-3 pl-9 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-650 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
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
                  visit.pasien.noRekamMedis.toLowerCase().includes(query)
                )
              })

              if (filtered.length === 0) {
                return (
                  <div className="glass-panel p-8 text-center rounded-2xl text-slate-400 dark:text-zinc-500 text-sm">
                    Tidak ada kunjungan yang cocok dengan pencarian.
                  </div>
                )
              }

              return (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {filtered.map((visit) => {
                    const isPaid = visit.pembayaran?.status === 'LUNAS'
                    return (
                      <button
                        key={visit.id}
                        onClick={() => handleSelectVisit(visit.id, visit.isLocalBill)}
                        className={`w-full glass-panel p-4 rounded-2xl border text-left flex justify-between items-center transition-all cursor-pointer ${
                          selectedBill?.pendaftaranId === visit.id
                            ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-600/5'
                            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 hover:border-slate-350 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{visit.pasien.nama}</span>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">({visit.pasien.noRekamMedis})</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                            Layanan: {visit.poli.nama} &bull; Dokter: {visit.dokter.nama}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                            Status: <span className="font-semibold text-slate-600 dark:text-zinc-300">{visit.status}</span>
                          </div>
                        </div>
                        
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-500/10 text-red-650 dark:text-red-400'
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
              <form onSubmit={handleCheckoutPayment} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800 space-y-6">
                
                {/* Billing Header */}
                <div className="pb-4 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Lembar Kasir / Checkout</span>
                    <h4 className="font-bold text-lg dark:text-white">{selectedBill.pasien.nama} ({selectedBill.pasien.noRekamMedis})</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Layanan: {selectedBill.poliNama} &bull; Dokter: {selectedBill.dokterNama}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBill(null)}
                    className="text-xs text-slate-400 hover:text-slate-650 dark:hover:text-white"
                  >
                    Tutup
                  </button>
                </div>

                {/* Billing Summary List */}
                <div className="space-y-4">
                  <h5 className="font-bold text-sm dark:text-white">Item Billing Tagihan</h5>
                  
                  <div className="space-y-3">
                    {/* Poly consulting/room fee */}
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-850 text-xs">
                      <div>
                        <span className="font-bold dark:text-white block">Jasa Konsultasi / Sewa Kamar</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500">{selectedBill.poliNama}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">
                        Rp {selectedBill.polyFee.toLocaleString()}
                      </span>
                    </div>

                    {/* Treatment fees */}
                    {selectedBill.treatmentFee !== undefined && selectedBill.treatmentFee > 0 && (
                      <div className="flex justify-between items-center bg-slate-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-850 text-xs">
                        <div>
                          <span className="font-bold dark:text-white block">Biaya Tindakan Medis</span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">IGD / Rawat Inap care</span>
                        </div>
                        <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">
                          Rp {selectedBill.treatmentFee.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Prescription items */}
                    {selectedBill.medicineItems.length > 0 && (
                      <div className="bg-slate-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-850 text-xs space-y-3">
                        <span className="font-bold dark:text-white block border-b border-slate-100 dark:border-zinc-800 pb-2">Rincian Obat Apotik</span>
                        {selectedBill.medicineItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <div>
                              <span>{item.nama}</span>
                              <span className="text-[10px] text-slate-450 dark:text-zinc-500 block">
                                {item.jumlah} {item.satuan} @ Rp {item.hargaSatuan.toLocaleString()}
                              </span>
                            </div>
                            <span className="font-mono text-slate-700 dark:text-zinc-300">
                              Rp {item.subtotal.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Big Total billing box */}
                <div className="bg-indigo-600/10 border border-indigo-650/20 dark:border-indigo-600/20 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Total yang Harus Dibayar</span>
                      <span className="text-xl font-black font-display dark:text-white mt-0.5">
                        Rp {selectedBill.totalBill.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {selectedBill.pembayaran?.status === 'LUNAS' && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider">
                      Lunas
                    </span>
                  )}
                </div>

                {/* Payment process selectors */}
                {selectedBill.pembayaran?.status !== 'LUNAS' ? (
                  <div className="space-y-4 border-t border-slate-200 dark:border-zinc-850 pt-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 dark:text-zinc-400 uppercase tracking-wider mb-2">Metode Pembayaran</label>
                      <div className="grid grid-cols-4 gap-3 text-center">
                        {['TUNAI', 'TRANSFER', 'BPJS', 'ASURANSI'].map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setMetodePembayaran(method)}
                            className={`py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              metodePembayaran === method
                                ? 'bg-indigo-600 text-white border-indigo-400 scale-[1.02]'
                                : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-855 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-indigo-650 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-zinc-800 text-white font-semibold py-4 rounded-2xl text-xs active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {isSubmitting ? 'Memproses Transaksi...' : 'Bayar Lunas & Terbitkan Kuitansi'}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4 border-t border-slate-200 dark:border-zinc-850 pt-5">
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
                      className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-450 font-semibold text-xs py-3 rounded-xl cursor-pointer border border-indigo-500/15"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Cetak Kuitansi Ulang</span>
                    </button>
                  </div>
                )}

              </form>
            ) : (
              <div className="glass-panel p-12 text-center rounded-3xl bg-slate-50 dark:bg-zinc-900/10 border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 text-sm">
                <CreditCard className="h-10 w-10 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
                Pilih kunjungan pasien di kolom sebelah kiri untuk memuat rincian tagihan obat & pemeriksaan dan memproses pembayaran kasir.
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  )
}
