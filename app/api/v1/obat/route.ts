import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET: Fetch list of medicines, support filters
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    const filter = searchParams.get('filter') // "low-stock" or "expired"

    const whereClause: any = {}

    if (query) {
      whereClause.OR = [
        { nama: { contains: query, mode: 'insensitive' } },
        { kode: { contains: query, mode: 'insensitive' } }
      ]
    }

    let obatList = await prisma.obat.findMany({
      where: whereClause,
      include: {
        stokLogs: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { nama: 'asc' }
    })

    const today = new Date()

    if (filter === 'low-stock') {
      obatList = obatList.filter(o => o.stok <= o.stokMinimum)
    } else if (filter === 'expired') {
      // Expired or expiring within 3 months (90 days)
      const warningThreshold = new Date()
      warningThreshold.setDate(today.getDate() + 90)
      obatList = obatList.filter(o => o.expiredDate && new Date(o.expiredDate) <= warningThreshold)
    }

    return NextResponse.json({ success: true, data: obatList })
  } catch (error) {
    console.error('Fetch obat list error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data obat.' }, { status: 500 })
  }
}

// POST: Add new medicine / Restock PO
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'MANAJER_STOK' && session.role !== 'APOTEKER' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Anda tidak memiliki akses untuk menambah stok obat.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { kode, nama, satuan, stok, stokMinimum, hargaBeli, hargaJual, expiredDate } = body

    if (!kode || !nama || !satuan || hargaBeli === undefined || hargaJual === undefined) {
      return NextResponse.json(
        { error: 'Mohon isi semua field obat yang wajib.' },
        { status: 400 }
      )
    }

    // Check if code duplicate
    const existing = await prisma.obat.findUnique({
      where: { kode }
    })

    if (existing) {
      return NextResponse.json({ error: 'Kode obat sudah digunakan.' }, { status: 400 })
    }

    const initialStock = parseInt(stok) || 0

    const newObat = await prisma.obat.create({
      data: {
        kode,
        nama,
        satuan,
        stok: initialStock,
        stokMinimum: parseInt(stokMinimum) || 10,
        hargaBeli: parseFloat(hargaBeli),
        hargaJual: parseFloat(hargaJual),
        expiredDate: expiredDate ? new Date(expiredDate) : null
      }
    })

    // Create stock log if initial stock > 0
    if (initialStock > 0) {
      await prisma.stokLog.create({
        data: {
          obatId: newObat.id,
          tipe: 'IN',
          jumlah: initialStock,
          keterangan: 'Stok Awal Tambah Baru'
        }
      })
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        aksi: 'CREATE OBAT',
        tabel: 'Obat',
        dataId: newObat.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    return NextResponse.json({ success: true, data: newObat })
  } catch (error) {
    console.error('Create obat error:', error)
    return NextResponse.json({ error: 'Gagal menambahkan obat baru.' }, { status: 500 })
  }
}

// PUT: Update medicine stock details or execute Purchase Order restock
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'MANAJER_STOK' && session.role !== 'APOTEKER' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { id, restockQty, purchaseOrderNumber, ...otherDetails } = body

    if (!id) {
      return NextResponse.json({ error: 'ID Obat diperlukan.' }, { status: 400 })
    }

    const existingObat = await prisma.obat.findUnique({
      where: { id }
    })

    if (!existingObat) {
      return NextResponse.json({ error: 'Obat tidak ditemukan.' }, { status: 404 })
    }

    const updateData: any = {}
    if (otherDetails.nama !== undefined) updateData.nama = otherDetails.nama
    if (otherDetails.satuan !== undefined) updateData.satuan = otherDetails.satuan
    if (otherDetails.stokMinimum !== undefined) updateData.stokMinimum = parseInt(otherDetails.stokMinimum)
    if (otherDetails.hargaBeli !== undefined) updateData.hargaBeli = parseFloat(otherDetails.hargaBeli)
    if (otherDetails.hargaJual !== undefined) updateData.hargaJual = parseFloat(otherDetails.hargaJual)
    if (otherDetails.expiredDate !== undefined) {
      updateData.expiredDate = otherDetails.expiredDate ? new Date(otherDetails.expiredDate) : null
    }

    let loggedAction = 'UPDATE OBAT'

    // If restocking
    if (restockQty && parseInt(restockQty) > 0) {
      const qty = parseInt(restockQty)
      updateData.stok = {
        increment: qty
      }
      loggedAction = `RESTOCK OBAT (+${qty})`

      // Transaction to update and write stock log
      await prisma.$transaction(async (tx) => {
        await tx.obat.update({
          where: { id },
          data: updateData
        })

        await tx.stokLog.create({
          data: {
            obatId: id,
            tipe: 'IN',
            jumlah: qty,
            keterangan: purchaseOrderNumber ? `Purchase Order: ${purchaseOrderNumber}` : 'Restock Logistik Manual'
          }
        })
      })
    } else {
      // Just update other details
      await prisma.obat.update({
        where: { id },
        data: updateData
      })
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        aksi: loggedAction,
        tabel: 'Obat',
        dataId: id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    return NextResponse.json({ success: true, message: 'Data obat berhasil diperbarui.' })
  } catch (error) {
    console.error('Update obat error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui data obat.' }, { status: 500 })
  }
}
