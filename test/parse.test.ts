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

  it('should add declarations for `font`', async () => {
    expect(await transform(`:root { font: 1.2em 'CustomFont' }`))
      .toMatchInlineSnapshot(`
        "@font-face {
          font-family: 'CustomFont';
          src: url("/customfont.woff2") format(woff2);
          font-display: swap;
        }
        :root { font: 1.2em 'CustomFont' }"
      `)
  })

  it('should add declarations for `font-family` with CSS variables', async () => {
    expect(await transform(`:root { --custom-css-variable: 'CustomFont' }`))
      .toMatchInlineSnapshot(`
        "@font-face {
          font-family: 'CustomFont';
          src: url("/customfont.woff2") format(woff2);
          font-display: swap;
        }
        :root { --custom-css-variable: 'CustomFont' }"
      `)
  })

  it('should insert generated fallbacks into CSS variables with quoted fonts', async () => {
    expect(await transform(`:root { --font-display: 'Poppins', sans-serif; }`))
      .toMatchInlineSnapshot(`
        "@font-face {
          font-family: 'Poppins';
          src: url("/poppins.woff2") format(woff2);
          font-display: swap;
        }
        @font-face {
          font-family: "Poppins Fallback: Times New Roman";
          src: local("Times New Roman");
          size-adjust: 123.0769%;
          ascent-override: 85.3125%;
          descent-override: 28.4375%;
          line-gap-override: 8.125%;
        }

        :root { --font-display: 'Poppins', "Poppins Fallback: Times New Roman", sans-serif; }"
      `)
  })

  it('should insert generated fallbacks into CSS variables with unquoted fonts', async () => {
    expect(await transform(`:root { --font-heading: POPPINS, serif; }`))
      .toMatchInlineSnapshot(`
        "@font-face {
          font-family: 'POPPINS';
          src: url("/poppins.woff2") format(woff2);
          font-display: swap;
        }
        :root { --font-heading: POPPINS, serif; }"
      `)
  })

  it('should skip CSS variables with duplicate fonts', async () => {
    expect(await transform(`:root { --font-a: 'Poppins', sans-serif; --font-b: 'Poppins', serif; }`))
      .toMatchInlineSnapshot(`
        "@font-face {
          font-family: 'Poppins';
          src: url("/poppins.woff2") format(woff2);
          font-display: swap;
        }
        @font-face {
          font-family: "Poppins Fallback: Times New Roman";
          src: local("Times New Roman");
          size-adjust: 123.0769%;
          ascent-override: 85.3125%;
          descent-override: 28.4375%;
          line-gap-override: 8.125%;
        }

        :root { --font-a: 'Poppins', "Poppins Fallback: Times New Roman", sans-serif; --font-b: 'Poppins', "Poppins Fallback: Times New Roman", serif; }"
      `)
  })

  it('should resolve font face with fallback list for CSS variables', async () => {
    expect(await transform(`:root { --font-body: 'Poppins', Arial, sans-serif; }`))
      .toMatchInlineSnapshot(`
        "@font-face {
          font-family: 'Poppins';
          src: url("/poppins.woff2") format(woff2);
          font-display: swap;
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
          font-family: "Poppins Fallback: Arial";
          src: local("Arial");
          size-adjust: 112.1577%;
          ascent-override: 93.6182%;
          descent-override: 31.2061%;
          line-gap-override: 8.916%;
        }

        :root { --font-body: 'Poppins', "Poppins Fallback: Times New Roman", "Poppins Fallback: Arial", Arial, sans-serif; }"
      `)
  })

  it('should handle multi word and unquoted font families', async () => {
    expect(await transform(`
    :root { font-family:Open Sans}
    :root { font-family: Open Sans, sans-serif }
    :root { --test: Open Sans, sans-serif }
    `))
      .toMatchInlineSnapshot(`
        "@font-face {
          font-family: 'Open Sans';
          src: url("/open-sans.woff2") format(woff2);
          font-display: swap;
        }
        @font-face {
          font-family: "Open Sans Fallback: Times New Roman";
          src: local("Times New Roman");
          size-adjust: 115.3846%;
          ascent-override: 92.6335%;
          descent-override: 25.3906%;
          line-gap-override: 0%;
        }


            :root { font-family:Open Sans, "Open Sans Fallback: Times New Roman"}
            :root { font-family: Open Sans, "Open Sans Fallback: Times New Roman", sans-serif }
            :root { --test: Open Sans, "Open Sans Fallback: Times New Roman", sans-serif }
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
          font-family: 'Poppins';
          src: url("/poppins.woff2") format(woff2);
          font-display: swap;
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
          font-family: "Poppins Fallback: Arial";
          src: local("Arial");
          size-adjust: 112.1577%;
          ascent-override: 93.6182%;
          descent-override: 31.2061%;
          line-gap-override: 8.916%;
        }

        :root { font-family: 'Poppins', "Poppins Fallback: Times New Roman", "Poppins Fallback: Arial", 'Arial', sans-serif }"
      `)
  })
})

