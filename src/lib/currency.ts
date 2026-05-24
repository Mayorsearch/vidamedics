const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 2,
})

export function formatPrice(amountInKobo: number) {
  return nairaFormatter.format(amountInKobo / 100)
}

export const SHIPPING_THRESHOLD = 5000
export const SHIPPING_FEE = 499
