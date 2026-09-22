import { it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

import { extractFontFaces, extractPreloadLinks } from './utils'

async function fetchStylesheets(html: string) {
  const hrefs = Array.from(html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g), m => m[1]!)
  expect(hrefs.length).toBeGreaterThan(0)
  return (await Promise.all(hrefs.map(href => $fetch<string>(href)))).join('')
}

export function itInjectsFontFaces() {
  it('injects font faces into bundled stylesheets', async () => {
    const css = await fetchStylesheets(await $fetch<string>('/'))

    expect(extractFontFaces('MyCustom', css)).toEqual([
      '@font-face{font-display:swap;font-family:MyCustom;src:url(/custom-font.woff2) format(woff2)}',
    ])
  })

  it('injects font faces for families only named through a preprocessor variable', async () => {
    const css = await fetchStylesheets(await $fetch<string>('/'))

    expect(extractFontFaces('MyLocal', css)).toEqual([
      '@font-face{font-display:swap;font-family:MyLocal;font-style:normal;font-weight:400;src:local(MyLocal Regular),local(MyLocal),url(/_fonts/mylocal-400.woff2) format(woff2)}',
    ])
  })

  it('renders font faces for globally registered families in the document head', async () => {
    const html = await $fetch<string>('/')

    expect(extractFontFaces('CustomGlobal', html)).toContain(
      '@font-face {font-display: swap;font-family: \'CustomGlobal\';src: url("/custom-font.woff2") format(woff2)}',
    )
  })

  it('preloads fonts from the public font directory', async () => {
    const html = await $fetch<string>('/')
    const css = await fetchStylesheets(html)

    expect(extractPreloadLinks(html, css)).toContain('/_fonts/mylocal-400.woff2')
  })
}
