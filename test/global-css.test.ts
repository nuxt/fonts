import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

import { extractFontFaces } from './utils'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/global-css', import.meta.url)),
})

describe('global stylesheets', () => {
  it('inlines font faces injected into stylesheets which Nuxt does not inline', async () => {
    const html = await $fetch<string>('/')
    expect(extractFontFaces('MyCustom', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:MyCustom;src:url(/custom-font.woff2) format(woff2)}",
      ]
    `)
  })

  it('strips hoisted font faces from the bundled stylesheet', async () => {
    const html = await $fetch<string>('/')
    const stylesheets = Array.from(html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g), m => m[1]!)
    expect(stylesheets.length).toBeGreaterThan(0)
    for (const stylesheet of stylesheets) {
      const css = await $fetch<string>(stylesheet)
      expect.soft(css).not.toContain('@font-face')
    }
  })

  it('does not repeat the same font face across inlined stylesheets', async () => {
    const html = await $fetch<string>('/')
    const rules = html.match(/@font-face\s*\{[^}]*\}/g) || []
    expect(rules.length).toBeGreaterThan(0)
    expect(rules).toStrictEqual([...new Set(rules)])
  })

  it('inlines font faces for globally registered families', async () => {
    const html = await $fetch<string>('/')
    expect(extractFontFaces('CustomGlobal', html)).toMatchInlineSnapshot(`
      [
        "@font-face {font-display: swap;font-family: 'CustomGlobal';src: url("/custom-font.woff2") format(woff2)}",
      ]
    `)
  })
})
