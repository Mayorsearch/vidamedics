import { createServerFn } from '@tanstack/react-start'
import { db } from '../../db/index.js'
import { paymentSettings } from '../../db/schema.js'
import { eq, desc } from 'drizzle-orm'
import { requireAuthMiddleware, requireAdminMiddleware } from '../middleware/identity.js'

export const getPaymentSettings = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .handler(async () => {
    return await db.select().from(paymentSettings).orderBy(desc(paymentSettings.createdAt))
  })

export const getActiveGateway = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .handler(async () => {
    const [gateway] = await db.select().from(paymentSettings).where(eq(paymentSettings.isActive, true))
    return gateway || null
  })

export const createPaymentSetting = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .inputValidator((data: { gatewayName: string; publicKey: string; secretKey: string; webhookSecret: string; isActive: boolean }) => data)
  .handler(async ({ data }) => {
    if (data.isActive) {
      await db.update(paymentSettings).set({ isActive: false, updatedAt: new Date() })
    }
    const [setting] = await db.insert(paymentSettings).values({
      gatewayName: data.gatewayName,
      publicKey: data.publicKey,
      secretKey: data.secretKey,
      webhookSecret: data.webhookSecret,
      isActive: data.isActive,
    }).returning()
    return setting
  })

export const updatePaymentSetting = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .inputValidator((data: { id: number; gatewayName: string; publicKey: string; secretKey: string; webhookSecret: string; isActive: boolean }) => data)
  .handler(async ({ data }) => {
    if (data.isActive) {
      await db.update(paymentSettings).set({ isActive: false, updatedAt: new Date() })
    }
    const [setting] = await db.update(paymentSettings).set({
      gatewayName: data.gatewayName,
      publicKey: data.publicKey,
      secretKey: data.secretKey,
      webhookSecret: data.webhookSecret,
      isActive: data.isActive,
      updatedAt: new Date(),
    }).where(eq(paymentSettings.id, data.id)).returning()
    return setting
  })

export const deletePaymentSetting = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    await db.delete(paymentSettings).where(eq(paymentSettings.id, id))
    return { success: true }
  })
