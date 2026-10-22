import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

import { extractPreloadLinks } from './utils.ts'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/glyph-preload', import.meta.url)),
})

describe('glyph subsetting', () => {
  it('preloads a glyph subsetted family when the preload option filters by subset', async () => {
    const html = await $fetch<string>('/')
    const links = extractPreloadLinks(html)
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).toContain('/_nuxt/fonts/')
    }
  })
})
