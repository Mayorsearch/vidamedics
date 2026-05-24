import { createServerFn } from '@tanstack/react-start'
import { db } from '../../db/index.js'
import { notifications } from '../../db/schema.js'
import { requireAuthMiddleware, requireAdminMiddleware } from '../middleware/identity.js'

type AdminEmailInput = {
  recipientEmail: string
  subject: string
  message: string
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const sendAdminEmail = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .inputValidator((data: AdminEmailInput) => data)
  .handler(async ({ data, context }) => {
    const recipientEmail = normalizeEmail(data.recipientEmail)
    const subject = data.subject.trim()
    const message = data.message.trim()

    if (!recipientEmail || !recipientEmail.includes('@')) {
      throw new Error('Enter a valid recipient email address.')
    }

    if (!subject) {
      throw new Error('Enter an email subject.')
    }

    if (!message) {
      throw new Error('Enter an email message.')
    }

    await db.insert(notifications).values({
      type: 'admin_email',
      title: subject,
      message,
      recipientEmail,
      isRead: true,
    })

    const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || ''
    if (!siteUrl) {
      return { success: true, emailQueued: false }
    }

    const response = await fetch(`${siteUrl}/__forms.html`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'form-name': 'admin-notifications',
        notification_type: 'admin_email',
        title: subject,
        message,
        email: recipientEmail,
        subject,
        sender: context.user.email ?? 'Admin',
      }).toString(),
    })

    if (!response.ok) {
      throw new Error('The message was saved, but Netlify Forms did not accept the email submission.')
    }

    return { success: true, emailQueued: true }
  })
