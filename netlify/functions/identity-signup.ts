import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import { drizzle } from 'drizzle-orm/netlify-db'
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core'

const notificationsTable = pgTable('notifications', {
  id: serial().primaryKey(),
  type: text().notNull(),
  title: text().notNull(),
  message: text().notNull(),
  recipientEmail: text('recipient_email').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

const ADMIN_EMAIL = 'akintolamary2018@gmail.com'
const ADMIN_NOTIFY_EMAIL = 'akintolamary2018@gmail.com'

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const user = JSON.parse(event.body || '{}')
  const email = user.email?.toLowerCase() || ''
  const userName = user.user_metadata?.full_name || email
  const isAdmin = email === ADMIN_EMAIL

  const siteUrl = process.env.URL || ''

  try {
    const database = drizzle()

    if (isAdmin) {
      await database.insert(notificationsTable).values({
        type: 'admin_confirmation',
        title: 'Admin Account Signup',
        message: `Admin account signup started for ${email}. The account must still be verified from the Netlify Identity confirmation email before login.`,
        recipientEmail: email,
      })
    } else {
      await database.insert(notificationsTable).values({
        type: 'signup',
        title: 'New User Signup',
        message: `New user signed up: ${userName} (${email})`,
        recipientEmail: ADMIN_NOTIFY_EMAIL,
      })
    }
  } catch (_) {
    // best-effort DB notification
  }

  if (siteUrl) {
    try {
      if (isAdmin) {
        await fetch(`${siteUrl}/__forms.html`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            'form-name': 'admin-notifications',
            notification_type: 'admin_confirmation',
            title: 'Admin Account Signup',
            message: `Your admin account (${email}) has been created. Please verify the account using the Netlify Identity confirmation email before signing in.`,
            email: email,
            subject: `Vidamedics Admin - Admin Account Signup for ${email}`,
          }).toString(),
        })
      } else {
        await fetch(`${siteUrl}/__forms.html`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            'form-name': 'admin-notifications',
            notification_type: 'signup',
            title: 'New User Signup',
            message: `New user signed up: ${userName} (${email})`,
            email: ADMIN_NOTIFY_EMAIL,
            subject: `Vidamedics - New User Signup: ${userName}`,
          }).toString(),
        })
      }
    } catch (_) {
      // best-effort form submission for email
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      app_metadata: {
        roles: ['user'],
      },
      user_metadata: {
        ...user.user_metadata,
        signed_up_at: new Date().toISOString(),
      },
    }),
  }
}

export { handler }
