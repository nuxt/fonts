import { $fetch } from 'ofetch'
import { hash } from 'ohash'

import type { FontProvider, ResolveFontFacesOptions } from '../types'
import { extractFontFaceData, addLocalFallbacks } from '../css/parse'
import { cachedData } from '../cache'
import { logger } from '../logger'

interface ProviderOption {
  id?: string
}

export default {
  async setup (providerOption: ProviderOption) {
    await initialiseFontMeta(providerOption.id!)
  },
  async resolveFontFaces (fontFamily, defaults) {
    if (!isAdobeFont(fontFamily)) { return }

    return {
      fonts: await cachedData(`adobe:${fontFamily}-${hash(defaults)}-data.json`, () => getFontDetails(fontFamily, defaults), {
        onError (err) {
          logger.error(`Could not fetch metadata for \`${fontFamily}\` from \`adobe\`.`, err)
          return []
        }
      })
    }
  },
} satisfies FontProvider

const fontAPI = $fetch.create({
  baseURL: 'https://typekit.com'
})

const fontCSSAPI = $fetch.create({
  baseURL: 'https://use.typekit.net'
})

interface AdobeFontMeta {
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

async function initialiseFontMeta (kitId: string) {
  fonts = await cachedData('adobe:meta.json', () => fontAPI<AdobeFontMeta>(`/api/v1/json/kits/${kitId}/published`, { responseType: 'json' }), {
    onError () {
      logger.error('Could not download `adobe` font metadata. `@nuxt/fonts` will not be able to inject `@font-face` rules for adobe.')
      return {kit: { id: '', families: [] } }
    }
  })
  for (const family in fonts.kit.families) {
    familyMap.set(fonts.kit.families[family]!.name, fonts.kit.families[family]!.id)
  }
}

function isAdobeFont (family: string) {
  return familyMap.has(family)
}

async function getFontDetails (family: string, variants: ResolveFontFacesOptions) {
  variants.weights = variants.weights.map(String)
  const font = fonts.kit.families.find(f => f.name === family)!
  const styles: string[] = []
  for (const style of font.variations) {
    if (style.includes('i') && !variants.styles.includes('italic')) { continue }
    if (!variants.weights.includes(String(style.slice(-1)+'00'))) { continue }
    styles.push(style)
  }

  if (styles.length === 0) return []
  const css = await fontCSSAPI(`${fonts.kit.id}.css`)

  return addLocalFallbacks(family, extractFontFaceData(css, family))
}
