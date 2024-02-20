import { addBuildPlugin, addTemplate, defineNuxtModule, resolveAlias, resolvePath, useLogger, useNuxt } from '@nuxt/kit'
import jiti from 'jiti'

import google from './providers/google'
import local from './providers/local'

import { FontFamilyInjectionPlugin } from './plugins/transform'
import { generateFontFaces } from './css/render'
import { setupPublicAssetStrategy } from './assets'

import type { FontFaceData, FontFamilyManualOverride, FontFamilyProviderOverride, FontProvider, ModuleOptions, ResolveFontFacesOptions } from './types'
export type { ModuleOptions } from './types'

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
  ]
} satisfies ResolveFontFacesOptions

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
    },
  },
  async setup (options, nuxt) {
    // Skip when preparing
    if (nuxt.options._prepare) return

    const logger = useLogger('@nuxt/fonts')

    for (const key of ['weights', 'styles', 'subsets'] as const) {
      options.defaults![key] ||= defaultValues[key] as any
    }

    const providers = await resolveProviders(options.providers)

    // Allow registering and disabling providers
    nuxt.hook('modules:done', async () => {
      await nuxt.callHook('fonts:providers', providers)
      const setups: Array<void | Promise<void>> = []
      for (const key in providers) {
        const provider = providers[key]!
        if (options.providers?.[key] === false) {
          delete providers[key]
        } else if (provider.setup) {
          setups.push(provider.setup(options[key as 'google' | 'local'] || {}, nuxt))
        }
      }
      await Promise.all(setups)
    })

    async function resolveFontFaceWithOverride (fontFamily: string, override: FontFamilyManualOverride | FontFamilyProviderOverride): Promise<FontFaceData | FontFaceData[] | undefined> {
      if ('src' in override) {
        return {
          src: override.src,
          display: override.display,
          weight: override.weight,
          style: override.style,
        }
      }

      // Respect fonts that should not be resolved through `@nuxt/fonts`
      if (override.provider === 'none') { return }

      // Respect custom weights, styles and subsets options
      const defaults = {
        weights: override.weights || defaultValues.weights,
        styles: override.styles || defaultValues.styles,
        subsets: override.subsets || defaultValues.subsets
      }

      // Handle explicit provider
      if (override.provider) {
        if (override.provider in providers) {
          const result = await providers[override.provider]!.resolveFontFaces!(fontFamily, override as ResolveFontFacesOptions)
          if (!result) {
            return logger.warn(`Could not produce font face declaration from \`${override.provider}\` for font family \`${fontFamily}\`.`)
          }
          return result?.fonts
        }

        // If not registered, log and fall back to default providers
        logger.warn(`Unknown provider \`${override.provider}\` for font family \`${fontFamily}\`. Falling back to default providers.`)
      }

      return resolveFontFace(providers, fontFamily, defaults)
    }

    const { normalizeFontData } = setupPublicAssetStrategy(options.assets)

    nuxt.options.css.push('#build/nuxt-fonts-global.css')
    addTemplate({
      filename: 'nuxt-fonts-global.css',
      write: true, // Seemingly necessary to allow vite to process file 🤔
      async getContents () {
        let css = ''
        for (const family of options.families || []) {
          if (!family.global) continue
          const result = await resolveFontFaceWithOverride(family.name, family).then(r => r && normalizeFontData(r))
          if (result) { css += generateFontFaces(family.name, result).join('\n') + '\n' }
        }
        return css
      }
    })

    addBuildPlugin(FontFamilyInjectionPlugin({
      async resolveFontFace (fontFamily) {
        const override = options.families?.find(f => f.name === fontFamily)

        if (!override) {
          return resolveFontFace(providers, fontFamily, defaultValues as ResolveFontFacesOptions).then(r => r && normalizeFontData(r))
        }

        // This CSS will be injected in a separate location
        if (override.global) { return }

        return resolveFontFaceWithOverride(fontFamily, override).then(r => r && normalizeFontData(r))
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

async function resolveFontFace (providers: Record<string, FontProvider>, fontFamily: string, defaults: ResolveFontFacesOptions) {
  for (const key in providers) {
    const provider = providers[key]!
    if (provider.resolveFontFaces) {
      const result = await provider.resolveFontFaces(fontFamily, defaults)
      if (result) {
        return result.fonts
      }
    }
  }
}

export interface ModuleHooks {
  'fonts:providers': (providers: FontProvider) => void | Promise<void>
}

declare module '@nuxt/schema' {
  interface NuxtHooks extends ModuleHooks {}
}
