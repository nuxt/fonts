import { fileURLToPath } from 'node:url'
import fsp from 'node:fs/promises'

import type { Nuxt } from '@nuxt/schema'
import { describe, expect, it } from 'vitest'
import { dirname, join } from 'pathe'

import localProvider from '../../src/providers/local'

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
    const provider = await setupFixture(['scanning', 'scanning/layer'])
    const faces = provider.resolveFontFaces('font', {
      fallbacks: [],
      weights: ['normal'],
      styles: ['normal'],
      subsets: ['latin']
    })
    expect(faces).toMatchInlineSnapshot(`
      {
        "fonts": [
          {
            "src": [
              "/font.eot",
              "/font.otf",
              "/font.ttf",
              "/font.woff",
              "/font.woff2",
            ],
            "style": "normal",
            "weight": "normal",
          },
        ],
      }
    `)
    await cleanup()
  })
})

/** test utilities */

const fixturePath = fileURLToPath(new URL('../../node_modules/.cache/test/fixtures', import.meta.url))

async function createFixture (slug: string, files: string[]) {
  await fsp.rm(join(fixturePath, slug), { recursive: true, force: true })
  for (const file of files) {
    const path = join(fixturePath, slug, file)
    await fsp.mkdir(dirname(path), { recursive: true })
    await fsp.writeFile(path, '')
  }
  return () => fsp.rm(join(fixturePath, slug), { recursive: true, force: true })
}

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

async function setupFixture (layers: string[]) {
  const mockNuxt = {
    options: {
      _layers: layers.map(l => ({ cwd: join(fixturePath, l), config: { srcDir: join(fixturePath, l) } }))
    },
    hook: () => {},
  } satisfies DeepPartial<Nuxt> as unknown as Nuxt
  await localProvider.setup({}, mockNuxt)
  return localProvider
}
