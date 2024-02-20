import { describe, expect, it } from 'vitest'
import { FontFamilyInjectionPlugin } from '../src/plugins/transform'

describe('parsing', () => {
  it('should add declarations for `font-family`', async () => {
    expect(await transform(`:root { font-family: 'CustomFont' }`))
      .toMatchInlineSnapshot(`
        "@font-face {
          font-family: 'CustomFont';
          src: url("/customfont.woff2") format(woff2);
          font-display: swap;
        }
        :root { font-family: 'CustomFont' }"
      `)
  })

  it('should skip processing declarations within `@font-face`', async () => {
    expect(await transform(`@font-face { font-family: 'CustomFont' }`))
      .toMatchInlineSnapshot(`undefined`)
  })

  it('should ignore any @font-face already in scope', async () => {
    expect(await transform([
      `@font-face { font-family: 'ScopedFont'; src: local("ScopedFont") }`,
      `:root { font-family: 'ScopedFont' }`,
      `:root { font-family: 'CustomFont' }`,
    ].join('\n')))
      .toMatchInlineSnapshot(`
        "@font-face {
          font-family: 'CustomFont';
          src: url("/customfont.woff2") format(woff2);
          font-display: swap;
        }
        @font-face { font-family: 'ScopedFont'; src: local("ScopedFont") }
        :root { font-family: 'ScopedFont' }
        :root { font-family: 'CustomFont' }"
      `)
  })
})

const slugify = (str: string) => str.toLowerCase().replace(/[^\d\w]/g, '-')
async function transform (css: string) {
  const plugin = FontFamilyInjectionPlugin({
    resolveFontFace: (family) => ({ src: `/${slugify(family)}.woff2` })
  }).raw({}, { framework: 'vite' }) as any

  const result = await plugin.transform(css)
  return result?.code
}
