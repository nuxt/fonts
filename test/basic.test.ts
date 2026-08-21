import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

import { mockAdobeFetch } from './fixtures/adobe'
import { extractFontFaces, extractPreloadLinks } from './utils'

mockAdobeFetch()

await setup({
  rootDir: fileURLToPath(new URL('../playgrounds/basic', import.meta.url)),
})

describe('providers', async () => {
  it('generates inlined font face rules for `local` provider', async () => {
    const html = await $fetch<string>('/providers/local')
    expect(extractFontFaces('Custom Font', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:Custom Font;font-style:normal;font-weight:400;src:local(Custom Font Regular),local(Custom Font),url(/custom-font.woff2) format(woff2)}",
      ]
    `)
  })

  it('generates inlined font face rules for `adobe` provider', async () => {
    const html = await $fetch<string>('/providers/adobe')
    expect(extractFontFaces('Aleo', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:auto;font-family:Aleo;font-style:italic;font-weight:400;src:local(Aleo Regular Italic),local(Aleo Italic),url(/_fonts/aleo-400-italic.woff2) format(woff2),url(/_fonts/aleo-400-italic.woff) format(woff),url(/_fonts/aleo-400-italic.otf) format(opentype)}",
        "@font-face{font-display:auto;font-family:Aleo;font-style:normal;font-weight:400;src:local(Aleo Regular),local(Aleo),url(/_fonts/aleo-400.woff2) format(woff2),url(/_fonts/aleo-400.woff) format(woff),url(/_fonts/aleo-400.otf) format(opentype)}",
      ]
    `)
    expect(extractFontFaces('Barlow Semi Condensed', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:auto;font-family:Barlow Semi Condensed;font-style:normal;font-weight:400;src:local(Barlow Semi Condensed Regular),local(Barlow Semi Condensed),url(/_fonts/barlow-semi-condensed-400.woff2) format(woff2),url(/_fonts/barlow-semi-condensed-400.woff) format(woff),url(/_fonts/barlow-semi-condensed-400.otf) format(opentype)}",
        "@font-face{font-display:auto;font-family:Barlow Semi Condensed;font-style:italic;font-weight:400;src:local(Barlow Semi Condensed Regular Italic),local(Barlow Semi Condensed Italic),url(/_fonts/barlow-semi-condensed-400-italic.woff2) format(woff2),url(/_fonts/barlow-semi-condensed-400-italic.woff) format(woff),url(/_fonts/barlow-semi-condensed-400-italic.otf) format(opentype)}",
      ]
    `)
  })

  it('generates inlined font face rules for `bunny` provider', async () => {
    const html = await $fetch<string>('/providers/bunny')
    expect(extractFontFaces('Abel', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:Abel;font-style:normal;font-weight:400;src:local(Abel Regular),local(Abel),url(/_fonts/abel-400-latin.woff2) format(woff2);unicode-range:U+0-FF,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+304,U+308,U+329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}",
      ]
    `)
  })

  it('generates inlined font face rules for `fontshare` provider', async () => {
    const html = await $fetch<string>('/providers/fontshare')
    expect(extractFontFaces('Satoshi', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:Satoshi;font-style:normal;font-weight:400;src:local(Satoshi Regular),local(Satoshi),url(/_fonts/satoshi-400.woff2) format(woff2)}",
        "@font-face{font-display:swap;font-family:Satoshi;font-style:italic;font-weight:400;src:local(Satoshi Regular Italic),local(Satoshi Italic),url(/_fonts/satoshi-400-italic.woff2) format(woff2)}",
      ]
    `)
  })

  it('generates inlined font face rules for `fontsource` provider', async () => {
    const html = await $fetch<string>('/providers/fontsource')
    expect(extractFontFaces('Roboto Flex', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:Roboto Flex;font-style:normal;font-weight:400;src:local(Roboto Flex Regular),local(Roboto Flex),url(/_fonts/roboto-flex-400-cyrillic-ext.woff2) format(woff2);unicode-range:U+460-52F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F}",
        "@font-face{font-display:swap;font-family:Roboto Flex;font-style:normal;font-weight:400;src:local(Roboto Flex Regular),local(Roboto Flex),url(/_fonts/roboto-flex-400-cyrillic.woff2) format(woff2);unicode-range:U+301,U+400-45F,U+490-491,U+4B0-4B1,U+2116}",
        "@font-face{font-display:swap;font-family:Roboto Flex;font-style:normal;font-weight:400;src:local(Roboto Flex Regular),local(Roboto Flex),url(/_fonts/roboto-flex-400-greek.woff2) format(woff2);unicode-range:U+370-377,U+37A-37F,U+384-38A,U+38C,U+38E-3A1,U+3A3-3FF}",
        "@font-face{font-display:swap;font-family:Roboto Flex;font-style:normal;font-weight:400;src:local(Roboto Flex Regular),local(Roboto Flex),url(/_fonts/roboto-flex-400-vietnamese.woff2) format(woff2);unicode-range:U+102-103,U+110-111,U+128-129,U+168-169,U+1A0-1A1,U+1AF-1B0,U+300-301,U+303-304,U+308-309,U+323,U+329,U+1EA0-1EF9,U+20AB}",
        "@font-face{font-display:swap;font-family:Roboto Flex;font-style:normal;font-weight:400;src:local(Roboto Flex Regular),local(Roboto Flex),url(/_fonts/roboto-flex-400-latin-ext.woff2) format(woff2);unicode-range:U+100-2BA,U+2BD-2C5,U+2C7-2CC,U+2CE-2D7,U+2DD-2FF,U+304,U+308,U+329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}",
        "@font-face{font-display:swap;font-family:Roboto Flex;font-style:normal;font-weight:400;src:local(Roboto Flex Regular),local(Roboto Flex),url(/_fonts/roboto-flex-400-latin.woff2) format(woff2);unicode-range:U+0-FF,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+304,U+308,U+329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}",
      ]
    `)
    expect(extractFontFaces('Roboto Mono', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:Roboto Mono;font-style:normal;font-weight:400;src:local(Roboto Mono Regular),local(Roboto Mono),url(/_fonts/roboto-mono-400-cyrillic-ext.woff2) format(woff2);unicode-range:U+460-52F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F}",
        "@font-face{font-display:swap;font-family:Roboto Mono;font-style:italic;font-weight:400;src:local(Roboto Mono Regular Italic),local(Roboto Mono Italic),url(/_fonts/roboto-mono-400-italic-cyrillic-ext.woff2) format(woff2);unicode-range:U+460-52F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F}",
        "@font-face{font-display:swap;font-family:Roboto Mono;font-style:normal;font-weight:400;src:local(Roboto Mono Regular),local(Roboto Mono),url(/_fonts/roboto-mono-400-cyrillic.woff2) format(woff2);unicode-range:U+301,U+400-45F,U+490-491,U+4B0-4B1,U+2116}",
        "@font-face{font-display:swap;font-family:Roboto Mono;font-style:italic;font-weight:400;src:local(Roboto Mono Regular Italic),local(Roboto Mono Italic),url(/_fonts/roboto-mono-400-italic-cyrillic.woff2) format(woff2);unicode-range:U+301,U+400-45F,U+490-491,U+4B0-4B1,U+2116}",
        "@font-face{font-display:swap;font-family:Roboto Mono;font-style:normal;font-weight:400;src:local(Roboto Mono Regular),local(Roboto Mono),url(/_fonts/roboto-mono-400-greek.woff2) format(woff2);unicode-range:U+370-377,U+37A-37F,U+384-38A,U+38C,U+38E-3A1,U+3A3-3FF}",
        "@font-face{font-display:swap;font-family:Roboto Mono;font-style:italic;font-weight:400;src:local(Roboto Mono Regular Italic),local(Roboto Mono Italic),url(/_fonts/roboto-mono-400-italic-greek.woff2) format(woff2);unicode-range:U+370-377,U+37A-37F,U+384-38A,U+38C,U+38E-3A1,U+3A3-3FF}",
        "@font-face{font-display:swap;font-family:Roboto Mono;font-style:normal;font-weight:400;src:local(Roboto Mono Regular),local(Roboto Mono),url(/_fonts/roboto-mono-400-vietnamese.woff2) format(woff2);unicode-range:U+102-103,U+110-111,U+128-129,U+168-169,U+1A0-1A1,U+1AF-1B0,U+300-301,U+303-304,U+308-309,U+323,U+329,U+1EA0-1EF9,U+20AB}",
        "@font-face{font-display:swap;font-family:Roboto Mono;font-style:italic;font-weight:400;src:local(Roboto Mono Regular Italic),local(Roboto Mono Italic),url(/_fonts/roboto-mono-400-italic-vietnamese.woff2) format(woff2);unicode-range:U+102-103,U+110-111,U+128-129,U+168-169,U+1A0-1A1,U+1AF-1B0,U+300-301,U+303-304,U+308-309,U+323,U+329,U+1EA0-1EF9,U+20AB}",
        "@font-face{font-display:swap;font-family:Roboto Mono;font-style:normal;font-weight:400;src:local(Roboto Mono Regular),local(Roboto Mono),url(/_fonts/roboto-mono-400-latin-ext.woff2) format(woff2);unicode-range:U+100-2BA,U+2BD-2C5,U+2C7-2CC,U+2CE-2D7,U+2DD-2FF,U+304,U+308,U+329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}",
        "@font-face{font-display:swap;font-family:Roboto Mono;font-style:italic;font-weight:400;src:local(Roboto Mono Regular Italic),local(Roboto Mono Italic),url(/_fonts/roboto-mono-400-italic-latin-ext.woff2) format(woff2);unicode-range:U+100-2BA,U+2BD-2C5,U+2C7-2CC,U+2CE-2D7,U+2DD-2FF,U+304,U+308,U+329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}",
        "@font-face{font-display:swap;font-family:Roboto Mono;font-style:normal;font-weight:400;src:local(Roboto Mono Regular),local(Roboto Mono),url(/_fonts/roboto-mono-400-latin.woff2) format(woff2);unicode-range:U+0-FF,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+304,U+308,U+329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}",
        "@font-face{font-display:swap;font-family:Roboto Mono;font-style:italic;font-weight:400;src:local(Roboto Mono Regular Italic),local(Roboto Mono Italic),url(/_fonts/roboto-mono-400-italic-latin.woff2) format(woff2);unicode-range:U+0-FF,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+304,U+308,U+329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}",
      ]
    `)
  })

  it('generates inlined font face rules for `google` provider', async () => {
    const html = await $fetch<string>('/providers/google')
    const poppins = extractFontFaces('Poppins', html)
    const raleway = extractFontFaces('Raleway', html)
    const press = extractFontFaces('Press Start 2P', html)
    expect(poppins.length).toMatchInlineSnapshot(`4`)
    // No `@font-face` is generated for second/fallback fonts
    expect(raleway.length).toMatchInlineSnapshot(`0`)
    expect(poppins[0]).toMatchInlineSnapshot(`"@font-face{font-display:swap;font-family:Poppins;font-style:italic;font-weight:400;src:local(Poppins Regular Italic),local(Poppins Italic),url(/_fonts/poppins-400-italic-latin-ext.woff2) format(woff2);unicode-range:U+100-2BA,U+2BD-2C5,U+2C7-2CC,U+2CE-2D7,U+2DD-2FF,U+304,U+308,U+329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}"`)
    expect(press).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:Press Start 2P;font-style:normal;font-weight:400;src:local(Press Start 2P Regular),local(Press Start 2P),url(/_fonts/press-start-2p-400-cyrillic-ext.woff2) format(woff2);unicode-range:U+460-52F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F}",
        "@font-face{font-display:swap;font-family:Press Start 2P;font-style:normal;font-weight:400;src:local(Press Start 2P Regular),local(Press Start 2P),url(/_fonts/press-start-2p-400-cyrillic.woff2) format(woff2);unicode-range:U+301,U+400-45F,U+490-491,U+4B0-4B1,U+2116}",
        "@font-face{font-display:swap;font-family:Press Start 2P;font-style:normal;font-weight:400;src:local(Press Start 2P Regular),local(Press Start 2P),url(/_fonts/press-start-2p-400-greek.woff2) format(woff2);unicode-range:U+370-377,U+37A-37F,U+384-38A,U+38C,U+38E-3A1,U+3A3-3FF}",
        "@font-face{font-display:swap;font-family:Press Start 2P;font-style:normal;font-weight:400;src:local(Press Start 2P Regular),local(Press Start 2P),url(/_fonts/press-start-2p-400-latin-ext.woff2) format(woff2);unicode-range:U+100-2BA,U+2BD-2C5,U+2C7-2CC,U+2CE-2D7,U+2DD-2FF,U+304,U+308,U+329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}",
        "@font-face{font-display:swap;font-family:Press Start 2P;font-style:normal;font-weight:400;src:local(Press Start 2P Regular),local(Press Start 2P),url(/_fonts/press-start-2p-400-latin.woff2) format(woff2);unicode-range:U+0-FF,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+304,U+308,U+329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}",
      ]
    `)
  })

  it('generates inlined font face rules for `npm` provider', async () => {
    const html = await $fetch<string>('/providers/npm')
    expect(extractFontFaces('Cal Sans', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:Cal Sans;font-style:normal;font-weight:400;src:local(Cal Sans Regular),local(Cal Sans),url(/_fonts/cal-sans-400-vietnamese.woff2) format(woff2);unicode-range:U+102-103,U+110-111,U+128-129,U+168-169,U+1A0-1A1,U+1AF-1B0,U+300-301,U+303-304,U+308-309,U+323,U+329,U+1EA0-1EF9,U+20AB}",
        "@font-face{font-display:swap;font-family:Cal Sans;font-style:normal;font-weight:400;src:local(Cal Sans Regular),local(Cal Sans),url(/_fonts/cal-sans-400-latin-ext.woff2) format(woff2);unicode-range:U+100-2BA,U+2BD-2C5,U+2C7-2CC,U+2CE-2D7,U+2DD-2FF,U+304,U+308,U+329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}",
        "@font-face{font-display:swap;font-family:Cal Sans;font-style:normal;font-weight:400;src:local(Cal Sans Regular),local(Cal Sans),url(/_fonts/cal-sans-400-latin.woff2) format(woff2);unicode-range:U+0-FF,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+304,U+308,U+329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}",
      ]
    `)
  })

  it('should allow overriding providers with `none`', async () => {
    const html = await $fetch<string>('/providers/none')
    expect(extractFontFaces('Custom Font', html)).toMatchInlineSnapshot(`[]`)
  })

  it('should allow defining custom providers (using unifont)', async () => {
    const html = await $fetch<string>('/providers/custom')
    expect(extractFontFaces('SomeFontFromCustomProvider', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:SomeFontFromCustomProvider;src:url(/some-font.woff2) format(woff2)}",
      ]
    `)
  })

  it('should allow defining custom providers (using legacy syntax)', async () => {
    const html = await $fetch<string>('/providers/custom')
    expect(extractFontFaces('SomeFontFromLegacyCustomProvider', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:SomeFontFromLegacyCustomProvider;src:url(/some-font.woff2) format(woff2)}",
      ]
    `)
  })
})

describe('features', () => {
  it('should allow manual overrides, bypassing providers', async () => {
    const html = await $fetch<string>('/overrides')
    expect(extractFontFaces('MyCustom', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:MyCustom;src:url(/custom-font.woff2) format(woff2)}",
      ]
    `)
  })

  it('should allow globally registered font', async () => {
    const html = await $fetch<string>('/')
    expect(extractFontFaces('CustomGlobal', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:CustomGlobal;src:url(/font-global.woff2) format(woff2)}",
      ]
    `)
  })

  it('should generate font fallbacks automatically', async () => {
    const html = await $fetch<string>('/fallbacks')
    expect(extractFontFaces('Lato Fallback: Arial', html)).toMatchInlineSnapshot(`
      [
        "@font-face{ascent-override:101.035%;descent-override:21.8038%;font-family:Lato Fallback: Arial;line-gap-override:0%;size-adjust:97.6894%;src:local(Arial)}",
      ]
    `)
    expect(extractFontFaces('Nunito Fallback: Arial', html)).toMatchInlineSnapshot(`
      [
        "@font-face{ascent-override:99.7134%;descent-override:34.8159%;font-family:Nunito Fallback: Arial;line-gap-override:0%;size-adjust:101.391%;src:local(Arial)}",
      ]
    `)
  })

  it('should allow overriding font fallbacks through configuration', async () => {
    const html = await $fetch<string>('/fallbacks')
    expect(extractFontFaces('Oswald Fallback: Times New Roman', html)).toMatchInlineSnapshot(`
      [
        "@font-face{ascent-override:133.514%;descent-override:32.3433%;font-family:Oswald Fallback: Times New Roman;line-gap-override:0%;size-adjust:89.3538%;src:local(Times New Roman)}",
      ]
    `)
    expect(extractFontFaces('Fredoka Fallback: Tahoma', html)).toMatchInlineSnapshot(`
      [
        "@font-face{ascent-override:96.06%;descent-override:23.2753%;font-family:Fredoka Fallback: Tahoma;line-gap-override:0%;size-adjust:101.395%;src:local(Tahoma)}",
      ]
    `)
  })

  it('only processes css variables prefixed with --font by default', async () => {
    const html = await $fetch<string>('/css-variable')
    expect(extractFontFaces('Sigmar', html)).toMatchInlineSnapshot(`[]`)
  })

  it('adds preload links to the HTML with locally scoped rules', async () => {
    const html = await $fetch<string>('/providers/local')
    expect(extractPreloadLinks(html)).toContain('/custom-font.woff2')
  })

  it('adds preload links for global fonts but not for subsetted fonts in global CSS', async () => {
    const html = await $fetch<string>('/')
    expect(extractPreloadLinks(html).sort()).toMatchInlineSnapshot(`
      [
        "/font-global.woff2",
      ]
    `)
  })

  it('only preloads fonts used by the rendered route', async () => {
    const html = await $fetch<string>('/providers/adobe')
    expect(extractPreloadLinks(html).sort()).toMatchInlineSnapshot(`
      [
        "/_fonts/aleo-400-italic.woff2",
        "/_fonts/barlow-semi-condensed-400.woff2",
        "/font-global.woff2",
      ]
    `)
  })
})
