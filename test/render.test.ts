import { describe, expect, it } from 'vitest'

import { generateFontFace } from '../src/css/render'

describe('rendering @font-face', () => {
  it('should add declarations for `font-family`', () => {
    const css = generateFontFace('Inter', {
      src: [{ name: 'Inter Var' }, { url: '/inter.woff2' }],
      weight: [400, 700],
    })
    expect(css).toMatchInlineSnapshot(`
      "@font-face {
        font-family: 'Inter';
        src: local("Inter Var"), url("/inter.woff2");
        font-display: swap;
        font-weight: 400 700;
      }"
    `)
  })
})
