import { createFileRoute } from '@tanstack/react-router'
import { getPaymentSettings, createPaymentSetting, updatePaymentSetting, deletePaymentSetting } from '@/lib/payment-settings'
import { CreditCard, Plus, Pencil, Trash2, Check, X, Eye, EyeOff, Shield } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/admin/settings')({
  component: PaymentSettingsPage,
  loader: async () => {
    const settings = await getPaymentSettings()
    return { settings }
  },
})

const GATEWAY_OPTIONS = ['Stripe', 'Paystack', 'Flutterwave', 'Square', 'PayPal', 'Other']

function PaymentSettingsPage() {
  const { settings: initialSettings } = Route.useLoaderData()
  const [settings, setSettings] = useState(initialSettings)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [visibleKeys, setVisibleKeys] = useState<Record<number | string, boolean>>({})

  const emptyForm = {
    gatewayName: 'Stripe',
    publicKey: '',
    secretKey: '',
    webhookSecret: '',
    isActive: false,
  }

  const [form, setForm] = useState(emptyForm)

  const toggleKeyVisibility = (id: number | string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••'
    return key.slice(0, 4) + '••••••••' + key.slice(-4)
  }

  const startEdit = (setting: typeof settings[0]) => {
    setEditing(setting.id)
    setForm({
      gatewayName: setting.gatewayName,
      publicKey: setting.publicKey,
      secretKey: setting.secretKey,
      webhookSecret: setting.webhookSecret,
      isActive: setting.isActive,
    })
    setShowForm(false)
    setError('')
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
  }

  const startAdd = () => {
    setShowForm(true)
    setEditing(null)
    setForm(emptyForm)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (editing !== null) {
        const updated = await updatePaymentSetting({ data: { id: editing, ...form } })
        if (form.isActive) {
          setSettings(prev => prev.map(s => s.id === editing ? updated : { ...s, isActive: false }))
        } else {
          setSettings(prev => prev.map(s => s.id === editing ? updated : s))
        }
        setEditing(null)
      } else {
        const created = await createPaymentSetting({ data: form })
        if (form.isActive) {
          setSettings(prev => [...prev.map(s => ({ ...s, isActive: false })), created])
        } else {
          setSettings(prev => [...prev, created])
        }
        setShowForm(false)
      }
      setForm(emptyForm)
    } catch (err: any) {
      setError(err.message || 'Failed to save payment gateway')
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this payment gateway?')) return
    setDeleting(id)
    try {
      await deletePaymentSetting({ data: id })
      setSettings(prev => prev.filter(s => s.id !== id))
    } catch {
      alert('Failed to delete payment gateway')
    }
    setDeleting(null)
  }

  const activeGateway = settings.find(s => s.isActive)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure payment gateways for your store</p>
        </div>
        {!showForm && editing === null && (
          <button
            onClick={startAdd}
            className="inline-flex items-center gap-2 bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-purple-800 transition-all shadow-sm hover:shadow-md border-0 cursor-pointer"
          >
            <Plus size={16} />
            Add Gateway
          </button>
        )}
      </div>

      {activeGateway ? (
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Active Payment Gateway</p>
              <p className="text-2xl font-bold mt-1">{activeGateway.gatewayName}</p>
              <p className="text-emerald-100 text-xs mt-1">Public Key: {maskKey(activeGateway.publicKey)}</p>
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Shield size={24} className="text-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <CreditCard size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800">No Active Gateway</p>
              <p className="text-sm text-amber-600">Add and activate a payment gateway to start accepting payments.</p>
            </div>
          </div>
        </div>
      )}

      {(showForm || editing !== null) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {editing !== null ? 'Edit Payment Gateway' : 'Add Payment Gateway'}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100 mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gateway Provider</label>
              <select
                value={form.gatewayName}
                onChange={(e) => setForm(f => ({ ...f, gatewayName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                {GATEWAY_OPTIONS.map(gw => (
                  <option key={gw} value={gw}>{gw}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Public Key</label>
              <input
                type="text"
                value={form.publicKey}
                onChange={(e) => setForm(f => ({ ...f, publicKey: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                placeholder="pk_live_..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Secret Key</label>
              <input
                type="password"
                value={form.secretKey}
                onChange={(e) => setForm(f => ({ ...f, secretKey: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                placeholder="sk_live_..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Webhook Secret (optional)</label>
              <input
                type="password"
                value={form.webhookSecret}
                onChange={(e) => setForm(f => ({ ...f, webhookSecret: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                placeholder="whsec_..."
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 text-purple-700 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Set as active gateway
              </label>
              {form.isActive && settings.some(s => s.isActive && s.id !== editing) && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Will replace current active gateway</span>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-purple-800 transition-all shadow-sm hover:shadow-md disabled:bg-purple-400 disabled:cursor-wait border-0 cursor-pointer"
              >
                <Check size={16} />
                {saving ? 'Saving...' : editing !== null ? 'Update Gateway' : 'Add Gateway'}
              </button>
              <button
                type="button"
                onClick={editing !== null ? cancelEdit : () => setShowForm(false)}
                className="px-6 py-3 rounded-xl font-medium text-sm text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200 bg-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Configured Gateways</h2>
        <p className="text-sm text-gray-400">{settings.length} total</p>
      </div>

      {settings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-16 px-6">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard size={28} className="text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment gateways configured</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Add a payment gateway to start accepting payments from your customers.</p>
          <button
            onClick={startAdd}
            className="inline-flex items-center gap-2 bg-purple-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-purple-800 transition-colors border-0 cursor-pointer"
          >
            <Plus size={16} />
            Add First Gateway
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {settings.map(setting => (
            <div
              key={setting.id}
              className={`bg-white rounded-2xl border p-6 transition-all ${
                setting.isActive ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    setting.isActive ? 'bg-emerald-100' : 'bg-gray-100'
                  }`}>
                    <CreditCard size={22} className={setting.isActive ? 'text-emerald-600' : 'text-gray-500'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{setting.gatewayName}</h3>
                      {setting.isActive && (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">Public Key:</span>
                      <code className="text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
                        {visibleKeys[setting.id] ? setting.publicKey : maskKey(setting.publicKey)}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(setting.id)}
                        className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer p-0.5"
                        title={visibleKeys[setting.id] ? 'Hide key' : 'Show key'}
                      >
                        {visibleKeys[setting.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(setting)}
                    disabled={editing === setting.id}
                    className="p-2 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors bg-transparent border-0 cursor-pointer"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(setting.id)}
                    disabled={deleting === setting.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-transparent border-0 cursor-pointer disabled:cursor-wait"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
