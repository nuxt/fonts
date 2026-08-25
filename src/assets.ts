import fsp from 'node:fs/promises'
import { existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
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
    const filename = event.path.split('/').pop()!.split('?')[0]!
    const font = context.renderedFontURLs.get(filename)
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

  const devRoute = joinURL(nuxt.options.runtimeConfig.app.baseURL || nuxt.options.app.baseURL, context.assetsBaseURL)
  addDevServerHandler({
    route: devRoute,
    handler: eventHandler(devEventHandler),
  })
  // nitro v2 mounts dev handlers as path prefixes whereas nitro v3 matches them as route
  // patterns, so both shapes are registered to serve font requests on either
  addDevServerHandler({
    route: joinURL(devRoute, '**'),
    handler: eventHandler(devEventHandler),
  })

  // the vite dev server sits in front of the nitro dev handlers and answers requests for
  // paths that look like static files itself, so fonts are served from here too. the plugin
  // is registered for every environment as `configureServer` is only called for plugins
  // that are not scoped to a single one
  addVitePlugin({
    name: 'nuxt-fonts-public-assets',
    async configureServer(server) {
      const handler = async (req: IncomingMessage, res: ServerResponse, next: (error?: unknown) => void) => {
        try {
          const h3evt = createEvent(req, res)
          res.end(await devEventHandler(h3evt))
        }
        catch (error) {
          next(error)
        }
      }
      // the app base URL is not stripped from the request before vite middleware runs,
      // so requests arrive at the prefixed path when a base URL is configured
      for (const route of new Set([context.assetsBaseURL, devRoute])) {
        server.middlewares.use(route, handler)
      }
    },
  })

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
    await fsp.rm(cacheDir, { recursive: true, force: true })
    await fsp.mkdir(cacheDir, { recursive: true })
    // each bundler environment transforms the same styles, so a font may already have been
    // downloaded by the time a later environment renders it again
    context.callback = (filename) => {
      const path = join(cacheDir, filename)
      if (!existsSync(path)) {
        writeFileSync(path, '')
      }
    }
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

  const downloaded = new Set<string>()
  let queue = Promise.resolve()

  // TODO: refactor to use nitro storage when it can be cached between builds
  async function downloadFonts() {
    let banner = false
    for (const [filename, font] of context.renderedFontURLs) {
      if (downloaded.has(filename)) {
        continue
      }
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
      downloaded.add(filename)
    }
    if (banner) {
      logger.success('Fonts downloaded and cached.')
    }
  }

  if (!nuxt.options.dev) {
    const flush = () => {
      queue = queue.then(downloadFonts)
      return queue
    }

    // font URLs are only known once styles have been transformed, and the bundler output
    // must be complete before nitro copies public assets into the build output
    addVitePlugin({
      name: 'nuxt-fonts-download-assets',
      apply: 'build',
      closeBundle: flush,
    })
    nuxt.hook('webpack:compiled', flush)
    nuxt.hook('rspack:compiled', flush)
    nuxt.hook('nitro:init', (nitro) => {
      nitro.hooks.hook('rollup:before', flush)
    })
  }

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
