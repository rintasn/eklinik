import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { encryptField, decryptField } from '@/lib/encryption'

// Default consulting fees per Poli clinic
const CONSULT_FEES: { [key: string]: number } = {
  'Poli Umum': 30000,
  'Poli Gigi': 50000,
  'Poli Anak': 75000,
  'Poli KIA': 40000,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nik,
      nama,
      tanggalLahir,
      jenisKelamin,
      alamat,
      telepon,
      email,
      poliId,
      dokterId,
      jadwalId,
      tanggal,
      keluhan
    } = body

    // 1. Validation
    if (
      !nik ||
      !nama ||
      !tanggalLahir ||
      !jenisKelamin ||
      !alamat ||
      !telepon ||
      !poliId ||
      !dokterId ||
      !jadwalId ||
      !tanggal
    ) {
      return NextResponse.json(
        { error: 'Mohon isi semua data formulir pendaftaran secara lengkap.' },
        { status: 400 }
      )
    }

    const targetDate = new Date(`${tanggal}T00:00:00Z`)

    // 2. Find or Create Patient record
    // Since NIK is encrypted, retrieve all and decrypt in memory to find duplicate
    const allPatients = await prisma.pasien.findMany()
    let patient = allPatients.find(p => decryptField(p.nik) === nik)

    if (!patient) {
      // Generate medical record number (Format: RM-YYXXXX)
      const currentYear = new Date().getFullYear().toString().substring(2, 4)
      const lastPasien = await prisma.pasien.findFirst({
        where: { noRekamMedis: { startsWith: `RM-${currentYear}` } },
        orderBy: { noRekamMedis: 'desc' }
      })

      let nextNumber = 1
      if (lastPasien) {
        const parts = lastPasien.noRekamMedis.split('-')
        if (parts.length === 2) {
          const sequence = parseInt(parts[1].substring(2))
          nextNumber = sequence + 1
        }
      }
      const noRekamMedis = `RM-${currentYear}${nextNumber.toString().padStart(4, '0')}`

      // Create new Patient
      patient = await prisma.pasien.create({
        data: {
          noRekamMedis,
          nik: encryptField(nik),
          nama,
          tanggalLahir: new Date(tanggalLahir),
          jenisKelamin,
          alamat: encryptField(alamat),
          telepon: encryptField(telepon),
          email: email || null,
        }
      })
    }

    // 3. Check for existing active registration for today
    const existingRegistration = await prisma.pendaftaran.findFirst({
      where: {
        pasienId: patient.id,
        dokterId,
        tanggal: targetDate,
        status: { in: ['MENUNGGU', 'DIPERIKSA'] }
      }
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Anda sudah terdaftar untuk dokter tersebut pada tanggal ini.' },
        { status: 400 }
      )
    }

    // 4. Verify schedule and quotas
    const schedule = await prisma.jadwalDokter.findUnique({
      where: { id: jadwalId },
      include: {
        dokter: true,
        poli: true
      }
    })

    if (!schedule || !schedule.aktif) {
      return NextResponse.json({ error: 'Jadwal dokter tidak tersedia atau tidak aktif.' }, { status: 400 })
    }

    const currentBookings = await prisma.pendaftaran.count({
      where: {
        jadwalId,
        tanggal: targetDate,
        status: { in: ['MENUNGGU', 'DIPERIKSA', 'SELESAI'] }
      }
    })

    if (currentBookings >= schedule.kuota) {
      return NextResponse.json({ error: 'Kuota pendaftaran dokter untuk sesi ini sudah penuh.' }, { status: 400 })
    }

    // 5. Calculate queue number for this specific poly on this date
    const todayRegistrationsCount = await prisma.pendaftaran.count({
      where: {
        poliId,
        tanggal: targetDate
      }
    })
    const queueNumber = todayRegistrationsCount + 1

    // 6. Create booking records in transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Create Pendaftaran
      const pendaftaran = await tx.pendaftaran.create({
        data: {
          pasienId: patient!.id,
          poliId,
          dokterId,
          jadwalId,
          tanggal: targetDate,
          status: 'MENUNGGU',
          sumber: 'ONLINE',
          keluhan: keluhan || null,
        }
      })

      // Create Antrian
      const antrian = await tx.antrian.create({
        data: {
          pendaftaranId: pendaftaran.id,
          nomorAntrian: queueNumber,
          status: 'MENUNGGU'
        }
      })

      // Create initial Pembayaran record (BELUM_BAYAR)
      const polyFee = CONSULT_FEES[schedule.poli.nama] || 30000
      
      // Generate temporary bill code
      const yy = targetDate.getFullYear().toString().substring(2, 4)
      const mm = (targetDate.getMonth() + 1).toString().padStart(2, '0')
      const noKuitansi = `TEMP-${yy}${mm}${Math.random().toString(36).substring(2, 6).toUpperCase()}`

      await tx.pembayaran.create({
        data: {
          pendaftaranId: pendaftaran.id,
          totalTagihan: polyFee,
          metodePembayaran: 'TUNAI',
          status: 'BELUM_BAYAR',
          noKuitansi
        }
      })

      return { pendaftaran, antrian }
    })

    return NextResponse.json({
      success: true,
      data: {
        noRekamMedis: patient.noRekamMedis,
        pasienNama: patient.nama,
        poliNama: schedule.poli.nama,
        dokterNama: schedule.dokter.nama,
        tanggal: tanggal,
        nomorAntrian: queueNumber,
        estimasiMenit: queueNumber * 15, // E.g., average 15 mins per patient
        pendaftaranId: transactionResult.pendaftaran.id
      }
    })

  } catch (error) {
    console.error('Public online registration error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat menyimpan pendaftaran.' },
      { status: 500 }
    )
  }
}
