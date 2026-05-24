import { createServerFn } from '@tanstack/react-start'
import { db } from '../../db/index.js'
import { notifications } from '../../db/schema.js'
import { eq, desc } from 'drizzle-orm'
import { requireAuthMiddleware, requireAdminMiddleware } from '../middleware/identity.js'

export const getNotifications = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .handler(async () => {
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt))
  })

export const getUnreadCount = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .handler(async () => {
    const unread = await db.select().from(notifications).where(eq(notifications.isRead, false))
    return unread.length
  })

export const markAsRead = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id))
    return { success: true }
  })

export const markAllAsRead = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .handler(async () => {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.isRead, false))
    return { success: true }
  })

export const createNotification = createServerFn({ method: 'POST' })
  .inputValidator((data: { type: string; title: string; message: string; recipientEmail: string }) => data)
  .handler(async ({ data }) => {
    const [notification] = await db.insert(notifications).values({
      type: data.type,
      title: data.title,
      message: data.message,
      recipientEmail: data.recipientEmail,
    }).returning()
    return notification
  })
