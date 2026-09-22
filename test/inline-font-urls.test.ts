import { describe, expect, it } from 'vitest'

import { resolveInlineFontURLs } from '../src/assets'

const placeholders = new Map([['__VITE_ASSET__abc123__', '_nuxt/fonts/anton-400.woff2']])

function resolve(css: string, base: string) {
  return resolveInlineFontURLs(css, base, placeholders)
}

describe('inline font URLs', () => {
  it('resolves an emitted font placeholder against the base URL', () => {
    expect(resolve('src:url(__VITE_ASSET__abc123__)', '/foo/'))
      .toBe('src:url(/foo/_nuxt/fonts/anton-400.woff2)')
  })

  it('applies the base URL to an emitted font exactly once', () => {
    const resolved = resolve('src:url(__VITE_ASSET__abc123__)', '/foo/')

    expect(resolved).not.toContain('/foo/foo/')
  })

  it('resolves an emitted font placeholder against a CDN URL', () => {
    expect(resolve('src:url(__VITE_ASSET__abc123__)', 'https://cdn.example.com/'))
      .toBe('src:url(https://cdn.example.com/_nuxt/fonts/anton-400.woff2)')
  })

  it('resolves a root-relative font URL against the base URL', () => {
    expect(resolve('src:url(/custom-font.woff2)', '/foo/'))
      .toBe('src:url(/foo/custom-font.woff2)')
  })

  it('preserves the quoting of a root-relative font URL', () => {
    expect(resolve('src:url("/custom-font.woff2")', '/foo/'))
      .toBe('src:url("/foo/custom-font.woff2")')
  })

  it('leaves absolute and protocol-relative font URLs alone', () => {
    const css = 'src:url(https://example.com/a.woff2),url(//example.com/b.woff2)'

    expect(resolve(css, '/foo/')).toBe(css)
  })

  it('leaves a placeholder it cannot resolve alone', () => {
    expect(resolve('src:url(__VITE_ASSET__missing__)', '/foo/'))
      .toBe('src:url(__VITE_ASSET__missing__)')
  })
})
