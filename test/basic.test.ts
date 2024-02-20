import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
})

describe('providers', async () => {
  // TODO: investigate regression with spaces in local font-family
  it('generates inlined font face rules for `local` provider', async () => {
    const html = await $fetch('/local')
    expect(extractFontFaces('CustomFont', html)).toMatchInlineSnapshot(`
      [
        "@font-face {
        font-family: 'CustomFont';
        src: url("/custom-font.woff2") format(woff2);
        font-display: swap;
        font-weight: 400;
        font-style: normal;
      }",
      ]
    `)
  })

  it('generates inlined font face rules for `google` provider', async () => {
    const html = await $fetch('/google')
    const poppins = extractFontFaces('Poppins', html)
    const raleway = extractFontFaces('Raleway', html)
    expect(poppins.length).toMatchInlineSnapshot(`18`)
    expect(raleway.length).toMatchInlineSnapshot(`18`)
    expect(poppins[0]).toMatchInlineSnapshot(`
      "@font-face {
        font-family: 'Poppins';
        src: local("Poppins"), url("https://fonts.gstatic.com/file.woff2") format(woff2), url("https://fonts.gstatic.com/file.woff") format(woff), url("https://fonts.gstatic.com/file.ttf") format(truetype), url("https://fonts.gstatic.com/file") format(svg);
        font-display: swap;
        font-weight: 900;
        font-style: italic;
      }"
    `)
    expect(raleway[0]).toMatchInlineSnapshot(`
      "@font-face {
        font-family: 'Raleway';
        src: local("Raleway"), url("https://fonts.gstatic.com/file.woff2") format(woff2), url("https://fonts.gstatic.com/file.ttf") format(truetype), url("https://fonts.gstatic.com/file") format(svg);
        font-display: swap;
        font-weight: 900;
        font-style: italic;
      }"
    `)
  })

  it('should allow overriding providers with `none`', async () => {
    const html = await $fetch('/none')
    expect(extractFontFaces('CustomFont', html)).toMatchInlineSnapshot(`[]`)
  })

  it('supports external files and scss syntax', async () => {
    const html = await $fetch('/preprocessors')
    expect(extractFontFaces('Anta', html)).toMatchInlineSnapshot(`
      [
        "@font-face {
        font-family: 'Anta';
        src: local("Anta"), url("https://fonts.gstatic.com/file.woff2") format(woff2), url("https://fonts.gstatic.com/file.woff") format(woff), url("https://fonts.gstatic.com/file.ttf") format(truetype), url("https://fonts.gstatic.com/file") format(svg);
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
        src: local("Anton"), url("https://fonts.gstatic.com/file.woff2") format(woff2), url("https://fonts.gstatic.com/file.woff") format(woff), url("https://fonts.gstatic.com/file.ttf") format(truetype), url("https://fonts.gstatic.com/file") format(svg);
        font-display: swap;
        font-weight: 400;
        font-style: normal;
      }",
      ]
    `)
  })
})

function extractFontFaces (fontFamily: string, html: string) {
  const matches = html.matchAll(new RegExp(`@font-face {\\s*font-family: '${fontFamily}'[^}]+}`, 'g'))
  return Array.from(matches, (match) => match[0]
    .replace(/"(https?:\/\/[^/]+)\/[^"]+(\.[^".]+)"/g, '"$1/file$2"')
    .replace(/"(https?:\/\/[^/]+)\/[^".]+"/g, '"$1/file"')
  )
}
