import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rooms = await prisma.fasilitas.findMany({
      orderBy: { namaRuangan: 'asc' }
    })

    return NextResponse.json({ success: true, data: rooms })
  } catch (error) {
    console.error('Fetch rooms error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data fasilitas.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'MANAJER_STOK' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Hanya Manajer Stok atau Admin yang dapat merubah fasilitas.' }, { status: 403 })
    }

    const body = await request.json()
    const { id, status, logKerusakan } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'ID Fasilitas dan Status diperlukan.' }, { status: 400 })
    }

    const updatedRoom = await prisma.fasilitas.update({
      where: { id },
      data: {
        status,
        logKerusakan: logKerusakan || null
      }
    })

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        aksi: `UPDATE ROOM STATUS - ${updatedRoom.namaRuangan} (${status})`,
        tabel: 'Fasilitas',
        dataId: id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    return NextResponse.json({ success: true, data: updatedRoom })
  } catch (error) {
    console.error('Update room error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui status ruangan.' }, { status: 500 })
  }
}
