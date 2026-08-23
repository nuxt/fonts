import fsp from 'node:fs/promises'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { addDevServerHandler, addVitePlugin, useNuxt } from '@nuxt/kit'
import type { H3Event } from 'h3'
import { eventHandler, createEvent, createError, setResponseHeader } from 'h3'
import { colors } from 'consola/utils'
import { defu } from 'defu'
import type { NitroConfig } from 'nitropack'
import { joinURL } from 'ufo'
import { join } from 'pathe'

import { normalizeFontData } from 'fontless'
import type { NormalizeFontDataContext, RenderedFont } from 'fontless'
import type { Storage, StorageValue } from 'unstorage'
import { downloadFont } from './download'
import { logger } from './logger'
import type { ModuleOptions } from './types'

interface PublicAssetStrategyOptions {
  /** Whether a font that cannot be downloaded should fail the build. */
  throwOnError?: boolean
}

// TODO: replace this with nuxt/assets when it is released
export async function setupPublicAssetStrategy(storage: Storage<StorageValue>, options: ModuleOptions['assets'] = {}, { throwOnError = true }: PublicAssetStrategyOptions = {}) {
  const nuxt = useNuxt()

  const context: NormalizeFontDataContext = {
    dev: nuxt.options.dev,
    renderedFontURLs: new Map(),
    assetsBaseURL: options.prefix || '/_fonts',
    baseURL: nuxt.options.runtimeConfig.app.baseURL || nuxt.options.app.baseURL,
    root: nuxt.options.rootDir,
  }
  nuxt.hook('modules:done', () => nuxt.callHook('fonts:public-asset-context', context))

  // Register font proxy URL for development
  async function devEventHandler(event: H3Event) {
    const filename = event.path.slice(1)
    const font = context.renderedFontURLs.get(event.path.slice(1))
    if (!font) {
      throw createError({ statusCode: 404 })
    }
    const key = 'data:fonts:' + filename
    // Use storage to cache the font data between requests
    let res = await storage.getItemRaw<Buffer>(key)
    if (!res) {
      res = await readFontData(font)
      await storage.setItemRaw(key, res)
    }
    // Set immutable cache headers to prevent font flashes during development
    setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
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
          async (req, res) => {
            const h3evt = createEvent(req, res)
            res.end(await devEventHandler(h3evt))
          },
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
      for (const [filename, font] of context.renderedFontURLs) {
        const key = 'data:fonts:' + filename
        // Use storage to cache the font data between builds
        let res = await storage.getItemRaw<Buffer>(key)
        if (!res) {
          if (!banner) {
            banner = true
            logger.info('Downloading fonts...')
          }
          logger.log(colors.gray('  ├─ ' + font.url))
          try {
            res = await readFontData(font)
          }
          catch (error) {
            if (throwOnError) {
              throw error
            }
            logger.warn(`${(error as Error).message} This font will be missing from your build. Set \`fonts.throwOnError\` to \`true\` to fail the build instead.`)
            continue
          }
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

async function readFontData({ url, init }: RenderedFont) {
  if (url.startsWith('file://')) {
    return await fsp.readFile(fileURLToPath(url))
  }
  return await downloadFont(url, { init })
}

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365
