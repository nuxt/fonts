import { fileURLToPath, pathToFileURL } from 'node:url'
import fsp from 'node:fs/promises'

import type { Nitro, NitroOptions } from 'nitropack'
import { describe, expect, it, vi } from 'vitest'
import { dirname, join } from 'pathe'
import { createUnifont } from 'unifont'

import localProvider from '../../src/providers/local'
import type { LocalProviderOptions } from '../../src/providers/local'

const mockUseNuxt = vi.hoisted(() => vi.fn())
vi.mock('@nuxt/kit', () => ({
  useNuxt: mockUseNuxt,
}))

const mockWarn = vi.hoisted(() => vi.fn())
vi.mock('../../src/logger', () => ({
  logger: { warn: mockWarn },
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
      'public/MyFont_extra-light.woff2',
      'public/MyFont.700.eot',
      'public/MyFont.600-234987akd.woff2',
      'public/My-Font.200.woff2',
      'public/MyFontbold-latin.ttf',
      'public/MyFontbold-latin.woff',
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
            {
              "format": "woff2",
              "url": "/MyFont_extra-light.woff2",
            },
          ],
          "style": "normal",
          "weight": "extra-light",
        },
      ]
    `)
    await cleanup()
  })

  it('should resolve variable weight ranges declared in filenames', async () => {
    const cleanup = await createFixture('resolve-variable', [
      'public/Merriweather-400-700.ttf',
      'public/Satoshi-400-700.woff2',
      'public/Spaced-100 900.woff2',
      'public/Dotted.100-900.woff2',
    ])
    const provider = await setupFixture(['resolve-variable/public'])

    for (const family of ['Merriweather', 'Satoshi', 'Spaced', 'Dotted']) {
      const range = family === 'Merriweather' || family === 'Satoshi' ? '400 700' : '100 900'
      expect(await provider.resolveFont(family, {
        weights: [range],
        styles: ['normal'],
        subsets: ['latin'],
        formats: ['woff2', 'woff', 'ttf', 'otf', 'eot'],
      }).then(r => r.fonts), family).toMatchObject([{ weight: range }])
    }

    expect(await provider.resolveFont('Merriweather', {
      weights: ['400-700'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2', 'woff', 'ttf', 'otf', 'eot'],
    }).then(r => r.fonts)).toMatchInlineSnapshot(`
      [
        {
          "src": [
            {
              "format": "truetype",
              "url": "/Merriweather-400-700.ttf",
            },
          ],
          "style": "normal",
          "weight": "400-700",
        },
      ]
    `)

    expect(await provider.resolveFont('Satoshi', {
      weights: ['400'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2', 'woff', 'ttf', 'otf', 'eot'],
    }).then(r => r.fonts)).toMatchInlineSnapshot(`
      [
        {
          "src": [
            {
              "format": "woff2",
              "url": "/Satoshi-400-700.woff2",
            },
          ],
          "style": "normal",
          "weight": "400",
        },
      ]
    `)

    expect(await provider.resolveFont('Satoshi', {
      weights: ['900'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2', 'woff', 'ttf', 'otf', 'eot'],
    }).then(r => r.fonts)).toMatchInlineSnapshot(`[]`)

    await cleanup()
  })

  it('should not treat a trailing non-weight number as a variable range', async () => {
    const cleanup = await createFixture('resolve-variable-ambiguous', [
      'public/MyFont-100.woff2',
      'public/MyFont-300-234987akd.woff2',
      'public/Big-1100-9000.woff2',
      'public/Descending-900-100.woff2',
    ])
    const provider = await setupFixture(['resolve-variable-ambiguous/public'])

    expect(await provider.resolveFont('MyFont', {
      weights: ['thin'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
    }).then(r => r.fonts)).toMatchObject([{ weight: 'thin', src: [{ url: '/MyFont-100.woff2' }] }])

    expect(await provider.resolveFont('MyFont', {
      weights: ['light'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
    }).then(r => r.fonts)).toMatchObject([{ weight: 'light', src: [{ url: '/MyFont-300-234987akd.woff2' }] }])

    expect(await provider.resolveFont('Big', {
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
    }).then(r => r.fonts)).toMatchInlineSnapshot(`[]`)

    expect(await provider.resolveFont('Descending', {
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
    }).then(r => r.fonts)).toMatchInlineSnapshot(`[]`)

    expect(await provider.resolveFont('Descending', {
      weights: ['900'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
    }).then(r => r.fonts)).toMatchObject([{ weight: '900', src: [{ url: '/Descending-900-100.woff2' }] }])

    await cleanup()
  })

  it('should resolve variable fonts named without a weight range', async () => {
    const cleanup = await createFixture('resolve-variable-keyword', [
      'public/Faro-Variable.woff2',
      'public/Inter-VF.woff2',
    ])
    const provider = await setupFixture(['resolve-variable-keyword/public'])

    for (const [family, url] of [['Faro Variable', '/Faro-Variable.woff2'], ['Faro', '/Faro-Variable.woff2'], ['Inter', '/Inter-VF.woff2']] as const) {
      for (const weight of ['400', '700', '100 900']) {
        expect(await provider.resolveFont(family, {
          weights: [weight],
          styles: ['normal'],
          subsets: ['latin'],
          formats: ['woff2'],
        }).then(r => r.fonts), `${family} @ ${weight}`).toMatchObject([{ weight, src: [{ url }] }])
      }
    }

    await cleanup()
  })

  it('should scan known font packages without configuration', async () => {
    const cleanup = await createFixture('known-package', [
      'node_modules/geist/dist/fonts/geist-sans/Geist-Bold.woff2',
      'node_modules/cal-sans/fonts/webfonts/CalSans-SemiBold.woff2',
    ])
    const provider = await setupFixture([], { rootDir: join(fixturePath, 'known-package') })

    expect(await provider.resolveFont('Geist', {
      weights: ['bold'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
    }).then(r => r.fonts.map(f => f.src))).toEqual([[{
      format: 'woff2',
      url: pathToFileURL(join(fixturePath, 'known-package/node_modules/geist/dist/fonts/geist-sans/Geist-Bold.woff2')).href,
    }]])

    expect(await provider.resolveFont('Cal Sans', {
      weights: ['600'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
    }).then(r => r.fonts)).toHaveLength(1)

    await cleanup()
  })

  it('should ignore known font packages that are not installed', async () => {
    const cleanup = await createFixture('no-package', ['public/MyFont-400.woff2'])
    const provider = await setupFixture(['no-package/public'], { rootDir: join(fixturePath, 'no-package') })

    expect(await provider.resolveFont('Geist', {
      weights: ['bold'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
    }).then(r => r.fonts)).toEqual([])

    await cleanup()
  })

  it('should warn with the filenames it looked for when a local family cannot be resolved', async () => {
    const cleanup = await createFixture('warn-missing', ['public/something-else.woff2'])
    const provider = await setupFixture(['warn-missing/public'], {
      rootDir: fixturePath,
      fonts: { provider: 'local' },
    })
    mockWarn.mockClear()

    expect(await provider.resolveFont('Faro Variable', {
      weights: ['400'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
    }).then(r => r.fonts)).toEqual([])

    expect(mockWarn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "Could not find a local font file for \`Faro Variable\`. Looked for \`Faro-Variable[-<weight>][-<style>][-<subset>].[woff2|woff|ttf|otf|eot]\` within \`warn-missing/public\`, where \`<weight>\` is one of \`400\`, \`<style>\` one of \`normal\` and \`<subset>\` one of \`latin\`.",
        ],
      ]
    `)

    await cleanup()
  })

  it('should scan additional directories, including within `node_modules`', async () => {
    const cleanup = await createFixture('npm-package', [
      'node_modules/geist/dist/fonts/Geist-Bold.woff2',
      'node_modules/geist/dist/fonts/Geist-Bold.ttf',
    ])
    const provider = await setupFixture([], {
      rootDir: join(fixturePath, 'npm-package'),
      providerOptions: { dirs: ['node_modules/geist/dist/fonts'] },
    })
    const fonts = await provider.resolveFont('Geist', {
      weights: ['bold'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2', 'woff', 'ttf', 'otf', 'eot'],
    }).then(r => r.fonts)

    expect(fonts).toHaveLength(1)
    expect(fonts[0]!.src.map(s => 'url' in s ? s.url : s)).toEqual([
      pathToFileURL(join(fixturePath, 'npm-package/node_modules/geist/dist/fonts/Geist-Bold.woff2')).href,
      pathToFileURL(join(fixturePath, 'npm-package/node_modules/geist/dist/fonts/Geist-Bold.ttf')).href,
    ])

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

interface FixtureOptions extends Record<string, unknown> {
  rootDir?: string
  providerOptions?: LocalProviderOptions
}

async function setupFixture(publicAssetDirs: string[], opts: FixtureOptions = {}) {
  const { providerOptions, ...nuxtOptions } = opts
  let promise: Promise<unknown>
  mockUseNuxt.mockImplementation(() => ({
    options: { ...nuxtOptions, rootDir: opts.rootDir || fixturePath },
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
  const unifont = await createUnifont([localProvider(providerOptions)])
  await promise!
  return unifont
}
