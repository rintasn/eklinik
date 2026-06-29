import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET: Retrieve medical records for a specific patient or pendaftaran
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pasienId = searchParams.get('pasienId')
    const pendaftaranId = searchParams.get('pendaftaranId')

    if (!pasienId && !pendaftaranId) {
      return NextResponse.json(
        { error: 'pasienId atau pendaftaranId harus disediakan.' },
        { status: 400 }
      )
    }

    const whereClause: any = {}
    if (pasienId) whereClause.pasienId = pasienId
    if (pendaftaranId) whereClause.pendaftaranId = pendaftaranId

    const medicalRecords = await prisma.rekamMedis.findMany({
      where: whereClause,
      include: {
        dokter: {
          select: {
            nama: true,
            spesialisasi: true
          }
        },
        resep: {
          include: {
            items: {
              include: {
                obat: true
              }
            }
          }
        },
        pendaftaran: {
          include: {
            poli: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: medicalRecords })
  } catch (error) {
    console.error('Fetch medical records error:', error)
    return NextResponse.json({ error: 'Gagal mengambil rekam medis.' }, { status: 500 })
  }
}

// POST: Create a new medical record (SOAP notes + Diagnosa + Prescription)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'DOKTER' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Hanya DOKTER yang dapat menyimpan rekam medis.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      pasienId,
      pendaftaranId,
      dokterId,
      subjektif,
      objektif,
      assessment,
      plan,
      diagnosaICD, // array of strings
      resepItems   // array of { obatId: string, jumlah: number, aturan: string, catatan?: string }
    } = body

    if (!pasienId || !pendaftaranId || !dokterId || !subjektif || !objektif || !assessment || !plan) {
      return NextResponse.json(
        { error: 'Mohon lengkapi data SOAP rekam medis.' },
        { status: 400 }
      )
    }

    // 1. Transaction to write medical record, create prescription, update status
    const result = await prisma.$transaction(async (tx) => {
      // Create Rekam Medis
      const rekamMedis = await tx.rekamMedis.create({
        data: {
          pasienId,
          pendaftaranId,
          dokterId,
          subjektif,
          objektif,
          assessment,
          plan,
          diagnosaICD: diagnosaICD || [],
        }
      })

      // Create prescription if provided
      let resep = null
      if (resepItems && resepItems.length > 0) {
        resep = await tx.resep.create({
          data: {
            rekamMedisId: rekamMedis.id,
            status: 'MENUNGGU',
            items: {
              create: resepItems.map((item: any) => ({
                obatId: item.obatId,
                jumlah: parseInt(item.jumlah),
                aturan: item.aturan,
                catatan: item.catatan || null,
              }))
            }
          },
          include: {
            items: true
          }
        })
      }

      // Update Pendaftaran status to SELESAI
      await tx.pendaftaran.update({
        where: { id: pendaftaranId },
        data: { status: 'SELESAI' }
      })

      // Update Antrian status to SELESAI
      const antrian = await tx.antrian.findUnique({
        where: { pendaftaranId }
      })

      if (antrian) {
        await tx.antrian.update({
          where: { id: antrian.id },
          data: {
            status: 'SELESAI',
            selesai: new Date()
          }
        })
      }

      return { rekamMedis, resep }
    })

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        aksi: 'CREATE REKAM MEDIS',
        tabel: 'RekamMedis',
        dataId: result.rekamMedis.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Save medical record error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan rekam medis.' }, { status: 500 })
  }
}
