import { createServerFn } from '@tanstack/react-start'
import { getStore } from '@netlify/blobs'
import { requireAuthMiddleware, requireAdminMiddleware } from '../middleware/identity.js'

export const uploadProductImage = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware, requireAdminMiddleware])
  .inputValidator((data: { fileName: string; fileData: string; contentType: string }) => data)
  .handler(async ({ data }) => {
    const store = getStore({ name: 'product-images', consistency: 'strong' })
    const key = `${Date.now()}-${data.fileName}`
    const buffer = Buffer.from(data.fileData, 'base64')
    await store.set(key, buffer, {
      metadata: { contentType: data.contentType },
    })
    return { key, url: `/api/images/${key}` }
  })
