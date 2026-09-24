import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup } from '@nuxt/test-utils'
import type { ManualFontDetails, ProviderFontDetails } from 'fontless'

const resolved: Array<ManualFontDetails | ProviderFontDetails> = []

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/cdn-url', import.meta.url)),
  server: false,
  build: true,
  nuxtConfig: {
    hooks: {
      'fonts:resolved': (font) => {
        resolved.push(font)
      },
    },
  },
})

function urlSources(font: ManualFontDetails | ProviderFontDetails) {
  return font.fonts.flatMap(face => face.src.filter(src => 'url' in src))
}

describe('`fonts:resolved` hook', () => {
  it('passes the path each emitted font is served from', () => {
    const local = resolved.filter(font => font.fontFamily === 'MyLocal')
    expect(local.length).toBeGreaterThan(0)
    for (const src of local.flatMap(urlSources)) {
      expect(src.url).toMatch(/^\/_nuxt\/fonts\/[^/]+\.woff2$/)
      expect(src.originalURL).toMatch(/^file:\/\/.*\/MyLocal-400\.woff2$/)
    }
  })

  it('never passes a Vite asset placeholder', () => {
    expect(resolved.length).toBeGreaterThan(0)
    for (const src of resolved.flatMap(urlSources)) {
      expect(src.url).not.toContain('__VITE_ASSET__')
    }
  })
})
