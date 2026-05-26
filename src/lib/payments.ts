import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { paymentSettings, paymentTransactions, products } from '../../db/schema.js'
import { SHIPPING_FEE, SHIPPING_THRESHOLD } from './currency.js'
import { createOrderNotification } from './orders.js'

const PAYSTACK_INITIALIZE_URL = 'https://api.paystack.co/transaction/initialize'
const PAYSTACK_VERIFY_URL = 'https://api.paystack.co/transaction/verify'
const DEFAULT_CURRENCY = 'NGN'

const checkoutItemSchema = z.object({
  id: z.number().int().positive(),
  quantity: z.number().int().positive().max(99),
})

const deliveryDetailsSchema = z.object({
  fullName: z.string().min(1).max(200),
  phone: z.string().min(1).max(30),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
})

const initializeCheckoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  customerEmail: z.string().email(),
  deliveryDetails: deliveryDetailsSchema,
})

const verifyPaymentSchema = z.object({
  reference: z.string().min(1),
})

type CheckoutItem = z.infer<typeof checkoutItemSchema>

function normalizeGatewayName(name: string) {
  return name.trim().toLowerCase()
}

function getSiteUrl() {
  return process.env.URL || process.env.DEPLOY_PRIME_URL || 'http://localhost:3000'
}

function makeReference() {
  const random = Math.random().toString(36).slice(2, 10)
  return `VIDA-${Date.now()}-${random}`.toUpperCase()
}

async function getActivePaystackGateway() {
  const activeGateways = await db
    .select()
    .from(paymentSettings)
    .where(eq(paymentSettings.isActive, true))
  const gateway = activeGateways.find((setting) => normalizeGatewayName(setting.gatewayName) === 'paystack')

  if (!gateway || normalizeGatewayName(gateway.gatewayName) !== 'paystack') {
    throw new Error('Paystack is not configured as the active payment gateway.')
  }

  if (!gateway.secretKey) {
    throw new Error('Paystack secret key is missing.')
  }

  return gateway
}

async function buildCheckoutItems(items: CheckoutItem[]) {
  const quantities = new Map<number, number>()
  for (const item of items) {
    quantities.set(item.id, (quantities.get(item.id) || 0) + item.quantity)
  }

  const productIds = [...quantities.keys()]
  const rows = await db.select().from(products).where(inArray(products.id, productIds))

  if (rows.length !== productIds.length) {
    throw new Error('One or more cart items are no longer available.')
  }

  const orderItems = rows.map((product) => {
    if (!product.inStock) {
      throw new Error(`${product.name} is currently out of stock.`)
    }

    return {
      id: product.id,
      name: product.name,
      quantity: quantities.get(product.id) || 0,
      price: product.price,
    }
  })

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE

  return {
    orderItems,
    subtotal,
    shipping,
    total: subtotal + shipping,
  }
}

export const initializePaystackCheckout = createServerFn({ method: 'POST' })
  .inputValidator(initializeCheckoutSchema)
  .handler(async ({ data }) => {
    const gateway = await getActivePaystackGateway()
    const checkout = await buildCheckoutItems(data.items)
    const reference = makeReference()
    const callbackUrl = `${getSiteUrl()}/checkout/success?reference=${encodeURIComponent(reference)}`

    const response = await fetch(PAYSTACK_INITIALIZE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gateway.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.customerEmail,
        amount: checkout.total,
        currency: DEFAULT_CURRENCY,
        reference,
        callback_url: callbackUrl,
        metadata: {
          order_items: checkout.orderItems,
          shipping: checkout.shipping,
        },
      }),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok || !payload?.status || !payload?.data?.authorization_url) {
      throw new Error(payload?.message || 'Unable to start Paystack checkout.')
    }

    await db.insert(paymentTransactions).values({
      reference,
      gatewayName: gateway.gatewayName,
      customerEmail: data.customerEmail,
      amount: checkout.total,
      currency: DEFAULT_CURRENCY,
      status: 'pending',
      itemsJson: JSON.stringify(checkout.orderItems),
      authorizationUrl: payload.data.authorization_url,
      deliveryDetailsJson: JSON.stringify(data.deliveryDetails),
    })

    return {
      authorizationUrl: payload.data.authorization_url as string,
      reference,
    }
  })

export const verifyPaystackPayment = createServerFn({ method: 'POST' })
  .inputValidator(verifyPaymentSchema)
  .handler(async ({ data }) => {
    const [transaction] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.reference, data.reference))

    if (!transaction) {
      throw new Error('Payment reference was not found.')
    }

    if (transaction.status === 'success') {
      return { success: true, alreadyProcessed: true }
    }

    const gateway = await getActivePaystackGateway()
    const response = await fetch(`${PAYSTACK_VERIFY_URL}/${encodeURIComponent(data.reference)}`, {
      headers: {
        Authorization: `Bearer ${gateway.secretKey}`,
      },
    })
    const payload = await response.json().catch(() => null)
    const payment = payload?.data

    if (!response.ok || !payload?.status || payment?.status !== 'success') {
      await db
        .update(paymentTransactions)
        .set({ status: payment?.status || 'failed', updatedAt: new Date() })
        .where(eq(paymentTransactions.reference, data.reference))
      throw new Error(payload?.message || 'Payment could not be verified.')
    }

    if (payment.reference !== data.reference || payment.amount !== transaction.amount) {
      await db
        .update(paymentTransactions)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(paymentTransactions.reference, data.reference))
      throw new Error('Payment verification did not match the order.')
    }

    await db
      .update(paymentTransactions)
      .set({ status: 'success', updatedAt: new Date() })
      .where(eq(paymentTransactions.reference, data.reference))

    const orderItems = JSON.parse(transaction.itemsJson) as Array<{ name: string; quantity: number; price: number }>
    const deliveryDetails = JSON.parse(transaction.deliveryDetailsJson || '{}')
    await createOrderNotification({
      items: orderItems,
      total: transaction.amount,
      customerEmail: transaction.customerEmail,
      deliveryDetails,
    })

    return { success: true, alreadyProcessed: false }
  })
