import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { decryptField } from '@/lib/encryption'

// Default consulting fees per Poli clinic
const CONSULT_FEES: { [key: string]: number } = {
  'Poli Umum': 30000,
  'Poli Gigi': 50000,
  'Poli Anak': 75000,
  'Poli KIA': 40000,
}

// GET: Retrieve invoices or calculate dynamic bill details for a registration
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pendaftaranId = searchParams.get('pendaftaranId')
    const statusParam = searchParams.get('status') // "BELUM_BAYAR", "LUNAS"

    // Case 1: Fetch invoice preview / calculation for a specific registration
    if (pendaftaranId) {
      const pendaftaran = await prisma.pendaftaran.findUnique({
        where: { id: pendaftaranId },
        include: {
          pasien: true,
          poli: true,
          dokter: true,
          rekamMedis: {
            include: {
              resep: {
                include: {
                  items: {
                    include: {
                      obat: true
                    }
                  }
                }
              }
            }
          },
          pembayaran: true
        }
      })

      if (!pendaftaran) {
        return NextResponse.json({ error: 'Data pendaftaran tidak ditemukan.' }, { status: 404 })
      }

      // Calculate details
      const polyFee = CONSULT_FEES[pendaftaran.poli.nama] || 30000
      let medicineFee = 0
      const medicineItems: any[] = []

      if (pendaftaran.rekamMedis?.resep) {
        for (const resep of pendaftaran.rekamMedis.resep) {
          for (const item of resep.items) {
            const cost = Number(item.obat.hargaJual) * item.jumlah
            medicineFee += cost
            medicineItems.push({
              id: item.id,
              nama: item.obat.nama,
              jumlah: item.jumlah,
              satuan: item.obat.satuan,
              hargaSatuan: Number(item.obat.hargaJual),
              subtotal: cost
            })
          }
        }
      }

      const totalBill = polyFee + medicineFee

      return NextResponse.json({
        success: true,
        data: {
          pendaftaranId: pendaftaran.id,
          pasien: {
            id: pendaftaran.pasien.id,
            noRekamMedis: pendaftaran.pasien.noRekamMedis,
            nama: pendaftaran.pasien.nama,
            telepon: decryptField(pendaftaran.pasien.telepon),
            alamat: decryptField(pendaftaran.pasien.alamat),
          },
          dokterNama: pendaftaran.dokter.nama,
          poliNama: pendaftaran.poli.nama,
          tanggal: pendaftaran.tanggal,
          statusPendaftaran: pendaftaran.status,
          polyFee,
          medicineFee,
          medicineItems,
          totalBill,
          pembayaran: pendaftaran.pembayaran
        }
      })
    }

    // Case 2: Fetch all payments list
    const whereClause: any = {}
    if (statusParam) {
      whereClause.status = statusParam
    }

    const pembayaranList = await prisma.pembayaran.findMany({
      where: whereClause,
      include: {
        pendaftaran: {
          include: {
            pasien: true,
            poli: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedList = pembayaranList.map((p: any) => ({
      ...p,
      pendaftaran: {
        ...p.pendaftaran,
        pasien: {
          ...p.pendaftaran.pasien,
          nik: decryptField(p.pendaftaran.pasien.nik),
          telepon: decryptField(p.pendaftaran.pasien.telepon),
          alamat: decryptField(p.pendaftaran.pasien.alamat),
        }
      }
    }))

    return NextResponse.json({ success: true, data: formattedList })
  } catch (error) {
    console.error('Fetch payments error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data pembayaran.' }, { status: 500 })
  }
}

// POST: Execute checkout and complete payment
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'KASIR' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Hanya KASIR yang dapat memproses pembayaran.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { pendaftaranId, metodePembayaran, totalTagihan, nomorKartu, rujukanNo, asuransiProvider } = body

    if (!pendaftaranId || !metodePembayaran || totalTagihan === undefined) {
      return NextResponse.json(
        { error: 'Data pembayaran tidak lengkap.' },
        { status: 400 }
      )
    }

    // Check if payment already exists
    const existingPembayaran = await prisma.pembayaran.findUnique({
      where: { pendaftaranId }
    })

    if (existingPembayaran && existingPembayaran.status === 'LUNAS') {
      return NextResponse.json({ error: 'Tagihan pendaftaran ini sudah lunas.' }, { status: 400 })
    }

    // Generate Invoice Number (Format: INV-YYMMXXXX)
    const now = new Date()
    const yy = now.getFullYear().toString().substring(2, 4)
    const mm = (now.getMonth() + 1).toString().padStart(2, '0')
    const prefix = `INV-${yy}${mm}`

    const lastPayment = await prisma.pembayaran.findFirst({
      where: { noKuitansi: { startsWith: prefix } },
      orderBy: { noKuitansi: 'desc' }
    })

    let sequence = 1
    if (lastPayment) {
      const parts = lastPayment.noKuitansi.split('-')
      if (parts.length === 2) {
        const lastSeq = parseInt(parts[1].substring(4))
        sequence = lastSeq + 1
      }
    }
    const noKuitansi = `${prefix}${sequence.toString().padStart(4, '0')}`

    let result = null

    if (existingPembayaran) {
      // Update existing
      result = await prisma.pembayaran.update({
        where: { id: existingPembayaran.id },
        data: {
          totalTagihan: parseFloat(totalTagihan),
          metodePembayaran,
          status: 'LUNAS',
          noKuitansi,
          kasirId: session.userId,
          nomorKartu: nomorKartu || null,
          rujukanNo: rujukanNo || null,
          asuransiProvider: asuransiProvider || null
        }
      })
    } else {
      // Create new
      result = await prisma.pembayaran.create({
        data: {
          pendaftaranId,
          totalTagihan: parseFloat(totalTagihan),
          metodePembayaran,
          status: 'LUNAS',
          noKuitansi,
          kasirId: session.userId,
          nomorKartu: nomorKartu || null,
          rujukanNo: rujukanNo || null,
          asuransiProvider: asuransiProvider || null
        }
      })
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        aksi: `CHECKOUT PAYMENT - Invoice #${noKuitansi}`,
        tabel: 'Pembayaran',
        dataId: result.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Process payment error:', error)
    return NextResponse.json({ error: 'Gagal memproses pembayaran tagihan.' }, { status: 500 })
  }
}
