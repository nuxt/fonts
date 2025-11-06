import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

import { extractFontFaces } from '../utils'

await setup({
  rootDir: fileURLToPath(new URL('../../playgrounds/scss', import.meta.url)),
})

describe('scss features', () => {
  it('supports external files and scss syntax', async () => {
    const html = await $fetch<string>('/')
    expect(extractFontFaces('Anta', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-family:Anta;src:local("Anta Regular"),local("Anta"),url(/_fonts/file.woff) format(woff);font-display:swap;font-weight:400;font-style:normal}",
        "@font-face{font-family:Anta;src:local("Anta Regular"),local("Anta"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;font-weight:400;font-style:normal}",
        "@font-face{font-family:Anta;src:local("Anta Regular"),local("Anta"),url(/_fonts/file.woff2) format(woff2);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;font-weight:400;font-style:normal}",
      ]
    `)
  })
},
)
