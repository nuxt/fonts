import { defineEventHandler } from 'h3'
// @ts-expect-error virtual module registered in nuxt.config
import urls from '#font-urls'

// fetches each font from within Nitro, the way modules that render images do while prerendering
export default defineEventHandler(async (event) => {
  const sizes: Record<string, number | string> = {}
  for (const url of urls as string[]) {
    sizes[url] = await event.$fetch<ArrayBuffer>(url, { responseType: 'arrayBuffer' })
      .then(data => data.byteLength, (error: Error) => error.message)
  }
  return sizes
})
