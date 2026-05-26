import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCart } from '@/lib/cart-context'
import { useIdentity } from '@/lib/identity-context'
import { formatPrice, SHIPPING_FEE, SHIPPING_THRESHOLD } from '@/lib/currency'
import { initializePaystackCheckout } from '@/lib/payments'
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, MapPin } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart()
  const { user } = useIdentity()
  const navigate = useNavigate()
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [delivery, setDelivery] = useState({
    customerName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  })
  const [showDeliveryForm, setShowDeliveryForm] = useState(false)
  const [deliveryErrors, setDeliveryErrors] = useState<Record<string, string>>({})

  const deliveryComplete = delivery.customerName.trim() !== '' &&
    delivery.phone.trim() !== '' &&
    delivery.address.trim() !== '' &&
    delivery.city.trim() !== '' &&
    delivery.state.trim() !== ''

  function validateDelivery() {
    const errors: Record<string, string> = {}
    if (!delivery.customerName.trim()) errors.customerName = 'Full name is required'
    if (!delivery.phone.trim()) errors.phone = 'Phone number is required'
    if (!delivery.address.trim()) errors.address = 'Address is required'
    if (!delivery.city.trim()) errors.city = 'City is required'
    if (!delivery.state.trim()) errors.state = 'State is required'
    setDeliveryErrors(errors)
    return Object.keys(errors).length === 0
  }

  function updateField(field: string, value: string) {
    setDelivery(prev => ({ ...prev, [field]: value }))
    if (deliveryErrors[field]) {
      setDeliveryErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

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
        </div>

        <div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24 space-y-6">
            <h2 className="font-semibold text-gray-900">Order Summary</h2>
            <div className="space-y-3">
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

            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={() => setShowDeliveryForm(!showDeliveryForm)}
                className="w-full flex items-center justify-between text-left bg-transparent border-0 cursor-pointer p-0"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={16} className={deliveryComplete ? 'text-green-600' : 'text-purple-700'} />
                  <span className="font-medium text-gray-900 text-sm">Delivery Details</span>
                </div>
                {deliveryComplete ? (
                  <span className="text-xs text-green-600 font-medium">Completed</span>
                ) : (
                  <span className="text-xs text-purple-700 font-medium">{showDeliveryForm ? 'Hide' : 'Fill in'}</span>
                )}
              </button>

              {showDeliveryForm && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label htmlFor="customerName" className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                    <input
                      id="customerName"
                      type="text"
                      value={delivery.customerName}
                      onChange={e => updateField('customerName', e.target.value)}
                      placeholder="John Doe"
                      className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 ${deliveryErrors.customerName ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {deliveryErrors.customerName && <p className="text-xs text-red-500 mt-1">{deliveryErrors.customerName}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-600 mb-1">Phone Number *</label>
                    <input
                      id="phone"
                      type="tel"
                      value={delivery.phone}
                      onChange={e => updateField('phone', e.target.value)}
                      placeholder="+234 800 000 0000"
                      className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 ${deliveryErrors.phone ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {deliveryErrors.phone && <p className="text-xs text-red-500 mt-1">{deliveryErrors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-xs font-medium text-gray-600 mb-1">Street Address *</label>
                    <input
                      id="address"
                      type="text"
                      value={delivery.address}
                      onChange={e => updateField('address', e.target.value)}
                      placeholder="123 Main Street"
                      className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 ${deliveryErrors.address ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {deliveryErrors.address && <p className="text-xs text-red-500 mt-1">{deliveryErrors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="city" className="block text-xs font-medium text-gray-600 mb-1">City *</label>
                      <input
                        id="city"
                        type="text"
                        value={delivery.city}
                        onChange={e => updateField('city', e.target.value)}
                        placeholder="Lagos"
                        className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 ${deliveryErrors.city ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      {deliveryErrors.city && <p className="text-xs text-red-500 mt-1">{deliveryErrors.city}</p>}
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-xs font-medium text-gray-600 mb-1">State *</label>
                      <input
                        id="state"
                        type="text"
                        value={delivery.state}
                        onChange={e => updateField('state', e.target.value)}
                        placeholder="Lagos"
                        className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 ${deliveryErrors.state ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      {deliveryErrors.state && <p className="text-xs text-red-500 mt-1">{deliveryErrors.state}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-xs font-medium text-gray-600 mb-1">Postal Code</label>
                    <input
                      id="postalCode"
                      type="text"
                      value={delivery.postalCode}
                      onChange={e => updateField('postalCode', e.target.value)}
                      placeholder="100001"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={async () => {
                setCheckoutError('')
                if (!user?.email) {
                  navigate({ to: '/login' })
                  return
                }

                if (!validateDelivery()) {
                  setShowDeliveryForm(true)
                  return
                }

                setCheckingOut(true)
                try {
                  const checkout = await initializePaystackCheckout({
                    data: {
                      items: items.map(i => ({ id: i.id, quantity: i.quantity })),
                      customerEmail: user.email,
                      delivery,
                    },
                  })
                  window.location.href = checkout.authorizationUrl
                } catch (err: any) {
                  setCheckoutError(err.message || 'Unable to start checkout. Please try again.')
                  setCheckingOut(false)
                }
              }}
              disabled={checkingOut}
              className="w-full bg-purple-700 text-white py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors border-0 cursor-pointer disabled:bg-purple-400 disabled:cursor-wait"
            >
              {checkingOut ? 'Opening Paystack...' : deliveryComplete ? 'Pay with Paystack' : 'Enter Delivery Details to Pay'}
            </button>
            {checkoutError && (
              <p className="text-sm text-red-600" role="alert">
                {checkoutError}
              </p>
            )}
            <Link
              to="/"
              className="block text-center text-sm text-gray-500 hover:text-purple-700 no-underline transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
