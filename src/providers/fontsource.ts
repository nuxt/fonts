import { hash } from 'ohash'

import type { FontProvider, NormalizedFontFaceData, ResolveFontFacesOptions } from '../types'
import { addLocalFallbacks } from '../css/parse'
import { cachedData } from '../cache'
import { $fetch } from '../fetch'
import { logger } from '../logger'

export default {
  async setup () {
    await initialiseFontMeta()
  },
  async resolveFontFaces (fontFamily, defaults) {
    if (!isFontsourceFont(fontFamily)) { return }

    return {
      fonts: await cachedData(`fontsource:${fontFamily}-${hash(defaults)}-data.json`, () => getFontDetails(fontFamily, defaults), {
        onError (err) {
          logger.error(`Could not fetch metadata for \`${fontFamily}\` from \`fontsource\`.`, err)
          return []
        }
      })
    }
  },
} satisfies FontProvider

const fontAPI = $fetch.create({
  baseURL: 'https://api.fontsource.org/v1'
})

export interface FontsourceFontMeta {
  [key: string]: {
    id: string
    family: string
    subsets: string[]
    weights: number[]
    styles: string[]
    defSubset: string
    variable: boolean
    lastModified: string
    category: string
    version: string
    type: string
  }
}

interface FontsourceFontFile {
  url: {
    woff2?: string
    woff?: string
    ttf?: string
  }
}

interface FontsourceFontVariant {
  [key: string]: {
    [key: string]: {
      [key: string]: FontsourceFontFile
    }
  }
}

interface FontsourceFontDetail {
  id: string
  family: string
  subsets: string[]
  weights: number[]
  styles: string[]
  unicodeRange: Record<string, string>
  defSubset: string
  variable: boolean
  lastModified: string
  category: string
  version: string
  type: string
  variants: FontsourceFontVariant
}

let fonts: FontsourceFontMeta
const familyMap = new Map<string, string>()

async function initialiseFontMeta () {
  fonts = await cachedData('fontsource:meta.json', () => fontAPI<FontsourceFontMeta[]>('/fonts', { responseType: 'json' }), {
    onError () {
      logger.error('Could not download `fontsource` font metadata. `@nuxt/fonts` will not be able to inject `@font-face` rules for fontsource.')
      return {}
    }
  })
  for (const id in fonts) {
    familyMap.set(fonts[id]!.family!, id)
  }
}

function isFontsourceFont (family: string) {
  return familyMap.has(family)
}


async function getFontDetails (family: string, variants: ResolveFontFacesOptions) {
  const id = familyMap.get(family) as keyof typeof fonts
  const font = fonts[id]!
  const weights = variants.weights.filter(weight => font.weights.includes(Number(weight)))
  const styles = variants.styles.filter(style => font.styles.includes(style))
  const subsets = variants.subsets ? variants.subsets.filter(subset => font.subsets.includes(subset)) : [font.defSubset]
  if (weights.length === 0 || styles.length === 0) return []

  const fontDetail = await fontAPI<FontsourceFontDetail>(`/fonts/${font.id}`, { responseType: 'json' })
  const fontFaceData: NormalizedFontFaceData[] = []

  for (const subset of subsets) {
    for (const style of styles) {
      if (font.variable) {
        fontFaceData.push({
          style,
          weight: [font.weights[0]!, font.weights.slice(-1)[0]!],
          src: [
            { url: `https://cdn.jsdelivr.net/fontsource/fonts/${font.id}:vf@latest/${subset}-wght-${style}.woff2`, format: "woff2" }
          ],
          unicodeRange: fontDetail.unicodeRange[subset]?.split(',')
        })
      }
      for (const weight of weights) {
        const variantUrl = fontDetail.variants[weight]![style]![subset]!.url
        fontFaceData.push({
          style,
          weight,
          src: Object.entries(variantUrl).map(([format, url]) => ({url, format})),
          unicodeRange: fontDetail.unicodeRange[subset]?.split(',')
        })
      }
    }
  }

  return addLocalFallbacks(family, fontFaceData)
}
