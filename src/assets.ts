import fsp from 'node:fs/promises'
import { writeFileSync } from 'node:fs'
import { addDevServerHandler, addVitePlugin, useNuxt } from '@nuxt/kit'
import type { H3Event } from 'h3'
import { eventHandler, createError } from 'h3'
import { fetch } from 'node-fetch-native/proxy'
import { colors } from 'consola/utils'
import { defu } from 'defu'
import type { NitroConfig } from 'nitropack'
import { hasProtocol, joinRelativeURL, joinURL } from 'ufo'
import { extname, join } from 'pathe'
import { filename } from 'pathe/utils'
import { hash } from 'ohash'
import type { FontFaceData } from 'unifont'

import { storage } from './cache'
import { logger } from './logger'
import { formatToExtension, parseFont } from './css/render'
import type { ModuleOptions, RawFontFaceData } from './types'

// TODO: replace this with nuxt/assets when it is released
export async function setupPublicAssetStrategy(options: ModuleOptions['assets'] = {}) {
  const assetsBaseURL = options.prefix || '/_fonts'
  const nuxt = useNuxt()
  const renderedFontURLs = new Map<string, string>()

  function normalizeFontData(faces: RawFontFaceData | FontFaceData[]): FontFaceData[] {
    const data: FontFaceData[] = []
    for (const face of Array.isArray(faces) ? faces : [faces]) {
      data.push({
        ...face,
        unicodeRange: face.unicodeRange === undefined || Array.isArray(face.unicodeRange) ? face.unicodeRange : [face.unicodeRange],
        src: (Array.isArray(face.src) ? face.src : [face.src]).map((src) => {
          const source = typeof src === 'string' ? parseFont(src) : src
          if ('url' in source && hasProtocol(source.url, { acceptRelative: true })) {
            source.url = source.url.replace(/^\/\//, 'https://')
            const _url = source.url.replace(/\?.*/, '')
            const MAX_FILENAME_PREFIX_LENGTH = 50
            const file = [
              // TODO: investigate why negative ignore pattern below is being ignored
              hash(filename(_url) || _url).replace(/^-+/, '').slice(0, MAX_FILENAME_PREFIX_LENGTH),
              hash(source).replace(/-/, '_') + (extname(source.url) || formatToExtension(source.format) || ''),
            ].filter(Boolean).join('-')

            renderedFontURLs.set(file, source.url)
            source.originalURL = source.url
            source.url = nuxt.options.dev
              ? joinRelativeURL(nuxt.options.app.baseURL, assetsBaseURL, file)
              : joinURL(assetsBaseURL, file)

            if (!nuxt.options.dev) {
              // write stub file so Nuxt is aware to handle it like a public asset
              writeFileSync(join(cacheDir, file), '')
            }
          }
          return source
        }),
      })
    }
    return data
  }

  // Register font proxy URL for development
  async function devEventHandler(event: { path: string }) {
    const filename = event.path.slice(1)
    const url = renderedFontURLs.get(event.path.slice(1))
    if (!url) {
      throw createError({ statusCode: 404 })
    }
    const key = 'data:fonts:' + filename
    // Use storage to cache the font data between requests
    let res = await storage.getItemRaw(key)
    if (!res) {
      res = await fetch(url).then(r => r.arrayBuffer()).then(r => Buffer.from(r))
      await storage.setItemRaw(key, res)
    }
    return res
  }

  addDevServerHandler({
    route: joinURL(nuxt.options.runtimeConfig.app.baseURL || nuxt.options.app.baseURL, assetsBaseURL),
    handler: eventHandler(devEventHandler),
  })

  // add workaround for libraries like histoire/storybook
  addVitePlugin({
    name: 'nuxt-fonts-public-assets',
    async configureServer(server) {
      if (server.config.appType !== 'custom' || nuxt.options.buildId === 'storybook') {
        server.middlewares.use(
          assetsBaseURL,
          async (req, res) => { res.end(await devEventHandler({ path: req.url } as H3Event)) },
        )
      }
    },
  }, { client: true, server: false })

  if (nuxt.options.dev) {
    nuxt.options.routeRules ||= {}
    nuxt.options.routeRules[joinURL(assetsBaseURL, '**')] = {
      cache: {
        maxAge: ONE_YEAR_IN_SECONDS,
      },
    }
  }

  nuxt.options.nitro.publicAssets ||= []
  const cacheDir = join(nuxt.options.buildDir, 'cache', 'fonts')

  if (!nuxt.options.dev) {
    await fsp.mkdir(cacheDir, { recursive: true })
  }

  nuxt.options.nitro = defu(nuxt.options.nitro, {
    publicAssets: [{
      dir: cacheDir,
      maxAge: ONE_YEAR_IN_SECONDS,
      baseURL: assetsBaseURL,
    }],
    ignore: [`!${join(cacheDir, '**/*')}`],
    prerender: {
      ignore: [assetsBaseURL],
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
      for (const [filename, url] of renderedFontURLs) {
        const key = 'data:fonts:' + filename
        // Use storage to cache the font data between builds
        let res = await storage.getItemRaw(key)
        if (!res) {
          if (!banner) {
            banner = true
            logger.info('Downloading fonts...')
          }
          logger.log(colors.gray('  ├─ ' + url))
          res = await fetch(url).then(r => r.arrayBuffer()).then(r => Buffer.from(r))
          await storage.setItemRaw(key, res)
        }
        await fsp.writeFile(join(cacheDir, filename), res)
      }
      if (banner) {
        logger.success('Fonts downloaded and cached.')
      }
    })
  })

  return { normalizeFontData }
}

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365
