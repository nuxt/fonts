import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

import { extractFontFaces } from '../utils'

await setup({
  rootDir: fileURLToPath(new URL('../../playgrounds/unocss', import.meta.url)),
})

describe('unocss features', () => {
  it('supports `@unocss/nuxt`', async () => {
    const html = await $fetch<string>('/')
    const cssFile = html.match(/rel="stylesheet" href="(\/_nuxt\/entry\.[^"]+\.css)"/)![1]!
    const css = await $fetch<string>(cssFile)
    const barlow = extractFontFaces('Barlow', css)
    expect(barlow.length).toMatchInlineSnapshot(`6`)
    expect(barlow[0]).toMatchInlineSnapshot(`"@font-face{font-display:swap;font-family:Barlow;font-style:italic;font-weight:400;src:local(Barlow Regular Italic),local(Barlow Italic),url(../_fonts/file.woff2) format(woff2);unicode-range:U+102-103,U+110-111,U+128-129,U+168-169,U+1A0-1A1,U+1AF-1B0,U+300-301,U+303-304,U+308-309,U+323,U+329,U+1EA0-1EF9,U+20AB}"`)
  })
})
