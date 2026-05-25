import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { getServerUser } from '@/lib/auth'
import { getUserProfile, upsertUserProfile } from '@/lib/profiles'
import { useIdentity } from '@/lib/identity-context'
import { useState } from 'react'
import { User, Phone, MapPin, Mail, Save, CheckCircle, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/profile')({
  beforeLoad: async () => {
    const user = await getServerUser()
    if (!user) throw redirect({ to: '/login' })
    return { user }
  },
  loader: async () => {
    const profile = await getUserProfile()
    return { profile }
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = Route.useRouteContext()
  const { profile: initialProfile } = Route.useLoaderData()

  const [fullName, setFullName] = useState(initialProfile?.fullName || user.name || '')
  const [phone, setPhone] = useState(initialProfile?.phone || '')
  const [contactEmail, setContactEmail] = useState(initialProfile?.contactEmail || user.email || '')
  const [address, setAddress] = useState(initialProfile?.address || '')
  const [city, setCity] = useState(initialProfile?.city || '')
  const [state, setState] = useState(initialProfile?.state || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const initials = (fullName || user.email || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await upsertUserProfile({
        data: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          contactEmail: contactEmail.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
        },
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-700 no-underline mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>

      <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold shadow-lg border border-white/20">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-purple-200 text-sm mt-1">{user.email}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={18} className="text-purple-700" />
            <h2 className="font-semibold text-gray-900">Personal Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1"><Phone size={13} /> Phone Number</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g. 08012345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1"><Mail size={13} /> Contact Email</span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
              <p className="text-xs text-gray-400 mt-1">This is separate from your login email ({user.email})</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={18} className="text-purple-700" />
            <h2 className="font-semibold text-gray-900">Delivery Address</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">This address will be pre-filled during checkout.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Street address, building, apartment, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g. Ikeja"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g. Lagos"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 border border-red-100">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 border border-green-100 flex items-center gap-2">
            <CheckCircle size={16} />
            Profile saved successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors border-0 cursor-pointer disabled:bg-purple-400 disabled:cursor-wait flex items-center justify-center gap-2"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
