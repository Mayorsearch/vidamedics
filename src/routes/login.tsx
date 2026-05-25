import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { login, requestPasswordRecovery, AuthError } from '@netlify/identity'
import { useIdentity } from '@/lib/identity-context'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { user, ready } = useIdentity()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMessage, setForgotMessage] = useState('')

  if (!ready) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    navigate({ to: '/' })
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      window.location.href = '/dashboard'
    } catch (err: any) {
      if (err instanceof AuthError) {
        if (err.status === 401) {
          setError('Invalid email or password.')
        } else if (err.status === 403) {
          setError('Your account has not been confirmed yet. Please check your email for a confirmation link.')
        } else {
          setError(err.message || 'Login failed. Please try again.')
        }
      } else {
        setError(err.message || 'Invalid email or password')
      }
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setForgotMessage('')
    setForgotLoading(true)
    try {
      await requestPasswordRecovery(forgotEmail)
      setForgotMessage('Check your email for a password reset link.')
    } catch (err: any) {
      if (err instanceof AuthError) {
        setError(err.message || 'Could not send recovery email. Please try again.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4">
            <img src="/logo.svg" alt="Vidamedics" className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your Vidamedics account</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {forgotMessage && (
            <div className="bg-purple-50 text-purple-700 text-sm px-4 py-3 rounded-lg mb-6">
              {forgotMessage}
            </div>
          )}

          {forgotMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <p className="text-sm text-gray-600 mb-4">Enter your email address and we'll send you a link to reset your password.</p>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-purple-700 text-white py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors disabled:bg-purple-400 disabled:cursor-wait border-0 cursor-pointer"
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => { setForgotMode(false); setError(''); setForgotMessage('') }}
                className="w-full text-sm text-purple-700 font-medium hover:text-purple-800 bg-transparent border-0 cursor-pointer py-2"
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="mt-1.5 text-right">
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setError(''); setForgotEmail(email) }}
                    className="text-xs text-purple-700 font-medium hover:text-purple-800 bg-transparent border-0 cursor-pointer p-0"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-700 text-white py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors disabled:bg-purple-400 disabled:cursor-wait border-0 cursor-pointer"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-purple-700 font-medium hover:text-purple-800 no-underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
