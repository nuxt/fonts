import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
})

describe('providers', async () => {
  // TODO: investigate regression with spaces in local font-family
  it('generates inlined font face rules for `local` provider', async () => {
    const html = await $fetch('/providers/local')
    expect(extractFontFaces('CustomFont', html)).toMatchInlineSnapshot(`
      [
        "@font-face {
        font-family: 'CustomFont';
        src: url("/file.woff2") format(woff2);
        font-display: swap;
        font-weight: 400;
        font-style: normal;
      }",
      ]
    `)
  })

  it('generates inlined font face rules for `bunny` provider', async () => {
    const html = await $fetch('/providers/bunny')
    expect(extractFontFaces('Abel', html)).toMatchInlineSnapshot(`
      [
        "@font-face {
        font-family: 'Abel';
        src: url("/file.woff2") format(woff2), url("/file.woff") format(woff);
        font-display: swap;
        unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
        font-weight: 400;
        font-style: normal;
      }",
      ]
    `)
  })

  it('generates inlined font face rules for `google` provider', async () => {
    const html = await $fetch('/providers/google')
    const poppins = extractFontFaces('Poppins', html)
    const raleway = extractFontFaces('Raleway', html)
    expect(poppins.length).toMatchInlineSnapshot(`18`)
    expect(raleway.length).toMatchInlineSnapshot(`18`)
    expect(poppins[0]).toMatchInlineSnapshot(`
      "@font-face {
        font-family: 'Poppins';
        src: local("Poppins"), url("/file.woff2") format(woff2), url("/file.woff") format(woff), url("/file.ttf") format(truetype), url("/file.svg") format(svg);
        font-display: swap;
        font-weight: 900;
        font-style: italic;
      }"
    `)
    expect(raleway[0]).toMatchInlineSnapshot(`
      "@font-face {
        font-family: 'Raleway';
        src: local("Raleway"), url("/file.woff2") format(woff2), url("/file.woff") format(woff), url("/file.ttf") format(truetype), url("/file.svg") format(svg);
        font-display: swap;
        font-weight: 900;
        font-style: italic;
      }"
    `)
  })

  it('should allow overriding providers with `none`', async () => {
    const html = await $fetch('/providers/none')
    expect(extractFontFaces('CustomFont', html)).toMatchInlineSnapshot(`[]`)
  })

  it('should allow defining custom providers', async () => {
    const html = await $fetch('/providers/custom')
    expect(extractFontFaces('SomeFontFromCustomProvider', html)).toMatchInlineSnapshot(`
      [
        "@font-face {
        font-family: 'SomeFontFromCustomProvider';
        src: url("/file.woff2") format(woff2);
        font-display: swap;
      }",
      ]
    `)
  })
})

describe('features', () => {
  it('should allow manual overrides, bypassing providers', async () => {
    const html = await $fetch('/overrides')
    expect(extractFontFaces('MyCustom', html)).toMatchInlineSnapshot(`
      [
        "@font-face {
        font-family: 'MyCustom';
        src: url("/file.woff2") format(woff2);
        font-display: swap;
      }",
      ]
    `)
  })

  it('should allow globally registered font', async () => {
    const html = await $fetch('/')
    expect(extractFontFaces('CustomGlobal', html)).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:CustomGlobal;src:url(/font-global.woff2) format(woff2)}",
      ]
    `)
  })

  it('supports external files and scss syntax', async () => {
    const html = await $fetch('/preprocessors')
    expect(extractFontFaces('Anta', html)).toMatchInlineSnapshot(`
      [
        "@font-face {
        font-family: 'Anta';
        src: local("Anta"), url("/file.woff2") format(woff2), url("/file.woff") format(woff), url("/file.ttf") format(truetype), url("/file.svg") format(svg);
        font-display: swap;
        font-weight: 400;
        font-style: normal;
      }",
      ]
    `)
  })

  it('supports `@nuxtjs/tailwindcss`', async () => {
    const html = await $fetch('/tailwindcss')
    expect(extractFontFaces('Anton', html)).toMatchInlineSnapshot(`
      [
        "@font-face {
        font-family: 'Anton';
        src: local("Anton"), url("/file.woff2") format(woff2), url("/file.woff") format(woff), url("/file.ttf") format(truetype), url("/file.svg") format(svg);
        font-display: swap;
        font-weight: 400;
        font-style: normal;
      }",
      ]
    `)
  })
})

function extractFontFaces (fontFamily: string, html: string) {
  const matches = html.matchAll(new RegExp(`@font-face\\s*{[^}]*font-family:\\s*['"]?${fontFamily}['"]?[^}]+}`, 'g'))
  return Array.from(matches, (match) => match[0]
    .replace(/"(https?:\/\/[^/]+)?\/[^"]+(\.[^".]+)"/g, '"$1/file$2"')
    .replace(/"(https?:\/\/[^/]+)?\/[^".]+"/g, '"$1/file"')
  )
}
