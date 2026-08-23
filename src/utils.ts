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

/**
 * Named `font-weight` values accepted in `fonts.defaults.weights` and
 * `fonts.families[].weights`, mapped to their numeric equivalent.
 *
 * Both the hyphenated (`semi-bold`) and unhyphenated (`semibold`, as used by
 * Tailwind CSS) spellings are accepted.
 */
export const weightNames: Record<string, number> = {
  'thin': 100,
  'hairline': 100,
  'extra-light': 200,
  'extralight': 200,
  'ultra-light': 200,
  'ultralight': 200,
  'light': 300,
  'normal': 400,
  'regular': 400,
  'medium': 500,
  'semi-bold': 600,
  'semibold': 600,
  'demi-bold': 600,
  'demibold': 600,
  'bold': 700,
  'extra-bold': 800,
  'extrabold': 800,
  'ultra-bold': 800,
  'ultrabold': 800,
  'black': 900,
  'heavy': 900,
}

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
