import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Retrieve doctor schedules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const poliId = searchParams.get('poliId')
    const hari = searchParams.get('hari') // E.g. "SENIN", "SELASA"

    const whereClause: any = { aktif: true }
    if (poliId) {
      whereClause.poliId = poliId
    }
    if (hari) {
      whereClause.hari = hari
    }

    const schedules = await prisma.jadwalDokter.findMany({
      where: whereClause,
      include: {
        dokter: {
          select: {
            id: true,
            nama: true,
            spesialisasi: true
          }
        },
        poli: {
          select: {
            id: true,
            nama: true
          }
        }
      },
      orderBy: [
        { hari: 'asc' },
        { jamMulai: 'asc' }
      ]
    })

    return NextResponse.json({ success: true, data: schedules })
  } catch (error) {
    console.error('Fetch doctor schedules error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data jadwal dokter.' }, { status: 500 })
  }
}
