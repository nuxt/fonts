import { addBuildPlugin, defineNuxtModule, resolveAlias, resolvePath } from '@nuxt/kit'

import google from './providers/google'
import local from './providers/local'

import { FontFamilyInjectionPlugin } from './plugin'
import type { FontProvider } from './types'

export interface ModuleOptions {
  // TODO: support default provider
  provider?: string
  providers?: {
    [key: string]: FontProvider | string | false
  }
  /**
   * An ordered list of providers to check when resolving font families.
   *
   * Default behaviour is to check all user providers in the order they were defined, and then all built-in providers.
   */
  priority?: string[]
  // TODO:
  families?: Array<{
    name: string
    as?: string
    provider?: string
    src?: string
    subsets?: Array<string>
    display?: string
    weight?: Array<string>
    style?: Array<string>
    fallbacks?: Array<string>
  }>
  // TODO: allow customising download behaviour with nuxt/assets
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxt/fonts',
    configKey: 'fonts'
  },
  defaults: {
    providers: {
      local,
      google,
    },
  },
  async setup (options, nuxt) {
    // Skip when preparing
    if (nuxt.options._prepare) return

    const providers = await resolveProviders(options.providers)

    // Allow registering and disabling providers
    nuxt.hook('modules:done', async () => {
      await nuxt.callHook('fonts:providers', providers)
      const setups: Array<void | Promise<void>> = []
      for (const key in providers) {
        if (options.providers?.[key] === false) {
          delete providers[key]
        } else if (providers[key].setup) {
          setups.push(providers[key].setup!(nuxt))
        }
      }
      await Promise.all(setups)
    })

    addBuildPlugin(FontFamilyInjectionPlugin({
      dev: nuxt.options.dev,
      resolveFontFace: (fontFamily) => {
        // TODO: respect 'none' provider
        for (const key in providers) {
          const resolveFontFaces = providers[key].resolveFontFaces
          console.log(key)
          if (resolveFontFaces) {
            const result = resolveFontFaces(fontFamily)
            if (result) {
              return result.fonts
            }
          }
        }
      }
    }))
  }
})

async function resolveProviders (_providers: Record<string, FontProvider | string | false> = {}) {
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

export interface ModuleHooks {
  'fonts:providers': (providers: FontProvider) => void | Promise<void>
}


declare module '@nuxt/schema' {
  interface NuxtHooks extends ModuleHooks {}
}
