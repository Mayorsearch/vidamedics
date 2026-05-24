import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createProduct } from '@/lib/products'
import { uploadProductImage } from '@/lib/images'
import { useState, useRef } from 'react'
import { ArrowLeft, Image, Package } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/products/new')({
  component: NewProduct,
})

const categories = ['Stethoscopes', 'Gloves', 'Diagnostic Tools', 'PPE', 'Surgical', 'First Aid', 'General']

function NewProduct() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [imageUrl, setImageUrl] = useState('/placeholder.png')

  const [form, setForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    category: 'General',
    inStock: true,
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1]
        setImagePreview(event.target?.result as string)

        const result = await uploadProductImage({
          data: {
            fileName: file.name,
            fileData: base64,
            contentType: file.type,
          },
        })
        setImageUrl(result.url)
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setError('Failed to upload image')
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const priceInKobo = Math.round(parseFloat(form.price) * 100)
    if (isNaN(priceInKobo) || priceInKobo <= 0) {
      setError('Please enter a valid price')
      setSaving(false)
      return
    }

    try {
      await createProduct({
        data: {
          name: form.name,
          description: form.description,
          shortDescription: form.shortDescription,
          price: priceInKobo,
          imageUrl,
          category: form.category,
          inStock: form.inStock,
        },
      })
      navigate({ to: '/admin' })
    } catch (err: any) {
      setError(err.message || 'Failed to create product')
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

      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details below to add a new product to your catalog</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100 mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-all"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl mx-auto shadow-sm" />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Image size={24} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Click to upload an image</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                    </div>
                  </div>
                )}
                {uploading && <p className="text-sm text-purple-600 mt-3 font-medium">Uploading...</p>}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g. Professional Stethoscope"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="A brief summary for product cards"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
                placeholder="Detailed product description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (NGN)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₦</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.price}
                    onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                    required
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="29900.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="inStock"
                checked={form.inStock}
                onChange={(e) => setForm(f => ({ ...f, inStock: e.target.checked }))}
                className="w-4 h-4 text-purple-700 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="inStock" className="text-sm font-medium text-gray-700">In Stock</label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex items-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-purple-800 transition-all shadow-sm hover:shadow-md disabled:bg-purple-400 disabled:cursor-wait border-0 cursor-pointer"
              >
                <Package size={16} />
                {saving ? 'Saving...' : 'Add Product'}
              </button>
              <Link
                to="/admin"
                className="px-6 py-3 rounded-xl font-medium text-sm text-gray-600 hover:bg-gray-50 transition-colors no-underline border border-gray-200"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
