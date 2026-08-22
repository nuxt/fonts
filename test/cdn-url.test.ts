import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/cdn-url', import.meta.url)),
})

describe('custom CDN URL', () => {
  it('resolves font URLs in inlined styles against the CDN', async () => {
    const html = await $fetch<string>('/')
    const urls = Array.from(html.matchAll(/url\(([^)]*custom-font\.woff2)\)/g), m => m[1]!)
    expect(urls.length).toBeGreaterThan(0)
    expect(new Set(urls)).toStrictEqual(new Set(['https://cdn.example.com/custom-font.woff2']))
  })
})
