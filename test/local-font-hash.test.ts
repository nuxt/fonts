import { fileURLToPath } from 'node:url'
import { promises as fsp } from 'node:fs'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { buildNuxt, loadNuxt } from '@nuxt/kit'
import { defu } from 'defu'
import { dirname, join } from 'pathe'
import { glob } from 'tinyglobby'

const fixtureRoot = fileURLToPath(new URL('./fixtures/local-font-hash', import.meta.url))
const fontPath = join(fixtureRoot, 'assets/fonts/MyFont-400.woff2')
const cacheDir = join(fixtureRoot, '.nuxt', 'test-font-cache')

async function buildFixture() {
  const buildDir = join(fixtureRoot, '.nuxt', 'test', Math.random().toString(36).slice(2, 8))
  const nuxt = await loadNuxt({
    cwd: fixtureRoot,
    dev: false,
    overrides: defu(
      { fonts: { cache: cacheDir } },
      { buildDir, nitro: { output: { dir: join(buildDir, 'output') } } },
    ),
  })
  try {
    await buildNuxt(nuxt)
    const outputDir = join(buildDir, 'output', 'public')
    const fonts = await glob('_nuxt/fonts/*.{woff,woff2,ttf,otf,eot}', { cwd: outputDir })
    return {
      fonts,
      contents: await Promise.all(fonts.map(file => fsp.readFile(join(outputDir, file)))),
    }
  }
  finally {
    await nuxt.close()
    await fsp.rm(buildDir, { recursive: true, force: true })
  }
}

describe('local font file names', () => {
  beforeAll(async () => {
    await fsp.mkdir(dirname(fontPath), { recursive: true })
    await fsp.rm(cacheDir, { recursive: true, force: true })
  })

  afterAll(async () => {
    await fsp.rm(fontPath, { force: true })
    await fsp.rm(cacheDir, { recursive: true, force: true })
  })

  it('should change when a local font file changes at the same path', async () => {
    await fsp.writeFile(fontPath, 'font-content-one')
    const first = await buildFixture()

    await fsp.writeFile(fontPath, 'font-content-two')
    const second = await buildFixture()

    expect(first.fonts).toHaveLength(1)
    expect(second.fonts).toHaveLength(1)
    expect(first.fonts[0]).not.toBe(second.fonts[0])
    expect(first.contents[0]!.toString()).toBe('font-content-one')
    expect(second.contents[0]!.toString()).toBe('font-content-two')
  }, 180_000)
})
