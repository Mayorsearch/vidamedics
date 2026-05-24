import { Link, createFileRoute } from '@tanstack/react-router'
import { getProduct } from '@/lib/products'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/currency'
import { ArrowLeft, ShoppingCart, Check, Package } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/products/$productId')({
  component: ProductDetail,
  loader: async ({ params }) => {
    const product = await getProduct({ data: +params.productId })
    return { product }
  },
})

function ProductDetail() {
  const { product } = Route.useLoaderData()
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-purple-700 text-sm font-medium mb-6 no-underline transition-colors">
        <ArrowLeft size={16} />
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full aspect-square object-cover"
          />
        </div>

        <div className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full">{product.category}</span>
            {product.inStock ? (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <Check size={14} /> In Stock
              </span>
            ) : (
              <span className="text-sm text-red-500 font-medium flex items-center gap-1">
                <Package size={14} /> Out of Stock
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="text-3xl font-bold text-purple-700 mb-6">
            {formatPrice(product.price)}
          </div>

          <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all border-0 cursor-pointer ${
              added
                ? 'bg-green-600 text-white'
                : 'bg-purple-700 text-white hover:bg-purple-800'
            } disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            {added ? (
              <>
                <Check size={18} />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                Add to Cart
              </>
            )}
          </button>

          <div className="mt-8 border-t border-gray-100 pt-8 space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Package size={16} className="text-purple-600" />
              Free shipping on qualifying orders
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Check size={16} className="text-purple-600" />
              Quality guaranteed
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
