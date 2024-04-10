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
    if (!isGoogleFont(fontFamily)) {
      return
    }

    return {
      fonts: await cachedData(`google:${fontFamily}-${hash(defaults)}-data.json`, () => getFontDetails(fontFamily, defaults), {
        onError(err) {
          logger.error(`Could not fetch metadata for \`${fontFamily}\` from \`google\`.`, err)
          return []
        },
      }),
    }
  },
} satisfies FontProvider

interface FontIndexMeta {
  family: string
  subsets: string[]
  fonts: Record<string, {
    thickness: number | null
    slant: number | null
    width: number | null
    lineHeight: number | null
  }>
  axes: Array<{
    tag: string
    min: number
    max: number
    defaultValue: number
  }>
}

/** internal */

let fonts: FontIndexMeta[]

async function fetchFontMetadata() {
  return await $fetch<{ familyMetadataList: FontIndexMeta[] }>('https://fonts.google.com/metadata/fonts', { responseType: 'json' })
    .then(r => r.familyMetadataList)
}

async function initialiseFontMeta() {
  fonts = await cachedData('google:meta.json', fetchFontMetadata, {
    onError() {
      logger.error('Could not download `google` font metadata. `@nuxt/fonts` will not be able to inject `@font-face` rules for google.')
      return []
    },
  })
}

function isGoogleFont(family: string) {
  return fonts.some(font => font.family === family)
}

const styleMap = {
  italic: '1',
  oblique: '1',
  normal: '0',
}
async function getFontDetails(family: string, variants: ResolveFontFacesOptions) {
  const font = fonts.find(font => font.family === family)!
  const styles = [...new Set(variants.styles.map(i => styleMap[i]))].sort()

  const variableWeight = font.axes.find(a => a.tag === 'wght')
  const weights = variableWeight
    ? [`${variableWeight.min}..${variableWeight.max}`]
    : variants.weights.filter(weight => weight in font.fonts)

  if (weights.length === 0 || styles.length === 0) return []

  const resolvedVariants = weights.flatMap(w => [...styles].map(s => `${s},${w}`)).sort()

  let css = ''

  for (const extension in userAgents) {
    css += await $fetch<string>('/css2', {
      baseURL: 'https://fonts.googleapis.com',
      headers: { 'user-agent': userAgents[extension as keyof typeof userAgents] },
      query: {
        family: family + ':' + 'ital,wght@' + resolvedVariants.join(';'),
      },
    })
  }

  // TODO: support subsets
  return addLocalFallbacks(family, extractFontFaceData(css))
}

const userAgents = {
  woff2: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  ttf: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.54.16 (KHTML, like Gecko) Version/5.1.4 Safari/534.54.16',
  // eot: 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)',
  // woff: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
  // svg: 'Mozilla/4.0 (iPad; CPU OS 4_0_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/4.1 Mobile/9A405 Safari/7534.48.3',
}
