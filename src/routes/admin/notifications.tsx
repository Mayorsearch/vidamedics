import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/notifications'
import { Bell, CheckCircle, UserPlus, ShoppingBag, Shield, Mail, Inbox } from 'lucide-react'

export const Route = createFileRoute('/admin/notifications')({
  loader: () => getNotifications(),
  component: NotificationsPage,
})

function NotificationsPage() {
  const notifications = Route.useLoaderData()
  const router = useRouter()

  const handleMarkAsRead = async (id: number) => {
    await markAsRead({ data: id })
    router.invalidate()
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    router.invalidate()
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'signup': return <UserPlus size={18} className="text-blue-600" />
      case 'order': return <ShoppingBag size={18} className="text-emerald-600" />
      case 'admin_confirmation': return <Shield size={18} className="text-purple-600" />
      case 'admin_email': return <Mail size={18} className="text-purple-600" />
      default: return <Bell size={18} className="text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      signup: 'bg-blue-50 text-blue-700 ring-blue-100',
      order: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      admin_confirmation: 'bg-purple-50 text-purple-700 ring-purple-100',
      admin_email: 'bg-purple-50 text-purple-700 ring-purple-100',
    }
    const labels: Record<string, string> = {
      signup: 'Signup',
      order: 'Order',
      admin_confirmation: 'Admin',
      admin_email: 'Email',
    }
    const style = styles[type] || 'bg-gray-50 text-gray-700 ring-gray-100'
    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ring-1 ${style}`}>
        {labels[type] || type}
      </span>
    )
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Stay updated on signups, orders, and admin events</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1.5 text-sm text-purple-700 hover:text-purple-800 font-medium bg-purple-50 hover:bg-purple-100 border-0 cursor-pointer px-4 py-2 rounded-lg transition-colors"
          >
            <CheckCircle size={14} />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-16 px-6">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No notifications yet</p>
          <p className="text-sm text-gray-400 mt-1">Notifications about user signups and orders will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl border p-5 flex items-start gap-4 transition-all hover:shadow-sm ${
                notification.isRead ? 'border-gray-100' : 'border-purple-200 shadow-sm ring-1 ring-purple-100/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                notification.isRead ? 'bg-gray-50' : 'bg-purple-50'
              }`}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  {getTypeBadge(notification.type)}
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{notification.title}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{notification.message}</p>
                <div className="flex items-center gap-3 mt-2.5">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Mail size={11} />
                    {notification.recipientEmail}
                  </span>
                  <span className="text-xs text-gray-300">|</span>
                  <span className="text-xs text-gray-400">
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
                  </span>
                </div>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="text-xs text-purple-700 hover:text-purple-800 font-semibold bg-purple-50 hover:bg-purple-100 border-0 cursor-pointer whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
