import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { userProfiles } from '../../db/schema.js'
import { requireAuthMiddleware } from '../middleware/identity.js'

const updateProfileSchema = z.object({
  fullName: z.string().max(200).default(''),
  phone: z.string().max(30).default(''),
  contactEmail: z.string().email().or(z.literal('')).default(''),
  address: z.string().max(500).default(''),
  city: z.string().max(100).default(''),
  state: z.string().max(100).default(''),
})

export type UserProfile = typeof updateProfileSchema._output

export const getUserProfile = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const userId = context.user.id
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
    return profile ?? null
  })

export const upsertUserProfile = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateProfileSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const [existing] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))

    if (existing) {
      const [updated] = await db
        .update(userProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userProfiles.userId, userId))
        .returning()
      return updated
    }

    const [created] = await db
      .insert(userProfiles)
      .values({ userId, ...data })
      .returning()
    return created
  })

export const getProfileForCheckout = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const userId = context.user.id
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
    if (!profile) return null
    return {
      fullName: profile.fullName,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      state: profile.state,
    }
  })
