import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

import { extractFontFaces } from '../utils'

await setup({
  rootDir: fileURLToPath(new URL('../../playgrounds/tailwindcss', import.meta.url)),
})

describe('tailwindcss features', () => {
  it('supports `tailwindcss`', async () => {
    const html = await $fetch<string>('/')
    expect(extractFontFaces('Anton', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:Anton;font-style:normal;font-weight:400;src:local(Anton Regular),local(Anton),url(/_fonts/anton-400-vietnamese.woff2) format(woff2);unicode-range:U+102-103,U+110-111,U+128-129,U+168-169,U+1A0-1A1,U+1AF-1B0,U+300-301,U+303-304,U+308-309,U+323,U+329,U+1EA0-1EF9,U+20AB}",
        "@font-face{font-display:swap;font-family:Anton;font-style:normal;font-weight:400;src:local(Anton Regular),local(Anton),url(/_fonts/anton-400-latin-ext.woff2) format(woff2);unicode-range:U+100-2BA,U+2BD-2C5,U+2C7-2CC,U+2CE-2D7,U+2DD-2FF,U+304,U+308,U+329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}",
        "@font-face{font-display:swap;font-family:Anton;font-style:normal;font-weight:400;src:local(Anton Regular),local(Anton),url(/_fonts/anton-400-latin.woff2) format(woff2);unicode-range:U+0-FF,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+304,U+308,U+329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}",
      ]
    `)
  })
})
