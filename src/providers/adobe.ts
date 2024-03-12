import { $fetch } from 'ofetch'
import { hash } from 'ohash'

import type { FontProvider, ResolveFontFacesOptions } from '../types'
import { extractFontFaceData, addLocalFallbacks } from '../css/parse'
import { cachedData } from '../cache'
import { logger } from '../logger'

interface ProviderOption {
  id?: string[] | string
}

export default {
  async setup (providerOption: ProviderOption) {
    if (!providerOption.id) { return }
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

async function getAdobeFontMeta (kitId: string | string[]):Promise<AdobeFontMeta> {
  if (typeof kitId === "string")
    return {
      kits: [
        (await fontAPI<AdobeFontAPI>(`/api/v1/json/kits/${kitId}/published`, { responseType: 'json' })).kit
      ]
    }

  const metadata: AdobeFontMeta = { kits: [] }

  for (const kit in kitId) {
    metadata.kits.push((await fontAPI<AdobeFontAPI>(`/api/v1/json/kits/${kitId[kit]}/published`, { responseType: 'json' })).kit)
  }

  return metadata
}

async function initialiseFontMeta (kitId: string | string[]) {
  fonts = await cachedData('adobe:meta.json', () => getAdobeFontMeta(kitId), {
    onError () {
      logger.error('Could not download `adobe` font metadata. `@nuxt/fonts` will not be able to inject `@font-face` rules for adobe.')
      return { kits: [] }
    }
  })
  for (const kit in fonts.kits) {
    for (const family in fonts.kits[kit]!.families) {
      familyMap.set(fonts.kits[kit]!.families[family]!.name, fonts.kits[kit]!.families[family]!.id)
    }
  }
}

function isAdobeFont (family: string) {
  return familyMap.has(family)
}

async function getFontDetails (family: string, variants: ResolveFontFacesOptions) {
  variants.weights = variants.weights.map(String)

  for (const kit in fonts.kits) {
    const font = fonts.kits[kit]!.families.find(f => f.name === family)!
    if (!font) { continue }

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
    if (styles.length === 0) { continue }
    const css = await fontCSSAPI(`${fonts.kits[kit]!.id}.css`)

    // Adobe uses slugs instead of names in its CSS to define its font faces, so we need to first transform names into slugs.
    const slug = family.toLowerCase().split(' ').join('-')
    return addLocalFallbacks(family, extractFontFaceData(css, slug))
  }

  return []
}
