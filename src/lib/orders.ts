import { createServerFn } from '@tanstack/react-start'
import { db } from '../../db/index.js'
import { notifications } from '../../db/schema.js'
import { formatPrice } from './currency.js'

const ADMIN_EMAIL = 'akintolamary2018@gmail.com'

interface DeliveryDetails {
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  notes: string
}

export async function createOrderNotification(data: { items: Array<{ name: string; quantity: number; price: number }>; total: number; customerEmail?: string; delivery?: DeliveryDetails }) {
  const itemsList = data.items.map(i => `${i.name} x${i.quantity} - ${formatPrice(i.price * i.quantity)}`).join(', ')
  const totalFormatted = formatPrice(data.total)

  let deliveryInfo = ''
  if (data.delivery && data.delivery.fullName) {
    deliveryInfo = ` | Deliver to: ${data.delivery.fullName}, ${data.delivery.address}, ${data.delivery.city}, ${data.delivery.state}. Phone: ${data.delivery.phone}.`
    if (data.delivery.notes) {
      deliveryInfo += ` Notes: ${data.delivery.notes}.`
    }
  }

  const message = `Order total: ${totalFormatted}. Items: ${itemsList}. Customer: ${data.customerEmail || 'Guest'}${deliveryInfo}`

  await db.insert(notifications).values({
    type: 'order',
    title: 'New Order Received',
    message,
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
          message,
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
