import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { FontFamilyInjectionPlugin } from '../src/plugins/transform.ts'
import { buildAssets, findStylesheet, referencedStylesheets, sharedNamesWithDifferentContents } from './build-assets.ts'

describe('emitted asset file names', () => {
  it('changes when font faces are hoisted out of bundled stylesheets', async () => {
    const rootDir = fileURLToPath(new URL('./fixtures/css-filenames', import.meta.url))
    const hoisted = await buildAssets(rootDir)
    const inline = await buildAssets(rootDir, { features: { inlineStyles: false } })

    expect(findStylesheet(hoisted, 'entry')).not.toContain('@font-face')
    expect(findStylesheet(hoisted, 'LaterText')).not.toContain('@font-face')
    expect(findStylesheet(inline, 'entry')).toContain('@font-face')
    expect(findStylesheet(inline, 'LaterText')).toContain('@font-face')

    expect(sharedNamesWithDifferentContents(hoisted, inline)).toEqual([])

    for (const assets of [hoisted, inline]) {
      const referenced = referencedStylesheets(assets)
      expect(referenced.some(file => file.startsWith('_nuxt/LaterText.'))).toBe(true)
      expect(referenced.filter(file => !assets.has(file))).toEqual([])
    }
  }, 120_000)

  it('moves preloads to the name a stylesheet is emitted under once its font faces change', async () => {
    const fontsToPreload = new Map<string, Set<string>>()
    const plugin = FontFamilyInjectionPlugin({
      dev: false,
      fontsToPreload,
      selectFontsToPreload: (_family, fonts) => fonts,
      resolveFontFace: () => ({ fonts: [{ src: [{ url: '/custom.woff2', format: 'woff2' }] }] }),
    }).vite() as any

    const bundle: Record<string, unknown> = {
      '_nuxt/Later.a.css': { type: 'asset', fileName: '_nuxt/Later.a.css', names: ['Later.css'], originalFileNames: [], source: '.later{font-family:CustomFont}' },
    }
    const context = {
      emitFile: (asset: object) => {
        bundle['_nuxt/Later.b.css'] = { ...asset, fileName: '_nuxt/Later.b.css' }
        return 'ref'
      },
      getFileName: () => '_nuxt/Later.b.css',
    }
    await plugin.generateBundle.handler.call(context, {}, bundle)

    expect(Object.keys(bundle)).toEqual(['_nuxt/Later.b.css'])
    expect(Object.fromEntries([...fontsToPreload].map(([file, urls]) => [file, [...urls]]))).toEqual({
      '_nuxt/Later.b.css': ['/custom.woff2'],
    })
  })
})
