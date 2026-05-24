import { Link, createFileRoute } from '@tanstack/react-router'
import { XCircle } from 'lucide-react'

export const Route = createFileRoute('/checkout/cancel')({
  component: CheckoutCancel,
})

function CheckoutCancel() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center max-w-lg">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout Cancelled</h1>
        <p className="text-gray-500 mb-8">
          Your payment was cancelled. No charges were made. You can continue shopping or try again.
        </p>
        <Link
          to="/"
          className="inline-block bg-purple-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-800 transition-colors no-underline"
        >
          Back to Shop
        </Link>
      </div>
    </div>
  )
}
