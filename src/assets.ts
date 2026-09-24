import fsp from 'node:fs/promises'
import { existsSync, writeFileSync } from 'node:fs'
import { AsyncLocalStorage } from 'node:async_hooks'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { addDevServerHandler, addVitePlugin, useNuxt } from '@nuxt/kit'
import type { H3Event } from 'h3'
import { eventHandler, createEvent, createError, setResponseHeader } from 'h3'
import { colors } from 'consola/utils'
import { defu } from 'defu'
import type { NitroConfig } from 'nitropack'
import { joinURL, withoutLeadingSlash } from 'ufo'
import { join } from 'pathe'

import { normalizeFontData } from 'fontless'
import type { NormalizeFontDataContext, RenderedFont } from 'fontless'
import type { FontFaceData } from 'unifont'
import type { FontStorage } from './cache'
import { downloadFont } from './download'
import { assertSubsetter, subsetFont } from './subset'
import { logger } from './logger'
import type { ModuleOptions } from './types'

interface PublicAssetStrategyOptions {
  /** Whether a font that cannot be downloaded should fail the build. */
  throwOnError?: boolean
}

/** Hands a font file to Vite's asset pipeline, returning a placeholder Vite rewrites into a URL. */
export const assetEmitter = new AsyncLocalStorage<(file: string) => string>()

export interface BuildAssetStrategy {
  /** The bundle file name a font file is emitted as, relative to the client output root. */
  fileName: (file: string) => string
  /** The file names emitted so far in the current build. */
  emitted: Set<string>
  /**
   * The path each generated font URL is served from, keyed by the URL embedded in CSS.
   *
   * Vite rewrites asset placeholders only within the bundle, so preload links are resolved here.
   */
  publicURLs: Map<string, string>
  /** The bundle file name each emitted asset placeholder stands for. */
  placeholders: Map<string, string>
}

const VITE_ASSET_RE = /__VITE_ASSET__[\w$-]+__/g
const ROOT_RELATIVE_URL_RE = /url\((['"]?)(\/(?!\/)[^'")]*)\1\)/g

/**
 * Resolve the font URLs of `@font-face` rules rendered in the document head, which never
 * pass through the bundle, the way Vite resolves them within it.
 *
 * Placeholders resolve to an already-based URL, so they are substituted after the
 * root-relative rewrite rather than being caught by it a second time.
 */
export function resolveInlineFontURLs(css: string, base: string, placeholders: Map<string, string>) {
  return css
    .replace(ROOT_RELATIVE_URL_RE, (_, quote: string, url: string) => `url(${quote}${joinURL(base, url)}${quote})`)
    .replace(VITE_ASSET_RE, (placeholder) => {
      const fileName = placeholders.get(placeholder)
      return fileName ? joinURL(base, fileName) : placeholder
    })
}

export interface PublicAssetContext extends NormalizeFontDataContext {
  /**
   * Read a font file we serve, by its URL or file name, downloading and subsetting it if needed.
   *
   * Returns `undefined` for a file we don't serve.
   */
  readFont: (url: string) => Promise<Buffer | undefined>
}

/**
 * Replace the Vite asset placeholders in a font face with the path each file is served from.
 *
 * Fonts resolved while Vite transforms a stylesheet only get their final URL once Vite writes the
 * bundle, so anything outside the bundle would otherwise see a placeholder.
 */
export function resolveFontFacePublicURLs(face: FontFaceData, placeholders: Map<string, string>, baseURL: string): FontFaceData {
  return {
    ...face,
    src: face.src.map((source) => {
      const fileName = 'url' in source ? placeholders.get(source.url) : undefined
      return fileName ? { ...source, url: joinURL(baseURL, fileName) } : source
    }),
  }
}

// TODO: replace this with nuxt/assets when it is released
export async function setupPublicAssetStrategy(storage: FontStorage, options: ModuleOptions['assets'] = {}, { throwOnError = true }: PublicAssetStrategyOptions = {}) {
  const nuxt = useNuxt()

  const buildAssets = !nuxt.options.dev && nuxt.options.builder === '@nuxt/vite-builder'

  const assetsBaseURL = buildAssets
    ? joinURL(nuxt.options.app.buildAssetsDir, options.prefix || 'fonts')
    : options.prefix || '/_fonts'

  const context: PublicAssetContext = {
    dev: nuxt.options.dev,
    renderedFontURLs: new Map(),
    assetsBaseURL,
    resolveAssetURL: buildAssets ? file => assetEmitter.getStore()?.(file) : undefined,
    baseURL: nuxt.options.runtimeConfig.app.baseURL || nuxt.options.app.baseURL,
    root: nuxt.options.rootDir,
    readFont,
  }
  nuxt.hook('modules:done', () => nuxt.callHook('fonts:public-asset-context', context))

  async function readFont(url: string) {
    const filename = url.split('/').pop()!.split('?')[0]!
    const font = context.renderedFontURLs.get(filename)
    if (!font) {
      return
    }
    const key = 'data:fonts:' + filename
    // Use storage to cache the font data between requests
    let res = await storage.getItemRaw<Buffer>(key)
    if (!res) {
      res = await readFontData(font, nuxt.options.rootDir)
      await storage.setItemRaw(key, res)
    }
    return res
  }

  // Register font proxy URL for development
  async function devEventHandler(event: H3Event) {
    const res = await readFont(event.path)
    if (!res) {
      throw createError({ statusCode: 404 })
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

  const publicURLs = new Map<string, string>()

  if (!nuxt.options.dev) {
    await fsp.rm(cacheDir, { recursive: true, force: true })
    await fsp.mkdir(cacheDir, { recursive: true })
    // each bundler environment transforms the same styles, so a font may already have been
    // downloaded by the time a later environment renders it again
    context.callback = (filename, url) => {
      const path = join(cacheDir, filename)
      if (!existsSync(path)) {
        writeFileSync(path, '')
      }
      publicURLs.set(url, joinURL('/', assetsBaseURL, filename))
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
    const needsSubsetting = [...context.renderedFontURLs].filter(([filename, font]) => font.subset && !downloaded.has(filename))
    if (needsSubsetting.length > 0) {
      await assertSubsetter(nuxt.options.rootDir, needsSubsetting.map(([, font]) => font.url))
    }

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
          res = await readFontData(font, nuxt.options.rootDir)
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

  const emitted = new Set<string>()
  const placeholders = new Map<string, string>()

  return {
    normalizeFontData: normalizeFontData.bind(null, context),
    buildAssets: buildAssets
      ? {
        emitted,
        publicURLs,
        placeholders,
        fileName: (file: string) => {
          const fileName = withoutLeadingSlash(joinURL(assetsBaseURL, file))
          emitted.add(fileName)
          return fileName
        },
      } satisfies BuildAssetStrategy
      : undefined,
  }
}

async function readFontData({ url, init, subset, variationAxes }: RenderedFont, rootDir: string) {
  const data = url.startsWith('file://')
    ? await fsp.readFile(fileURLToPath(url))
    : await downloadFont(url, { init })

  return subset ? await subsetFont(data, subset, url, rootDir, variationAxes) : data
}

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365
