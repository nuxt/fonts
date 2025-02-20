import { addBuildPlugin, addTemplate, defineNuxtModule, useNuxt, findPath, resolvePath } from '@nuxt/kit'
import { createJiti } from 'jiti'
import type { ResourceMeta } from 'vue-bundle-renderer'
import { join, relative } from 'pathe'
import { createUnifont, providers } from 'unifont'
import type { Provider, ProviderFactory } from 'unifont'
import { withoutLeadingSlash } from 'ufo'

import local from './providers/local'

import { storage } from './cache'
import { FontFamilyInjectionPlugin, type FontFaceResolution } from './plugins/transform'
import { generateFontFace } from './css/render'
import { addLocalFallbacks } from './css/parse'
import type { GenericCSSFamily } from './css/parse'
import { setupPublicAssetStrategy } from './assets'
import type { FontFamilyManualOverride, FontFamilyProviderOverride, FontProvider, ModuleHooks, ModuleOptions, FontFaceData } from './types'
import { setupDevtoolsConnection } from './devtools'
import { logger } from './logger'
import { toUnifontProvider } from './utils'

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
  FontProvider,
  FontFallback,
  FontFamilyManualOverride,
  FontFamilyOverrides,
  FontFamilyProviderOverride,
  FontProviderName,
  FontSource,
  ModuleOptions,
} from './types'

