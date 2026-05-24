import { createFileRoute, Link } from '@tanstack/react-router'
import { getProducts, deleteProduct, getProductStats } from '@/lib/products'
import { getUnreadCount } from '@/lib/notifications'
import { formatPrice } from '@/lib/currency'
import { Pencil, Trash2, Package, TrendingUp, Bell, Tag, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
  loader: async () => {
    const [products, stats, unreadNotifications] = await Promise.all([
      getProducts(),
      getProductStats(),
      getUnreadCount(),
    ])
    return { products, stats, unreadNotifications }
  },
})

function AdminDashboard() {
  const { products: initialProducts, stats, unreadNotifications } = Route.useLoaderData()
  const [products, setProducts] = useState(initialProducts)
  const [deleting, setDeleting] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    setDeleting(id)
    try {
      await deleteProduct({ data: id })
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch {
      alert('Failed to delete product')
    }
    setDeleting(null)
  }

  const statCards = [
    {
      label: 'Total Products',
      value: stats.total,
      icon: Package,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-700',
    },
    {
      label: 'In Stock',
      value: stats.inStock,
      icon: CheckCircle,
      color: 'emerald',
      bgGradient: 'from-emerald-500 to-emerald-700',
    },
    {
      label: 'Out of Stock',
      value: stats.outOfStock,
      icon: XCircle,
      color: 'amber',
      bgGradient: 'from-amber-500 to-amber-600',
    },
    {
      label: 'Unread Alerts',
      value: unreadNotifications,
      icon: Bell,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-700',
    },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your products and monitor store activity</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-purple-800 transition-all shadow-sm hover:shadow-md no-underline"
        >
          <Package size={16} />
          Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 group hover:shadow-lg transition-all">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.bgGradient} opacity-5 rounded-bl-[60px] -mr-4 -mt-4`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.bgGradient} flex items-center justify-center mb-3 shadow-sm`}>
              <card.icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {stats.totalValue > 0 && (
        <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-medium">Total Catalog Value</p>
              <p className="text-3xl font-bold mt-1">{formatPrice(stats.totalValue)}</p>
              <p className="text-purple-200 text-xs mt-1">{stats.total} products across {stats.categories} categories</p>
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Products</h2>
        <p className="text-sm text-gray-400">{products.length} total</p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-16 px-6">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Start building your catalog by adding your first product to the store.</p>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 bg-purple-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-purple-800 transition-colors no-underline"
          >
            <Package size={16} />
            Add First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Product</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Price</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-purple-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-gray-100">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                          <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{product.shortDescription}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                        <Tag size={10} />
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-sm text-gray-900">{formatPrice(product.price)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {product.inStock ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          <CheckCircle size={10} />
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-lg">
                          <XCircle size={10} />
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link
                          to="/admin/products/$productId/edit"
                          params={{ productId: product.id.toString() }}
                          className="p-2 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors no-underline"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-transparent border-0 cursor-pointer disabled:cursor-wait"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
