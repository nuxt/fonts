import { describe, expect, it } from 'vitest'
import { runWithNuxtContext } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { NormalizeFontDataContext } from 'fontless'

import { setupPublicAssetStrategy } from '../src/assets'
import type { ModuleOptions } from '../src/types'

interface StrategyOptions {
  builder?: string
  dev?: boolean
  assets?: ModuleOptions['assets']
}

async function resolveStrategy({ builder = '@nuxt/vite-builder', dev = false, assets }: StrategyOptions = {}) {
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
      dev,
      builder,
      rootDir: process.cwd(),
      buildDir: `${process.cwd()}/node_modules/.cache/test-asset-strategy`,
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

  const strategy = await runWithNuxtContext(nuxt, () => setupPublicAssetStrategy({} as never, assets))
  await nuxt.callHook('modules:done')

  return { ...strategy, context: context!, nuxt }
}

describe('asset strategy', () => {
  it('emits fonts as build assets under `buildAssetsDir` with vite', async () => {
    const { context, buildAssets, nuxt } = await resolveStrategy()

    expect(context.assetsBaseURL).toBe('/_nuxt/fonts')
    expect(context.resolveAssetURL).toBeTypeOf('function')
    expect(buildAssets?.fileName('font.woff2')).toBe('_nuxt/fonts/font.woff2')
    expect(nuxt.options.nitro.publicAssets?.[0]?.baseURL).toBe('/_nuxt/fonts')
  })

  it('resolves `assets.prefix` relative to `buildAssetsDir` with vite', async () => {
    const { context } = await resolveStrategy({ assets: { prefix: '/my-fonts' } })

    expect(context.assetsBaseURL).toBe('/_nuxt/my-fonts')
  })

  it('serves fonts from a public path with builders that cannot emit build assets', async () => {
    for (const builder of ['@nuxt/webpack-builder', '@nuxt/rspack-builder']) {
      const { context, buildAssets, nuxt } = await resolveStrategy({ builder })

      expect.soft(context.assetsBaseURL).toBe('/_fonts')
      expect.soft(context.resolveAssetURL).toBeUndefined()
      expect.soft(buildAssets).toBeUndefined()
      expect.soft(nuxt.options.nitro.publicAssets?.[0]?.baseURL).toBe('/_fonts')
    }
  })

  it('keeps `assets.prefix` a public path with builders that cannot emit build assets', async () => {
    const { context } = await resolveStrategy({ builder: '@nuxt/webpack-builder', assets: { prefix: '/my-fonts' } })

    expect(context.assetsBaseURL).toBe('/my-fonts')
  })

  it('serves fonts from a public path in development', async () => {
    const { context, buildAssets } = await resolveStrategy({ dev: true })

    expect(context.assetsBaseURL).toBe('/_fonts')
    expect(context.resolveAssetURL).toBeUndefined()
    expect(buildAssets).toBeUndefined()
  })
})
