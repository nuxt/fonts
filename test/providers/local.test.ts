import { fileURLToPath } from 'node:url'
import fsp from 'node:fs/promises'

import type { Nitro, NitroOptions } from 'nitropack'
import { describe, expect, it, vi } from 'vitest'
import { dirname, join } from 'pathe'
import { createUnifont } from 'unifont'

import localProvider from '../../src/providers/local'

const mockUseNuxt = vi.hoisted(() => vi.fn())
vi.mock('@nuxt/kit', () => ({
  useNuxt: mockUseNuxt,
}))

describe('local font provider', () => {
  it('should scan for font files', async () => {
    const cleanup = await createFixture('scanning', [
      'font.ttf',
      'font.woff',
      'font.woff2',
      'font.eot',
      'font.otf',
      'font.txt',
    ].flatMap(l => [`public/${l}`, `layer/public/${l}`]))
    const provider = await setupFixture(['scanning/public', 'scanning/layer/public'])
    const faces = await provider.resolveFont('font', {
      weights: ['normal'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2', 'woff', 'ttf', 'otf', 'eot'],
    })
    expect(faces).toMatchInlineSnapshot(`
      {
        "fonts": [
          {
            "src": [
              {
                "format": "woff2",
                "url": "/font.woff2",
              },
              {
                "format": "woff",
                "url": "/font.woff",
              },
              {
                "format": "truetype",
                "url": "/font.ttf",
              },
              {
                "format": "opentype",
                "url": "/font.otf",
              },
              {
                "format": "embedded-opentype",
                "url": "/font.eot",
              },
            ],
            "style": "normal",
            "weight": "normal",
          },
        ],
        "provider": "local",
      }
    `)
    await cleanup()
  })

  it('should resolve correct font weights, subsets and styles', async () => {
    const cleanup = await createFixture('resolve-weights', [
      'public/MyFont.woff',
      'public/MyFont-normal.woff2',
      'public/MyFont_bold.woff2',
      'public/MyFont.700.eot',
      'public/MyFont.600-234987akd.woff2',
      'public/My-Font.200.woff2',
      'public/MyFontbold-latin.ttf',
      'public/MyFontbold-latin.woff',
      'public/Variable.100-900.woff2',
      'public/Variable-100-900.woff2',
      'public/variable.100-900.woff2',
      'public/variable-100-900.woff2',
    ])
    const provider = await setupFixture(['resolve-weights/public'])
    expect(await provider.resolveFont('MyFont', {
      weights: ['normal'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2', 'woff', 'ttf', 'otf', 'eot'],
    }).then(r => r.fonts)).toMatchInlineSnapshot(`
      [
        {
          "src": [
            {
              "format": "woff2",
              "url": "/MyFont-normal.woff2",
            },
            {
              "format": "woff",
              "url": "/MyFont.woff",
            },
          ],
          "style": "normal",
          "weight": "normal",
        },
      ]
    `)
    expect(await provider.resolveFont('MyFont', {
      weights: ['bold'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2', 'woff', 'ttf', 'otf', 'eot'],
    }).then(r => r.fonts)).toMatchInlineSnapshot(`
      [
        {
          "src": [
            {
              "format": "woff2",
              "url": "/MyFont_bold.woff2",
            },
            {
              "format": "woff",
              "url": "/MyFontbold-latin.woff",
            },
            {
              "format": "truetype",
              "url": "/MyFontbold-latin.ttf",
            },
            {
              "format": "embedded-opentype",
              "url": "/MyFont.700.eot",
            },
          ],
          "style": "normal",
          "weight": "bold",
        },
      ]
    `)
    expect(await provider.resolveFont('MyFont', {
      weights: ['extra-light'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2', 'woff', 'ttf', 'otf', 'eot'],
    }).then(r => r.fonts)).toMatchInlineSnapshot(`
      [
        {
          "src": [
            {
              "format": "woff2",
              "url": "/My-Font.200.woff2",
            },
          ],
          "style": "normal",
          "weight": "extra-light",
        },
      ]
    `)
    expect(
      await provider
        .resolveFont('Variable', {
          weights: ['100 900'],
          styles: ['normal'],
          subsets: ['latin'],
          formats: ['woff2', 'woff', 'ttf', 'otf', 'eot'],
        })
        .then(r => r.fonts),
    ).toMatchInlineSnapshot(`
     [
       {
         "src": [
           {
             "format": "woff2",
             "url": "/Variable-100-900.woff2",
           },
           {
             "format": "woff2",
             "url": "/Variable.100-900.woff2",
           },
           {
             "format": "woff2",
             "url": "/variable-100-900.woff2",
           },
           {
             "format": "woff2",
             "url": "/variable.100-900.woff2",
           },
         ],
         "style": "normal",
         "weight": "100 900",
       },
     ]
    `)
    await cleanup()
  })
})

/** test utilities */

const fixturePath = fileURLToPath(new URL('../../node_modules/.cache/test/fixtures', import.meta.url))

async function createFixture(slug: string, files: string[]) {
  await fsp.rm(join(fixturePath, slug), { recursive: true, force: true })
  for (const file of files) {
    const path = join(fixturePath, slug, file)
    await fsp.mkdir(dirname(path), { recursive: true })
    await fsp.writeFile(path, '')
  }
  return () => fsp.rm(join(fixturePath, slug), { recursive: true, force: true })
}

async function setupFixture(publicAssetDirs: string[]) {
  let promise: Promise<unknown>
  mockUseNuxt.mockImplementation(() => ({
    hook: (event: string, callback: (nitro: Nitro) => Promise<unknown>) => {
      if (event === 'nitro:init') {
        promise = callback({
          options: {
            publicAssets: publicAssetDirs.map(l => ({ dir: join(fixturePath, l), baseURL: '/', maxAge: 1 })) satisfies NitroOptions['publicAssets'],
          },
        } as Partial<Nitro> as Nitro)
      }
    },
  }))
  const unifont = await createUnifont([localProvider()])
  await promise!
  return unifont
}
