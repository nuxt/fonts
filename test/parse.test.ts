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

  it('should handle multi word and unquoted font families', async () => {
    expect(await transform(`
    :root { font-family:Open Sans}
    :root { font-family: Open Sans, sans-serif }
    `))
      .toMatchInlineSnapshot(`
        "@font-face {
          font-family: "Open Sans Fallback: Times New Roman";
          src: local("Times New Roman");
          size-adjust: 115.3846%;
          ascent-override: 92.6335%;
          descent-override: 25.3906%;
          line-gap-override: 0%;
        }

        @font-face {
          font-family: 'Open Sans';
          src: url("/open-sans.woff2") format(woff2);
          font-display: swap;
        }

            :root { font-family:Open Sans, "Open Sans Fallback: Times New Roman"}
            :root { font-family: Open Sans, "Open Sans Fallback: Times New Roman", sans-serif }
            "
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

  it('should not insert font fallbacks if metrics cannot be resolved', async () => {
    expect(await transform(`:root { font-family: 'CustomFont', "OtherFont", sans-serif }`))
      .toMatchInlineSnapshot(`
        "@font-face {
          font-family: 'CustomFont';
          src: url("/customfont.woff2") format(woff2);
          font-display: swap;
        }
        :root { font-family: 'CustomFont', "OtherFont", sans-serif }"
      `)
  })

  it('should add `@font-face` declarations with metrics', async () => {
    expect(await transform(`:root { font-family: 'Poppins', 'Arial', sans-serif }`))
      .toMatchInlineSnapshot(`
        "@font-face {
          font-family: "Poppins Fallback: Arial";
          src: local("Arial");
          size-adjust: 112.1577%;
          ascent-override: 93.6182%;
          descent-override: 31.2061%;
          line-gap-override: 8.916%;
        }

        @font-face {
          font-family: "Poppins Fallback: Times New Roman";
          src: local("Times New Roman");
          size-adjust: 123.0769%;
          ascent-override: 85.3125%;
          descent-override: 28.4375%;
          line-gap-override: 8.125%;
        }

        @font-face {
          font-family: 'Poppins';
          src: url("/poppins.woff2") format(woff2);
          font-display: swap;
        }
        :root { font-family: 'Poppins', "Poppins Fallback: Times New Roman", "Poppins Fallback: Arial", 'Arial', sans-serif }"
      `)
  })
})

describe('error handling', () => {
  it('handles no font details supplied', async () => {
    const plugin = FontFamilyInjectionPlugin({
      dev: true,
      lookupFontURL: () => undefined,
      resolveFontFace: () => ({ fonts: [] })
    }).raw({}, { framework: 'vite' }) as any
    expect(await plugin.transform(`:root { font-family: 'Poppins', 'Arial', sans-serif }`).then((r: any) => r?.code)).toMatchInlineSnapshot(`undefined`)
  })
})

const slugify = (str: string) => str.toLowerCase().replace(/[^\d\w]/g, '-')
async function transform (css: string) {
  const plugin = FontFamilyInjectionPlugin({
    dev: true,
    lookupFontURL: () => undefined,
    resolveFontFace: (family, options) => ({
      fonts: [{ src: [{ url: `/${slugify(family)}.woff2`, format: 'woff2' }] }],
      fallbacks: options?.fallbacks ? ['Times New Roman', ...options.fallbacks] : undefined
    })
  }).raw({}, { framework: 'vite' }) as any

  const result = await plugin.transform(css)
  return result?.code
}
