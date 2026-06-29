import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { decryptField } from '@/lib/encryption'

// GET: Fetch list of registrations (with patient details decrypted)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('tanggal') // "YYYY-MM-DD"
    const patientId = searchParams.get('pasienId')
    const poliId = searchParams.get('poliId')

    const whereClause: any = {}
    if (dateParam) {
      whereClause.tanggal = new Date(`${dateParam}T00:00:00Z`)
    }
    if (patientId) {
      whereClause.pasienId = patientId
    }
    if (poliId) {
      whereClause.poliId = poliId
    }

    const pendaftarans = await prisma.pendaftaran.findMany({
      where: whereClause,
      include: {
        pasien: true,
        poli: true,
        dokter: true,
        antrian: true,
        rekamMedis: true,
        pembayaran: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    // Decrypt patient NIK, phone, address for staff view
    // Note: If we need to send to a client, keep it safe
    const result = pendaftarans.map((p: any) => {
      return {
        ...p,
        pasien: {
          ...p.pasien,
          nik: decryptField(p.pasien.nik),
          telepon: decryptField(p.pasien.telepon),
          alamat: decryptField(p.pasien.alamat),
        }
      }
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Fetch pendaftarans error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data pendaftaran.' }, { status: 500 })
  }
}

// POST: Register a patient visit
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    // Public patient portal doesn't require session for ONLINE registration,
    // but staff OFFLINE walk-in requires authenticated session.
    const isOnline = request.headers.get('x-source') === 'online'
    if (!isOnline && !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { pasienId, poliId, dokterId, jadwalId, tanggal, sumber, keluhan } = body

    if (!pasienId || !poliId || !dokterId || !jadwalId || !tanggal) {
      return NextResponse.json(
        { error: 'Mohon isi semua field pendaftaran yang diperlukan.' },
        { status: 400 }
      )
    }

    const targetDate = new Date(`${tanggal}T00:00:00Z`)

    // Check if patient already registered for this doctor on this day
    const existingRegistration = await prisma.pendaftaran.findFirst({
      where: {
        pasienId,
        dokterId,
        tanggal: targetDate,
        status: { in: ['MENUNGGU', 'DIPERIKSA', 'SELESAI'] }
      }
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Pasien sudah terdaftar untuk dokter tersebut pada tanggal ini.' },
        { status: 400 }
      )
    }

    // Verify schedule kuota
    const schedule = await prisma.jadwalDokter.findUnique({
      where: { id: jadwalId }
    })

    if (!schedule || !schedule.aktif) {
      return NextResponse.json({ error: 'Jadwal dokter tidak aktif atau tidak ditemukan.' }, { status: 400 })
    }

    const currentBookings = await prisma.pendaftaran.count({
      where: {
        jadwalId,
        tanggal: targetDate,
        status: { in: ['MENUNGGU', 'DIPERIKSA', 'SELESAI'] }
      }
    })

    if (currentBookings >= schedule.kuota) {
      return NextResponse.json({ error: 'Kuota pendaftaran dokter sudah penuh.' }, { status: 400 })
    }

    // Calculate queue number for the specific poly on this date
    const todayRegistrationsCount = await prisma.pendaftaran.count({
      where: {
        poliId,
        tanggal: targetDate
      }
    })
    const queueNumber = todayRegistrationsCount + 1

    // Create Pendaftaran
    const newPendaftaran = await prisma.pendaftaran.create({
      data: {
        pasienId,
        poliId,
        dokterId,
        jadwalId,
        tanggal: targetDate,
        status: 'MENUNGGU',
        sumber: sumber || 'ONLINE',
        keluhan: keluhan || null,
      }
    })

    // Create Antrian
    const newAntrian = await prisma.antrian.create({
      data: {
        pendaftaranId: newPendaftaran.id,
        nomorAntrian: queueNumber,
        status: 'MENUNGGU'
      }
    })

    // Audit Log
    if (session) {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          aksi: `CREATE PENDAFTARAN - Antrian #${queueNumber}`,
          tabel: 'Pendaftaran',
          dataId: newPendaftaran.id,
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        pendaftaran: newPendaftaran,
        antrian: newAntrian
      }
    })
  } catch (error) {
    console.error('Create pendaftaran error:', error)
    return NextResponse.json({ error: 'Gagal membuat pendaftaran kunjungan.' }, { status: 500 })
  }
}

// PUT: Update registration (E.g. update status or record vital signs during check-in/triage)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      status,
      keluhan,
      tensiSistolik,
      tensiDiastolik,
      beratBadan,
      tinggiBadan,
      suhuTubuh,
      nadi,
      triaseColor
    } = body

    if (!id) {
      return NextResponse.json({ error: 'ID Pendaftaran diperlukan.' }, { status: 400 })
    }

    const existingPendaftaran = await prisma.pendaftaran.findUnique({
      where: { id },
      include: { antrian: true }
    })

    if (!existingPendaftaran) {
      return NextResponse.json({ error: 'Data pendaftaran tidak ditemukan.' }, { status: 404 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (keluhan !== undefined) updateData.keluhan = keluhan
    if (tensiSistolik !== undefined) updateData.tensiSistolik = parseInt(tensiSistolik) || null
    if (tensiDiastolik !== undefined) updateData.tensiDiastolik = parseInt(tensiDiastolik) || null
    if (beratBadan !== undefined) updateData.beratBadan = parseFloat(beratBadan) || null
    if (tinggiBadan !== undefined) updateData.tinggiBadan = parseFloat(tinggiBadan) || null
    if (suhuTubuh !== undefined) updateData.suhuTubuh = parseFloat(suhuTubuh) || null
    if (nadi !== undefined) updateData.nadi = parseInt(nadi) || null
    if (triaseColor !== undefined) updateData.triaseColor = triaseColor

    const updatedPendaftaran = await prisma.pendaftaran.update({
      where: { id },
      data: updateData
    })

    // If status is updated, we sync the queue (Antrian) status too
    if (status && existingPendaftaran.antrian) {
      let antrianStatus: any = 'MENUNGGU'
      let callTime: Date | null = existingPendaftaran.antrian.dipanggil
      let endTime: Date | null = existingPendaftaran.antrian.selesai

      if (status === 'DIPERIKSA') {
        antrianStatus = 'DIPANGGIL'
        callTime = new Date()
      } else if (status === 'SELESAI') {
        antrianStatus = 'SELESAI'
        endTime = new Date()
      } else if (status === 'BATAL') {
        antrianStatus = 'BATAL'
      }

      await prisma.antrian.update({
        where: { id: existingPendaftaran.antrian.id },
        data: {
          status: antrianStatus,
          dipanggil: callTime,
          selesai: endTime
        }
      })
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        aksi: `UPDATE PENDAFTARAN - Status: ${status || 'Triage Update'}`,
        tabel: 'Pendaftaran',
        dataId: id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    return NextResponse.json({ success: true, data: updatedPendaftaran })
  } catch (error) {
    console.error('Update pendaftaran error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui data pendaftaran.' }, { status: 500 })
  }
}
