import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { getServerUser } from '@/lib/auth'
import { useCart } from '@/lib/cart-context'
import { useIdentity } from '@/lib/identity-context'
import { formatPrice } from '@/lib/currency'
import { getProducts } from '@/lib/products'
import {
  ShoppingCart,
  Package,
  ArrowRight,
  Shield,
  Star,
  Stethoscope,
  Truck,
  CreditCard,
  UserCircle,
} from 'lucide-react'
import { isAdminUser } from '@/lib/admin'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const user = await getServerUser()
    if (!user) throw redirect({ to: '/login' })
    return { user }
  },
  loader: async () => {
    const products = await getProducts()
    return { products }
  },
  component: UserDashboard,
})

function UserDashboard() {
  const { user } = Route.useRouteContext()
  const { products } = Route.useLoaderData()
  const { totalPrice, totalItems } = useCart()
  const { logout } = useIdentity()

  const initials = (user.name || user.email || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const isAdmin = isAdminUser(user)

  const featuredProducts = products.slice(0, 4)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800 rounded-3xl p-8 md:p-10 mb-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full -ml-32 -mb-32 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold shadow-lg border border-white/20">
              {initials}
            </div>
            <div>
              <p className="text-purple-200 text-sm font-medium">Welcome back</p>
              <h1 className="text-2xl md:text-3xl font-bold mt-0.5">{user.name || 'User'}</h1>
              <p className="text-purple-200 text-sm mt-1">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-white/30 transition-all no-underline border border-white/20"
              >
                <Shield size={16} />
                Admin Panel
              </Link>
            )}
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-white text-purple-700 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-purple-50 transition-all no-underline shadow-sm"
            >
              <Package size={16} />
              Browse Shop
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/cart" className="no-underline group">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-purple-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <ShoppingCart size={22} className="text-purple-600" />
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-purple-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            <p className="text-sm text-gray-500 mt-0.5">Items in Cart</p>
            {totalPrice > 0 && (
              <p className="text-sm font-semibold text-purple-700 mt-2">
                {formatPrice(totalPrice)} total
              </p>
            )}
          </div>
        </Link>

        <Link to="/" className="no-underline group">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-purple-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <Package size={22} className="text-emerald-600" />
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            <p className="text-sm text-gray-500 mt-0.5">Products Available</p>
            <p className="text-sm font-semibold text-emerald-600 mt-2">
              {products.filter(p => p.inStock).length} in stock
            </p>
          </div>
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Star size={22} className="text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">Member</p>
          <p className="text-sm text-gray-500 mt-0.5">Account Status</p>
          <p className="text-sm font-semibold text-amber-600 mt-2">
            {isAdmin ? 'Administrator' : 'Active Member'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Featured Products</h2>
            <Link to="/" className="text-sm text-purple-700 font-medium hover:text-purple-800 no-underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {featuredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <Package size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No products available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredProducts.map(product => (
                <Link
                  key={product.id}
                  to="/products/$productId"
                  params={{ productId: product.id.toString() }}
                  className="no-underline group"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                    <div className="aspect-[16/10] bg-gray-50 overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">{product.category}</span>
                        {product.inStock ? (
                          <span className="text-xs text-emerald-600 font-medium">In Stock</span>
                        ) : (
                          <span className="text-xs text-red-500 font-medium">Sold Out</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">{product.name}</h3>
                      <p className="text-lg font-bold text-gray-900 mt-1">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/profile" className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-purple-200 transition-all no-underline group">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <UserCircle size={18} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">My Profile</p>
                <p className="text-xs text-gray-400">Update your details & address</p>
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-purple-500" />
            </Link>

            <Link to="/" className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-purple-200 transition-all no-underline group">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Stethoscope size={18} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">Browse Products</p>
                <p className="text-xs text-gray-400">Find medical equipment</p>
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-purple-500" />
            </Link>

            <Link to="/cart" className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-purple-200 transition-all no-underline group">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <ShoppingCart size={18} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">View Cart</p>
                <p className="text-xs text-gray-400">{totalItems > 0 ? `${totalItems} items` : 'Your cart is empty'}</p>
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-emerald-500" />
            </Link>

            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-purple-200 transition-all no-underline group">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <Shield size={18} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">Admin Dashboard</p>
                  <p className="text-xs text-gray-400">Manage products & orders</p>
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-amber-500" />
              </Link>
            )}
          </div>

          <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200/50">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Why Vidamedics?</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Stethoscope size={14} className="text-purple-600 flex-shrink-0" />
                <span className="text-xs text-gray-600">Premium medical-grade equipment</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck size={14} className="text-purple-600 flex-shrink-0" />
                <span className="text-xs text-gray-600">Free shipping on qualifying orders</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CreditCard size={14} className="text-purple-600 flex-shrink-0" />
                <span className="text-xs text-gray-600">Secure checkout</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Shield size={14} className="text-purple-600 flex-shrink-0" />
                <span className="text-xs text-gray-600">Quality guaranteed</span>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Account Info</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Name</span>
                <span className="text-xs font-medium text-gray-900">{user.name || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Email</span>
                <span className="text-xs font-medium text-gray-900 truncate ml-4">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Role</span>
                <span className={`text-xs font-semibold ${isAdmin ? 'text-purple-700' : 'text-emerald-600'}`}>
                  {isAdmin ? 'Administrator' : 'Member'}
                </span>
              </div>
            </div>
            <button
              onClick={() => { logout(); window.location.href = '/' }}
              className="w-full mt-4 text-sm text-red-600 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 py-2 rounded-lg border-0 cursor-pointer transition-colors"
            >
              Sign Out
            </button>
            <Link
              to="/profile"
              className="block w-full mt-2 text-center text-sm text-purple-700 hover:text-purple-800 font-medium bg-purple-50 hover:bg-purple-100 py-2 rounded-lg no-underline transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
