import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, fetch } from '@nuxt/test-utils'

import { extractFontFaces, extractPreloadLinks } from './utils'

await setup({
  rootDir: fileURLToPath(new URL('../playgrounds/nuxt5', import.meta.url)),
})

describe('nuxt 5', () => {
  it('generates font face rules for remote providers', async () => {
    const html = await $fetch<string>('/providers/bunny')
    expect(extractFontFaces('Abel', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:Abel;font-style:normal;font-weight:400;src:local(Abel Regular),local(Abel),url(/_fonts/abel-400-latin.woff2) format(woff2);unicode-range:U+0-FF,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+304,U+308,U+329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}",
      ]
    `)
  })

  it('generates font fallback metrics', async () => {
    const html = await $fetch<string>('/providers/bunny')
    expect(extractFontFaces('Abel Fallback: Arial', html)).toMatchInlineSnapshot(`
      [
        "@font-face{ascent-override:114.212%;descent-override:34.3887%;font-family:Abel Fallback: Arial;line-gap-override:0%;size-adjust:85.7612%;src:local(Arial)}",
      ]
    `)
  })

  it('generates font face rules for manual overrides', async () => {
    const html = await $fetch<string>('/overrides')
    expect(extractFontFaces('MyCustom', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:MyCustom;src:url(/custom-font.woff2) format(woff2)}",
      ]
    `)
  })

  it('processes fonts within preprocessed styles', async () => {
    const html = await $fetch<string>('/providers/google')
    expect(extractFontFaces('Anta', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:Anta;font-style:normal;font-weight:400;src:local(Anta Regular),local(Anta),url(/_fonts/anta-400-latin-ext.woff2) format(woff2);unicode-range:U+100-2BA,U+2BD-2C5,U+2C7-2CC,U+2CE-2D7,U+2DD-2FF,U+304,U+308,U+329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}",
        "@font-face{font-display:swap;font-family:Anta;font-style:normal;font-weight:400;src:local(Anta Regular),local(Anta),url(/_fonts/anta-400-latin.woff2) format(woff2);unicode-range:U+0-FF,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+304,U+308,U+329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}",
      ]
    `)
  })

  it('adds preload links to the HTML', async () => {
    const html = await $fetch<string>('/providers/fontsource')
    expect(extractPreloadLinks(html).sort()).toMatchInlineSnapshot(`
      [
        "/_fonts/roboto-mono-400-cyrillic-ext.woff2",
      ]
    `)
  })

  it('serves the font files referenced by generated font face rules', async () => {
    const html = await $fetch<string>('/providers/google')
    const urls = new Set(Array.from(html.matchAll(/url\((\/_fonts\/[^)]+)\)/g), match => match[1]!))
    expect(urls.size).toBeGreaterThan(0)
    for (const url of urls) {
      const res = await fetch(url)
      expect.soft(res.status, url).toBe(200)
      expect.soft((await res.arrayBuffer()).byteLength, url).toBeGreaterThan(0)
    }
  })
})
