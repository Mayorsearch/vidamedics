import { createFileRoute } from '@tanstack/react-router'
import { getStore } from '@netlify/blobs'

export const Route = createFileRoute('/api/images/$imageKey')({
  server: {
    handlers: {
      GET: async ({ params }: { params: { imageKey: string } }) => {
        const store = getStore({ name: 'product-images', consistency: 'strong' })
        const result = await store.getWithMetadata(params.imageKey, { type: 'arrayBuffer' })

        if (!result) {
          return new Response('Not found', { status: 404 })
        }

        const contentType = result.metadata?.contentType || 'image/jpeg'
        return new Response(result.data as ArrayBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000',
          },
        })
      },
    },
  },
})
