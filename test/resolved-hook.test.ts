import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import type { ResolvedFontDetails } from '../src/types'

const events: Array<{ type: 'resolved', font: ResolvedFontDetails } | { type: 'read' } | { type: 'nitro' }> = []

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/resolved-hook', import.meta.url)),
  nuxtConfig: {
    hooks: {
      'fonts:resolved': async (font) => {
        events.push({ type: 'resolved', font })
        await new Promise(resolve => setTimeout(resolve, 50))
        await Promise.all(font.files.map(file => file.readFont()))
        events.push({ type: 'read' })
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
  it('passes global families and families found in CSS', () => {
    expect([...new Set(resolved().map(font => font.fontFamily))].sort()).toEqual(families)
    for (const font of resolved()) {
      expect.soft(font.fonts).toEqual([expect.objectContaining({ weight: '400', style: 'normal' })])
    }
  })

  it('waits for every listener before Nitro builds', () => {
    const nitro = events.findIndex(event => event.type === 'nitro')
    expect(nitro).toBeGreaterThan(0)
    expect(events.slice(nitro).filter(event => event.type !== 'nitro')).toEqual([])
    expect(events.filter(event => event.type === 'read')).toHaveLength(resolved().length)
  })

  it('resolves emitted fonts to their public path', () => {
    for (const font of resolved().filter(font => ['MyGlobal', 'MyLocal'].includes(font.fontFamily))) {
      for (const src of font.fonts.flatMap(face => face.src)) {
        if ('url' in src) {
          expect.soft(src.url).toMatch(/^\/base\/_nuxt\/fonts\/[^/]+\.woff2$/)
        }
      }
    }
  })

  it('passes a file for each family, read from where it was found', () => {
    for (const font of resolved()) {
      expect.soft(font.files, font.fontFamily).toEqual([expect.objectContaining({
        url: expect.stringMatching(/^\/base\//),
        originalURL: expect.stringMatching(new RegExp(`^file://.*/fonts/${font.fontFamily}-400\\.woff2$`)),
      })])
    }
  })

  it('reads each file as it is served', async () => {
    for (const file of resolved().flatMap(font => font.files)) {
      const served = await $fetch<ArrayBuffer>(file.url, { responseType: 'arrayBuffer' })
      expect.soft(Buffer.from(served).equals(await file.readFont()), file.url).toBe(true)
    }
  })
})
