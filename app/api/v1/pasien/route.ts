import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { encryptField, decryptField } from '@/lib/encryption'

// GET: List or search patients
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''

    const allPatients = await prisma.pasien.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Decrypt fields and filter in memory
    const decryptedPatients = allPatients.map((p) => ({
      ...p,
      nik: decryptField(p.nik),
      telepon: decryptField(p.telepon),
      alamat: decryptField(p.alamat),
    }))

    const filteredPatients = query
      ? decryptedPatients.filter(
          (p) =>
            p.nama.toLowerCase().includes(query) ||
            p.noRekamMedis.toLowerCase().includes(query) ||
            p.nik.includes(query) ||
            p.telepon.includes(query) ||
            (p.email && p.email.toLowerCase().includes(query))
        )
      : decryptedPatients

    return NextResponse.json({ success: true, data: filteredPatients })
  } catch (error) {
    console.error('Fetch patients error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data pasien.' }, { status: 500 })
  }
}

// POST: Create a new patient
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { nik, nama, tanggalLahir, jenisKelamin, alamat, telepon, email } = body

    if (!nik || !nama || !tanggalLahir || !jenisKelamin || !alamat || !telepon) {
      return NextResponse.json(
        { error: 'Mohon isi semua data pasien yang wajib.' },
        { status: 400 }
      )
    }

    // Check if patient NIK already exists
    // Since NIK is encrypted, we check by searching decrypted list
    const existingPatients = await prisma.pasien.findMany()
    const isDuplicate = existingPatients.some(
      (p) => decryptField(p.nik) === nik
    )
    if (isDuplicate) {
      return NextResponse.json(
        { error: 'Pasien dengan NIK tersebut sudah terdaftar.' },
        { status: 400 }
      )
    }

    // Generate unique Rekam Medis number (Format: RM-YYXXXX)
    const currentYear = new Date().getFullYear().toString().substring(2, 4) // "26"
    const lastPasien = await prisma.pasien.findFirst({
      where: { noRekamMedis: { startsWith: `RM-${currentYear}` } },
      orderBy: { noRekamMedis: 'desc' }
    })

    let nextNumber = 1
    if (lastPasien) {
      const parts = lastPasien.noRekamMedis.split('-')
      if (parts.length === 2) {
        const sequence = parseInt(parts[1].substring(2)) // E.g. "0001" -> 1
        nextNumber = sequence + 1
      }
    }
    const noRekamMedis = `RM-${currentYear}${nextNumber.toString().padStart(4, '0')}`

    // Encrypt fields
    const encryptedNik = encryptField(nik)
    const encryptedTelepon = encryptField(telepon)
    const encryptedAlamat = encryptField(alamat)

    // Save to DB
    const newPasien = await prisma.pasien.create({
      data: {
        noRekamMedis,
        nik: encryptedNik,
        nama,
        tanggalLahir: new Date(tanggalLahir),
        jenisKelamin,
        alamat: encryptedAlamat,
        telepon: encryptedTelepon,
        email: email || null,
      }
    })

    // Decrypt for UI response
    const responseData = {
      ...newPasien,
      nik,
      telepon,
      alamat,
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        aksi: 'CREATE PASIEN',
        tabel: 'Pasien',
        dataId: newPasien.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    return NextResponse.json({ success: true, data: responseData })
  } catch (error) {
    console.error('Create patient error:', error)
    return NextResponse.json({ error: 'Gagal membuat data pasien baru.' }, { status: 500 })
  }
}
