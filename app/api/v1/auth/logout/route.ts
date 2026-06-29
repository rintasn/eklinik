import { NextResponse } from 'next/server'
import { logoutSession } from '@/lib/auth'

export async function POST() {
  try {
    await logoutSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Gagal melakukan logout.' },
      { status: 500 }
    )
  }
}
