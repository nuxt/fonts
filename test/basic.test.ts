import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
})

describe('providers', async () => {
  it('generates inlined font face rules for `local` provider', async () => {
    const html = await $fetch('/providers/local')
    expect(extractFontFaces('Custom Font', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Custom Font;src:url(/custom-font.woff2) format(woff2);font-display:swap;font-weight:400;font-style:normal}",
      ]
    `)
  })

  it('generates inlined font face rules for `adobe` provider', async () => {
    const html = await $fetch('/providers/adobe')
    expect(extractFontFaces('Aleo', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Aleo;src:local("Aleo Bold Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.otf) format(opentype);font-display:auto;font-weight:700;font-style:italic}",
        "@font-face{font-family:Aleo;src:local("Aleo Bold"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.otf) format(opentype);font-display:auto;font-weight:700;font-style:normal}",
        "@font-face{font-family:Aleo;src:local("Aleo Regular Italic"),local("Aleo Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.otf) format(opentype);font-display:auto;font-weight:400;font-style:italic}",
        "@font-face{font-family:Aleo;src:local("Aleo Regular"),local("Aleo"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.otf) format(opentype);font-display:auto;font-weight:400;font-style:normal}",
      ]
    `)
    expect(extractFontFaces('Barlow Semi Condensed', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Barlow Semi Condensed;src:local("Barlow Semi Condensed Regular"),local("Barlow Semi Condensed"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.otf) format(opentype);font-display:auto;font-weight:400;font-style:normal}",
        "@font-face{font-family:Barlow Semi Condensed;src:local("Barlow Semi Condensed Bold Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.otf) format(opentype);font-display:auto;font-weight:700;font-style:italic}",
        "@font-face{font-family:Barlow Semi Condensed;src:local("Barlow Semi Condensed Regular Italic"),local("Barlow Semi Condensed Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.otf) format(opentype);font-display:auto;font-weight:400;font-style:italic}",
        "@font-face{font-family:Barlow Semi Condensed;src:local("Barlow Semi Condensed Bold"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.otf) format(opentype);font-display:auto;font-weight:700;font-style:normal}",
      ]
    `)
  })


  it('generates inlined font face rules for `bunny` provider', async () => {
    const html = await $fetch('/providers/bunny')
    expect(extractFontFaces('Abel', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Abel;src:local("Abel Regular"),local("Abel"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:400;font-style:normal}",
      ]
    `)
  })

  it('generates inlined font face rules for `fontshare` provider', async () => {
    const html = await $fetch('/providers/fontshare')
    expect(extractFontFaces('Satoshi', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Satoshi;src:local("Satoshi Regular"),local("Satoshi"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(truetype);font-display:swap;font-weight:400;font-style:normal}",
      ]
    `)
  })

  it('generates inlined font face rules for `fontsource` provider', async () => {
    const html = await $fetch('/providers/fontsource')
    expect(extractFontFaces('Roboto Mono', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0460-052F,U+1C80-1C88,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F;font-weight:100 700;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular"),local("Roboto Mono"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0460-052F,U+1C80-1C88,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F;font-weight:400;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable Italic"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0460-052F,U+1C80-1C88,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F;font-weight:100 700;font-style:italic}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular Italic"),local("Roboto Mono Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0460-052F,U+1C80-1C88,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F;font-weight:400;font-style:italic}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116;font-weight:100 700;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular"),local("Roboto Mono"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116;font-weight:400;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable Italic"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116;font-weight:100 700;font-style:italic}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular Italic"),local("Roboto Mono Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116;font-weight:400;font-style:italic}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF;font-weight:100 700;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular"),local("Roboto Mono"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF;font-weight:400;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable Italic"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF;font-weight:100 700;font-style:italic}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular Italic"),local("Roboto Mono Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF;font-weight:400;font-style:italic}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;font-weight:100 700;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular"),local("Roboto Mono"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;font-weight:400;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable Italic"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;font-weight:100 700;font-style:italic}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular Italic"),local("Roboto Mono Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;font-weight:400;font-style:italic}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:100 700;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular"),local("Roboto Mono"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:400;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable Italic"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:100 700;font-style:italic}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular Italic"),local("Roboto Mono Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:400;font-style:italic}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:100 700;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular"),local("Roboto Mono"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:400;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable Italic"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:100 700;font-style:italic}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular Italic"),local("Roboto Mono Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:400;font-style:italic}",
      ]
    `)
  })

  it('generates inlined font face rules for `google` provider', async () => {
    const html = await $fetch('/providers/google')
    const poppins = extractFontFaces('Poppins', html)
    const raleway = extractFontFaces('Raleway', html)
    const press = extractFontFaces('Press Start 2P', html)
    expect(poppins.length).toMatchInlineSnapshot(`6`)
    // No `@font-face` is generated for second/fallback fonts
    expect(raleway.length).toMatchInlineSnapshot(`0`)
    expect(poppins[0]).toMatchInlineSnapshot(`"@font-face{font-family:Poppins;src:local("Poppins Regular Italic"),local("Poppins Italic"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:400;font-style:italic}"`)
    expect(press).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:"Press Start 2P";src:local("Press Start 2P Regular"),local("Press Start 2P"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0460-052F,U+1C80-1C88,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F;font-weight:400;font-style:normal}",
        "@font-face{font-family:"Press Start 2P";src:local("Press Start 2P Regular"),local("Press Start 2P"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116;font-weight:400;font-style:normal}",
        "@font-face{font-family:"Press Start 2P";src:local("Press Start 2P Regular"),local("Press Start 2P"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF;font-weight:400;font-style:normal}",
        "@font-face{font-family:"Press Start 2P";src:local("Press Start 2P Regular"),local("Press Start 2P"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:400;font-style:normal}",
        "@font-face{font-family:"Press Start 2P";src:local("Press Start 2P Regular"),local("Press Start 2P"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:400;font-style:normal}",
        "@font-face{font-family:"Press Start 2P";src:local("Press Start 2P Regular"),local("Press Start 2P"),url(/_fonts/file.woff) format(woff);font-display:swap;font-weight:400;font-style:normal}",
      ]
    `)
  })

  it('should allow overriding providers with `none`', async () => {
    const html = await $fetch('/providers/none')
    expect(extractFontFaces('Custom Font', html)).toMatchInlineSnapshot(`[]`)
  })

  it('should allow defining custom providers', async () => {
    const html = await $fetch('/providers/custom')
    expect(extractFontFaces('SomeFontFromCustomProvider', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:SomeFontFromCustomProvider;src:url(/some-font.woff2) format(woff2);font-display:swap}",
      ]
    `)
  })
})

