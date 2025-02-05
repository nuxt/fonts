import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

import { extractFontFaces, extractPreloadLinks } from './utils'

await setup({
  rootDir: fileURLToPath(new URL('../playgrounds/basic', import.meta.url)),
})

describe('providers', async () => {
  it('generates inlined font face rules for `local` provider', async () => {
    const html = await $fetch<string>('/providers/local')
    expect(extractFontFaces('Custom Font', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Custom Font;src:local("Custom Font Regular"),local("Custom Font"),url(/custom-font.woff2) format(woff2);font-display:swap;font-weight:400;font-style:normal}",
      ]
    `)
  })

  it('generates inlined font face rules for `adobe` provider', async () => {
    const html = await $fetch<string>('/providers/adobe')
    expect(extractFontFaces('Aleo', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Aleo;src:local("Aleo Regular Italic"),local("Aleo Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.otf) format(opentype);font-display:auto;font-weight:400;font-style:italic}",
        "@font-face{font-family:Aleo;src:local("Aleo Regular"),local("Aleo"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.otf) format(opentype);font-display:auto;font-weight:400;font-style:normal}",
      ]
    `)
    expect(extractFontFaces('Barlow Semi Condensed', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Barlow Semi Condensed;src:local("Barlow Semi Condensed Regular"),local("Barlow Semi Condensed"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.otf) format(opentype);font-display:auto;font-weight:400;font-style:normal}",
        "@font-face{font-family:Barlow Semi Condensed;src:local("Barlow Semi Condensed Regular Italic"),local("Barlow Semi Condensed Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.otf) format(opentype);font-display:auto;font-weight:400;font-style:italic}",
      ]
    `)
  })

  it('generates inlined font face rules for `bunny` provider', async () => {
    const html = await $fetch<string>('/providers/bunny')
    expect(extractFontFaces('Abel', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Abel;src:local("Abel Regular"),local("Abel"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:400;font-style:normal}",
      ]
    `)
  })

  it('generates inlined font face rules for `fontshare` provider', async () => {
    const html = await $fetch<string>('/providers/fontshare')
    expect(extractFontFaces('Satoshi', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Satoshi;src:local("Satoshi Regular"),local("Satoshi"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(truetype);font-display:swap;font-weight:400;font-style:normal}",
        "@font-face{font-family:Satoshi;src:local("Satoshi Regular Italic"),local("Satoshi Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(truetype);font-display:swap;font-weight:400;font-style:italic}",
      ]
    `)
  })

  it('generates inlined font face rules for `fontsource` provider', async () => {
    const html = await $fetch<string>('/providers/fontsource')
    expect(extractFontFaces('Roboto Flex', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Roboto Flex;src:local("Roboto Flex Variable"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F;font-weight:100 1000;font-style:normal}",
        "@font-face{font-family:Roboto Flex;src:local("Roboto Flex Regular"),local("Roboto Flex"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F;font-weight:400;font-style:normal}",
        "@font-face{font-family:Roboto Flex;src:local("Roboto Flex Variable"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116;font-weight:100 1000;font-style:normal}",
        "@font-face{font-family:Roboto Flex;src:local("Roboto Flex Regular"),local("Roboto Flex"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116;font-weight:400;font-style:normal}",
        "@font-face{font-family:Roboto Flex;src:local("Roboto Flex Variable"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF;font-weight:100 1000;font-style:normal}",
        "@font-face{font-family:Roboto Flex;src:local("Roboto Flex Regular"),local("Roboto Flex"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF;font-weight:400;font-style:normal}",
        "@font-face{font-family:Roboto Flex;src:local("Roboto Flex Variable"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;font-weight:100 1000;font-style:normal}",
        "@font-face{font-family:Roboto Flex;src:local("Roboto Flex Regular"),local("Roboto Flex"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;font-weight:400;font-style:normal}",
        "@font-face{font-family:Roboto Flex;src:local("Roboto Flex Variable"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:100 1000;font-style:normal}",
        "@font-face{font-family:Roboto Flex;src:local("Roboto Flex Regular"),local("Roboto Flex"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:400;font-style:normal}",
        "@font-face{font-family:Roboto Flex;src:local("Roboto Flex Variable"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:100 1000;font-style:normal}",
        "@font-face{font-family:Roboto Flex;src:local("Roboto Flex Regular"),local("Roboto Flex"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:400;font-style:normal}",
      ]
    `)
    expect(extractFontFaces('Roboto Mono', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F;font-weight:100 700;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular"),local("Roboto Mono"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F;font-weight:400;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable Italic"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F;font-weight:100 700;font-style:italic}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular Italic"),local("Roboto Mono Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F;font-weight:400;font-style:italic}",
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
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:100 700;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular"),local("Roboto Mono"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:400;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable Italic"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:100 700;font-style:italic}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular Italic"),local("Roboto Mono Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:400;font-style:italic}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:100 700;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular"),local("Roboto Mono"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:400;font-style:normal}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Variable Italic"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:100 700;font-style:italic}",
        "@font-face{font-family:Roboto Mono;src:local("Roboto Mono Regular Italic"),local("Roboto Mono Italic"),url(/_fonts/file.woff2) format(woff2),url(/_fonts/file.woff) format(woff),url(/_fonts/file.ttf) format(ttf);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:400;font-style:italic}",
      ]
    `)
  })

  it('generates inlined font face rules for `google` provider', async () => {
    const html = await $fetch<string>('/providers/google')
    const poppins = extractFontFaces('Poppins', html)
    const raleway = extractFontFaces('Raleway', html)
    const press = extractFontFaces('Press Start 2P', html)
    expect(poppins.length).toMatchInlineSnapshot(`6`)
    // No `@font-face` is generated for second/fallback fonts
    expect(raleway.length).toMatchInlineSnapshot(`0`)
    expect(poppins[0]).toMatchInlineSnapshot(`"@font-face{font-family:Poppins;src:local("Poppins Regular Italic"),local("Poppins Italic"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:400;font-style:italic}"`)
    expect(press).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:"Press Start 2P";src:local("Press Start 2P Regular"),local("Press Start 2P"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F;font-weight:400;font-style:normal}",
        "@font-face{font-family:"Press Start 2P";src:local("Press Start 2P Regular"),local("Press Start 2P"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116;font-weight:400;font-style:normal}",
        "@font-face{font-family:"Press Start 2P";src:local("Press Start 2P Regular"),local("Press Start 2P"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF;font-weight:400;font-style:normal}",
        "@font-face{font-family:"Press Start 2P";src:local("Press Start 2P Regular"),local("Press Start 2P"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:400;font-style:normal}",
        "@font-face{font-family:"Press Start 2P";src:local("Press Start 2P Regular"),local("Press Start 2P"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:400;font-style:normal}",
        "@font-face{font-family:"Press Start 2P";src:local("Press Start 2P Regular"),local("Press Start 2P"),url(/_fonts/file.woff) format(woff);font-display:swap;font-weight:400;font-style:normal}",
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
        "@font-face{font-family:SomeFontFromCustomProvider;src:url(/some-font.woff2) format(woff2);font-display:swap}",
      ]
    `)
  })

  it('should allow defining custom providers (using legacy syntax)', async () => {
    const html = await $fetch<string>('/providers/custom')
    expect(extractFontFaces('SomeFontFromLegacyCustomProvider', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:SomeFontFromLegacyCustomProvider;src:url(/some-font.woff2) format(woff2);font-display:swap}",
      ]
    `)
  })
})

describe('features', () => {
  it('should allow manual overrides, bypassing providers', async () => {
    const html = await $fetch<string>('/overrides')
    expect(extractFontFaces('MyCustom', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:MyCustom;src:url(/custom-font.woff2) format(woff2);font-display:swap}",
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
    const html = await $fetch<string>('/fallbacks')
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

  // TODO: Font defined in the global CSS is not being preloaded. Looks like a bug, needs investigation.
  it('adds preload links to the HTML with locally scoped rules', async () => {
    const html = await $fetch<string>('/providers/local')
    expect(extractPreloadLinks(html)).toMatchInlineSnapshot(`
      [
        "/custom-font.woff2",
      ]
    `)
  })

  // TODO: Font defined in the global CSS is not being preloaded. Looks like a bug, needs investigation.
  it.todo('adds preload links to the HTML with global CSS', async () => {
    const html = await $fetch<string>('/')
    expect(extractPreloadLinks(html)).toMatchInlineSnapshot(`
      [
        "/file.woff2",
      ]
    `)
  })
})
