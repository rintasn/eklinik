import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET || 'f1e2d3c4b5a69078563412cdfeab8978cdbfae5687ab23cd12bc34de56ef7890'
const key = new TextEncoder().encode(secretKey)

interface SessionPayload {
  userId: string
  email: string
  role: string
  nama: string
}

async function getSessionPayload(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get('session')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })
    return payload as unknown as SessionPayload
  } catch (error) {
    return null
  }
}

// Map sub-dashboards to authorized roles
const routeRoles: { [key: string]: string[] } = {
  '/front-office': ['ADMIN', 'FRONT_OFFICE'],
  '/pendaftaran': ['ADMIN', 'FRONT_OFFICE', 'PERAWAT'],
  '/dokter': ['ADMIN', 'DOKTER'],
  '/apotik': ['ADMIN', 'APOTEKER'],
  '/pembayaran': ['ADMIN', 'KASIR'],
  '/stok': ['ADMIN', 'MANAJER_STOK', 'APOTEKER'],
  '/fasilitas': ['ADMIN', 'MANAJER_STOK'],
  '/laporan': ['ADMIN', 'KASIR', 'MANAJER_STOK'],
  '/jadwal': ['ADMIN', 'FRONT_OFFICE', 'DOKTER', 'PERAWAT', 'APOTEKER', 'KASIR', 'MANAJER_STOK'],
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip static assets, APIs, and public pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/daftar-online') ||
    pathname.startsWith('/layar-antrian') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  const payload = await getSessionPayload(request)

  // Auth pages logic (login/register)
  if (pathname === '/login' || pathname === '/register') {
    if (payload) {
      return NextResponse.redirect(new URL('/front-office', request.url))
    }
    return NextResponse.next()
  }

  // Guard all other routes
  if (!payload) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role verification (RBAC)
  const matchedRoute = Object.keys(routeRoles).find(route => pathname.startsWith(route))
  if (matchedRoute) {
    const allowedRoles = routeRoles[matchedRoute]
    if (!allowedRoles.includes(payload.role)) {
      // Forbidden: redirect to default allowed page
      let defaultPath = '/'
      if (payload.role === 'FRONT_OFFICE') defaultPath = '/front-office'
      else if (payload.role === 'PERAWAT') defaultPath = '/pendaftaran'
      else if (payload.role === 'DOKTER') defaultPath = '/dokter'
      else if (payload.role === 'APOTEKER') defaultPath = '/apotik'
      else if (payload.role === 'KASIR') defaultPath = '/pembayaran'
      else if (payload.role === 'MANAJER_STOK') defaultPath = '/stok'
      else if (payload.role === 'ADMIN') defaultPath = '/front-office'

      return NextResponse.redirect(new URL(defaultPath, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
