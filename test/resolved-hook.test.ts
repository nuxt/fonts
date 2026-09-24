import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import type { ResolvedFontDetails } from '../src/types'

// Modules that render fonts outside the browser (e.g. OG images) collect these at build time
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

// The fixture builds in `beforeAll`, so events are only read once a test runs
function resolved() {
  const fonts = events.flatMap(event => event.type === 'resolved' ? [event.font] : [])
  expect(fonts.length).toBeGreaterThan(0)
  return fonts
}

function urlSources(fonts: ResolvedFontDetails[]) {
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

  it('passes a file for each font we serve', () => {
    for (const font of resolved()) {
      expect.soft(font.files.map(file => file.url).sort()).toEqual([...new Set(urlSources([font]).map(src => src.url))].sort())
    }
  })

  it('reads each file at build time as it is served', async () => {
    for (const file of resolved().flatMap(font => font.files)) {
      const served = await $fetch<ArrayBuffer>(file.url, { responseType: 'arrayBuffer' })
      expect.soft(Buffer.from(served).equals(await file.readFont()), file.url).toBe(true)
    }
  })

  it('serves the original font file at each path', async () => {
    for (const src of urlSources(resolved())) {
      const served = await $fetch<ArrayBuffer>(src.url, { responseType: 'arrayBuffer' })
      const original = await readFile(fileURLToPath(src.originalURL!))
      expect.soft(Buffer.from(served).equals(original), src.url).toBe(true)
    }
  })
})
