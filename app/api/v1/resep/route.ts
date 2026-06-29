import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { decryptField } from '@/lib/encryption'

// GET: Retrieve all active prescriptions
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status') // "MENUNGGU", "DIPROSES", "SELESAI"

    const whereClause: any = {}
    if (statusParam) {
      whereClause.status = statusParam
    }

    const activeResep = await prisma.resep.findMany({
      where: whereClause,
      include: {
        rekamMedis: {
          include: {
            pasien: true,
            dokter: {
              select: {
                nama: true
              }
            },
            pendaftaran: {
              include: {
                poli: true
              }
            }
          }
        },
        items: {
          include: {
            obat: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Decrypt patient details in memory
    const result = activeResep.map((r: any) => {
      return {
        ...r,
        rekamMedis: {
          ...r.rekamMedis,
          pasien: {
            ...r.rekamMedis.pasien,
            nik: decryptField(r.rekamMedis.pasien.nik),
            telepon: decryptField(r.rekamMedis.pasien.telepon),
            alamat: decryptField(r.rekamMedis.pasien.alamat),
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Fetch prescriptions error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data resep.' }, { status: 500 })
  }
}

// PUT: Process/Dispense a prescription (Deduct inventory stock and log transactions)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'APOTEKER' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Hanya APOTEKER yang dapat memproses resep.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { resepId, status, call } = body

    if (!resepId) {
      return NextResponse.json({ error: 'ID Resep diperlukan.' }, { status: 400 })
    }

    const resep = await prisma.resep.findUnique({
      where: { id: resepId },
      include: {
        items: {
          include: {
            obat: true
          }
        },
        rekamMedis: {
          include: {
            pasien: true
          }
        }
      }
    })

    if (!resep) {
      return NextResponse.json({ error: 'Resep tidak ditemukan.' }, { status: 404 })
    }

    const updateData: any = {}
    if (call) {
      updateData.dipanggil = new Date()
    }

    // If status is transitioning to SELESAI for the first time, deduct inventory stock and log
    if (status === 'SELESAI' && resep.status !== 'SELESAI') {
      // 1. Validate all stocks first
      for (const item of resep.items) {
        if (item.obat.stok < item.jumlah) {
          return NextResponse.json(
            { error: `Stok obat ${item.obat.nama} tidak mencukupi (Tersedia: ${item.obat.stok}, Diminta: ${item.jumlah}).` },
            { status: 400 }
          )
        }
      }

      // 2. Perform stock deduction transaction
      await prisma.$transaction(async (tx: any) => {
        for (const item of resep.items) {
          // Deduct stock
          await tx.obat.update({
            where: { id: item.obatId },
            data: {
              stok: {
                decrement: item.jumlah
              }
            }
          })

          // Create stock log
          await tx.stokLog.create({
            data: {
              obatId: item.obatId,
              tipe: 'OUT',
              jumlah: item.jumlah,
              keterangan: `Resep Dokter - Pasien: ${resep.rekamMedis.pasien.nama} (RM: ${resep.rekamMedis.pendaftaranId})`
            }
          })
        }

        // Update resep status to SELESAI
        await tx.resep.update({
          where: { id: resepId },
          data: {
            ...updateData,
            status: 'SELESAI'
          }
        })
      })
    } else {
      if (status) {
        updateData.status = status
      }
      if (Object.keys(updateData).length > 0) {
        await prisma.resep.update({
          where: { id: resepId },
          data: updateData
        })
      }
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        aksi: `DISPENSE RESEP - Status: ${status || resep.status} - Called: ${!!call}`,
        tabel: 'Resep',
        dataId: resepId,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    return NextResponse.json({ success: true, message: 'Resep berhasil diperbarui.' })
  } catch (error) {
    console.error('Dispense prescription error:', error)
    return NextResponse.json({ error: 'Gagal memproses resep.' }, { status: 500 })
  }
}
