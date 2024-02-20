import { addBuildPlugin, defineNuxtModule, resolveAlias, resolvePath, useLogger } from '@nuxt/kit'

import google from './providers/google'
import local from './providers/local'

import { FontFamilyInjectionPlugin } from './transform'
import type { FontProvider, ModuleOptions, ResolveFontFacesOptions } from './types'

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
          setups.push(provider.setup(nuxt))
        }
      }
      await Promise.all(setups)
    })

    addBuildPlugin(FontFamilyInjectionPlugin({
      async resolveFontFace (fontFamily) {
        const override = options.families?.find(f => f.name === fontFamily)

        if (!override) {
          return resolveFontFace(providers, fontFamily, defaultValues as ResolveFontFacesOptions)
        }

        // Manual override
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
    }))
  }
})

async function resolveProviders (_providers: ModuleOptions['providers'] = {}) {
  const providers = { ..._providers }
  for (const key in providers) {
    const value = providers[key]
    if (value === false) {
      delete providers[key]
    }
    if (typeof value === 'string') {
      providers[key] = await import(await resolvePath(resolveAlias(value)))
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
