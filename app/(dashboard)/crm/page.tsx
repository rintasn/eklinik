'use client'

import { useState } from 'react'
import { MessageSquare, Plus, Search, CheckCircle, Video, Star, Send, Bell } from 'lucide-react'

interface CSATFeedback {
  id: string
  pasienNama: string
  rating: number
  ulasan: string
  tanggal: string
  balasanAdmin?: string
}

interface TeleConsultation {
  id: string
  pasienNama: string
  dokterNama: string
  tanggal: string
  jam: string
  status: 'TERJADWAL' | 'SELESAI' | 'BATAL'
  linkRoom: string
}

export default function CRMPage() {
  const [feedbacks, setFeedbacks] = useState<CSATFeedback[]>([
    { id: '1', pasienNama: 'Ahmad Syarif', rating: 5, ulasan: 'Pelayanan dokter sangat informatif, dan pendaftaran mandiri cepat sekali!', tanggal: '2026-06-29' },
    { id: '2', pasienNama: 'Budi Santoso', rating: 4, ulasan: 'Apotik agak lama antriannya, tapi selebihnya sangat bagus.', tanggal: '2026-06-28', balasanAdmin: 'Terima kasih atas masukannya. Kami terus meningkatkan kecepatan pelayanan farmasi.' },
  ])

  const [consultations, setConsultations] = useState<TeleConsultation[]>([
    { id: '1', pasienNama: 'Lilis Indah', dokterNama: 'dr. Sarah Sp.A', tanggal: '2026-06-30', jam: '13:00', status: 'TERJADWAL', linkRoom: 'https://meet.google.com/xyz-abc' },
  ])

  const [activeTab, setActiveTab] = useState<'feedback' | 'telemedis' | 'blast'>('feedback')

  // Feedback reply
  const [replyInputId, setReplyInputId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  // Broadcast campaign
  const [campaignSuccess, setCampaignSuccess] = useState('')
  const [campaignTitle, setCampaignTitle] = useState('')
  const [campaignBody, setCampaignBody] = useState('')

  const handleReplySubmit = (id: string) => {
    setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, balasanAdmin: replyText } : f))
    setReplyInputId(null)
    setReplyText('')
  }

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaignTitle || !campaignBody) return
    setCampaignSuccess('WhatsApp Blast kampanye pengingat kontrol berhasil dikirim ke 142 pasien!')
    setCampaignTitle('')
    setCampaignBody('')
    setTimeout(() => setCampaignSuccess(''), 5000)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white">Customer Relationship Management (CRM)</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Umpan balik pasien (NPS/CSAT), penjadwalan telekonsultasi video online, serta broadcast notifikasi pengingat kontrol.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-zinc-800 pb-px">
        {[
          { id: 'feedback', label: 'Kepuasan & Umpan Balik', icon: Star },
          { id: 'telemedis', label: 'Telekonsultasi Online', icon: Video },
          { id: 'blast', label: 'Broadcast WhatsApp / Notif', icon: Bell },
        ].map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={[
                'flex items-center gap-2 text-xs font-semibold px-4 py-3 border-b-2 transition-all cursor-pointer',
                activeTab === t.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {feedbacks.map(f => (
              <div key={f.id} className="glass-panel p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold dark:text-white">{f.pasienNama}</span>
                  <span className="text-slate-400 dark:text-zinc-500">{f.tanggal}</span>
                </div>

                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: f.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400 italic bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/80">
                  &quot;{f.ulasan}&quot;
                </p>

                {f.balasanAdmin ? (
                  <div className="text-[11px] bg-indigo-500/5 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-500/10 text-slate-600 dark:text-zinc-400">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">Tanggapan Klinik:</span>
                    {f.balasanAdmin}
                  </div>
                ) : (
                  replyInputId !== f.id && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setReplyInputId(f.id)}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        Tanggapi Ulasan
                      </button>
                    </div>
                  )
                )}

                {replyInputId === f.id && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Ketik tanggapan apresiasi atau solusi..."
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setReplyInputId(null)} className="text-[10px] font-bold text-slate-400 px-2 py-1">Batal</button>
                      <button onClick={() => handleReplySubmit(f.id)} className="text-[10px] font-bold text-white bg-indigo-650 hover:bg-indigo-500 px-3 py-1 rounded-lg">Kirim Balasan</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'telemedis' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-950 text-slate-400 dark:text-zinc-500 border-b border-slate-200 dark:border-zinc-800">
                  <th className="p-4 font-bold uppercase">Nama Pasien</th>
                  <th className="p-4 font-bold uppercase">Dokter Konsultan</th>
                  <th className="p-4 font-bold uppercase">Jadwal Sesi</th>
                  <th className="p-4 font-bold uppercase">Tautan Room Medis</th>
                  <th className="p-4 font-bold uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {consultations.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/20 transition-all">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{c.pasienNama}</td>
                    <td className="p-4 text-slate-650 dark:text-zinc-300 font-semibold">{c.dokterNama}</td>
                    <td className="p-4 text-slate-500 dark:text-zinc-500">{c.tanggal} ({c.jam} WIB)</td>
                    <td className="p-4">
                      <a href={c.linkRoom} target="_blank" rel="noreferrer" className="text-indigo-650 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1">
                        <Video className="h-3.5 w-3.5 shrink-0" />
                        <span>Google Meet Room &rarr;</span>
                      </a>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'blast' && (
        <div className="space-y-6 max-w-2xl">
          {campaignSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>{campaignSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="glass-panel p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
            <div>
              <h3 className="font-bold text-sm dark:text-white">Kirim Pengingat Kontrol Pasien (WhatsApp Blast)</h3>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Kirim notifikasi terjadwal pengingat kontrol rutin H-1 ke seluruh pasien terdaftar.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Nama Kampanye Notifikasi</label>
              <input
                type="text"
                required
                value={campaignTitle}
                onChange={e => setCampaignTitle(e.target.value)}
                placeholder="E.g. Pengingat Kontrol Rutin Poli Jantung"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2.5 px-3 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Draft Pesan WhatsApp</label>
              <textarea
                required
                value={campaignBody}
                onChange={e => setCampaignBody(e.target.value)}
                placeholder="Halo [Nama Pasien], kami mengingatkan jadwal kontrol rutin Anda besok..."
                rows={4}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl py-2.5 px-3 text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/10"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Kirim Broadcast</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
