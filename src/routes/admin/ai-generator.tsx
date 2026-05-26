import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, Bot, Loader2, Check, Package, Sparkles, AlertCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { generateProducts, saveGeneratedProducts } from '@/lib/ai-products'
import { formatPrice } from '@/lib/currency'

export const Route = createFileRoute('/admin/ai-generator')({
  component: AIGenerator,
})

const categories = ['All', 'Stethoscopes', 'Gloves', 'Diagnostic Tools', 'PPE', 'Surgical', 'First Aid', 'General']

type GeneratedProduct = {
  name: string
  shortDescription: string
  description: string
  price: number
  category: string
  imageUrl: string
  inStock: boolean
  selected: boolean
}

function AIGenerator() {
  const [category, setCategory] = useState('All')
  const [count, setCount] = useState(5)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [generatedProducts, setGeneratedProducts] = useState<GeneratedProduct[]>([])
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null)

  const handleGenerate = async () => {
    setError('')
    setSuccess('')
    setGenerating(true)
    setGeneratedProducts([])

    try {
      const products = await generateProducts({ data: { category, count } })
      setGeneratedProducts(products.map(p => ({ ...p, selected: true })))
    } catch (err: any) {
      setError(err.message || 'Failed to generate products. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const toggleProduct = (index: number) => {
    setGeneratedProducts(prev =>
      prev.map((p, i) => (i === index ? { ...p, selected: !p.selected } : p)),
    )
  }

  const toggleAll = (selected: boolean) => {
    setGeneratedProducts(prev => prev.map(p => ({ ...p, selected })))
  }

  const selectedCount = generatedProducts.filter(p => p.selected).length

  const handleSave = async () => {
    const toSave = generatedProducts
      .filter(p => p.selected)
      .map(({ selected, ...rest }) => rest)

    if (toSave.length === 0) {
      setError('Please select at least one product to add.')
      return
    }

    setError('')
    setSaving(true)

    try {
      await saveGeneratedProducts({ data: toSave })
      setSuccess(`Successfully added ${toSave.length} product${toSave.length > 1 ? 's' : ''} to the catalog!`)
      setGeneratedProducts([])
    } catch (err: any) {
      setError(err.message || 'Failed to save products.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-700 text-sm font-medium mb-6 no-underline transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Product Generator</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Generate medical equipment listings with AI-powered descriptions and Nigerian market prices
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Generation Settings</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              disabled={generating}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white disabled:opacity-50"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Number of Products</label>
            <select
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              disabled={generating}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white disabled:opacity-50"
            >
              {[1, 2, 3, 5, 8, 10].map(n => (
                <option key={n} value={n}>
                  {n} product{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium text-sm hover:from-purple-800 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-wait border-0 cursor-pointer"
            >
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100 mb-6 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl border border-green-100 mb-6 flex items-center gap-2">
          <Check size={16} />
          {success}
          <Link
            to="/admin"
            className="ml-auto text-green-700 font-medium hover:text-green-800 no-underline underline"
          >
            View Dashboard
          </Link>
        </div>
      )}

      {generating && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Loader2 size={28} className="text-purple-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Generating Products</h3>
          <p className="text-sm text-gray-500">
            AI is creating {count} medical equipment product{count > 1 ? 's' : ''} with Nigerian market prices...
          </p>
        </div>
      )}

      {generatedProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Generated Products
              </h2>
              <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                {selectedCount} of {generatedProducts.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAll(true)}
                className="text-xs font-medium text-purple-600 hover:text-purple-800 bg-transparent border-0 cursor-pointer"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => toggleAll(false)}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 bg-transparent border-0 cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {generatedProducts.map((product, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl border transition-all ${
                  product.selected
                    ? 'border-purple-200 shadow-sm ring-1 ring-purple-100'
                    : 'border-gray-100 opacity-60'
                }`}
              >
                <div className="p-4 flex items-start gap-4">
                  <button
                    onClick={() => toggleProduct(index)}
                    className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                      product.selected
                        ? 'bg-purple-700 border-purple-700'
                        : 'bg-white border-gray-300 hover:border-purple-400'
                    }`}
                    style={{ padding: 0 }}
                  >
                    {product.selected && <Check size={12} className="text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3
                          className="font-semibold text-gray-900 text-sm cursor-pointer hover:text-purple-700"
                          onClick={() =>
                            setExpandedProduct(expandedProduct === index ? null : index)
                          }
                        >
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{product.shortDescription}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-lg">
                          {product.category}
                        </span>
                        <span className="text-sm font-bold text-purple-700">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>

                    {expandedProduct === index && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || selectedCount === 0}
              className="inline-flex items-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-purple-800 transition-all shadow-sm hover:shadow-md disabled:bg-purple-400 disabled:cursor-wait border-0 cursor-pointer"
            >
              <Package size={16} />
              {saving
                ? 'Adding to Catalog...'
                : `Add ${selectedCount} Product${selectedCount !== 1 ? 's' : ''} to Catalog`}
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200 bg-white cursor-pointer"
            >
              <Sparkles size={16} />
              Regenerate
            </button>
          </div>
        </div>
      )}

      {!generating && generatedProducts.length === 0 && !success && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <Bot size={28} className="text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Ready to Generate</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Choose a category and the number of products, then click Generate. The AI will create
            product names, descriptions, and realistic Nigerian market prices.
          </p>
        </div>
      )}
    </div>
  )
}
