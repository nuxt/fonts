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
    if (!isFontshareFont(fontFamily)) {
      return
    }

    return {
      fonts: await cachedData(`fontshare:${fontFamily}-${hash(defaults)}-data.json`, () => getFontDetails(fontFamily, defaults), {
        onError(err) {
          logger.error(`Could not fetch metadata for \`${fontFamily}\` from \`fontshare\`.`, err)
          return []
        },
      }),
    }
  },
} satisfies FontProvider

/** internal */

const fontAPI = $fetch.create({
  baseURL: 'https://api.fontshare.com/v2',
})

interface FontshareFontMeta {
  slug: string
  name: string
  styles: Array<{
    default: boolean
    file: string
    id: string
    is_italic: boolean
    is_variable: boolean
    properties: {
      ascending_leading: number
      body_height: null
      cap_height: number
      descending_leading: number
      max_char_width: number
      x_height: number
      y_max: number
      y_min: number
    }
    weight: {
      label: string
      name: string
      native_name: null
      number: number
      weight: number
    }
  }>
}

let fonts: FontshareFontMeta[]
const families = new Set<string>()

async function initialiseFontMeta() {
  fonts = await cachedData('fontshare:meta.json', async () => {
    const fonts: FontshareFontMeta[] = []
    let offset = 0
    let chunk
    do {
      chunk = await fontAPI<{ fonts: FontshareFontMeta[], has_more: boolean }>('/fonts', {
        responseType: 'json',
        query: {
          offset,
          limit: 100,
        },
      })
      fonts.push(...chunk.fonts)
      offset++
    } while (chunk.has_more)
    return fonts
  }, {
    onError() {
      logger.error('Could not download `fontshare` font metadata. `@nuxt/fonts` will not be able to inject `@font-face` rules for fontshare.')
      return []
    },
  })
  for (const font of fonts) {
    families.add(font.name)
  }
}

function isFontshareFont(family: string) {
  return families.has(family)
}

async function getFontDetails(family: string, variants: ResolveFontFacesOptions) {
  // https://api.fontshare.com/v2/css?f[]=alpino@300
  const font = fonts.find(f => f.name === family)!
  const numbers: number[] = []
  for (const style of font.styles) {
    if (style.is_italic && !variants.styles.includes('italic')) {
      continue
    }
    if (!variants.weights.includes(String(style.weight.number))) {
      continue
    }
    numbers.push(style.weight.number)
  }

  if (numbers.length === 0) return []

  const css = await fontAPI<string>(`/css?f[]=${font.slug + '@' + numbers.join(',')}`)

  // TODO: support subsets and axes
  return addLocalFallbacks(family, extractFontFaceData(css))
}
