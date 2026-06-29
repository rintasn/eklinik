'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, Users, DollarSign, Bed, Activity, ShoppingBag, ShieldCheck } from 'lucide-react'

export default function DashboardDireksiPage() {
  const [kpis] = useState([
    { title: 'Pendapatan Bulan Ini', value: 'Rp 284,500,000', change: '+12.5% vs bulan lalu', trendUp: true, icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Total Kunjungan Pasien', value: '1,842 Pasien', change: '+8.2% vs bulan lalu', trendUp: true, icon: Users, color: 'text-indigo-650 dark:text-indigo-400 bg-indigo-500/10' },
    { title: 'Bed Occupancy Rate (BOR)', value: '62.5%', change: '+4.1% vs bulan lalu', trendUp: true, icon: Bed, color: 'text-cyan-500 bg-cyan-500/10' },
    { title: 'Klaim BPJS Terkumpul', value: 'Rp 145,200,000', change: '-2.4% vs bulan lalu', trendUp: false, icon: ShieldCheck, color: 'text-amber-500 bg-amber-500/10' },
  ])

  const [visitationData] = useState([
    { hari: 'Senin', count: 185 },
    { hari: 'Selasa', count: 210 },
    { hari: 'Rabu', count: 195 },
    { hari: 'Kamis', count: 240 },
    { hari: 'Jumat', count: 220 },
    { hari: 'Sabtu', count: 150 },
    { hari: 'Minggu', count: 90 },
  ])

  const [revenueData] = useState([
    { poli: 'Poli Umum', rev: 45 },
    { poli: 'Poli Gigi', rev: 25 },
    { poli: 'Poli Anak', rev: 15 },
    { poli: 'IGD', rev: 10 },
    { poli: 'Lainnya', rev: 5 },
  ])

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white">Dashboard Direksi</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Laporan kinerja eksekutif (KPI), visualisasi volume kunjungan, rekapitulasi keuangan, dan analisis operasional.</p>
        </div>
      </div>

      {/* KPI Banners */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((k, i) => {
          const Icon = k.icon
          return (
            <div key={i} className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">{k.title}</span>
                <span className="text-xl font-bold dark:text-white mt-1 block">{k.value}</span>
                <span className={`text-[10px] font-semibold mt-1 block ${k.trendUp ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {k.change}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Custom HTML/CSS Bar Charts */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left chart: Patient visitation weekly trend (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold font-display dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              <span>Tren Kunjungan Harian (Minggu Ini)</span>
            </h3>
          </div>

          <div className="h-64 flex items-end justify-between gap-2.5 pt-8 px-4 font-mono text-[10px]">
            {visitationData.map((d, i) => {
              const max = 250
              const pct = (d.count / max) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-slate-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold mb-1">
                    {d.count}
                  </div>
                  <div
                    style={{ height: `${pct}%` }}
                    className="w-full bg-indigo-600/10 dark:bg-indigo-600/20 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 rounded-t-lg border-t border-indigo-500/20 group-hover:border-indigo-400 transition-all duration-300"
                  />
                  <span className="text-slate-500 dark:text-zinc-400 font-semibold">{d.hari.slice(0, 3)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right chart: Revenue share per Poli (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold font-display dark:text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              <span>Distribusi Pendapatan Layanan</span>
            </h3>
          </div>

          <div className="space-y-4 pt-4 text-xs">
            {revenueData.map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700 dark:text-zinc-300">
                  <span>{d.poli}</span>
                  <span className="font-bold">{d.rev}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-zinc-950 rounded-full overflow-hidden border border-slate-200/50 dark:border-zinc-850">
                  <div
                    style={{ width: `${d.rev}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
