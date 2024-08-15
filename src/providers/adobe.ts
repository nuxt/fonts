import { hash } from 'ohash'

import type { FontProvider, ResolveFontFacesOptions } from '../types'
import { extractFontFaceData, addLocalFallbacks } from '../css/parse'
import { cachedData } from '../cache'
import { $fetch } from '../fetch'
import { logger } from '../logger'

interface ProviderOption {
  id?: string[] | string
}

export default {
  async setup(options: ProviderOption) {
    if (!options.id) {
      return
    }
    await initialiseFontMeta(typeof options.id === 'string' ? [options.id] : options.id)
  },
  async resolveFontFaces(fontFamily, defaults) {
    if (!isAdobeFont(fontFamily)) {
      return
    }

    return {
      fonts: await cachedData(`adobe:${fontFamily}-${hash(defaults)}-data.json`, () => getFontDetails(fontFamily, defaults), {
        onError(err) {
          logger.error(`Could not fetch metadata for \`${fontFamily}\` from \`adobe\`.`, err)
          return []
        },
      }),
    }
  },
} satisfies FontProvider

const fontAPI = $fetch.create({
  baseURL: 'https://typekit.com',
})

const fontCSSAPI = $fetch.create({
  baseURL: 'https://use.typekit.net',
})

interface AdobeFontMeta {
  kits: AdobeFontKit[]
}

interface AdobeFontAPI {
  kit: AdobeFontKit
}

interface AdobeFontKit {
  id: string
  families: AdobeFontFamily[]
}

interface AdobeFontFamily {
  id: string
  name: string
  slug: string
  css_names: string[]
  css_stack: string
  variations: string[]
}

let fonts: AdobeFontMeta
const familyMap = new Map<string, string>()

async function getAdobeFontMeta(id: string): Promise<AdobeFontKit> {
  const { kit } = await fontAPI<AdobeFontAPI>(`/api/v1/json/kits/${id}/published`, { responseType: 'json' })
  return kit
}

async function initialiseFontMeta(kits: string[]) {
  fonts = {
    kits: await Promise.all(kits.map(id => cachedData(`adobe:meta-${id}.json`, () => getAdobeFontMeta(id), {
      onError() {
        logger.error('Could not download `adobe` font metadata. `@nuxt/fonts` will not be able to inject `@font-face` rules for adobe.')
        return null
      },
    }))).then(r => r.filter((meta): meta is AdobeFontKit => !!meta)),
  }
  for (const kit in fonts.kits) {
    const families = fonts.kits[kit]!.families
    for (const family in families) {
      familyMap.set(families[family]!.name, families[family]!.id)
    }
  }
}

function isAdobeFont(family: string) {
  return familyMap.has(family)
}

async function getFontDetails(family: string, variants: ResolveFontFacesOptions) {
  variants.weights = variants.weights.map(String)

  for (const kit in fonts.kits) {
    const font = fonts.kits[kit]!.families.find(f => f.name === family)!
    if (!font) {
      continue
    }

    const styles: string[] = []
    for (const style of font.variations) {
      if (style.includes('i') && !variants.styles.includes('italic')) {
        continue
      }
      if (!variants.weights.includes(String(style.slice(-1) + '00'))) {
        continue
      }
      styles.push(style)
    }
    if (styles.length === 0) {
      continue
    }
    const css = await fontCSSAPI<string>(`${fonts.kits[kit]!.id}.css`)

    // TODO: Not sure whether this css_names array always has a single element. Still need to investigate.
    const cssName = font.css_names[0] ?? family.toLowerCase().split(' ').join('-')

    return addLocalFallbacks(family, extractFontFaceData(css, cssName), variants.addLocal)
  }

  return []
}