const defaultValues = {
  weights: [400],
  styles: ['normal', 'italic'] as const,
  subsets: [
    'cyrillic-ext',
    'cyrillic',
    'greek-ext',
    'greek',
    'vietnamese',
    'latin-ext',
    'latin',
  ],
  fallbacks: {
    'serif': ['Times New Roman'],
    'sans-serif': ['Arial'],
    'monospace': ['Courier New'],
    'cursive': [],
    'fantasy': [],
    'system-ui': [
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
    ],
    'ui-serif': ['Times New Roman'],
    'ui-sans-serif': ['Arial'],
    'ui-monospace': ['Courier New'],
    'ui-rounded': [],
    'emoji': [],
    'math': [],
    'fangsong': [],
  },
} satisfies ModuleOptions['defaults']

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxt/fonts',
    configKey: 'fonts',
  },
  defaults: {
    devtools: true,
    experimental: {
      processCSSVariables: false,
      disableLocalFallbacks: false,
    },
    defaults: {},
    assets: {
      prefix: '/_fonts',
    },
    local: {},
    google: {},
    adobe: {
      id: '',
    },
    providers: {
      local,
      adobe: providers.adobe,
      google: providers.google,
      googleicons: providers.googleicons,
      bunny: providers.bunny,
      fontshare: providers.fontshare,
      fontsource: providers.fontsource,
    },
  },
  async setup(options, nuxt) {
    // Skip when preparing
    if (nuxt.options._prepare) return

    // Custom merging for defaults - providing a value for any default will override module
    // defaults entirely (to prevent array merging)
    const normalizedDefaults = {
      weights: (options.defaults?.weights || defaultValues.weights).map(v => String(v)),
      styles: options.defaults?.styles || defaultValues.styles,
      subsets: options.defaults?.subsets || defaultValues.subsets,
      fallbacks: Object.fromEntries(Object.entries(defaultValues.fallbacks).map(([key, value]) => [
        key,
        Array.isArray(options.defaults?.fallbacks) ? options.defaults.fallbacks : options.defaults?.fallbacks?.[key as GenericCSSFamily] || value,
      ])) as Record<GenericCSSFamily, string[]>,
    }

    if (!options.defaults?.fallbacks || !Array.isArray(options.defaults.fallbacks)) {
      const fallbacks = (options.defaults!.fallbacks as Exclude<NonNullable<typeof options.defaults>['fallbacks'], string[]>) ||= {}
      for (const _key in defaultValues.fallbacks) {
        const key = _key as keyof typeof defaultValues.fallbacks
        fallbacks[key] ||= defaultValues.fallbacks[key]
      }
    }

    // Set `options.experimental.processCSSVariables` to `true` if TailwindCSS V4 is installed (which requires @tailwindcss/vite or @tailwindcss/postcss)
    if (await findPath(await resolvePath('@tailwindcss/vite')) || await findPath(await resolvePath('@tailwindcss/postcss'))) {
      logger.info('Detected TailwindCSS V4, enabling `experimental.processCSSVariables`.')
      options.experimental ??= {}
      options.experimental.processCSSVariables = true
    }

    const providers = await resolveProviders(options.providers)
    const prioritisedProviders = new Set<string>()

    // TODO: export Unifont type
    let unifont: Awaited<ReturnType<typeof createUnifont>>

    // Allow registering and disabling providers
    nuxt.hook('modules:done', async () => {
      await nuxt.callHook('fonts:providers', providers)
      const resolvedProviders: Array<Provider> = []
      for (const [key, provider] of Object.entries(providers)) {
        if (options.providers?.[key] === false || (options.provider && options.provider !== key)) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete providers[key]
        }
        else {
          const unifontProvider = provider instanceof Function ? provider : toUnifontProvider(key, provider)
          const providerOptions = (options[key as 'google' | 'local' | 'adobe'] || {}) as Record<string, unknown>
          resolvedProviders.push(unifontProvider(providerOptions))
        }
      }

      for (const val of options.priority || []) {
        if (val in providers) prioritisedProviders.add(val)
      }
      for (const provider in providers) {
        prioritisedProviders.add(provider)
      }

      unifont = await createUnifont(resolvedProviders, { storage })
    })

    const { normalizeFontData } = await setupPublicAssetStrategy(options.assets)
    const { exposeFont } = setupDevtoolsConnection(nuxt.options.dev && !!options.devtools)

    function addFallbacks(fontFamily: string, font: FontFaceData[]) {
      if (options.experimental?.disableLocalFallbacks) {
        return font
      }
      return addLocalFallbacks(fontFamily, font)
    }

    async function resolveFontFaceWithOverride(fontFamily: string, override?: FontFamilyManualOverride | FontFamilyProviderOverride, fallbackOptions?: { fallbacks: string[], generic?: GenericCSSFamily }): Promise<FontFaceResolution | undefined> {
      const fallbacks = override?.fallbacks || normalizedDefaults.fallbacks[fallbackOptions?.generic || 'sans-serif']

      if (override && 'src' in override) {
        const fonts = addFallbacks(fontFamily, normalizeFontData({
          src: override.src,
          display: override.display,
          weight: override.weight,
          style: override.style,
        }))
        exposeFont({
          type: 'manual',
          fontFamily,
          fonts,
        })
        return {
          fallbacks,
          fonts,
        }
      }

      // Respect fonts that should not be resolved through `@nuxt/fonts`
      if (override?.provider === 'none') {
        return
      }

      // Respect custom weights, styles and subsets options
      const defaults = { ...normalizedDefaults, fallbacks }
      for (const key of ['weights', 'styles', 'subsets'] as const) {
        if (override?.[key]) {
          defaults[key as 'weights'] = override[key]!.map(v => String(v))
        }
      }

      // Handle explicit provider
      if (override?.provider) {
        if (override.provider in providers) {
          const result = await unifont.resolveFont(fontFamily, defaults, [override.provider])
          // Rewrite font source URLs to be proxied/local URLs
          const fonts = normalizeFontData(result?.fonts || [])
          if (!fonts.length || !result) {
            logger.warn(`Could not produce font face declaration from \`${override.provider}\` for font family \`${fontFamily}\`.`)
            return
          }
          const fontsWithLocalFallbacks = addFallbacks(fontFamily, fonts)
          exposeFont({
            type: 'override',
            fontFamily,
            provider: override.provider,
            fonts: fontsWithLocalFallbacks,
          })
          return {
            fallbacks: result.fallbacks || defaults.fallbacks,
            fonts: fontsWithLocalFallbacks,
          }
        }

        // If not registered, log and fall back to default providers
        logger.warn(`Unknown provider \`${override.provider}\` for font family \`${fontFamily}\`. Falling back to default providers.`)
      }

      const result = await unifont.resolveFont(fontFamily, defaults, [...prioritisedProviders])
      if (result) {
        // Rewrite font source URLs to be proxied/local URLs
        const fonts = normalizeFontData(result.fonts)
        if (fonts.length > 0) {
          const fontsWithLocalFallbacks = addFallbacks(fontFamily, fonts)
          // TODO: expose provider name in result
          exposeFont({
            type: 'auto',
            fontFamily,
            provider: result.provider || 'unknown',
            fonts: fontsWithLocalFallbacks,
          })
          return {
            fallbacks: result.fallbacks || defaults.fallbacks,
            fonts: fontsWithLocalFallbacks,
          }
        }
        if (override) {
          logger.warn(`Could not produce font face declaration for \`${fontFamily}\` with override.`)
        }
      }
    }

    nuxt.options.css.push('#build/nuxt-fonts-global.css')
    addTemplate({
      filename: 'nuxt-fonts-global.css',
      write: true, // Seemingly necessary to allow vite to process file 🤔
      async getContents() {
        let css = ''
        for (const family of options.families || []) {
          if (!family.global) continue
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
      const unprocessedPreloads = new Set([...fontMap.values()].flatMap(v => [...v]))
      function addPreloadLinks(chunk: ResourceMeta, urls: Set<string>) {
        chunk.assets ||= []
        for (const url of urls) {
          if (!chunk.assets.includes(url)) {
            chunk.assets.push(url)
            unprocessedPreloads.delete(url)
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
            addPreloadLinks(chunk, fontMap.get(assetName)!)
          }
        }
      }

      // Source files in bundle
      for (const [id, urls] of fontMap) {
        const chunk = manifest[relative(nuxt.options.srcDir, id)]
        if (!chunk) continue

        addPreloadLinks(chunk, urls)
      }

      if (entry) {
        addPreloadLinks(entry, unprocessedPreloads)
      }
    })

    addBuildPlugin(FontFamilyInjectionPlugin({
      dev: nuxt.options.dev,
      fontsToPreload: fontMap,
      processCSSVariables: options.experimental?.processCSSVariables,
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

        return resolveFontFaceWithOverride(fontFamily, override, fallbackOptions)
      },
    }))
  },
})

async function resolveProviders(_providers: ModuleOptions['providers'] = {}) {
  const nuxt = useNuxt()
  const jiti = createJiti(nuxt.options.rootDir, { alias: nuxt.options.alias })

  const providers = { ..._providers }
  for (const key in providers) {
    const value = providers[key]
    if (value === false) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete providers[key]
    }
    if (typeof value === 'string') {
      providers[key] = await jiti.import(value, { default: true }) as ProviderFactory | FontProvider
    }
  }
  return providers as Record<string, ProviderFactory | FontProvider>
}

declare module '@nuxt/schema' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface NuxtHooks extends ModuleHooks {}
}
