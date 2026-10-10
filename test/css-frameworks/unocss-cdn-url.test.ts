import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

const cdnURL = 'https://cdn.example.com/app/'

await setup({
  rootDir: fileURLToPath(new URL('../../playgrounds/unocss', import.meta.url)),
  nuxtConfig: {
    app: { cdnURL },
    fonts: {
      families: [{ name: 'Barlow', preload: true }],
    },
  },
})

async function fetchFontURLs() {
  const html = await $fetch<string>('/')
  const href = html.match(/rel="stylesheet" href="([^"]+\/entry\.[^"]+\.css)"/)![1]!
  const css = await $fetch<string>(href.replace(cdnURL, '/'))
  const urls = Array.from(css.matchAll(/url\(([^)]+)\)/g), m => new URL(m[1]!.replace(/^['"]|['"]$/g, ''), href).href)
  const preloads = (html.match(/<link[^>]+rel="preload"[^>]*>/g) || [])
    .filter(link => link.includes('as="font"'))
    .map(link => link.match(/href="([^"]+)"/)?.[1])
  return { urls, preloads }
}

describe('unocss with a custom CDN URL', () => {
  it('resolves font URLs in the stylesheet against the CDN', async () => {
    const { urls } = await fetchFontURLs()
    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) {
      expect.soft(url).toMatch(/^https:\/\/cdn\.example\.com\/app\/_nuxt\/fonts\//)
    }
  })

  it('preloads the same URLs that the font face rules reference', async () => {
    const { urls, preloads } = await fetchFontURLs()
    expect(preloads.length).toBeGreaterThan(0)
    for (const preload of preloads) {
      expect.soft(urls).toContain(preload)
    }
  })
})
