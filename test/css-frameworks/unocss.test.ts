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
    expect(barlow[0]).toMatchInlineSnapshot(`"@font-face{font-family:Barlow;src:local("Barlow Regular Italic"),local("Barlow Italic"),url(../_fonts/file.woff) format(woff);font-display:swap;font-weight:400;font-style:italic}"`)
  })
})
