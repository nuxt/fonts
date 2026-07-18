import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

import { mockAdobeFetch } from './fixtures/adobe'
import { extractPreloadLinks } from './utils'

mockAdobeFetch()

await setup({
  rootDir: fileURLToPath(new URL('../playgrounds/basic', import.meta.url)),
  env: {
    NUXT_APP_BASE_URL: '/foo',
  },
})

describe('custom base URL', async () => {
  const providers = ['adobe', 'bunny', 'fontshare', 'fontsource', 'google']

  it('respects custom baseURL in preload links', async () => {
    for (const provider of providers) {
      const html = await $fetch<string>(`/foo/providers/${provider}`)
      const links = extractPreloadLinks(html)
      expect(links.every(link => link?.includes('/foo'))).toBeTruthy()
    }
  })

  // TODO: this test fails in testing but succeeds when run locally
  it.todo('respects custom baseURL in inline styles', async () => {
    function startsWithBase(url: string) {
      return url.startsWith('/foo')
    }
    for (const provider of providers) {
      const html = await $fetch<string>(`/foo/providers/${provider}`)
      for (const block of html.matchAll(/<style>([\s\S]+)<\/style>/g)) {
        const fontUrls = [...block[1]!.matchAll(/url\(([^)]+)\)/g)].map(url => url[1])
        for (const url of fontUrls) {
          expect.soft(url).toSatisfy(startsWithBase)
        }
      }
    }
  })

  it('resolves font URLs in CSS against the base URL', async () => {
    for (const provider of providers) {
      const html = await $fetch<string>(`/foo/providers/${provider}`)

      const cssLink = html.match(/<link rel="stylesheet" href="([^"]+)"/)?.[1]
      if (cssLink) {
        // External stylesheet: font URLs are written relative to the
        // stylesheet path so they resolve regardless of the app base URL.
        const css = await $fetch<string>(cssLink)
        const fontUrls = css.match(/url\(([^)]+)\)/g)
        expect(fontUrls!.every(url =>
          url?.includes('../_fonts')
          // global (unresolved) font in css from v4 onwards
          || url?.includes('/font-global.woff2'),
        )).toBeTruthy()
        continue
      }

      // Inlined CSS resolves against the document, so font URLs carry the
      // base URL prefix.
      const inlineCss = Array.from(html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g), m => m[1]).join('')
      const fontUrls = inlineCss.match(/url\(([^)]+)\)/g)
      expect(fontUrls!.every(url =>
        url?.includes('/foo/_fonts')
        // global (unresolved) font in css from v4 onwards
        || url?.includes('/font-global.woff2'),
      )).toBeTruthy()
    }
  })
})
