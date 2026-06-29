'use client'

import { useState, useEffect } from 'react'
import {
  Activity,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  AlertTriangle,
  Heart
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899']

export default function LaporanAnalisisPage() {
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<'finance' | 'visitors' | 'medicines'>('finance')
  const [loading, setLoading] = useState(true)
  
  // States for data fetched
  const [financeData, setFinanceData] = useState<any>(null)
  const [visitorData, setVisitorData] = useState<any>(null)
  const [medicineData, setMedicineData] = useState<any>(null)

  const loadReport = async (reportType: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/laporan?type=${reportType}`)
      const data = await res.json()
      if (data.success) {
        if (reportType === 'finance') setFinanceData(data.data)
        else if (reportType === 'visitors') setVisitorData(data.data)
        else if (reportType === 'medicines') setMedicineData(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Prevent hydration mismatches with Recharts
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadReport(tab)
    }
  }, [tab, mounted])

  if (!mounted) return null

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Laporan & Analisis Statistik</h2>
          <p className="text-zinc-400 text-sm mt-1">Lacak visualisasi omset pendapatan kasir, grafik tren pengunjung poli, serta analisis stok obat-obatan.</p>
        </div>
        <button
          onClick={() => loadReport(tab)}
          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-3 py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setTab('finance')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
            tab === 'finance'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          💳 Omset Keuangan
        </button>
        <button
          onClick={() => setTab('visitors')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
            tab === 'visitors'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          👥 Kunjungan Pasien
        </button>
        <button
          onClick={() => setTab('medicines')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
            tab === 'medicines'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          💊 Analisis Stok & Obat
        </button>
      </div>

      {loading ? (
        <div className="text-zinc-500 text-sm py-12 text-center">Menghitung statistik analitis...</div>
      ) : (
        <div className="space-y-8">
          
          {/* ======================== TAB 1: FINANCE ======================== */}
          {tab === 'finance' && financeData && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-3xl bg-zinc-900/20 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Hari Ini</span>
                    <span className="text-2xl font-bold font-display text-white mt-1 block">
                      Rp {financeData.todayRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl bg-zinc-900/20 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Bulan Ini (MTD)</span>
                    <span className="text-2xl font-bold font-display text-emerald-400 mt-1 block">
                      Rp {financeData.monthRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="h-6 w-6 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Charts grid */}
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Line Chart: Daily Revenue (8 columns) */}
                <div className="lg:col-span-8 glass-panel p-6 rounded-3xl bg-zinc-900/10 border border-zinc-800 space-y-4">
                  <h4 className="font-bold text-sm text-white">📈 Tren Omset Pendapatan Harian (7 Hari Terakhir)</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={financeData.history}>
                        <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px' }} />
                        <Line type="monotone" dataKey="revenue" name="Pendapatan" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart: Payment Breakdown (4 columns) */}
                <div className="lg:col-span-4 glass-panel p-6 rounded-3xl bg-zinc-900/10 border border-zinc-800 space-y-4">
                  <h4 className="font-bold text-sm text-white">💳 Rasio Metode Pembayaran</h4>
                  <div className="h-56 flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={financeData.breakdown.filter((d: any) => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {financeData.breakdown.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 mt-2 border-t border-zinc-800 pt-3">
                    {financeData.breakdown.map((item: any, i: number) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span>{item.name}: Rp {item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================== TAB 2: VISITORS ======================== */}
          {tab === 'visitors' && visitorData && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="glass-panel p-5 rounded-2xl bg-zinc-900/20 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block font-sans">Hari Ini</span>
                  <span className="text-2xl font-bold font-display text-white mt-1 block">{visitorData.today.total} Pasien</span>
                </div>
                <div className="glass-panel p-5 rounded-2xl bg-zinc-900/20 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block font-sans">Menunggu Triage</span>
                  <span className="text-2xl font-bold font-display text-indigo-400 mt-1 block">{visitorData.today.waiting} Pasien</span>
                </div>
                <div className="glass-panel p-5 rounded-2xl bg-zinc-900/20 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block font-sans">Sedang Konsultasi</span>
                  <span className="text-2xl font-bold font-display text-cyan-400 mt-1 block">{visitorData.today.examining} Pasien</span>
                </div>
                <div className="glass-panel p-5 rounded-2xl bg-zinc-900/20 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block font-sans">Layanan Selesai</span>
                  <span className="text-2xl font-bold font-display text-emerald-400 mt-1 block">{visitorData.today.completed} Pasien</span>
                </div>
              </div>

              {/* Charts grid */}
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Bar Chart: Visitor History (8 columns) */}
                <div className="lg:col-span-8 glass-panel p-6 rounded-3xl bg-zinc-900/10 border border-zinc-800 space-y-4">
                  <h4 className="font-bold text-sm text-white">📊 Jumlah Pengunjung Harian (7 Hari Terakhir)</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={visitorData.history}>
                        <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px' }} />
                        <Bar dataKey="patients" name="Jumlah Pasien" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart: Poly breakdown MTD (4 columns) */}
                <div className="lg:col-span-4 glass-panel p-6 rounded-3xl bg-zinc-900/10 border border-zinc-800 space-y-4">
                  <h4 className="font-bold text-sm text-white">🏢 Kunjungan per Poli (Bulan Ini)</h4>
                  <div className="h-56 flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={visitorData.breakdown.filter((d: any) => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {visitorData.breakdown.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 mt-2 border-t border-zinc-800 pt-3">
                    {visitorData.breakdown.map((item: any, i: number) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span>{item.name}: {item.value} Kunjungan</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================== TAB 3: MEDICINES ======================== */}
          {tab === 'medicines' && medicineData && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-panel p-5 rounded-2xl bg-zinc-900/20 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Stok Obat Kosong</span>
                    <span className="text-2xl font-bold font-display text-red-500 mt-1 block">
                      {medicineData.summary.outOfStock} Macam
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl bg-zinc-900/20 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Stok Obat Menipis</span>
                    <span className="text-2xl font-bold font-display text-amber-500 mt-1 block">
                      {medicineData.summary.lowStock} Macam
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Package className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl bg-zinc-900/20 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Mendekati Kadaluarsa (≤90 Hari)</span>
                    <span className="text-2xl font-bold font-display text-zinc-300 mt-1 block">
                      {medicineData.summary.nearExpired} Macam
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* List: Top Prescribed Drugs */}
              <div className="glass-panel p-6 rounded-3xl bg-zinc-900/10 border border-zinc-800 space-y-4">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span>Obat Paling Sering Diresepkan Dokter (Bulan Ini)</span>
                </h4>

                {medicineData.topPrescribed.length === 0 ? (
                  <p className="text-zinc-500 text-xs italic py-4 text-center">Belum ada obat yang diresepkan.</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                    {medicineData.topPrescribed.map((drug: any, index: number) => (
                      <div key={drug.name} className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400 font-display">
                            #{index + 1}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{drug.name}</span>
                            <span className="text-[10px] text-zinc-500">Kategori: Farmasi</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold font-mono text-emerald-400 block">{drug.amount}</span>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{drug.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  )
}