describe('parsing css', () => {
  it('should handle nested CSS', async () => {
    const expected = await transform(`.parent { div { font-family: 'Poppins'; } p { font-family: 'Poppins'; @media (min-width: 768px) { @media (prefers-reduced-motion: reduce) { a { font-family: 'Lato'; } } } } }`)
    expect(expected).toMatchInlineSnapshot(`
      "@font-face {
        font-family: 'Lato';
        src: url("/lato.woff2") format(woff2);
        font-display: swap;
      }
      @font-face {
        font-family: "Lato Fallback: Times New Roman";
        src: local("Times New Roman");
        size-adjust: 107.2%;
        ascent-override: 92.0709%;
        descent-override: 19.8694%;
        line-gap-override: 0%;
      }

      @font-face {
        font-family: 'Poppins';
        src: url("/poppins.woff2") format(woff2);
        font-display: swap;
      }
      @font-face {
        font-family: "Poppins Fallback: Times New Roman";
        src: local("Times New Roman");
        size-adjust: 123.0769%;
        ascent-override: 85.3125%;
        descent-override: 28.4375%;
        line-gap-override: 8.125%;
      }

      .parent { div { font-family: 'Poppins', "Poppins Fallback: Times New Roman"; } p { font-family: 'Poppins', "Poppins Fallback: Times New Roman"; @media (min-width: 768px) { @media (prefers-reduced-motion: reduce) { a { font-family: 'Lato', "Lato Fallback: Times New Roman"; } } } } }"
      `)
  })
})

