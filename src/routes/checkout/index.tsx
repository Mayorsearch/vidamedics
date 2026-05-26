import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCart } from '@/lib/cart-context'
import { useIdentity } from '@/lib/identity-context'
import { formatPrice, SHIPPING_FEE, SHIPPING_THRESHOLD } from '@/lib/currency'
import { initializePaystackCheckout } from '@/lib/payments'
import { ArrowLeft, MapPin, Truck } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/checkout/')({
  component: CheckoutPage,
})

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

function CheckoutPage() {
  const { items, totalPrice } = useCart()
  const { user } = useIdentity()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [notes, setNotes] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Truck size={32} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No items to check out</h1>
        <p className="text-gray-500 mb-8">Add some products to your cart first.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-800 transition-colors no-underline"
        >
          <ArrowLeft size={16} />
          Browse Products
        </Link>
      </div>
    )
  }

  if (!user?.email) {
    navigate({ to: '/login' })
    return null
  }

  const shipping = totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = totalPrice + shipping

  function validate() {
    const errors: Record<string, string> = {}
    if (!fullName.trim()) errors.fullName = 'Full name is required'
    if (!phone.trim()) errors.phone = 'Phone number is required'
    if (!address.trim()) errors.address = 'Delivery address is required'
    if (!city.trim()) errors.city = 'City is required'
    if (!state) errors.state = 'State is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleCheckout() {
    if (!validate()) return

    setCheckoutError('')
    setCheckingOut(true)

    try {
      const checkout = await initializePaystackCheckout({
        data: {
          items: items.map(i => ({ id: i.id, quantity: i.quantity })),
          customerEmail: user!.email!,
          delivery: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
            state,
            notes: notes.trim(),
          },
        },
      })
      window.location.href = checkout.authorizationUrl
    } catch (err: any) {
      setCheckoutError(err.message || 'Unable to start checkout. Please try again.')
      setCheckingOut(false)
    }
  }

  const inputClasses = (field: string) =>
    `w-full px-4 py-3 rounded-lg border ${
      fieldErrors[field] ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-200'
    } bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-700 mb-6 no-underline transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Cart
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <MapPin size={20} className="text-purple-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Details</h1>
          <p className="text-sm text-gray-500">Where should we deliver your order?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={e => { setFullName(e.target.value); setFieldErrors(prev => ({ ...prev, fullName: '' })) }}
                  placeholder="Enter your full name"
                  className={inputClasses('fullName')}
                />
                {fieldErrors.fullName && <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setFieldErrors(prev => ({ ...prev, phone: '' })) }}
                  placeholder="e.g. 08012345678"
                  className={inputClasses('phone')}
                />
                {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={e => { setAddress(e.target.value); setFieldErrors(prev => ({ ...prev, address: '' })) }}
                placeholder="House number, street name"
                className={inputClasses('address')}
              />
              {fieldErrors.address && <p className="mt-1 text-xs text-red-600">{fieldErrors.address}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={e => { setCity(e.target.value); setFieldErrors(prev => ({ ...prev, city: '' })) }}
                  placeholder="Enter city"
                  className={inputClasses('city')}
                />
                {fieldErrors.city && <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1.5">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  id="state"
                  value={state}
                  onChange={e => { setState(e.target.value); setFieldErrors(prev => ({ ...prev, state: '' })) }}
                  className={inputClasses('state')}
                >
                  <option value="">Select a state</option>
                  {NIGERIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {fieldErrors.state && <p className="mt-1 text-xs text-red-600">{fieldErrors.state}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1.5">
                Delivery Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any special instructions for delivery (e.g. landmarks, gate code)"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">{item.name} x{item.quantity}</span>
                  <span className="text-gray-900 font-medium flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 mb-6">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full bg-purple-700 text-white py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors border-0 cursor-pointer disabled:bg-purple-400 disabled:cursor-wait"
            >
              {checkingOut ? 'Opening Paystack...' : 'Proceed to Payment'}
            </button>
            {checkoutError && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {checkoutError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
