import { Link, createFileRoute } from '@tanstack/react-router'
import { getProducts } from '@/lib/products'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/currency'
import { ShoppingCart, Search, Stethoscope, Shield, Truck } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: async () => {
    const products = await getProducts()
    return { products }
  },
})

const categories = ['All', 'Stethoscopes', 'Gloves', 'Diagnostic Tools', 'PPE', 'Surgical', 'First Aid', 'Mobility Aids', 'Patient Monitoring', 'Dental', 'Lab Equipment', 'Wound Care']

function HomePage() {
  const { products } = Route.useLoaderData()
  const { addItem } = useCart()
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div>
      <section className="relative overflow-hidden text-white" style={{ minHeight: '480px' }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=2000&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700/80 via-purple-600/65 to-purple-500/45" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 flex items-center" style={{ minHeight: '480px' }}>
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Stethoscope size={14} className="text-purple-300" />
              <span className="text-purple-200 font-medium text-sm">Trusted by Healthcare Professionals</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Professional Medical Equipment
            </h1>
            <p className="text-purple-100 text-lg md:text-xl leading-relaxed mb-8">
              Quality stethoscopes, gloves, diagnostic tools, and medical supplies for healthcare professionals.
              Everything you need, delivered to your door.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#products"
                className="inline-flex items-center gap-2 bg-white text-purple-800 px-8 py-3.5 rounded-lg font-semibold hover:bg-purple-50 transition-colors no-underline"
              >
                <ShoppingCart size={18} />
                Shop Now
              </a>
              <a
                href="#products"
                className="inline-flex items-center gap-2 bg-transparent border-2 border-white/30 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-white/10 transition-colors no-underline"
              >
                Browse Catalog
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Stethoscope size={20} className="text-purple-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Premium Quality</h3>
                <p className="text-sm text-gray-500">All products meet the highest medical standards and certifications.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck size={20} className="text-purple-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Fast Delivery</h3>
                <p className="text-sm text-gray-500">Free shipping on qualifying orders. Same-day dispatch available.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield size={20} className="text-purple-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Trusted Brand</h3>
                <p className="text-sm text-gray-500">Serving thousands of healthcare professionals nationwide.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Our Products</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-64"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border-0 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-purple-700 text-white'
                  : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-700 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">No products found</p>
            <p className="text-gray-400 text-sm">
              {products.length === 0
                ? 'Products will appear here once the admin adds them.'
                : 'Try adjusting your search or filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <Link
                  to="/products/$productId"
                  params={{ productId: product.id.toString() }}
                  className="block no-underline"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <div className="p-3 sm:p-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                    <span className="text-[10px] sm:text-xs font-medium text-purple-700 bg-purple-50 px-1.5 sm:px-2 py-0.5 rounded-full">{product.category}</span>
                    {product.inStock ? (
                      <span className="text-[10px] sm:text-xs text-purple-600 font-medium">In Stock</span>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-red-500 font-medium">Out of Stock</span>
                    )}
                  </div>
                  <Link
                    to="/products/$productId"
                    params={{ productId: product.id.toString() }}
                    className="no-underline"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors text-sm sm:text-base line-clamp-1">{product.name}</h3>
                  </Link>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 line-clamp-2 hidden sm:block">{product.shortDescription}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                    <button
                      onClick={() => addItem({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl })}
                      disabled={!product.inStock}
                      className="bg-purple-700 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed border-0 cursor-pointer whitespace-nowrap"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
