import fsp from 'node:fs/promises'
import { addDevServerHandler, useNitro, useNuxt } from '@nuxt/kit'
import { eventHandler, createError, lazyEventHandler } from 'h3'
import { fetch } from 'ofetch'
import chalk from 'chalk'
import { defu } from 'defu'
import type { NitroConfig } from 'nitropack'
import { hasProtocol, joinURL } from 'ufo'
import { extname, join } from 'pathe'
import { filename } from 'pathe/utils'
import { hash } from 'ohash'

import { logger } from './logger'
import { formatToExtension, parseFont } from './css/render'
import type { FontFaceData, ModuleOptions, NormalizedFontFaceData } from './types'

// TODO: replace this with nuxt/assets when it is released
export function setupPublicAssetStrategy (options: ModuleOptions['assets'] = {}) {
  const assetsBaseURL = options.prefix || '/_fonts'
  const nuxt = useNuxt()
  const renderedFontURLs = new Map<string, string>()

  function normalizeFontData (faces: FontFaceData | FontFaceData[]): NormalizedFontFaceData[] {
    const data: NormalizedFontFaceData[] = []
    for (const face of Array.isArray(faces) ? faces : [faces]) {
      data.push({
        ...face,
        src: (Array.isArray(face.src) ? face.src : [face.src]).map(src => {
          const source = typeof src === 'string' ? parseFont(src) : src
          if ('url' in source && hasProtocol(source.url, { acceptRelative: true })) {
            source.url = source.url.replace(/^\/\//, 'https://')
            const file = [
              filename(source.url.replace(/\?.*/, '')),
              hash(source) + (extname(source.url) || formatToExtension(source.format) || '')
            ].filter(Boolean).join('-')

            renderedFontURLs.set(file, source.url)
            source.url = joinURL(assetsBaseURL, file)
          }
          return source
        })
      })
    }
    return data
  }

  // Register font proxy URL for development
  addDevServerHandler({
    route: assetsBaseURL,
    handler: lazyEventHandler(async () => {
      const nitro = useNitro()
      return eventHandler(async event => {
        const filename = event.path.slice(1)
        const url = renderedFontURLs.get(event.path.slice(1))
        if (!url) { throw createError({ statusCode: 404 }) }
        const key = 'data:fonts:' + filename
        // Use nitro.storage to cache the font data between requests
        let res = await nitro.storage.getItemRaw(key)
        if (!res) {
          res = await fetch(url).then(r => r.arrayBuffer()).then(r => Buffer.from(r))
          await nitro.storage.setItemRaw(key, res)
        }
        return res
      })
    })
  })

  if (nuxt.options.dev) {
    nuxt.options.routeRules ||= {}
    nuxt.options.routeRules[joinURL(assetsBaseURL, '**')] = {
      cache: {
        maxAge: ONE_YEAR_IN_SECONDS,
      }
    }
  }

  nuxt.options.nitro.publicAssets ||= []
  const cacheDir = join(nuxt.options.buildDir, 'cache', 'fonts')
  nuxt.options.nitro.publicAssets.push()
  nuxt.options.nitro = defu(nuxt.options.nitro, {
    publicAssets: [{
      dir: cacheDir,
      maxAge: ONE_YEAR_IN_SECONDS,
      baseURL: assetsBaseURL
    }],
    prerender: {
      ignore: [assetsBaseURL]
    },
    // TODO: refactor to use nitro storage when it can be cached between builds
    storage: {
      'data:fonts:': {
        driver: 'fs',
        base: 'node_modules/.cache/nuxt-fonts/data'
      }
    }
  } satisfies NitroConfig)

  nuxt.hook('nitro:init', async (nitro) => {
    if (nuxt.options.dev) { return }
    nitro.hooks.hook('rollup:before', async () => {
      await fsp.rm(cacheDir, { recursive: true, force: true })
      await fsp.mkdir(cacheDir, { recursive: true })
      let banner = false
      for (const [filename, url] of renderedFontURLs) {
        const key = 'data:fonts:' + filename
        // Use nitro.storage to cache the font data between builds
        let res = await nitro.storage.getItemRaw(key)
        if (!res) {
          if (!banner) {
            banner = true
            logger.info('Downloading fonts...')
          }
          logger.log(chalk.gray('  ├─ ' + url))
          res = await fetch(url).then(r => r.arrayBuffer()).then(r => Buffer.from(r))
          await nitro.storage.setItemRaw(key, res)
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
