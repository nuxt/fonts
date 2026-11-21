import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { runWithNuxtContext } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { NormalizeFontDataContext } from 'fontless'
import { join } from 'pathe'
import type { Plugin } from 'vite'

const mocks = vi.hoisted(() => ({
  downloadFont: vi.fn(),
  resolveModulePath: vi.fn(),
}))

vi.mock('../src/download.ts', () => ({
  downloadFont: mocks.downloadFont,
}))
vi.mock('exsolve', async importOriginal => ({
  ...await importOriginal<typeof import('exsolve')>(),
  resolveModulePath: mocks.resolveModulePath,
}))

const { setupPublicAssetStrategy } = await import('../src/assets.ts')
const { resolveModulePath } = await vi.importActual<typeof import('exsolve')>('exsolve')

const installedPath = resolveModulePath('subset-font', { from: import.meta.url })

const buildDir = `${process.cwd()}/node_modules/.cache/test-download-assets`
const cacheDir = join(buildDir, 'cache', 'fonts')

beforeEach(async () => {
  vi.clearAllMocks()
  mocks.downloadFont.mockResolvedValue(Buffer.from('font'))
  mocks.resolveModulePath.mockReturnValue(installedPath)
  await rm(buildDir, { recursive: true, force: true })
})

async function setupBuild() {
  const handlers = new Map<string, ((...args: never[]) => unknown)[]>()
  const nuxt = {
    hook: (name: string, handler: (...args: never[]) => unknown) => {
      handlers.set(name, [...handlers.get(name) || [], handler])
    },
    callHook: async (name: string, ...args: never[]) => {
      for (const handler of handlers.get(name) || []) {
        await handler(...args)
      }
    },
    options: {
      dev: false,
      builder: '@nuxt/vite-builder',
      rootDir: process.cwd(),
      buildDir,
      app: { baseURL: '/', buildAssetsDir: '/_nuxt/' },
      runtimeConfig: { app: {} },
      devServerHandlers: [],
      nitro: {},
      vite: {},
    },
  } as unknown as Nuxt

  let context: NormalizeFontDataContext | undefined
  nuxt.hook('fonts:public-asset-context', (ctx) => {
    context = ctx
  })

  const storage = { getItemRaw: async () => null, setItemRaw: async () => {} }
  await runWithNuxtContext(nuxt, () => setupPublicAssetStrategy(storage as never))
  await nuxt.callHook('modules:done')

  const config: { plugins: Plugin[] } = { plugins: [] }
  await nuxt.callHook('vite:extend', { config } as never)
  const plugin = config.plugins.find(p => p.name === 'nuxt-fonts-download-assets')!

  const nitroHandlers: Record<string, () => Promise<void>> = {}
  await nuxt.callHook('nitro:init', {
    options: { publicAssets: [] },
    hooks: {
      hook: (name: string, handler: () => Promise<void>) => {
        nitroHandlers[name] = handler
      },
    },
  } as never)

  return {
    render(filename: string, font: { url: string, subset?: string }) {
      context!.renderedFontURLs.set(filename, font as never)
      context!.callback?.(filename, `/_nuxt/fonts/${filename}`)
    },
    bundle: () => (plugin.closeBundle as () => Promise<void>)(),
    bundleServer: () => nitroHandlers['rollup:before']!(),
  }
}

async function downloadRenderedFonts(font: { url: string, subset?: string }) {
  const build = await setupBuild()
  build.render('CustomFont.woff2', font)
  return build.bundle()
}

async function writeCachedFont(filename: string) {
  await mkdir(cacheDir, { recursive: true })
  await writeFile(join(cacheDir, filename), 'font')
}

describe('font downloads', () => {
  it('should fail before downloading a font that `subset-font` is needed for', async () => {
    mocks.resolveModulePath.mockReturnValue(undefined)

    await expect(downloadRenderedFonts({ url: 'https://example.com/CustomFont.woff2', subset: 'abc' }))
      .rejects.toThrow(/`https:\/\/example.com\/CustomFont.woff2`.*add --save-dev subset-font/s)
    expect(mocks.downloadFont).not.toHaveBeenCalled()
  })

  it('should download fonts that no provider needs to subset without `subset-font`', async () => {
    mocks.resolveModulePath.mockReturnValue(undefined)

    await downloadRenderedFonts({ url: 'https://example.com/CustomFont.woff2' })

    expect(mocks.downloadFont).toHaveBeenCalledOnce()
  })
})

describe('font output directory', () => {
  it('should keep existing fonts when the module is set up', async () => {
    await writeCachedFont('Existing.woff2')

    await setupBuild()

    expect(await readdir(cacheDir)).toEqual(['Existing.woff2'])
  })

  it('should keep existing fonts when the bundler does not run', async () => {
    await writeCachedFont('Existing.woff2')

    const build = await setupBuild()
    await build.bundleServer()

    expect(await readdir(cacheDir)).toEqual(['Existing.woff2'])
  })

  it('should remove fonts the bundle did not render', async () => {
    await writeCachedFont('Stale.woff2')

    const build = await setupBuild()
    build.render('CustomFont.woff2', { url: 'https://example.com/CustomFont.woff2' })
    await build.bundle()

    expect(await readdir(cacheDir)).toEqual(['CustomFont.woff2'])
  })
})
