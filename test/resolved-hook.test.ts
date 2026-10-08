import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import type { ResolvedFontDetails } from '../src/types.ts'

const events: Array<{ type: 'resolved', font: ResolvedFontDetails } | { type: 'nitro' }> = []

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/resolved-hook', import.meta.url)),
  nuxtConfig: {
    hooks: {
      'fonts:resolved': (font) => {
        events.push({ type: 'resolved', font })
      },
      'nitro:build:before': () => {
        events.push({ type: 'nitro' })
      },
    },
  },
})

const families = ['MyGlobal', 'MyLocal', 'MyManual', 'MyPublic']

function resolved() {
  const fonts = events.flatMap(event => event.type === 'resolved' ? [event.font] : [])
  expect(fonts.length).toBeGreaterThan(0)
  return fonts
}

describe('`fonts:resolved` hook', () => {
  it('passes global families and families found in CSS once each', () => {
    expect(resolved().map(font => font.fontFamily).sort()).toEqual(families)
    for (const font of resolved()) {
      expect.soft(font.fonts).toEqual([expect.objectContaining({ weight: '400', style: 'normal' })])
    }
  })

  it('resolves every family before Nitro builds', () => {
    const beforeNitro = events.slice(0, events.findIndex(event => event.type === 'nitro'))
    expect([...new Set(beforeNitro.flatMap(event => event.type === 'resolved' ? [event.font.fontFamily] : []))].sort()).toEqual(families)
  })

  it('resolves font URLs to the path they are served from', () => {
    const urls = Object.fromEntries(resolved().map(font => [font.fontFamily, font.fonts.flatMap(face => face.src.flatMap(src => 'url' in src ? [src.url] : []))]))
    expect(urls).toEqual({
      MyGlobal: [expect.stringMatching(/^\/base\/_nuxt\/fonts\/[^/]+\.woff2$/)],
      MyLocal: [expect.stringMatching(/^\/base\/_nuxt\/fonts\/[^/]+\.woff2$/)],
      MyManual: ['/base/fonts/MyManual-400.woff2?v=1'],
      MyPublic: ['/base/fonts/MyPublic-400.woff2'],
    })
  })

  it('passes a file for each font URL', () => {
    for (const font of resolved()) {
      const urls = font.fonts.flatMap(face => face.src.flatMap(src => 'url' in src ? [src.url] : []))
      expect.soft(font.files.map(file => file.url), font.fontFamily).toEqual(urls)
    }
  })

  it('reads each file as it is served', async () => {
    for (const file of resolved().flatMap(font => font.files)) {
      const served = await $fetch<ArrayBuffer>(file.url, { responseType: 'arrayBuffer' })
      expect.soft(Buffer.from(served).equals(await file.readFont()), file.url).toBe(true)
    }
  })
})
