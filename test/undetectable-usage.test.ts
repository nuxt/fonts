import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

import { extractFontFaces } from './utils'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/undetectable', import.meta.url)),
})

describe('undetectable font usage', () => {
  it('resolves a font used in a nested component style block', async () => {
    const html = await $fetch<string>('/')
    expect(extractFontFaces('NestedStyle', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:NestedStyle;src:url(/nested-style.woff2) format(woff2)}",
      ]
    `)
  })

  it('does not resolve a font used only in a style attribute', async () => {
    const html = await $fetch<string>('/')
    expect(extractFontFaces('InlineAttribute', html)).toMatchInlineSnapshot(`[]`)
  })

  it('does not resolve a font used only inside an SVG served from `public/`', async () => {
    const html = await $fetch<string>('/')
    expect(extractFontFaces('SvgAsset', html)).toMatchInlineSnapshot(`[]`)
  })

  it('emits a `global` font used only inside an SVG served from `public/`', async () => {
    const html = await $fetch<string>('/')
    expect(extractFontFaces('SvgAssetGlobal', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:SvgAssetGlobal;src:url(/svg-asset-global.woff2) format(woff2)}",
      ]
    `)
  })
})
