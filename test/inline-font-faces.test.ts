import { describe, expect, it, vi } from 'vitest'

vi.mock('#nuxt-fonts-inline', () => ({ css: '' }))
vi.mock('nitropack/runtime', () => ({ defineNitroPlugin: (plugin: unknown) => plugin }))

const { default: plugin } = await import('../src/runtime/nitro/inline-font-faces')

function render(head: string[]) {
  let hook: (html: { head: string[] }) => void
  ;(plugin as (nitro: unknown) => void)({
    hooks: { hook: (_: string, cb: typeof hook) => { hook = cb } },
  })
  const html = { head }
  hook!(html)
  return html.head
}

const rule = '@font-face{font-family:MyCustom;src:url(/_fonts/custom.woff2) format(woff2)}'

describe('inline font faces', () => {
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
})
