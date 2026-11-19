import { describe, expect, it } from 'vitest'

import { resolveInlineFontURLs } from '../src/assets.ts'

const placeholders = new Map([['__VITE_ASSET__abc123__', '_nuxt/fonts/anton-400.woff2']])
const publicURLs = new Map([['/foo/_nuxt/fonts/anton-400.woff2', '/_nuxt/fonts/anton-400.woff2']])

function resolve(css: string) {
  return resolveInlineFontURLs(css, { placeholders, publicURLs })
}

describe('inline font URLs', () => {
  it('resolves an emitted font placeholder to a root-relative URL', () => {
    expect(resolve('src:url(__VITE_ASSET__abc123__)'))
      .toBe('src:url(/_nuxt/fonts/anton-400.woff2)')
  })

  it('removes the build-time base URL from a font rendered outside the bundle', () => {
    expect(resolve('src:url("/foo/_nuxt/fonts/anton-400.woff2")'))
      .toBe('src:url("/_nuxt/fonts/anton-400.woff2")')
  })

  it('leaves other font URLs alone', () => {
    const css = 'src:url(/custom-font.woff2),url("/custom-font.woff2"),url(https://example.com/a.woff2),url(//example.com/b.woff2)'

    expect(resolve(css)).toBe(css)
  })

  it('leaves a placeholder it cannot resolve alone', () => {
    expect(resolve('src:url(__VITE_ASSET__missing__)'))
      .toBe('src:url(__VITE_ASSET__missing__)')
  })
})
