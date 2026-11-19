import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

import { extractFontFaces } from './utils.ts'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/cdn-url', import.meta.url)),
  nuxtConfig: {
    app: { cdnURL: '' },
  },
  env: {
    NUXT_APP_CDN_URL: 'https://cdn.example.com/',
  },
})

function fontPreloadLinks(html: string) {
  return (html.match(/<link[^>]+rel="preload"[^>]*>/g) || []).filter(link => link.includes('as="font"'))
}

describe('CDN URL set at runtime', () => {
  it('resolves font URLs in inlined styles against the CDN', async () => {
    const html = await $fetch<string>('/')
    const urls = Array.from(html.matchAll(/url\(([^)]+\.woff2)\)/g), m => m[1]!)
    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) {
      expect.soft(url).toMatch(/^https:\/\/cdn\.example\.com\//)
    }
  })

  it('preloads the same URLs that the font face rules reference', async () => {
    for (const path of ['/', '/inbox']) {
      const html = await $fetch<string>(path)
      const links = fontPreloadLinks(html)
      expect(links.length).toBeGreaterThan(0)
      const urls = new Set(Array.from(html.matchAll(/url\(([^)]+)\)/g), m => m[1]!.replace(/^['"]|['"]$/g, '')))
      for (const link of links) {
        expect.soft(urls).toContain(link.match(/href="([^"]+)"/)?.[1])
      }
    }
  })

  it('does not repeat a font face that Nuxt already inlined', async () => {
    const html = await $fetch<string>('/')
    expect(extractFontFaces('MyCustom', html)).toHaveLength(1)
  })
})
