import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCart } from '@/lib/cart-context'
import { useIdentity } from '@/lib/identity-context'
import { formatPrice, SHIPPING_FEE, SHIPPING_THRESHOLD } from '@/lib/currency'
import { initializePaystackCheckout } from '@/lib/payments'
import { getProfileForCheckout } from '@/lib/profiles'
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Truck } from 'lucide-react'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

interface DeliveryDetails {
  fullName: string
  phone: string
  address: string
  city: string
  state: string
}

function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart()
  const { user } = useIdentity()
  const navigate = useNavigate()
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [showDelivery, setShowDelivery] = useState(false)
  const [deliveryErrors, setDeliveryErrors] = useState<Partial<Record<keyof DeliveryDetails, string>>>({})
  const [delivery, setDelivery] = useState<DeliveryDetails>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  })
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    if (showDelivery && user && !profileLoaded) {
      setProfileLoaded(true)
      getProfileForCheckout().then((profile) => {
        if (profile) {
          setDelivery((prev) => ({
            fullName: prev.fullName || profile.fullName || '',
            phone: prev.phone || profile.phone || '',
            address: prev.address || profile.address || '',
            city: prev.city || profile.city || '',
            state: prev.state || profile.state || '',
          }))
        }
      }).catch(() => {})
    }
  }, [showDelivery, user, profileLoaded])

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart size={32} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Browse our products and add items to get started.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-800 transition-colors no-underline"
        >
          <ArrowLeft size={16} />
          Continue Shopping
        </Link>
      </div>
    )
  }

  function validateDelivery(): boolean {
    const errors: Partial<Record<keyof DeliveryDetails, string>> = {}
    if (!delivery.fullName.trim()) errors.fullName = 'Full name is required'
    if (!delivery.phone.trim()) errors.phone = 'Phone number is required'
    if (!delivery.address.trim()) errors.address = 'Address is required'
    if (!delivery.city.trim()) errors.city = 'City is required'
    if (!delivery.state.trim()) errors.state = 'State is required'
    setDeliveryErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleProceedToDelivery() {
    setCheckoutError('')
    if (!user?.email) {
      navigate({ to: '/login' })
      return
    }
    setShowDelivery(true)
  }

  async function handlePayment() {
    if (!validateDelivery()) return
    if (!user?.email) return

    setCheckingOut(true)
    setCheckoutError('')
    try {
      const checkout = await initializePaystackCheckout({
        data: {
          items: items.map(i => ({ id: i.id, quantity: i.quantity })),
          customerEmail: user.email,
          deliveryDetails: {
            fullName: delivery.fullName.trim(),
            phone: delivery.phone.trim(),
            address: delivery.address.trim(),
            city: delivery.city.trim(),
            state: delivery.state.trim(),
          },
        },
      })
      window.location.href = checkout.authorizationUrl
    } catch (err: any) {
      setCheckoutError(err.message || 'Unable to start checkout. Please try again.')
      setCheckingOut(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors bg-transparent border-0 cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                <p className="text-purple-700 font-bold mt-1">{formatPrice(item.price)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-gray-500 hover:text-purple-700 bg-transparent border-0 cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-gray-500 hover:text-purple-700 bg-transparent border-0 cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors bg-transparent border-0 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}

          {showDelivery && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Truck size={20} className="text-purple-700" />
                <h2 className="font-semibold text-gray-900">Delivery Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={delivery.fullName}
                    onChange={(e) => setDelivery({ ...delivery, fullName: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                  {deliveryErrors.fullName && <p className="text-red-500 text-xs mt-1">{deliveryErrors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={delivery.phone}
                    onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g. 08012345678"
                  />
                  {deliveryErrors.phone && <p className="text-red-500 text-xs mt-1">{deliveryErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={delivery.state}
                    onChange={(e) => setDelivery({ ...delivery, state: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g. Lagos"
                  />
                  {deliveryErrors.state && <p className="text-red-500 text-xs mt-1">{deliveryErrors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={delivery.city}
                    onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g. Ikeja"
                  />
                  {deliveryErrors.city && <p className="text-red-500 text-xs mt-1">{deliveryErrors.city}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <textarea
                    value={delivery.address}
                    onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Street address, building, apartment, etc."
                  />
                  {deliveryErrors.address && <p className="text-red-500 text-xs mt-1">{deliveryErrors.address}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>{totalPrice >= SHIPPING_THRESHOLD ? 'Free' : formatPrice(SHIPPING_FEE)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(totalPrice + (totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE))}</span>
              </div>
            </div>
            {!showDelivery ? (
              <button
                onClick={handleProceedToDelivery}
                className="w-full bg-purple-700 text-white py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors border-0 cursor-pointer flex items-center justify-center gap-2"
              >
                <Truck size={18} />
                Proceed to Delivery
              </button>
            ) : (
              <>
                <button
                  onClick={handlePayment}
                  disabled={checkingOut}
                  className="w-full bg-purple-700 text-white py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors border-0 cursor-pointer disabled:bg-purple-400 disabled:cursor-wait"
                >
                  {checkingOut ? 'Opening Paystack...' : 'Pay with Paystack'}
                </button>
                <button
                  onClick={() => setShowDelivery(false)}
                  className="w-full mt-2 text-sm text-gray-500 hover:text-purple-700 bg-transparent border-0 cursor-pointer transition-colors py-2"
                >
                  Back to Cart
                </button>
              </>
            )}
            {checkoutError && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {checkoutError}
              </p>
            )}
            <Link
              to="/"
              className="block text-center text-sm text-gray-500 hover:text-purple-700 mt-4 no-underline transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
