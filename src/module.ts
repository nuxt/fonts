import { readFile } from 'node:fs/promises'
import { addBuildPlugin, addServerPlugin, addTemplate, createResolver as createLocalResolver, defineNuxtModule, resolvePath } from '@nuxt/kit'
import type { ResourceMeta } from 'vue-bundle-renderer'
import { join, relative } from 'pathe'
import { withoutLeadingSlash } from 'ufo'

import defu from 'defu'
import { createResolver, resolveProviders, defaultOptions, defaultValues, generateFontFace } from 'fontless'
import type { FontlessOptions, Resolver } from 'fontless'
import type { FontFaceData } from 'unifont'
import { createFontStorage } from './cache'
import { FontFamilyInjectionPlugin } from './plugins/transform'
import { setupPublicAssetStrategy } from './assets'
import { selectFontsToPreload } from './preload'
import { logger } from './logger'
import type { ModuleHooks, ModuleOptions } from './types'
import { setupDevtoolsConnection } from './devtools'
import { toUnifontProvider } from './utils'
import local from './providers/local'

// extractable

export type {
  FontFaceData,
  FontFaceMeta,
  FontStyles,
  InitializedProvider,
  ResolveFontOptions,
  ResolveFontResult,
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
  FontFormat,
  FontProviderName,
  FontSource,
  ProviderFamilyOptions,
} from 'fontless'

export type { FontProvider, ModuleOptions } from './types'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxt/fonts',
    configKey: 'fonts',
  },
  defaults: nuxt => defu(
    {
      providers: { local },
      npm: {
        root: nuxt.options.rootDir,
        readFile: path => readFile(path, 'utf-8'),
      },
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
        const key = _key as keyof typeof fallbacks
        fallbacks[key] ||= defaultValues.fallbacks[key]
      }
    }

    const _providers = resolveProviders(options.providers, { root: nuxt.options.rootDir, alias: nuxt.options.alias })

    const storage = createFontStorage(options.cache, nuxt.options.rootDir)

    // A missing font in a production build is worse than a failed build, but in dev we
    // keep going so a flaky provider does not block work.
    options.throwOnError ??= !nuxt.options.dev

    const { normalizeFontData } = await setupPublicAssetStrategy(storage, options.assets, { throwOnError: options.throwOnError })
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

      resolvePromise = createResolver({ options: options as FontlessOptions, logger, providers, storage, exposeFont, normalizeFontData })
    })

    const fontMap = new Map<string, Set<string>>()
    const globalFontsToPreload = new Set<string>()

    const resolveFontsToPreload = (fontFamily: string, fonts: FontFaceData[]) => {
      const preload = options.families?.find(f => f.name === fontFamily)?.preload ?? options.defaults?.preload
      return selectFontsToPreload(preload, fontFamily, fonts)
    }

    // Nuxt's `inlineStyles` only inlines component styles by default, so `@font-face`
    // rules that land in global stylesheets are served via `<link>` while the rest of the
    // page's styles are inlined. We render those rules in the document head instead, and
    // strip them from the bundled stylesheet.
    const globalStylesheets = new Set<string>()
    const hoistedFontFaces = new Set<string>()
    let clientEntry: string | undefined

    // Nuxt inlines global stylesheets itself when `inlineStyles` is enabled for the client
    // entry, in which case their `@font-face` rules are already server-rendered.
    const hoistsFontFaces = () => {
      const inline = nuxt.options.features.inlineStyles
      if (nuxt.options.dev || inline === false) {
        return false
      }
      return typeof inline === 'function' ? !clientEntry || !inline(clientEntry) : inline !== true
    }

    nuxt.hook('modules:done', async () => {
      for (const file of nuxt.options.css) {
        globalStylesheets.add(await resolvePath(file))
      }
    })

    if (!nuxt.options.dev && nuxt.options.features.inlineStyles !== false) {
      const { resolve } = createLocalResolver(import.meta.url)
      addServerPlugin(resolve('./runtime/nitro/inline-font-faces'))
      nuxt.hook('nitro:config', (config) => {
        config.virtual ||= {}
        config.virtual['#nuxt-fonts-inline'] = () => {
          const css = hoistsFontFaces() ? [...hoistedFontFaces].join('').replace(/\s*\n\s*/g, '') : ''
          return `export const css = ${JSON.stringify(css)}`
        }
      })
    }

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
          if (!result?.fonts?.length) continue

          // Global fonts are injected outside of the CSS transform plugin, so they
          // never reach `fontMap`. Their preloads are attached to the entry chunk as
          // the global CSS is loaded on every route.
          for (const font of resolveFontsToPreload(family.name, result.fonts)) {
            const url = font.src.find(s => 'url' in s)?.url
            if (url) {
              globalFontsToPreload.add(url)
            }
          }

          for (const font of result.fonts) {
            // We only inject basic `@font-face` as metrics for fallbacks don't make sense
            // in this context unless we provide a name for the user to use elsewhere as a
            // `font-family`.
            const fontFace = generateFontFace(family.name, font)
            hoistedFontFaces.add(fontFace)
            css += fontFace + '\n'
          }
        }
        return css
      },
    })

    let viteEntry: string | undefined
    nuxt.hook('vite:extend', (ctx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clientEntry = (ctx as any).entry
      viteEntry = relative(ctx.config.root || nuxt.options.srcDir, clientEntry!)
    })
    nuxt.hook('build:manifest', (manifest) => {
      const unprocessedPreloads = new Set([...fontMap.keys()])
      function addPreloadLinks(chunk: ResourceMeta, urls: Set<string>, id?: string) {
        chunk.assets ||= []
        if (id) {
          unprocessedPreloads.delete(id)
        }
        for (const url of urls) {
          if (!chunk.assets.includes(url)) {
            chunk.assets.push(url)
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
        const path = relative(nuxt.options.srcDir, id)
        // Style blocks are keyed by their module id, which carries a query
        // (`?vue&type=style&index=0&lang.css`, plus `?inline&used` when inlining
        // styles); the manifest is keyed by the component that owns them.
        const chunk = manifest[path] || manifest[path.replace(/\?.*$/, '')]
        if (!chunk) continue

        addPreloadLinks(chunk, urls, id)
      }

      if (entry) {
        addPreloadLinks(entry, new Set([...globalFontsToPreload, ...[...unprocessedPreloads].flatMap(v => [...fontMap.get(v) || []])]))
      }
      else if (globalFontsToPreload.size > 0 || unprocessedPreloads.size > 0) {
        logger.debug('Could not find the entry chunk in the build manifest, so some fonts will not be preloaded.')
      }
    })

    addBuildPlugin(FontFamilyInjectionPlugin({
      dev: nuxt.options.dev,
      hoistsFontFaces,
      hoistedFontFaces,
      isGlobalStylesheet: id => globalStylesheets.has(id),
      fontsToPreload: fontMap,
      processCSSVariables: options.experimental?.processCSSVariables ?? options.processCSSVariables,
      selectFontsToPreload: resolveFontsToPreload,
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
