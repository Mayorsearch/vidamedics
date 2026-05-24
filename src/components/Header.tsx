import { Link, useNavigate } from '@tanstack/react-router'
import { useIdentity } from '../lib/identity-context'
import { useCart } from '../lib/cart-context'
import { ShoppingCart, Menu, X, Shield, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { isAdminUser } from '../lib/admin'

export function Header() {
  const { user, ready, logout } = useIdentity()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/' })
  }

  const isAdmin = isAdminUser(user)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Vida<span className="text-purple-700">medics</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-purple-700 font-medium text-sm transition-colors no-underline">
              Shop
            </Link>
            {user && (
              <Link to="/dashboard" className="text-gray-600 hover:text-purple-700 font-medium text-sm transition-colors no-underline flex items-center gap-1">
                <LayoutDashboard size={14} />
                My Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-gray-600 hover:text-purple-700 font-medium text-sm transition-colors no-underline flex items-center gap-1">
                <Shield size={14} />
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-purple-700 transition-colors no-underline">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </Link>

            {ready && (
              <>
                {user ? (
                  <div className="hidden md:flex items-center gap-3">
                    <Link to="/dashboard" className="text-sm text-gray-600 hover:text-purple-700 no-underline transition-colors">
                      {user.name || user.email}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-gray-500 hover:text-purple-700 transition-colors bg-transparent border-0 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Link
                      to="/login"
                      className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors no-underline"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="text-sm font-medium bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors no-underline"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}

            <button
              className="md:hidden p-2 text-gray-600 bg-transparent border-0 cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            <Link to="/" className="block text-gray-600 hover:text-purple-700 font-medium text-sm no-underline" onClick={() => setMobileOpen(false)}>
              Shop
            </Link>
            {user && (
              <Link to="/dashboard" className="block text-gray-600 hover:text-purple-700 font-medium text-sm no-underline flex items-center gap-1" onClick={() => setMobileOpen(false)}>
                <LayoutDashboard size={14} />
                My Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="block text-gray-600 hover:text-purple-700 font-medium text-sm no-underline flex items-center gap-1" onClick={() => setMobileOpen(false)}>
                <Shield size={14} />
                Admin
              </Link>
            )}
            {ready && user ? (
              <>
                <span className="block text-sm text-gray-500">{user.name || user.email}</span>
                <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="text-sm text-purple-700 bg-transparent border-0 cursor-pointer p-0">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-600 hover:text-purple-700 font-medium text-sm no-underline" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/signup" className="block text-purple-700 font-medium text-sm no-underline" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
