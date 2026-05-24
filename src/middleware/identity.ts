import { createMiddleware } from '@tanstack/react-start'
import { getUser, type User } from '@netlify/identity'
import { isAdminUser } from '../lib/admin.js'

export const identityMiddleware = createMiddleware().server(async ({ next }) => {
  const user: User | null = (await getUser()) ?? null
  return next({ context: { user } })
})

export const requireAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const user = await getUser()
  if (!user) throw new Error('Authentication required')
  return next({ context: { user } })
})

export function requireRoleMiddleware(role: string) {
  return createMiddleware().server(async ({ next }) => {
    const user = await getUser()
    if (!user) throw new Error('Authentication required')
    if (role === 'admin') {
      if (!isAdminUser(user)) throw new Error('Admin access required')
      return next({ context: { user } })
    }
    if (!user.roles?.includes(role)) throw new Error(`Role '${role}' required`)
    return next({ context: { user } })
  })
}

export const requireAdminMiddleware = createMiddleware().server(async ({ next }) => {
  const user = await getUser()
  if (!user) throw new Error('Authentication required')
  if (!isAdminUser(user)) throw new Error('Admin access required')
  return next({ context: { user } })
})
