import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secretKey = process.env.JWT_SECRET || 'f1e2d3c4b5a69078563412cdfeab8978cdbfae5687ab23cd12bc34de56ef7890'
const key = new TextEncoder().encode(secretKey)

export interface UserSession {
  userId: string
  email: string
  role: string
  nama: string
}

export async function encryptJWT(payload: UserSession, expiresAt: Date) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(key)
}

export async function decryptJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })
    return payload as unknown as UserSession
  } catch (error) {
    return null
  }
}

export async function createSession(user: { id: string; email: string; role: string; nama: string }) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const token = await encryptJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    nama: user.nama
  }, expiresAt)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return await decryptJWT(token)
}

export async function logoutSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
