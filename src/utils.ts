import { useNuxt } from '@nuxt/kit'
import { defineFontProvider as defineUnifontProvider } from 'unifont'
import type { FontProvider } from './types'

/**
 * @deprecated Use `defineFontProvider` from `unifont` instead.
 */
export function defineFontProvider(options: FontProvider) {
  return options
}

export type { FontProvider } from './types'

// This needs to convert custom font providers to unifont-style providers
export function toUnifontProvider<FontProviderOptions = Record<string, unknown>>(name: string, provider: FontProvider<FontProviderOptions>) {
  return defineUnifontProvider<FontProviderOptions>(name, async (options) => {
    const nuxt = useNuxt()
    await provider.setup?.(options, nuxt)

    return {
      async resolveFont(fontFamily, options) {
        const result = await provider.resolveFontFaces!(fontFamily, options)

        return result || undefined
      },
    }
  })
}
