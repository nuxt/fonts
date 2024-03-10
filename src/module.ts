import { addBuildPlugin, addTemplate, defineNuxtModule, resolveAlias, resolvePath, useNuxt } from '@nuxt/kit'
import jiti from 'jiti'

import local from './providers/local'
import google from './providers/google'
import bunny from './providers/bunny'
import fontshare from './providers/fontshare'

import { FontFamilyInjectionPlugin, type FontFaceResolution } from './plugins/transform'
import { generateFontFace } from './css/render'
import type { GenericCSSFamily } from './css/parse'
import { setupPublicAssetStrategy } from './assets'
import type { FontFamilyManualOverride, FontFamilyProviderOverride, FontProvider, ModuleHooks, ModuleOptions } from './types'
import { logger } from './logger'

export type {
  FontProvider,
  FontFaceData,
  FontFallback,
  FontFamilyManualOverride,
  FontFamilyOverrides,
  FontFamilyProviderOverride,
  FontProviderName,
  NormalizedFontFaceData,
  ResolveFontFacesOptions,
  LocalFontSource,
  RemoteFontSource,
  FontSource,
  ModuleOptions
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
  }
} satisfies ModuleOptions['defaults']

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxt/fonts',
    configKey: 'fonts'
  },
  defaults: {
    defaults: {},
    assets: {
      prefix: '/_fonts'
    },
    local: {},
    google: {},
    providers: {
      local,
      google,
      bunny,
      fontshare,
    },
  },
  async setup (options, nuxt) {
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
        Array.isArray(options.defaults?.fallbacks) ? options.defaults.fallbacks : options.defaults?.fallbacks?.[key as GenericCSSFamily] || value
      ])) as Record<GenericCSSFamily, string[]>
    }

    if (!options.defaults?.fallbacks || !Array.isArray(options.defaults.fallbacks)) {
      const fallbacks = (options.defaults!.fallbacks as Exclude<NonNullable<typeof options.defaults>['fallbacks'], string[]>) ||= {}
      for (const _key in defaultValues.fallbacks) {
        const key = _key as keyof typeof defaultValues.fallbacks
        fallbacks[key] ||= defaultValues.fallbacks[key]
      }
    }

    const providers = await resolveProviders(options.providers)
    const prioritisedProviders = new Set<string>()

    // Allow registering and disabling providers
    nuxt.hook('modules:done', async () => {
      await nuxt.callHook('fonts:providers', providers)
      const setups: Array<void | Promise<void>> = []
      for (const key in providers) {
        const provider = providers[key]!
        if (options.providers?.[key] === false || (options.provider && options.provider !== key)) {
          delete providers[key]
        } else if (provider.setup) {
          setups.push(provider.setup(options[key as 'google' | 'local'] || {}, nuxt))
        }
      }
      await Promise.all(setups)
      for (const val of options.priority || []) {
        if (val in providers) prioritisedProviders.add(val)
      }
      for (const provider in providers) {
        prioritisedProviders.add(provider)
      }
    })

    const { normalizeFontData, lookupFontURL } = setupPublicAssetStrategy(options.assets)

    async function resolveFontFaceWithOverride (fontFamily: string, override?: FontFamilyManualOverride | FontFamilyProviderOverride, fallbackOptions?: { fallbacks: string[], generic?: GenericCSSFamily }): Promise<FontFaceResolution | undefined> {
      const fallbacks = override?.fallbacks || normalizedDefaults.fallbacks[fallbackOptions?.generic || 'sans-serif']

      if (override && 'src' in override) {
        return {
          fallbacks,
          fonts: normalizeFontData({
            src: override.src,
            display: override.display,
            weight: override.weight,
            style: override.style,
          }),
        }
      }

      // Respect fonts that should not be resolved through `@nuxt/fonts`
      if (override?.provider === 'none') { return }

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
          const result = await providers[override.provider]!.resolveFontFaces!(fontFamily, defaults)
          const fonts = normalizeFontData(result?.fonts || [])
          if (!fonts.length || !result) {
            return logger.warn(`Could not produce font face declaration from \`${override.provider}\` for font family \`${fontFamily}\`.`)
          }
          return {
            fallbacks: result.fallbacks || defaults.fallbacks,
            // Rewrite font source URLs to be proxied/local URLs
            fonts: normalizeFontData(result.fonts),
          }
        }

        // If not registered, log and fall back to default providers
        logger.warn(`Unknown provider \`${override.provider}\` for font family \`${fontFamily}\`. Falling back to default providers.`)
      }

      for (const key of prioritisedProviders) {
        const provider = providers[key]!
        if (provider.resolveFontFaces) {
          const result = await provider.resolveFontFaces(fontFamily, defaults)
          if (result) {
            // Rewrite font source URLs to be proxied/local URLs
            const fonts = normalizeFontData(result.fonts)
            if (fonts.length > 0) {
              return {
                fallbacks: result.fallbacks || defaults.fallbacks,
                fonts,
              }
            }
            if (override) {
              logger.warn(`Could not produce font face declaration for \`${fontFamily}\` with override.`)
            }
          }
        }
      }
    }

    nuxt.options.css.push('#build/nuxt-fonts-global.css')
    addTemplate({
      filename: 'nuxt-fonts-global.css',
      write: true, // Seemingly necessary to allow vite to process file 🤔
      async getContents () {
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
      }
    })

    addBuildPlugin(FontFamilyInjectionPlugin({
      dev: nuxt.options.dev,
      lookupFontURL,
      async resolveFontFace (fontFamily, fallbackOptions) {
        const override = options.families?.find(f => f.name === fontFamily)

        // This CSS will be injected in a separate location
        if (override?.global) { return }

        return resolveFontFaceWithOverride(fontFamily, override, fallbackOptions)
      }
    }))
  }
})

async function resolveProviders (_providers: ModuleOptions['providers'] = {}) {
  const nuxt = useNuxt()
  const _jiti = jiti(nuxt.options.rootDir, { interopDefault: true })

  const providers = { ..._providers }
  for (const key in providers) {
    const value = providers[key]
    if (value === false) {
      delete providers[key]
    }
    if (typeof value === 'string') {
      providers[key] = await _jiti(await resolvePath(resolveAlias(value)))
    }
  }
  return providers as Record<string, FontProvider>
}

declare module '@nuxt/schema' {
  interface NuxtHooks extends ModuleHooks {}
}
