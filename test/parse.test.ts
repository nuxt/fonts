import { describe, expect, it } from 'vitest'
import { FontFamilyInjectionPlugin } from '../src/plugins/transform'

describe('parsing', () => {
  it('should declarations within `@font-face`', async () => {
    expect(await transform(`@font-face { font-family: 'CustomFont' }`))
      .toMatchInlineSnapshot(`undefined`)
  })

  it('should add declarations for `font-family`', async () => {
    expect(await transform(`:root { font-family: 'CustomFont' }`))
      .toMatchInlineSnapshot(`
        "@font-face {
          font-family: 'CustomFont';
          src: url("/font.woff2") format(woff2);
          font-display: swap;
        }
        :root { font-family: 'CustomFont' }"
      `)
  })
})


async function transform (css: string) {
  const plugin = FontFamilyInjectionPlugin({ resolveFontFace: () => ({ src: '/font.woff2' }) })
    .raw({}, { framework: 'vite' }) as any

  const result = await plugin.transform(css)
  return result?.code
}
