import { createFileRoute, redirect, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { getServerUser } from '@/lib/auth'
import { Bell, Mail, Package, LayoutDashboard, PlusCircle, ChevronRight, LogOut, CreditCard } from 'lucide-react'
import { getUnreadCount } from '@/lib/notifications'
import { useIdentity } from '@/lib/identity-context'
import { isAdminUser } from '@/lib/admin'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const user = await getServerUser()
    if (!user) throw redirect({ to: '/login' })
    if (!isAdminUser(user)) throw redirect({ to: '/' })
    return { user }
  },
  loader: async () => {
    const unreadCount = await getUnreadCount()
    return { unreadCount }
  },
  component: AdminLayout,
})

const navItems = [
  { to: '/admin' as const, label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/products/new' as const, label: 'Add Product', icon: PlusCircle, exact: false },
  { to: '/admin/email' as const, label: 'Email Users', icon: Mail, exact: false },
  { to: '/admin/notifications' as const, label: 'Notifications', icon: Bell, exact: false },
  { to: '/admin/settings' as const, label: 'Payment Settings', icon: CreditCard, exact: false },
]

function AdminLayout() {
  const { user } = Route.useRouteContext()
  const { unreadCount } = Route.useLoaderData()
  const { logout } = useIdentity()
  const pathname = useRouterState({ select: s => s.location.pathname })

  const isActive = (to: string, exact: boolean) => {
    if (exact) return pathname === to || pathname === to + '/'
    return pathname.startsWith(to)
  }

  const initials = (user.name || user.email || 'A')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <aside className="w-64 bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-6 border-b border-purple-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-900/50">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user.name || 'Admin'}</p>
              <p className="text-purple-300 text-xs truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => {
            const active = isActive(item.to, item.exact)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all no-underline group ${
                  active
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-purple-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={18} className={active ? 'text-purple-300' : 'text-purple-400 group-hover:text-purple-300'} />
                <span className="flex-1">{item.label}</span>
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {active && <ChevronRight size={14} className="text-purple-400" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-purple-800/50 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-purple-300 hover:bg-white/10 hover:text-white transition-all no-underline"
          >
            <Package size={18} className="text-purple-400" />
            <span>View Store</span>
          </Link>
          <button
            onClick={() => { logout(); window.location.href = '/' }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-purple-300 hover:bg-white/10 hover:text-white transition-all w-full bg-transparent border-0 cursor-pointer"
          >
            <LogOut size={18} className="text-purple-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 bg-gray-50 min-w-0">
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {navItems.map(item => {
              const active = isActive(item.to, item.exact)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all no-underline ${
                    active
                      ? 'bg-purple-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  <item.icon size={14} />
                  {item.label}
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full ml-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
