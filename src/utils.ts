import { useNuxt } from '@nuxt/kit'
import { defineFontProvider as defineUnifontProvider } from 'unifont'
import type { ProviderFactory } from 'unifont'
import type { FontProvider } from './types'

/**
 * @deprecated Use `defineFontProvider` from `unifont` instead.
 */
export function defineFontProvider(options: FontProvider) {
  return options
}

export type { FontProvider } from './types'

// This needs to convert custom font providers to unifont-style providers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toUnifontProvider(name: string, provider: FontProvider): ProviderFactory<string, any, any> {
  return defineUnifontProvider(name, async (options: Record<string, unknown>) => {
    const nuxt = useNuxt()
    await provider.setup?.(options, nuxt)

    return {
      async resolveFont(fontFamily, resolveOptions) {
        const result = await provider.resolveFontFaces!(fontFamily, resolveOptions)

        return result || undefined
      },
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as ProviderFactory<string, any, any>
}
