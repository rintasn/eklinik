import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // "finance" | "visitors" | "medicines"

    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    // CASE 1: Financial Reports
    if (type === 'finance') {
      const todayLunas = await prisma.pembayaran.findMany({
        where: {
          status: 'LUNAS',
          createdAt: { gte: todayStart, lte: todayEnd }
        }
      })
      const todayRevenue = todayLunas.reduce((acc, curr) => acc + Number(curr.totalTagihan), 0)

      const monthLunas = await prisma.pembayaran.findMany({
        where: {
          status: 'LUNAS',
          createdAt: { gte: thisMonthStart }
        }
      })
      const monthRevenue = monthLunas.reduce((acc, curr) => acc + Number(curr.totalTagihan), 0)

      // Revenue breakdown by payment method (month-to-date)
      const methods = ['TUNAI', 'TRANSFER', 'BPJS', 'ASURANSI']
      const breakdown = methods.map(method => {
        const total = monthLunas
          .filter(p => p.metodePembayaran === method)
          .reduce((acc, curr) => acc + Number(curr.totalTagihan), 0)
        return { name: method, value: total }
      })

      // Financial transaction history for the last 6 days + today
      const pastDaysData = []
      for (let i = 6; i >= 0; i--) {
        const day = new Date()
        day.setDate(today.getDate() - i)
        const dStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
        const dEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59)

        const dayLunas = await prisma.pembayaran.findMany({
          where: { status: 'LUNAS', createdAt: { gte: dStart, lte: dEnd } }
        })
        const total = dayLunas.reduce((acc, curr) => acc + Number(curr.totalTagihan), 0)

        const formattedDate = day.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
        pastDaysData.push({ date: formattedDate, revenue: total })
      }

      return NextResponse.json({
        success: true,
        data: {
          todayRevenue,
          monthRevenue,
          breakdown,
          history: pastDaysData
        }
      })
    }

    // CASE 2: Patient Visitor Analytics
    if (type === 'visitors') {
      const todayTotal = await prisma.pendaftaran.count({
        where: { tanggal: { gte: todayStart, lte: todayEnd } }
      })

      const todayWaiting = await prisma.pendaftaran.count({
        where: {
          tanggal: { gte: todayStart, lte: todayEnd },
          status: 'MENUNGGU'
        }
      })

      const todayExamining = await prisma.pendaftaran.count({
        where: {
          tanggal: { gte: todayStart, lte: todayEnd },
          status: 'DIPERIKSA'
        }
      })

      const todayDone = await prisma.pendaftaran.count({
        where: {
          tanggal: { gte: todayStart, lte: todayEnd },
          status: 'SELESAI'
        }
      })

      // Visitor ratio by Poly MTD
      const polis = await prisma.poli.findMany()
      const polyBreakdown = await Promise.all(
        polis.map(async (poli) => {
          const count = await prisma.pendaftaran.count({
            where: {
              poliId: poli.id,
              tanggal: { gte: thisMonthStart }
            }
          })
          return { name: poli.nama, value: count }
        })
      )

      // Daily visitor graph for last 7 days
      const visitorHistory = []
      for (let i = 6; i >= 0; i--) {
        const day = new Date()
        day.setDate(today.getDate() - i)
        const dStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
        const dEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59)

        const count = await prisma.pendaftaran.count({
          where: { tanggal: { gte: dStart, lte: dEnd } }
        })

        const formattedDate = day.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
        visitorHistory.push({ date: formattedDate, patients: count })
      }

      return NextResponse.json({
        success: true,
        data: {
          today: {
            total: todayTotal,
            waiting: todayWaiting,
            examining: todayExamining,
            completed: todayDone
          },
          breakdown: polyBreakdown,
          history: visitorHistory
        }
      })
    }

    // CASE 3: Medicine Stocks and Alerts
    if (type === 'medicines') {
      const allObat = await prisma.obat.findMany()

      const outOfStock = allObat.filter(o => o.stok <= 0).length
      const lowStock = allObat.filter(o => o.stok > 0 && o.stok <= o.stokMinimum).length

      // Near Expired (within 3 months)
      const warningThreshold = new Date()
      warningThreshold.setDate(today.getDate() + 90)
      const nearExpired = allObat.filter(
        o => o.expiredDate && new Date(o.expiredDate) <= warningThreshold && new Date(o.expiredDate) > today
      ).length

      // Top 5 prescribed drugs MTD
      const topPrescriptions = await prisma.resepItem.groupBy({
        by: ['obatId'],
        _sum: {
          jumlah: true
        },
        orderBy: {
          _sum: {
            jumlah: 'desc'
          }
        },
        take: 5
      })

      const topDrugsList = await Promise.all(
        topPrescriptions.map(async (item) => {
          const obat = await prisma.obat.findUnique({
            where: { id: item.obatId },
            select: { nama: true, satuan: true }
          })
          return {
            name: obat?.nama || 'Unknown',
            amount: item._sum.jumlah || 0,
            unit: obat?.satuan || 'Pcs'
          }
        })
      )

      return NextResponse.json({
        success: true,
        data: {
          summary: {
            outOfStock,
            lowStock,
            nearExpired
          },
          topPrescribed: topDrugsList
        }
      })
    }

    // Default: General summaries
    return NextResponse.json({ error: 'Tipe laporan tidak dispesifikasikan.' }, { status: 400 })
  } catch (error) {
    console.error('Fetch reports error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data laporan.' }, { status: 500 })
  }
}
