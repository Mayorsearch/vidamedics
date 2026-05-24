import { createServerFn } from '@tanstack/react-start'
import { db } from '../../db/index.js'
import { products } from '../../db/schema.js'
import { eq, desc } from 'drizzle-orm'
import { requireAuthMiddleware, requireAdminMiddleware } from '../middleware/identity.js'

export const getProducts = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.select().from(products).orderBy(desc(products.createdAt))
})

export const getProduct = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    const [product] = await db.select().from(products).where(eq(products.id, id))
    if (!product) throw new Error('Product not found')
    return product
  })

export const getProductsByCategory = createServerFn({ method: 'GET' })
  .inputValidator((category: string) => category)
  .handler(async ({ data: category }) => {
    if (category === 'All') {
      return await db.select().from(products).orderBy(desc(products.createdAt))
    }
    return await db.select().from(products).where(eq(products.category, category)).orderBy(desc(products.createdAt))
  })

export const createProduct = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .inputValidator((data: { name: string; description: string; shortDescription: string; price: number; imageUrl: string; category: string; inStock: boolean }) => data)
  .handler(async ({ data }) => {
    const [product] = await db.insert(products).values({
      name: data.name,
      description: data.description,
      shortDescription: data.shortDescription,
      price: data.price,
      imageUrl: data.imageUrl,
      category: data.category,
      inStock: data.inStock,
    }).returning()
    return product
  })

export const updateProduct = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .inputValidator((data: { id: number; name: string; description: string; shortDescription: string; price: number; imageUrl: string; category: string; inStock: boolean }) => data)
  .handler(async ({ data }) => {
    const [product] = await db.update(products).set({
      name: data.name,
      description: data.description,
      shortDescription: data.shortDescription,
      price: data.price,
      imageUrl: data.imageUrl,
      category: data.category,
      inStock: data.inStock,
      updatedAt: new Date(),
    }).where(eq(products.id, data.id)).returning()
    return product
  })

export const deleteProduct = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    await db.delete(products).where(eq(products.id, id))
    return { success: true }
  })

export const getProductStats = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .handler(async () => {
    const allProducts = await db.select().from(products)
    const inStock = allProducts.filter(p => p.inStock).length
    const outOfStock = allProducts.length - inStock
    const categories = [...new Set(allProducts.map(p => p.category))]
    const totalValue = allProducts.reduce((sum, p) => sum + p.price, 0)
    return { total: allProducts.length, inStock, outOfStock, categories: categories.length, totalValue }
  })
