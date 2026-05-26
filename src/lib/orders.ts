import { createServerFn } from '@tanstack/react-start'
import { db } from '../../db/index.js'
import { notifications } from '../../db/schema.js'
import { formatPrice } from './currency.js'

const ADMIN_EMAIL = 'akintolamary2018@gmail.com'

export async function createOrderNotification(data: { items: Array<{ name: string; quantity: number; price: number }>; total: number; customerEmail?: string; deliveryDetails?: { fullName?: string; phone?: string; address?: string; city?: string; state?: string } }) {
  const itemsList = data.items.map(i => `${i.name} x${i.quantity} - ${formatPrice(i.price * i.quantity)}`).join(', ')
  const totalFormatted = formatPrice(data.total)
  const d = data.deliveryDetails
  const deliveryInfo = d ? `\nDelivery: ${d.fullName || ''}, ${d.address || ''}, ${d.city || ''}, ${d.state || ''}. Phone: ${d.phone || ''}` : ''

  await db.insert(notifications).values({
    type: 'order',
    title: 'New Order Received',
    message: `Order total: ${totalFormatted}. Items: ${itemsList}. Customer: ${data.customerEmail || 'Guest'}${deliveryInfo}`,
    recipientEmail: ADMIN_EMAIL,
  })

  const siteUrl = process.env.URL || ''
  if (siteUrl) {
    try {
      await fetch(`${siteUrl}/__forms.html`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'admin-notifications',
          notification_type: 'order',
          title: 'New Order Received',
          message: `Order total: ${totalFormatted}. Items: ${itemsList}. Customer: ${data.customerEmail || 'Guest'}`,
          email: ADMIN_EMAIL,
          subject: `Vidamedics - New Order: ${totalFormatted}`,
        }).toString(),
      })
    } catch (_) {
      // best-effort email notification
    }
  }
}

export const placeOrder = createServerFn({ method: 'POST' })
  .inputValidator((data: { items: Array<{ name: string; quantity: number; price: number }>; total: number; customerEmail?: string }) => data)
  .handler(async ({ data }) => {
    await createOrderNotification(data)
    return { success: true }
  })
