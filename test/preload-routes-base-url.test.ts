import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

import { extractPreloadLinks } from './utils.ts'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/preload-routes', import.meta.url)),
  env: {
    NUXT_APP_BASE_URL: '/foo',
  },
})

describe('route scoped preloads with a custom base URL', () => {
  it('preloads a family on the routes a route rule matches', async () => {
    const html = await $fetch<string>('/foo/inbox')
    expect(extractPreloadLinks(html)).toContain('/foo/routed-font-bold.woff2')
  })

  it('does not preload a family on the routes no route rule matches', async () => {
    const links = extractPreloadLinks(await $fetch<string>('/foo/'))
    expect(links).not.toContain('/foo/routed-font.woff2')
    expect(links).not.toContain('/foo/routed-font-bold.woff2')
  })

  it('preloads a family no route rule mentions on every route', async () => {
    const html = await $fetch<string>('/foo/inbox')
    expect(extractPreloadLinks(html)).toContain('/foo/everywhere-font.woff2')
  })
})
