import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const poliId = searchParams.get('poliId')
    const statusParam = searchParams.get('status') // E.g. "MENUNGGU", "DIPANGGIL"

    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    const targetDate = new Date(`${dateStr}T00:00:00Z`)

    const whereClause: any = {
      pendaftaran: {
        tanggal: targetDate,
      }
    }

    if (poliId) {
      whereClause.pendaftaran.poliId = poliId
    }

    if (statusParam) {
      whereClause.status = statusParam
    }

    const activeQueues = await prisma.antrian.findMany({
      where: whereClause,
      include: {
        pendaftaran: {
          include: {
            pasien: {
              select: {
                nama: true,
                noRekamMedis: true,
              }
            },
            poli: {
              select: {
                nama: true,
              }
            },
            dokter: {
              select: {
                nama: true,
              }
            }
          }
        }
      },
      orderBy: { nomorAntrian: 'asc' }
    })

    // Compute metrics
    const totalQueues = activeQueues.length
    const waitingQueues = activeQueues.filter((q: any) => q.status === 'MENUNGGU').length
    const callingQueues = activeQueues.filter((q: any) => q.status === 'DIPANGGIL').length
    const completedQueues = activeQueues.filter((q: any) => q.status === 'SELESAI').length

    return NextResponse.json({
      success: true,
      data: activeQueues,
      metrics: {
        total: totalQueues,
        waiting: waitingQueues,
        calling: callingQueues,
        completed: completedQueues,
      }
    })
  } catch (error) {
    console.error('Fetch active queues error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data antrian.' }, { status: 500 })
  }
}
