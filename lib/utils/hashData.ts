import crypto from 'crypto'

export const hashData = (data: string) => {
  if (!data) return ''
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex')
}
