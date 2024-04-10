import { hash } from 'ohash'

import type { FontProvider, ResolveFontFacesOptions } from '../types'
import { extractFontFaceData, addLocalFallbacks } from '../css/parse'
import { cachedData } from '../cache'
import { $fetch } from '../fetch'
import { logger } from '../logger'

export default {
  async setup() {
    await initialiseFontMeta()
  },
  async resolveFontFaces(fontFamily, defaults) {
    if (!isBunnyFont(fontFamily)) {
      return
    }

    return {
      fonts: await cachedData(`bunny:${fontFamily}-${hash(defaults)}-data.json`, () => getFontDetails(fontFamily, defaults), {
        onError(err) {
          logger.error(`Could not fetch metadata for \`${fontFamily}\` from \`bunny\`.`, err)
          return []
        },
      }),
    }
  },
} satisfies FontProvider

/** internal */

const fontAPI = $fetch.create({
  baseURL: 'https://fonts.bunny.net',
})

interface BunnyFontMeta {
  [key: string]: {
    category: string
    defSubset: string
    familyName: string
    isVariable: boolean
    styles: string[]
    variants: Record<string, number>
    weights: number[]
  }
}

let fonts: BunnyFontMeta
const familyMap = new Map<string, string>()

async function initialiseFontMeta() {
  fonts = await cachedData('bunny:meta.json', () => fontAPI<BunnyFontMeta>('/list', { responseType: 'json' }), {
    onError() {
      logger.error('Could not download `bunny` font metadata. `@nuxt/fonts` will not be able to inject `@font-face` rules for bunny.')
      return {}
    },
  })
  for (const id in fonts) {
    familyMap.set(fonts[id]!.familyName!, id)
  }
}

function isBunnyFont(family: string) {
  return familyMap.has(family)
}

async function getFontDetails(family: string, variants: ResolveFontFacesOptions) {
  const id = familyMap.get(family) as keyof typeof fonts
  const font = fonts[id]!
  const weights = variants.weights.filter(weight => font.weights.includes(Number(weight)))
  const styleMap = {
    italic: 'i',
    oblique: 'i',
    normal: '',
  }
  const styles = new Set(variants.styles.map(i => styleMap[i]))
  if (weights.length === 0 || styles.size === 0) return []

  const resolvedVariants = weights.flatMap(w => [...styles].map(s => `${w}${s}`))

  const css = await fontAPI<string>('/css', {
    query: {
      family: id + ':' + resolvedVariants.join(','),
    },
  })

  // TODO: support subsets
  return addLocalFallbacks(family, extractFontFaceData(css))
}
