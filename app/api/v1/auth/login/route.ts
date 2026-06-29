import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi.' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.status) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan atau tidak aktif.' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password salah.' },
        { status: 401 }
      )
    }

    // Create session cookie
    await createSession({
      id: user.id,
      email: user.email,
      role: user.role.toString(),
      nama: user.nama,
    })

    // Log this action (Auditing)
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        aksi: 'LOGIN',
        tabel: 'User',
        dataId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nama: user.nama,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server internal.' },
      { status: 500 }
    )
  }
}
