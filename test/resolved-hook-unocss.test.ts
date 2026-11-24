import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup } from '@nuxt/test-utils'
import type { ResolvedFontDetails } from '../src/types.ts'

const events: ResolvedFontDetails[] = []

await setup({
  rootDir: fileURLToPath(new URL('../playgrounds/unocss', import.meta.url)),
  nuxtConfig: {
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

describe('`fonts:resolved` hook with a bundler-emitted stylesheet', () => {
  it('reports public font URLs rather than CSS-relative paths', () => {
    const urls = events.flatMap(font => font.fonts.flatMap(face => face.src.flatMap(src => 'url' in src ? [src.url] : [])))
    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) {
      expect(url).toMatch(/^\/_nuxt\/fonts\/[^/]+\.woff2$/)
    }
  })

  it('reports each file at the same URL as its face', () => {
    for (const font of events) {
      const urls = font.fonts.flatMap(face => face.src.flatMap(src => 'url' in src ? [src.url] : []))
      expect(font.files.map(file => file.url)).toEqual(urls)
    }
  })
})
