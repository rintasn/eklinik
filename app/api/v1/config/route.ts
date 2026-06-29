import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET: Retrieve config values (only for ADMIN)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Hanya ADMIN yang dapat mengelola konfigurasi.' }, { status: 403 })
    }

    const configs = await prisma.systemConfig.findMany()
    const configMap = configs.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value
      return acc;
    }, {})

    return NextResponse.json({
      success: true,
      data: {
        bpjs_api_key: configMap['bpjs_api_key'] || '',
        bpjs_api_url: configMap['bpjs_api_url'] || 'https://api.bpjs-kesehatan.go.id/vclaim-rest',
        asuransi_api_key: configMap['asuransi_api_key'] || '',
        asuransi_api_url: configMap['asuransi_api_url'] || 'https://api.asuransi-provider.com/v1',
      }
    })
  } catch (error) {
    console.error('Fetch config error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data konfigurasi.' }, { status: 500 })
  }
}

// POST: Save or update config values (only for ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Hanya ADMIN yang dapat mengelola konfigurasi.' }, { status: 403 })
    }

    const body = await request.json()
    const { bpjs_api_key, bpjs_api_url, asuransi_api_key, asuransi_api_url } = body

    const keysToUpdate = [
      { key: 'bpjs_api_key', value: bpjs_api_key },
      { key: 'bpjs_api_url', value: bpjs_api_url },
      { key: 'asuransi_api_key', value: asuransi_api_key },
      { key: 'asuransi_api_url', value: asuransi_api_url },
    ]

    for (const item of keysToUpdate) {
      if (item.value !== undefined) {
        await prisma.systemConfig.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: { key: item.key, value: item.value }
        })
      }
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        aksi: 'UPDATE SYSTEM CONFIGURATION',
        tabel: 'SystemConfig',
        dataId: 'MULTIPLE',
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    })

    return NextResponse.json({ success: true, message: 'Konfigurasi berhasil disimpan.' })
  } catch (error) {
    console.error('Save config error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan data konfigurasi.' }, { status: 500 })
  }
}
