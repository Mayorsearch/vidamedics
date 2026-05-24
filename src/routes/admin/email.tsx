import { createFileRoute } from '@tanstack/react-router'
import { sendAdminEmail } from '@/lib/admin-email'
import { Send, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/admin/email')({
  component: AdminEmailPage,
})

function AdminEmailPage() {
  const [recipientEmail, setRecipientEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSending(true)

    try {
      const result = await sendAdminEmail({
        data: {
          recipientEmail,
          subject,
          message,
        },
      })

      setRecipientEmail('')
      setSubject('')
      setMessage('')
      setSuccess(
        result.emailQueued
          ? 'Email submitted successfully.'
          : 'Message saved. Email delivery will run after the site has a deployed URL.',
      )
    } catch (err: any) {
      setError(err.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Email Users</h1>
        <p className="text-sm text-gray-500 mt-1">Send a direct message to customers or team members</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 shadow-sm">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl border border-emerald-100 flex items-center gap-2">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient Email</label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(event) => setRecipientEmail(event.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Order update"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            rows={8}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
            placeholder="Write your message..."
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-purple-800 transition-all shadow-sm hover:shadow-md disabled:bg-purple-400 disabled:cursor-wait border-0 cursor-pointer"
        >
          <Send size={16} />
          {sending ? 'Sending...' : 'Send Email'}
        </button>
      </form>
    </div>
  )
}
