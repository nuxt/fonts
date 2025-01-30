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
    expect(barlow.length).toMatchInlineSnapshot(`8`)
    expect(barlow[0]).toMatchInlineSnapshot(`"@font-face{font-family:Barlow;src:local("Barlow Regular Italic"),local("Barlow Italic"),url(../_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;font-weight:400;font-style:italic}"`)
  })
})
