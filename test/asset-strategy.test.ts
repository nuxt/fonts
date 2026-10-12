import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { describe, expect, it } from 'vitest'
import { createApp, toNodeListener } from 'h3'
import { runWithNuxtContext } from '@nuxt/kit'
import type { DevServerHandler, Nuxt } from '@nuxt/schema'
import type { NormalizeFontDataContext } from 'fontless'

import { setupPublicAssetStrategy } from '../src/assets.ts'
import type { ModuleOptions } from '../src/types.ts'

interface StrategyOptions {
  builder?: string
  dev?: boolean
  assets?: ModuleOptions['assets']
  nitroMajor?: 2 | 3
}

const storage = {
  getItemRaw: async () => null,
  setItemRaw: async () => {},
}

async function resolveStrategy({ builder = '@nuxt/vite-builder', dev = false, assets, nitroMajor }: StrategyOptions = {}) {
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
      _nitroMajor: nitroMajor,
      nitro: {},
      vite: {},
    },
  } as unknown as Nuxt

  let context: NormalizeFontDataContext | undefined
  nuxt.hook('fonts:public-asset-context', (ctx) => {
    context = ctx
  })

  const strategy = await runWithNuxtContext(nuxt, () => setupPublicAssetStrategy(storage as never, assets))
  await nuxt.callHook('modules:done')

  return { ...strategy, context: context!, nuxt }
}

const fontURL = new URL('../playgrounds/basic/public/custom-font.woff2', import.meta.url).href

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

  it('serves fonts in development with the `nuxt` dev handler variant on nitro v3', async () => {
    const { context, nuxt } = await resolveStrategy({ dev: true, nitroMajor: 3 })
    context.renderedFontURLs.set('custom.woff2', { url: fontURL })

    const [entry] = nuxt.options.devServerHandlers as DevServerHandler[]
    expect(nuxt.options.devServerHandlers).toHaveLength(1)
    expect(entry!.route).toBe('/_fonts/**')

    const handler = entry!.handler as (event: { req: Request }) => Promise<Response>
    const found = await handler({ req: new Request('http://localhost/_fonts/custom.woff2') })
    expect(found.status).toBe(200)
    expect(found.headers.get('cache-control')).toBe('public, max-age=31536000, immutable')
    expect((await found.arrayBuffer()).byteLength).toBeGreaterThan(0)

    const missing = await handler({ req: new Request('http://localhost/_fonts/missing.woff2') })
    expect(missing.status).toBe(404)
  })

  it('serves fonts in development with the `nitro2` dev handler variant on nitro v2', async () => {
    const { context, nuxt } = await resolveStrategy({ dev: true, nitroMajor: 2 })
    context.renderedFontURLs.set('custom.woff2', { url: fontURL })

    const app = createApp()
    for (const entry of nuxt.options.devServerHandlers as DevServerHandler[]) {
      app.use(entry.route!.replace(/\/\*\*$/, ''), entry.handler as never)
    }
    const server = createServer(toNodeListener(app)).listen(0, '127.0.0.1')
    await new Promise(resolve => server.once('listening', resolve))
    const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    try {
      const found = await fetch(`${origin}/_fonts/custom.woff2`)
      expect(found.status).toBe(200)
      expect(found.headers.get('cache-control')).toBe('public, max-age=31536000, immutable')
      expect((await found.arrayBuffer()).byteLength).toBeGreaterThan(0)

      const missing = await fetch(`${origin}/_fonts/missing.woff2`)
      expect(missing.status).toBe(404)
    }
    finally {
      server.close()
    }
  })

  it('serves fonts from a public path in development', async () => {
    const { context, buildAssets } = await resolveStrategy({ dev: true })

    expect(context.assetsBaseURL).toBe('/_fonts')
    expect(context.resolveAssetURL).toBeUndefined()
    expect(buildAssets).toBeUndefined()
  })
})
