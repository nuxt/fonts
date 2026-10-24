import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

import { extractPreloadLinks } from './utils.ts'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/preload-routes', import.meta.url)),
})

describe('route scoped preloads', () => {
  it('preloads a family on the routes a route rule matches', async () => {
    const html = await $fetch<string>('/inbox')
    expect(extractPreloadLinks(html)).toContain('/routed-font-bold.woff2')
  })

  it('preloads the faces the route rule asks for', async () => {
    const html = await $fetch<string>('/inbox')
    expect(extractPreloadLinks(html)).not.toContain('/routed-font.woff2')
  })

  it('preloads a family from a global stylesheet on the routes a route rule matches', async () => {
    const html = await $fetch<string>('/inbox')
    expect(extractPreloadLinks(html)).toContain('/styled-font.woff2')
  })

  it('preloads a family on the routes below a wildcard route rule', async () => {
    const html = await $fetch<string>('/inbox/123')
    expect(extractPreloadLinks(html)).toContain('/routed-font-bold.woff2')
  })

  it('does not preload a family on the routes no route rule matches', async () => {
    const html = await $fetch<string>('/')
    expect(extractPreloadLinks(html)).not.toContain('/routed-font-bold.woff2')
    expect(extractPreloadLinks(html)).not.toContain('/styled-font.woff2')
  })

  it('preloads a font file shared with a family no route rule mentions on every route', async () => {
    const html = await $fetch<string>('/')
    expect(extractPreloadLinks(html)).toContain('/shared-font.woff2')
  })

  it('preloads a font file shared with a family no route rule mentions once', async () => {
    const html = await $fetch<string>('/inbox')
    expect(extractPreloadLinks(html).filter(link => link === '/shared-font.woff2')).toHaveLength(1)
  })

  it('preloads a family no route rule mentions on every route', async () => {
    for (const path of ['/', '/inbox']) {
      const html = await $fetch<string>(path)
      expect.soft(extractPreloadLinks(html), path).toContain('/everywhere-font.woff2')
    }
  })
})
