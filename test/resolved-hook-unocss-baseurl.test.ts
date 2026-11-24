import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import type { ResolvedFontDetails } from '../src/types.ts'

const events: ResolvedFontDetails[] = []

await setup({
  rootDir: fileURLToPath(new URL('../playgrounds/unocss', import.meta.url)),
  nuxtConfig: {
    app: { baseURL: '/base/' },
    fonts: {
      local: {
        dirs: [fileURLToPath(new URL('./fixtures/resolved-hook-unocss/fonts', import.meta.url))],
      },
      families: [{ name: 'Barlow', preload: true, provider: 'local' }],
    },
    hooks: {
      'fonts:resolved': (font) => {
        events.push(font)
      },
    },
  },
})

describe('`fonts:resolved` hook with a base URL on a bundler-emitted stylesheet', () => {
  it('reports public font URLs including the base URL', () => {
    const urls = events.flatMap(font => font.fonts.flatMap(face => face.src.flatMap(src => 'url' in src ? [src.url] : [])))
    expect(urls).toEqual([expect.stringMatching(/^\/base\/_nuxt\/fonts\/[^/]+\.woff2$/)])
    for (const font of events) {
      expect(font.files.map(file => file.url)).toEqual(urls)
    }
  })

  it('emits CSS whose font URL resolves to the served file', async () => {
    const served = events[0]?.files[0]?.url
    expect(served).toMatch(/^\/base\/_nuxt\/fonts\/([^/]+)\.woff2$/)
    const filename = served!.split('/').pop()!

    const html = await $fetch<string>('/base/')
    const cssHrefs = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(m => m[1]!)
    let found = false
    for (const cssHref of cssHrefs) {
      const css = await $fetch<string>(cssHref)
      if (!css.includes(`./fonts/${filename}`)) {
        continue
      }
      const base = cssHref.startsWith('http') ? cssHref : `http://test.local${cssHref}`
      const resolved = new URL(`./fonts/${filename}`, base).pathname
      expect(resolved).toBe(`/base/_nuxt/fonts/${filename}`)
      found = true
    }
    expect(found).toBe(true)
  })
})
