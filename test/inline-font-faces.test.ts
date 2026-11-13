import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const inline = vi.hoisted(() => ({ css: '', applyRuntimeBase: true }))
vi.mock('#nuxt-fonts-inline', () => inline)

const { hoistFontFaces } = await import('../src/runtime/nitro/inline-font-faces.ts')

function render(head: string[], base = '/') {
  const html = { head }
  hoistFontFaces(html, base)
  return html.head
}

const rule = '@font-face{font-family:MyCustom;src:url(/_fonts/custom.woff2) format(woff2)}'

describe('inline font faces', () => {
  beforeEach(() => {
    inline.css = ''
    inline.applyRuntimeBase = true
  })

  afterEach(() => {
    inline.css = ''
    inline.applyRuntimeBase = true
  })

  it('should remove a repeated font face from a later stylesheet', () => {
    expect(render([`<style>${rule}</style>`, `<style>${rule}a{color:red}</style>`])).toEqual([
      `<style>${rule}</style>`,
      '<style>a{color:red}</style>',
    ])
  })

  it('should keep a font face that only applies within an at-rule', () => {
    const head = render([`<style>${rule}</style>`, `<style>@media print{${rule}}</style>`])
    expect(head[1]).toBe(`<style>@media print{${rule}}</style>`)
  })

  it('should treat a font face after a closed at-rule as top level', () => {
    const other = '@font-face{font-family:Other;src:url(/_fonts/other.woff2) format(woff2)}'
    const head = render([`<style>${rule}</style>`, `<style>@media print{${other}}${rule}${other}</style>`])
    expect(head[1]).toBe(`<style>@media print{${other}}${other}</style>`)
  })

  it('should resolve hoisted font URLs against the base given at runtime', () => {
    inline.css = '@font-face{src:url(/_nuxt/fonts/a.woff2),url("/custom.woff2"),url(https://example.com/b.woff2)}'

    expect(render([], 'https://cdn.example.com/')).toEqual([
      '<style>@font-face{src:url(https://cdn.example.com/_nuxt/fonts/a.woff2),url("https://cdn.example.com/custom.woff2"),url(https://example.com/b.woff2)}</style>',
    ])
    expect(render([], '/foo/')).toEqual([
      '<style>@font-face{src:url(/foo/_nuxt/fonts/a.woff2),url("/foo/custom.woff2"),url(https://example.com/b.woff2)}</style>',
    ])
  })

  it('should leave hoisted font URLs alone when the build resolves them', () => {
    inline.applyRuntimeBase = false
    inline.css = '@font-face{src:url(/_fonts/a.woff2)}'

    expect(render([], 'https://cdn.example.com/')).toEqual(['<style>@font-face{src:url(/_fonts/a.woff2)}</style>'])
  })
})
