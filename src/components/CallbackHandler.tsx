import { useEffect, useState } from 'react'
import { handleAuthCallback, updateUser, AuthError } from '@netlify/identity'

const AUTH_HASH_PATTERN =
  /^#(confirmation_token|recovery_token|invite_token|email_change_token|access_token)=/

export function CallbackHandler({ children }: { children: React.ReactNode }) {
  const [recovery, setRecovery] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (AUTH_HASH_PATTERN.test(window.location.hash)) {
      void handleAuthCallback().then((result) => {
        if (result?.type === 'recovery') {
          setRecovery(true)
        }
      }).catch(() => {})
    }
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await updateUser({ password: newPassword })
      setSuccess(true)
      setTimeout(() => { window.location.href = '/' }, 2000)
    } catch (err: any) {
      if (err instanceof AuthError) {
        setError(err.message || 'Could not update password.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (recovery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-4">
              <img src="/logo.svg" alt="Vidamedics" className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your new password below</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            {success ? (
              <div className="bg-purple-50 text-purple-700 text-sm px-4 py-3 rounded-lg">
                Password updated successfully. Redirecting...
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-700 text-white py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors disabled:bg-purple-400 disabled:cursor-wait border-0 cursor-pointer"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
