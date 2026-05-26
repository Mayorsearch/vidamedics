import { createServerFn } from '@tanstack/react-start'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuthMiddleware, requireAdminMiddleware } from '../middleware/identity.js'
import { db } from '../../db/index.js'
import { products } from '../../db/schema.js'

const categories = ['Stethoscopes', 'Gloves', 'Diagnostic Tools', 'PPE', 'Surgical', 'First Aid', 'General']

export const generateProducts = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .inputValidator((data: { category: string; count: number }) => data)
  .handler(async ({ data }) => {
    const { category, count } = data
    const targetCategory = category === 'All' ? 'any category from: ' + categories.join(', ') : category

    const anthropic = new Anthropic()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Generate ${count} realistic medical equipment products for an e-commerce store in Nigeria. Category: ${targetCategory}.

For each product, provide:
- name: A specific, professional product name
- shortDescription: A brief 1-sentence summary (max 120 characters)
- description: A detailed 2-3 paragraph description covering features, specifications, and use cases
- price: Price in Nigerian Naira (NGN) as a number. Use realistic Nigerian market prices (e.g. stethoscopes ₦15,000-₦85,000, gloves ₦3,500-₦25,000 per box, PPE ₦5,000-₦50,000, surgical tools ₦8,000-₦150,000, diagnostic tools ₦20,000-₦200,000, first aid kits ₦5,000-₦45,000)
- category: The product category${category === 'All' ? ' (pick from: ' + categories.join(', ') + ')' : ' (use: ' + category + ')'}

Return ONLY a JSON array of objects with these exact fields. No markdown, no code fences, just the raw JSON array.`,
        },
      ],
    })

    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('AI did not return text content')
    }

    let raw = textContent.text.trim()
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fenceMatch) {
      raw = fenceMatch[1].trim()
    }

    const generated = JSON.parse(raw) as Array<{
      name: string
      shortDescription: string
      description: string
      price: number
      category: string
    }>

    return generated.map((p) => ({
      name: p.name,
      shortDescription: p.shortDescription,
      description: p.description,
      price: Math.round(p.price * 100),
      category: p.category,
      imageUrl: '/placeholder.png',
      inStock: true,
    }))
  })

export const saveGeneratedProducts = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .inputValidator(
    (
      data: Array<{
        name: string
        shortDescription: string
        description: string
        price: number
        category: string
        imageUrl: string
        inStock: boolean
      }>,
    ) => data,
  )
  .handler(async ({ data }) => {
    const inserted = []
    for (const p of data) {
      const [product] = await db
        .insert(products)
        .values({
          name: p.name,
          description: p.description,
          shortDescription: p.shortDescription,
          price: p.price,
          imageUrl: p.imageUrl,
          category: p.category,
          inStock: p.inStock,
        })
        .returning()
      inserted.push(product)
    }
    return inserted
  })
