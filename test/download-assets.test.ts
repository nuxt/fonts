import { beforeEach, describe, expect, it, vi } from 'vitest'
import { runWithNuxtContext } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { NormalizeFontDataContext } from 'fontless'
import type { Plugin } from 'vite'

const mocks = vi.hoisted(() => ({
  downloadFont: vi.fn(),
  resolveModulePath: vi.fn(),
}))

vi.mock('../src/download', () => ({
  downloadFont: mocks.downloadFont,
}))
vi.mock('exsolve', async importOriginal => ({
  ...await importOriginal<typeof import('exsolve')>(),
  resolveModulePath: mocks.resolveModulePath,
}))

const { setupPublicAssetStrategy } = await import('../src/assets')
const { resolveModulePath } = await vi.importActual<typeof import('exsolve')>('exsolve')

const installedPath = resolveModulePath('subset-font', { from: import.meta.url })

beforeEach(() => {
  vi.clearAllMocks()
  mocks.downloadFont.mockResolvedValue(Buffer.from('font'))
  mocks.resolveModulePath.mockReturnValue(installedPath)
})

async function downloadRenderedFonts(font: { url: string, subset?: string }) {
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
      buildDir: `${process.cwd()}/node_modules/.cache/test-download-assets`,
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
  context!.renderedFontURLs.set('CustomFont.woff2', font as never)

  const config: { plugins: Plugin[] } = { plugins: [] }
  await nuxt.callHook('vite:extend', { config } as never)
  const plugin = config.plugins.find(p => p.name === 'nuxt-fonts-download-assets')!

  return (plugin.closeBundle as () => Promise<void>)()
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
