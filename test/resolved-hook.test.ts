import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import type { ManualFontDetails, ProviderFontDetails } from 'fontless'
import type { PublicAssetContext } from '../src/assets'

type ResolvedFont = ManualFontDetails | ProviderFontDetails

// Modules that render fonts outside the browser (e.g. OG images) collect these at build time
const events: Array<{ type: 'resolved', font: ResolvedFont } | { type: 'nitro' }> = []
let assetContext: PublicAssetContext | undefined

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/resolved-hook', import.meta.url)),
  nuxtConfig: {
    hooks: {
      'fonts:resolved': (font) => {
        events.push({ type: 'resolved', font })
      },
      'fonts:public-asset-context': (context) => {
        assetContext = context
      },
      'nitro:build:before': () => {
        events.push({ type: 'nitro' })
      },
    },
  },
})

// The fixture builds in `beforeAll`, so events are only read once a test runs
function resolved() {
  const fonts = events.flatMap(event => event.type === 'resolved' ? [event.font] : [])
  expect(fonts.length).toBeGreaterThan(0)
  return fonts
}

function urlSources(fonts: ResolvedFont[]) {
  return fonts.flatMap(font => font.fonts.flatMap(face => face.src.filter(src => 'url' in src)))
}

describe('`fonts:resolved` hook', () => {
  it('passes global families and families found in CSS', () => {
    const families = new Set(resolved().map(font => font.fontFamily))
    expect([...families].sort()).toEqual(['MyGlobal', 'MyLocal'])
    for (const font of resolved()) {
      expect.soft(font.fonts).toEqual([expect.objectContaining({ weight: '400', style: 'normal' })])
    }
  })

  it('resolves every family before Nitro builds', () => {
    const beforeNitro = events.slice(0, events.findIndex(event => event.type === 'nitro'))
    const families = new Set(beforeNitro.flatMap(event => event.type === 'resolved' ? [event.font.fontFamily] : []))
    expect([...families].sort()).toEqual(['MyGlobal', 'MyLocal'])
  })

  it('passes the path each font is served from, with the base URL', () => {
    const sources = urlSources(resolved())
    expect(sources.length).toBeGreaterThan(0)
    for (const src of sources) {
      expect.soft(src.url).toMatch(/^\/base\/_nuxt\/fonts\/[^/]+\.woff2$/)
    }
  })

  it('passes where each font was read from', () => {
    for (const font of resolved()) {
      for (const src of urlSources([font])) {
        expect.soft(src.originalURL).toMatch(new RegExp(`^file://.*/fonts/${font.fontFamily}-400\\.woff2$`))
      }
    }
  })

  it('reads each font at build time as it is served', async () => {
    for (const src of urlSources(resolved())) {
      const read = await assetContext!.readFont(src.url)
      const served = await $fetch<ArrayBuffer>(src.url, { responseType: 'arrayBuffer' })
      expect.soft(read && Buffer.from(served).equals(read), src.url).toBe(true)
    }
  })

  it('reads nothing for a font it does not serve', async () => {
    expect(await assetContext!.readFont('/base/_nuxt/fonts/missing.woff2')).toBeUndefined()
  })

  it('serves the original font file at each path', async () => {
    for (const src of urlSources(resolved())) {
      const served = await $fetch<ArrayBuffer>(src.url, { responseType: 'arrayBuffer' })
      const original = await readFile(fileURLToPath(src.originalURL!))
      expect.soft(Buffer.from(served).equals(original), src.url).toBe(true)
    }
  })
})