describe('filter patterns', () => {
  it('should not process CSS without font-family when processCSSVariables is false', async () => {
    const transformWithoutCSSVariables = async (css: string) => {
      const plugin = FontFamilyInjectionPlugin({
        dev: true,
        processCSSVariables: false,
        shouldPreload: () => true,
        fontsToPreload: new Map(),
        resolveFontFace: family => ({
          fonts: [{ src: [{ url: `/${slugify(family)}.woff2`, format: 'woff2' }] }],
        }),
      }).vite() as any

      const result = await plugin.transform?.handler?.(css, 'some-id.css')
      return result?.code
    }

    // CSS without font-family should not be processed (returns undefined)
    const cssWithoutFontFamily = `.header { color: red; background: blue; }`
    expect(await transformWithoutCSSVariables(cssWithoutFontFamily)).toBeUndefined()

    // CSS with font-family should be processed
    const cssWithFontFamily = `.header { font-family: 'CustomFont'; color: red; }`
    const result = await transformWithoutCSSVariables(cssWithFontFamily)
    expect(result).toContain('@font-face')
    expect(result).toContain('CustomFont')
  })

  it('should process CSS variables when processCSSVariables is true', async () => {
    const transformWithCSSVariables = async (css: string) => {
      const plugin = FontFamilyInjectionPlugin({
        dev: true,
        processCSSVariables: true,
        shouldPreload: () => true,
        fontsToPreload: new Map(),
        resolveFontFace: family => ({
          fonts: [{ src: [{ url: `/${slugify(family)}.woff2`, format: 'woff2' }] }],
        }),
      }).vite() as any

      const result = await plugin.transform?.handler?.(css, 'some-id.css')
      return result?.code
    }

    // CSS with font-family in variable should be processed
    const cssWithVariable = `:root { --font-var: 'CustomFont'; }`
    const result = await transformWithCSSVariables(cssWithVariable)
    expect(result).toContain('@font-face')
    expect(result).toContain('CustomFont')

    // Even CSS without explicit font-family should be processed when processCSSVariables is true
    const cssWithoutFontFamily = `.header { color: red; --font-var: 'AnotherFont'; }`
    const result2 = await transformWithCSSVariables(cssWithoutFontFamily)
    expect(result2).toContain('@font-face')
    expect(result2).toContain('AnotherFont')
  })

  it('should handle multiline CSS correctly', async () => {
    const transformWithoutCSSVariables = async (css: string) => {
      const plugin = FontFamilyInjectionPlugin({
        dev: true,
        processCSSVariables: false,
        shouldPreload: () => true,
        fontsToPreload: new Map(),
        resolveFontFace: family => ({
          fonts: [{ src: [{ url: `/${slugify(family)}.woff2`, format: 'woff2' }] }],
        }),
      }).vite() as any

      const result = await plugin.transform?.handler?.(css, 'some-id.css')
      return result?.code
    }

    // Multiline CSS without font-family should not be processed
    const multilineCssWithoutFontFamily = `
      .header {
        color: red;
        background: blue;
        margin: 10px;
      }
    `
    expect(await transformWithoutCSSVariables(multilineCssWithoutFontFamily)).toBeUndefined()

    // Multiline CSS with font-family should be processed
    const multilineCssWithFontFamily = `
      .header {
        color: red;
        font-family: 'CustomFont';
        background: blue;
      }
    `
    const result = await transformWithoutCSSVariables(multilineCssWithFontFamily)
    expect(result).toContain('@font-face')
    expect(result).toContain('CustomFont')
  })

  it('should detect font-family in various CSS contexts', async () => {
    const transformWithoutCSSVariables = async (css: string) => {
      const plugin = FontFamilyInjectionPlugin({
        dev: true,
        processCSSVariables: false,
        shouldPreload: () => true,
        fontsToPreload: new Map(),
        resolveFontFace: family => ({
          fonts: [{ src: [{ url: `/${slugify(family)}.woff2`, format: 'woff2' }] }],
        }),
      }).vite() as any

      const result = await plugin.transform?.handler?.(css, 'some-id.css')
      return result?.code
    }

    // Should process: direct font-family property
    const result1 = await transformWithoutCSSVariables(`.test { font-family: CustomFont; }`)
    expect(result1).toBeDefined()
    expect(result1).toContain('@font-face')

    // Should process: font-family in nested rules
    const result2 = await transformWithoutCSSVariables(`.parent { .child { font-family: CustomFont; } }`)
    expect(result2).toBeDefined()
    expect(result2).toContain('@font-face')

    // Should process: font-family in media queries
    const result3 = await transformWithoutCSSVariables(`@media (min-width: 768px) { .test { font-family: CustomFont; } }`)
    expect(result3).toBeDefined()
    expect(result3).toContain('@font-face')

    // Should process: font-family with spaces
    const result4 = await transformWithoutCSSVariables(`.test { font-family : CustomFont ; }`)
    expect(result4).toBeDefined()
    expect(result4).toContain('@font-face')

    // Should NOT process: no font-family at all
    expect(await transformWithoutCSSVariables(`.test { color: red; margin: 10px; }`)).toBeUndefined()

    // Should NOT process: has 'font' but not 'font-family'
    expect(await transformWithoutCSSVariables(`.test { font-size: 14px; font-weight: bold; }`)).toBeUndefined()
  })
})

describe('error handling', () => {
  it('handles no font details supplied', async () => {
    const plugin = FontFamilyInjectionPlugin({
      dev: true,
      shouldPreload: () => true,
      fontsToPreload: new Map(),
      processCSSVariables: true,
      resolveFontFace: () => ({ fonts: [] }),
    }).raw({}, { framework: 'vite' }) as any
    expect(await plugin.transform?.handler?.(`:root { font-family: 'Poppins', 'Arial', sans-serif }`, 'some-id').then((r: any) => r?.code)).toMatchInlineSnapshot(`undefined`)
  })
})

const slugify = (str: string) => str.toLowerCase().replace(/\W/g, '-')
async function transform(css: string) {
  const plugin = FontFamilyInjectionPlugin({
    dev: true,
    processCSSVariables: true,
    shouldPreload: () => true,
    fontsToPreload: new Map(),
    resolveFontFace: (family, options) => ({
      fonts: [{ src: [{ url: `/${slugify(family)}.woff2`, format: 'woff2' }] }],
      fallbacks: options?.fallbacks ? ['Times New Roman', ...options.fallbacks] : undefined,
    }),
  }).vite() as any

  const result = await plugin.transform?.handler?.(css, 'some-id.css')
  return result?.code
}