describe('features', () => {
  it('should allow manual overrides, bypassing providers', async () => {
    const html = await $fetch('/overrides')
    expect(extractFontFaces('MyCustom', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:MyCustom;src:url(/custom-font.woff2) format(woff2);font-display:swap}",
      ]
    `)
  })

  it('should allow globally registered font', async () => {
    const html = await $fetch('/')
    expect(extractFontFaces('CustomGlobal', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:CustomGlobal;src:url(/font-global.woff2) format(woff2)}",
      ]
    `)
  })

  it('should generate font fallbacks automatically', async () => {
    const html = await $fetch('/fallbacks')
    expect(extractFontFaces('Lato Fallback: Arial', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:"Lato Fallback: Arial";src:local("Arial");size-adjust:97.6894%;ascent-override:101.0345%;descent-override:21.8038%;line-gap-override:0%}",
      ]
    `)
    expect(extractFontFaces('Nunito Fallback: Arial', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:"Nunito Fallback: Arial";src:local("Arial");size-adjust:101.3906%;ascent-override:99.7134%;descent-override:34.8159%;line-gap-override:0%}",
      ]
    `)
  })

  it('should allow overriding font fallbacks through configuration', async () => {
    const html = await $fetch('/fallbacks')
    expect(extractFontFaces('Oswald Fallback: Times New Roman', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:"Oswald Fallback: Times New Roman";src:local("Times New Roman");size-adjust:89.3538%;ascent-override:133.5141%;descent-override:32.3433%;line-gap-override:0%}",
      ]
    `)
    expect(extractFontFaces('Fredoka Fallback: Tahoma', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:"Fredoka Fallback: Tahoma";src:local("Tahoma");size-adjust:101.395%;ascent-override:96.06%;descent-override:23.2753%;line-gap-override:0%}",
      ]
    `)
  })

  it('supports external files and scss syntax', async () => {
    const html = await $fetch('/preprocessors')
    expect(extractFontFaces('Anta', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Anta;src:local("Anta Regular"),local("Anta"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0302-0303,U+0305,U+0307-0308,U+0330,U+0391-03A1,U+03A3-03A9,U+03B1-03C9,U+03D1,U+03D5-03D6,U+03F0-03F1,U+03F4-03F5,U+2034-2037,U+2057,U+20D0-20DC,U+20E1,U+20E5-20EF,U+2102,U+210A-210E,U+2110-2112,U+2115,U+2119-211D,U+2124,U+2128,U+212C-212D,U+212F-2131,U+2133-2138,U+213C-2140,U+2145-2149,U+2190,U+2192,U+2194-21AE,U+21B0-21E5,U+21F1-21F2,U+21F4-2211,U+2213-2214,U+2216-22FF,U+2308-230B,U+2310,U+2319,U+231C-2321,U+2336-237A,U+237C,U+2395,U+239B-23B6,U+23D0,U+23DC-23E1,U+2474-2475,U+25AF,U+25B3,U+25B7,U+25BD,U+25C1,U+25CA,U+25CC,U+25FB,U+266D-266F,U+27C0-27FF,U+2900-2AFF,U+2B0E-2B11,U+2B30-2B4C,U+2BFE,U+FF5B,U+FF5D,U+1D400-1D7FF,U+1EE00-1EEFF;font-weight:400;font-style:normal}",
        "@font-face{font-family:Anta;src:local("Anta Regular"),local("Anta"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0001-000C,U+000E-001F,U+007F-009F,U+20DD-20E0,U+20E2-20E4,U+2150-218F,U+2190,U+2192,U+2194-2199,U+21AF,U+21E6-21F0,U+21F3,U+2218-2219,U+2299,U+22C4-22C6,U+2300-243F,U+2440-244A,U+2460-24FF,U+25A0-27BF,U+2800-28FF,U+2921-2922,U+2981,U+29BF,U+29EB,U+2B00-2BFF,U+4DC0-4DFF,U+FFF9-FFFB,U+10140-1018E,U+10190-1019C,U+101A0,U+101D0-101FD,U+102E0-102FB,U+10E60-10E7E,U+1D2C0-1D2D3,U+1D2E0-1D37F,U+1F000-1F0FF,U+1F100-1F1AD,U+1F1E6-1F1FF,U+1F30D-1F30F,U+1F315,U+1F31C,U+1F31E,U+1F320-1F32C,U+1F336,U+1F378,U+1F37D,U+1F382,U+1F393-1F39F,U+1F3A7-1F3A8,U+1F3AC-1F3AF,U+1F3C2,U+1F3C4-1F3C6,U+1F3CA-1F3CE,U+1F3D4-1F3E0,U+1F3ED,U+1F3F1-1F3F3,U+1F3F5-1F3F7,U+1F408,U+1F415,U+1F41F,U+1F426,U+1F43F,U+1F441-1F442,U+1F444,U+1F446-1F449,U+1F44C-1F44E,U+1F453,U+1F46A,U+1F47D,U+1F4A3,U+1F4B0,U+1F4B3,U+1F4B9,U+1F4BB,U+1F4BF,U+1F4C8-1F4CB,U+1F4D6,U+1F4DA,U+1F4DF,U+1F4E3-1F4E6,U+1F4EA-1F4ED,U+1F4F7,U+1F4F9-1F4FB,U+1F4FD-1F4FE,U+1F503,U+1F507-1F50B,U+1F50D,U+1F512-1F513,U+1F53E-1F54A,U+1F54F-1F5FA,U+1F610,U+1F650-1F67F,U+1F687,U+1F68D,U+1F691,U+1F694,U+1F698,U+1F6AD,U+1F6B2,U+1F6B9-1F6BA,U+1F6BC,U+1F6C6-1F6CF,U+1F6D3-1F6D7,U+1F6E0-1F6EA,U+1F6F0-1F6F3,U+1F6F7-1F6FC,U+1F700-1F7FF,U+1F800-1F80B,U+1F810-1F847,U+1F850-1F859,U+1F860-1F887,U+1F890-1F8AD,U+1F8B0-1F8B1,U+1F900-1F90B,U+1F93B,U+1F946,U+1F984,U+1F996,U+1F9E9,U+1FA00-1FA6F,U+1FA70-1FA7C,U+1FA80-1FA88,U+1FA90-1FABD,U+1FABF-1FAC5,U+1FACE-1FADB,U+1FAE0-1FAE8,U+1FAF0-1FAF8,U+1FB00-1FBFF;font-weight:400;font-style:normal}",
        "@font-face{font-family:Anta;src:local("Anta Regular"),local("Anta"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:400;font-style:normal}",
        "@font-face{font-family:Anta;src:local("Anta Regular"),local("Anta"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:400;font-style:normal}",
        "@font-face{font-family:Anta;src:local("Anta Regular"),local("Anta"),url(/_fonts/file.woff) format(woff);font-display:swap;font-weight:400;font-style:normal}",
      ]
    `)
  })

  it('supports `@nuxtjs/tailwindcss`', async () => {
    const html = await $fetch('/tailwindcss')
    expect(extractFontFaces('Anton', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Anton;src:local("Anton Regular"),local("Anton"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;font-weight:400;font-style:normal}",
        "@font-face{font-family:Anton;src:local("Anton Regular"),local("Anton"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:400;font-style:normal}",
        "@font-face{font-family:Anton;src:local("Anton Regular"),local("Anton"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:400;font-style:normal}",
        "@font-face{font-family:Anton;src:local("Anton Regular"),local("Anton"),url(/_fonts/file.woff) format(woff);font-display:swap;font-weight:400;font-style:normal}",
      ]
    `)
  })

  it('supports `@unocss/nuxt`', async () => {
    const html = await $fetch('/unocss')
    const cssFile = html.match(/rel="stylesheet" href="(\/_nuxt\/entry\.[^"]+\.css)"/)?.[1]
    const css = await $fetch(cssFile)
    const barlow = extractFontFaces('Barlow', css)
    expect(barlow.length).toMatchInlineSnapshot(`8`)
    expect(barlow[0]).toMatchInlineSnapshot(`"@font-face{font-family:Barlow;src:local("Barlow Regular Italic"),local("Barlow Italic"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;font-weight:400;font-style:italic}"`)
  })

  it('adds preload links to the HTML with locally scoped rules', async () => {
    const html = await $fetch('/providers/local')
    expect(extractPreloadLinks(html)).toMatchInlineSnapshot(`
      [
        "/file.woff2",
        "/custom-font.woff2",
      ]
    `)
  })

  it('adds preload links to the HTML with global CSS', async () => {
    const html = await $fetch('/unocss')
    expect(extractPreloadLinks(html)).toMatchInlineSnapshot(`
      [
        "/file.woff2",
      ]
    `)
  })
})

function extractFontFaces (fontFamily: string, html: string) {
  const matches = html.matchAll(new RegExp(`@font-face\\s*{[^}]*font-family:\\s*(?<quote>['"])?${fontFamily}\\k<quote>[^}]+}`, 'g'))
  return Array.from(matches, (match) => match[0]
    .replace(/(?<=['"(])(https?:\/\/[^/]+|\/_fonts)\/[^")]+(\.[^".)]+)(?=['")])/g, '$1/file$2')
    .replace(/(?<=['"(])(https?:\/\/[^/]+|\/_fonts)\/[^".)]+(?=['")])/g, '$1/file')
  )
}

function extractPreloadLinks (html?: string) {
  return (html?.match(/<link[^>]+rel="preload"[^>]+>/g) || []).map(link => link.match(/href="([^"]+)"/)?.[1]?.replace(/\/_fonts\/[^")]+(\.[^".)]+)$/g, '/file$1'))
}
