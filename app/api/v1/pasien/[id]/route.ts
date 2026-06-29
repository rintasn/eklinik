import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { encryptField, decryptField } from '@/lib/encryption'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const patient = await prisma.pasien.findUnique({
      where: { id }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Pasien tidak ditemukan.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...patient,
        nik: decryptField(patient.nik),
        telepon: decryptField(patient.telepon),
        alamat: decryptField(patient.alamat),
      }
    })
  } catch (error) {
    console.error('Fetch patient detail error:', error)
    return NextResponse.json({ error: 'Gagal mengambil detail pasien.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { nik, nama, tanggalLahir, jenisKelamin, alamat, telepon, email } = body

    const existingPatient = await prisma.pasien.findUnique({
      where: { id }
    })

    if (!existingPatient) {
      return NextResponse.json({ error: 'Pasien tidak ditemukan.' }, { status: 404 })
    }

    // Encrypt fields if updated
    const updateData: any = {}
    if (nama !== undefined) updateData.nama = nama
    if (tanggalLahir !== undefined) updateData.tanggalLahir = new Date(tanggalLahir)
    if (jenisKelamin !== undefined) updateData.jenisKelamin = jenisKelamin
    if (email !== undefined) updateData.email = email || null

    if (nik !== undefined) updateData.nik = encryptField(nik)
    if (telepon !== undefined) updateData.telepon = encryptField(telepon)
    if (alamat !== undefined) updateData.alamat = encryptField(alamat)

    const updatedPatient = await prisma.pasien.update({
      where: { id },
      data: updateData
    })

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        aksi: 'UPDATE PASIEN',
        tabel: 'Pasien',
        dataId: id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedPatient,
        nik: nik !== undefined ? nik : decryptField(updatedPatient.nik),
        telepon: telepon !== undefined ? telepon : decryptField(updatedPatient.telepon),
        alamat: alamat !== undefined ? alamat : decryptField(updatedPatient.alamat),
      }
    })
  } catch (error) {
    console.error('Update patient error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui data pasien.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Hanya ADMIN yang dapat menghapus data pasien.' }, { status: 403 })
    }

    const { id } = await context.params
    const patient = await prisma.pasien.findUnique({
      where: { id }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Pasien tidak ditemukan.' }, { status: 404 })
    }

    await prisma.pasien.delete({
      where: { id }
    })

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        aksi: 'DELETE PASIEN',
        tabel: 'Pasien',
        dataId: id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    return NextResponse.json({ success: true, message: 'Pasien berhasil dihapus.' })
  } catch (error) {
    console.error('Delete patient error:', error)
    return NextResponse.json({ error: 'Gagal menghapus data pasien.' }, { status: 500 })
  }
}
