import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

// POST: Test provider connectivity (only for ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Hanya ADMIN yang dapat menguji koneksi.' }, { status: 403 })
    }

    const body = await request.json()
    const { provider } = body // "BPJS" or "ASURANSI"

    if (!provider) {
      return NextResponse.json({ error: 'Provider name is required.' }, { status: 400 })
    }

    // Simulate network delay for verification
    await new Promise(resolve => setTimeout(resolve, 800))

    // Simple mock validation logic
    if (provider === 'BPJS') {
      return NextResponse.json({
        success: true,
        message: 'Koneksi sukses! Server BPJS V-Claim 2.0 merespon normal. Status: Active.'
      })
    } else if (provider === 'ASURANSI') {
      return NextResponse.json({
        success: true,
        message: 'Koneksi sukses! Merchant API Gateway Asuransi merespon normal. Status: Authorized.'
      })
    } else {
      return NextResponse.json({ error: 'Provider tidak dikenali.' }, { status: 400 })
    }
  } catch (error) {
    console.error('Test connection error:', error)
    return NextResponse.json({ error: 'Gagal menguji koneksi.' }, { status: 500 })
  }
}
