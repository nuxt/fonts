import { addBuildPlugin, addTemplate, defineNuxtModule } from '@nuxt/kit'
import type { ResourceMeta } from 'vue-bundle-renderer'
import { join, relative } from 'pathe'
import { withoutLeadingSlash } from 'ufo'

import defu from 'defu'
import { createResolver, resolveProviders, defaultOptions, defaultValues, generateFontFace } from 'fontless'
import type { Resolver } from 'fontless'
import { storage } from './cache'
import { FontFamilyInjectionPlugin } from './plugins/transform'
import { setupPublicAssetStrategy } from './assets'
import { logger } from './logger'
import type { ModuleHooks, ModuleOptions } from './types'
import { setupDevtoolsConnection } from './devtools'
import { toUnifontProvider } from './utils'
import local from './providers/local'

// extractable

export type {
  FontFaceData,
  ResolveFontOptions,
  LocalFontSource,
  RemoteFontSource,
  // for backwards compatibility
  FontFaceData as NormalizedFontFaceData,
  ResolveFontOptions as ResolveFontFacesOptions,
} from 'unifont'

export type {
  FontFallback,
  FontFamilyManualOverride,
  FontFamilyOverrides,
  FontFamilyProviderOverride,
  FontProviderName,
  FontSource,
} from 'fontless'

export type { FontProvider, ModuleOptions } from './types'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxt/fonts',
    configKey: 'fonts',
  },
  defaults: defu(
    {
      providers: { local },
      devtools: true,
      weights: ['400 700'],
    },
    defaultOptions,
  ),
  async setup(options, nuxt) {
    // Skip when preparing
    if (nuxt.options._prepare) return

    if (!options.defaults?.fallbacks || !Array.isArray(options.defaults.fallbacks)) {
      const fallbacks = (options.defaults!.fallbacks as Exclude<NonNullable<typeof options.defaults>['fallbacks'], string[]>) ||= {}
      for (const _key in defaultValues.fallbacks) {
        const key = _key as keyof typeof defaultValues.fallbacks
        fallbacks[key] ||= defaultValues.fallbacks[key]
      }
    }

    const _providers = resolveProviders(options.providers, { root: nuxt.options.rootDir, alias: nuxt.options.alias })

    const { normalizeFontData } = await setupPublicAssetStrategy(options.assets)
    const { exposeFont } = setupDevtoolsConnection(nuxt.options.dev && !!options.devtools)

    let resolveFontFaceWithOverride: Resolver
    let resolvePromise: Promise<Resolver>

    // Allow registering and disabling providers
    nuxt.hook('modules:done', async () => {
      const providers = await _providers
      await nuxt.callHook('fonts:providers', providers)
      for (const key in providers) {
        const provider = providers[key]
        if (provider && typeof provider === 'object') {
          providers[key] = toUnifontProvider(key, provider)
        }
      }

      resolvePromise = createResolver({ options, logger, providers, storage, exposeFont, normalizeFontData })
    })

    nuxt.options.css.push('#build/nuxt-fonts-global.css')
    addTemplate({
      filename: 'nuxt-fonts-global.css',
      // Seemingly necessary to allow vite to process file 🤔
      write: true,
      async getContents() {
        let css = ''
        for (const family of options.families || []) {
          if (!family.global) continue
          resolveFontFaceWithOverride ||= await resolvePromise
          const result = await resolveFontFaceWithOverride(family.name, family)
          for (const font of result?.fonts || []) {
            // We only inject basic `@font-face` as metrics for fallbacks don't make sense
            // in this context unless we provide a name for the user to use elsewhere as a
            // `font-family`.
            css += generateFontFace(family.name, font) + '\n'
          }
        }
        return css
      },
    })

    const fontMap = new Map<string, Set<string>>()
    let viteEntry: string | undefined
    nuxt.hook('vite:extend', (ctx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      viteEntry = relative(ctx.config.root || nuxt.options.srcDir, (ctx as any).entry)
    })
    nuxt.hook('build:manifest', (manifest) => {
      const unprocessedPreloads = new Set([...fontMap.keys()])
      function addPreloadLinks(chunk: ResourceMeta, urls: Set<string>, id?: string) {
        chunk.assets ||= []
        for (const url of urls) {
          if (!chunk.assets.includes(url)) {
            chunk.assets.push(url)
            if (id) {
              unprocessedPreloads.delete(id)
            }
          }
          if (!manifest[url]) {
            manifest[url] = {
              file: relative(nuxt.options.app.buildAssetsDir, url),
              resourceType: 'font',
              preload: true,
            }
          }
        }
      }

      // CSS files in bundle
      let entry: ResourceMeta | undefined
      for (const chunk of Object.values(manifest)) {
        if (chunk.isEntry && chunk.src === viteEntry) {
          entry = chunk
        }
        if (!chunk.css || chunk.css.length === 0) continue
        for (const css of chunk.css) {
          const assetName = withoutLeadingSlash(join(nuxt.options.app.buildAssetsDir, css))
          if (fontMap.has(assetName)) {
            addPreloadLinks(chunk, fontMap.get(assetName)!, assetName)
          }
        }
      }

      // Source files in bundle
      for (const [id, urls] of fontMap) {
        const chunk = manifest[relative(nuxt.options.srcDir, id)]
        if (!chunk) continue

        addPreloadLinks(chunk, urls, id)
      }

      if (entry) {
        addPreloadLinks(entry, new Set([...unprocessedPreloads].flatMap(v => [...fontMap.get(v) || []])))
      }
    })

    addBuildPlugin(FontFamilyInjectionPlugin({
      dev: nuxt.options.dev,
      fontsToPreload: fontMap,
      processCSSVariables: options.experimental?.processCSSVariables ?? options.processCSSVariables,
      shouldPreload(fontFamily, fontFace) {
        const override = options.families?.find(f => f.name === fontFamily)
        if (override && override.preload !== undefined) {
          return override.preload
        }
        if (options.defaults?.preload !== undefined) {
          return options.defaults.preload
        }
        return fontFace.src.some(s => 'url' in s) && !fontFace.unicodeRange
      },
      async resolveFontFace(fontFamily, fallbackOptions) {
        const override = options.families?.find(f => f.name === fontFamily)

        // This CSS will be injected in a separate location
        if (override?.global) {
          return
        }

        resolveFontFaceWithOverride ||= await resolvePromise
        return resolveFontFaceWithOverride(fontFamily, override, fallbackOptions)
      },
    }))
  },
})

declare module '@nuxt/schema' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface NuxtHooks extends ModuleHooks {}
}
