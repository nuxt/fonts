import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, fetch } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/cdn-url', import.meta.url)),
})

function fontPreloadLinks(html: string) {
  return (html.match(/<link[^>]+rel="preload"[^>]*>/g) || []).filter(link => link.includes('as="font"'))
}

function isEmittedFontURL(url: string | undefined) {
  if (!url) {
    return false
  }
  const { origin, pathname } = new URL(url, 'https://example.test')
  return origin === 'https://cdn.example.com' && pathname.startsWith('/_nuxt/fonts/')
}

describe('custom CDN URL', () => {
  it('resolves font URLs in inlined styles against the CDN', async () => {
    const html = await $fetch<string>('/')
    const urls = Array.from(html.matchAll(/url\(([^)]*custom-font\.woff2)\)/g), m => m[1]!)
    expect(urls).toEqual(['https://cdn.example.com/custom-font.woff2'])
  })

  it('resolves URLs of fonts we emit against the CDN', async () => {
    const html = await $fetch<string>('/')
    const urls = Array.from(html.matchAll(/url\(([^)]*\/fonts\/[^)]+)\)/g), m => m[1]!)
    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) {
      expect.soft(url).toMatch(/^https:\/\/cdn\.example\.com\/_nuxt\/fonts\//)
    }
  })

  it('resolves URLs of fonts hoisted into the document head against the CDN', async () => {
    const html = await $fetch<string>('/')
    const heads = Array.from(html.matchAll(/<style>([\s\S]*?)<\/style>/g), m => m[1]!)
    expect(heads.length).toBeGreaterThan(0)
    for (const style of heads) {
      expect.soft(style).not.toContain('__VITE_ASSET__')
    }
  })

  it('preloads fonts served from the CDN with `crossorigin`', async () => {
    const html = await $fetch<string>('/')
    const links = fontPreloadLinks(html)
    expect(links.length).toBeGreaterThan(0)
    expect(links.some(link => isEmittedFontURL(link.match(/href="([^"]+)"/)?.[1]))).toBe(true)
    for (const link of links) {
      expect.soft(link).toContain('crossorigin')
    }
  })

  it('preloads the same URLs that the font face rules reference', async () => {
    const html = await $fetch<string>('/')
    const urls = new Set(Array.from(html.matchAll(/url\(([^)]+)\)/g), m => m[1]!.replace(/^['"]|['"]$/g, '')))
    for (const link of fontPreloadLinks(html)) {
      expect.soft(urls).toContain(link.match(/href="([^"]+)"/)?.[1])
    }
  })

  it('serves emitted fonts with immutable cache headers, which a `/_nuxt/**` route rule does not override', async () => {
    const html = await $fetch<string>('/')
    const url = html.match(/https:\/\/cdn\.example\.com(\/_nuxt\/fonts\/[^)"']+)/)?.[1]
    expect(url).toBeDefined()
    const res = await fetch(url!)
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('public, max-age=31536000, immutable')
    expect(res.headers.get('x-route-rule')).toBe('applied')
  })
})
