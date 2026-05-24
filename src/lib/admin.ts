import type { User } from '@netlify/identity'

export const ADMIN_EMAIL = 'akintolamary2018@gmail.com'

export function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? ''
}

export function isAdminEmail(email: string | null | undefined) {
  return normalizeEmail(email) === ADMIN_EMAIL
}

export function isAdminUser(user: Pick<User, 'email'> | null | undefined) {
  return isAdminEmail(user?.email)
}
