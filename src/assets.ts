import fsp from 'node:fs/promises'
import { writeFileSync } from 'node:fs'
import { addDevServerHandler, addVitePlugin, useNuxt } from '@nuxt/kit'
import type { H3Event } from 'h3'
import { eventHandler, createError } from 'h3'
import { $fetch } from 'ofetch'
import { colors } from 'consola/utils'
import { defu } from 'defu'
import type { NitroConfig } from 'nitropack'
import { joinURL } from 'ufo'
import { join } from 'pathe'

import { normalizeFontData } from 'fontless'
import type { NormalizeFontDataContext } from 'fontless'
import { storage } from './cache'
import { logger } from './logger'
import type { ModuleOptions } from './types'

// TODO: replace this with nuxt/assets when it is released
export async function setupPublicAssetStrategy(options: ModuleOptions['assets'] = {}) {
  const nuxt = useNuxt()

  const context: NormalizeFontDataContext = {
    dev: nuxt.options.dev,
    renderedFontURLs: new Map<string, string>(),
    assetsBaseURL: options.prefix || '/_fonts',
  }
  nuxt.hook('modules:done', () => nuxt.callHook('fonts:public-asset-context', context))

  // Register font proxy URL for development
  async function devEventHandler(event: { path: string }) {
    const filename = event.path.slice(1)
    const url = context.renderedFontURLs.get(event.path.slice(1))
    if (!url) {
      throw createError({ statusCode: 404 })
    }
    const key = 'data:fonts:' + filename
    // Use storage to cache the font data between requests
    let res = await storage.getItemRaw<Buffer>(key)
    if (!res) {
      res = await $fetch(url, { responseType: 'arrayBuffer' }).then(b => Buffer.from(b))
      await storage.setItemRaw(key, res)
    }
    return res
  }

  addDevServerHandler({
    route: joinURL(nuxt.options.runtimeConfig.app.baseURL || nuxt.options.app.baseURL, context.assetsBaseURL),
    handler: eventHandler(devEventHandler),
  })

  // add workaround for libraries like histoire/storybook
  addVitePlugin({
    name: 'nuxt-fonts-public-assets',
    async configureServer(server) {
      if (server.config.appType !== 'custom' || nuxt.options.buildId === 'storybook') {
        server.middlewares.use(
          context.assetsBaseURL,
          async (req, res) => { res.end(await devEventHandler({ path: req.url } as H3Event)) },
        )
      }
    },
  }, { client: true, server: false })

  if (nuxt.options.dev) {
    nuxt.options.routeRules ||= {}
    nuxt.options.routeRules[joinURL(context.assetsBaseURL, '**')] = {
      cache: {
        maxAge: ONE_YEAR_IN_SECONDS,
      },
    }
  }

  nuxt.options.nitro.publicAssets ||= []
  const cacheDir = join(nuxt.options.buildDir, 'cache', 'fonts')

  if (!nuxt.options.dev) {
    await fsp.mkdir(cacheDir, { recursive: true })
    context.callback = filename => writeFileSync(join(cacheDir, filename), '')
  }

  nuxt.options.nitro = defu(nuxt.options.nitro, {
    publicAssets: [{
      dir: cacheDir,
      maxAge: ONE_YEAR_IN_SECONDS,
      baseURL: context.assetsBaseURL,
    }],
    ignore: [`!${join(cacheDir, '**/*')}`],
    prerender: {
      ignore: [context.assetsBaseURL],
    },
  } satisfies NitroConfig)

  // TODO: refactor to use nitro storage when it can be cached between builds
  nuxt.hook('nitro:init', (nitro) => {
    if (nuxt.options.dev) {
      return
    }
    let built = false
    nuxt.hook('vite:compiled', () => {
      built = true
    })
    nuxt.hook('webpack:compiled', () => {
      built = true
    })
    nitro.hooks.hook('rollup:before', async () => {
      if (!built) {
        return
      }
      await fsp.rm(cacheDir, { recursive: true, force: true })
      await fsp.mkdir(cacheDir, { recursive: true })
      let banner = false
      for (const [filename, url] of context.renderedFontURLs) {
        const key = 'data:fonts:' + filename
        // Use storage to cache the font data between builds
        let res = await storage.getItemRaw<Buffer>(key)
        if (!res) {
          if (!banner) {
            banner = true
            logger.info('Downloading fonts...')
          }
          logger.log(colors.gray('  ├─ ' + url))
          const r = await $fetch(url, { responseType: 'arrayBuffer' })
          res = Buffer.from(r)
          await storage.setItemRaw(key, res)
        }
        await fsp.writeFile(join(cacheDir, filename), res)
      }
      if (banner) {
        logger.success('Fonts downloaded and cached.')
      }
    })
  })

  return {
    normalizeFontData: normalizeFontData.bind(null, context),
  }
}

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365
