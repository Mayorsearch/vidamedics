import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCart } from '@/lib/cart-context'
import { formatPrice, SHIPPING_FEE, SHIPPING_THRESHOLD } from '@/lib/currency'
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart()
  const navigate = useNavigate()

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
            <button
              onClick={() => navigate({ to: '/checkout' })}
              className="w-full bg-purple-700 text-white py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors border-0 cursor-pointer"
            >
              Proceed to Checkout
            </button>
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
