import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alkesList = await prisma.alatKesehatan.findMany({
      orderBy: { kode: 'asc' }
    })

    return NextResponse.json({ success: true, data: alkesList })
  } catch (error) {
    console.error('Fetch alkes error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data alkes.' }, { status: 500 })
  }
}
