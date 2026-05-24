import { Link, createFileRoute } from '@tanstack/react-router'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { verifyPaystackPayment } from '@/lib/payments'
import { useCart } from '@/lib/cart-context'

export const Route = createFileRoute('/checkout/success')({
  component: CheckoutSuccess,
})

function CheckoutSuccess() {
  const { clearCart } = useCart()
  const verifiedRef = useRef(false)
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [message, setMessage] = useState('Confirming your payment with Paystack.')

  useEffect(() => {
    if (verifiedRef.current) return
    verifiedRef.current = true

    const reference = new URLSearchParams(window.location.search).get('reference')

    if (!reference) {
      setStatus('failed')
      setMessage('No payment reference was provided.')
      return
    }

    verifyPaystackPayment({ data: { reference } })
      .then(() => {
        clearCart()
        setStatus('success')
        setMessage('Thank you for your purchase. Your order is being processed and you will receive a confirmation email shortly.')
      })
      .catch((err: any) => {
        setStatus('failed')
        setMessage(err.message || 'Payment could not be verified. Please contact support if you were charged.')
      })
  }, [clearCart])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center max-w-lg">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          status === 'success' ? 'bg-green-100' : status === 'failed' ? 'bg-red-100' : 'bg-purple-100'
        }`}>
          {status === 'success' && <CheckCircle size={40} className="text-green-600" />}
          {status === 'failed' && <XCircle size={40} className="text-red-600" />}
          {status === 'verifying' && <Loader2 size={40} className="text-purple-700 animate-spin" />}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {status === 'success' ? 'Payment Successful!' : status === 'failed' ? 'Payment Not Verified' : 'Verifying Payment'}
        </h1>
        <p className="text-gray-500 mb-8">
          {message}
        </p>
        <Link
          to={status === 'failed' ? '/cart' : '/'}
          className="inline-block bg-purple-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-800 transition-colors no-underline"
        >
          {status === 'failed' ? 'Back to Cart' : 'Continue Shopping'}
        </Link>
      </div>
    </div>
  )
}
