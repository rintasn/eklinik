import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const TAG_LENGTH = 16

const getKey = () => {
  const hexKey = process.env.ENCRYPTION_KEY || 'd7a36c5b9e8d7c6b5a4938271605f4e3d2c1b0a9f8e7d6c5b4a39281706f5e4d'
  return Buffer.from(hexKey, 'hex')
}

export function encryptField(plaintext: string): string {
  if (!plaintext) return ''
  try {
    const iv = randomBytes(IV_LENGTH)
    const key = getKey()
    const cipher = createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const tag = cipher.getAuthTag()
    // format: iv:encryptedData:authTag
    return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`
  } catch (err) {
    console.error('Encryption failed, returning plaintext:', err)
    return plaintext
  }
}

export function decryptField(ciphertext: string): string {
  if (!ciphertext) return ''
  try {
    const parts = ciphertext.split(':')
    if (parts.length !== 3) {
      // If it doesn't match our 'iv:encryptedData:tag' pattern, return as-is
      return ciphertext
    }
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    const tag = Buffer.from(parts[2], 'hex')
    const key = getKey()
    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (err) {
    // Graceful fallback for unencrypted seed data
    return ciphertext
  }
}
