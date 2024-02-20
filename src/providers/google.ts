import { $fetch } from 'ofetch'

import type { FontProvider } from '../types'

export default {
  async setup () {
    await initialiseFontMeta()
  },
  async resolveFontFaces (fontFamily, defaults) {
    if (!isGoogleFont(fontFamily)) { return }

    const details = await getFontDetails(fontFamily, defaults.subsets)

    return {
      fonts: details.variants.map(variant => ({
        style: variant.fontStyle,
        weight: variant.fontWeight,
        // TODO: handle subset unicode ranges
        src: [
          ...variant.local?.map(name => ({ name })) || [fontFamily],
          ...variant.woff2 ? [{ url: variant.woff2, format: 'woff2' }] : [],
          ...variant.woff ? [{ url: variant.woff, format: 'woff' }] : [],
          ...variant.ttf ? [{ url: variant.ttf, format: 'truetype' }] : [],
          ...variant.eot ? [{ url: variant.eot, format: 'embedded-opentype' }] : [],
          ...variant.svg ? [{ url: variant.svg, format: 'svg' }] : [],
        ]
      }))
    }
  },
} satisfies FontProvider

// https://github.com/majodev/google-webfonts-helper

interface FontIndexMeta {
  category: string
  defSubset: string
  defVariant: string
  family: string
  id: string
  lastModified: string
  popularity: number
  subsets: string[]
  variants: string[]
  version: string
}

interface FontDetail extends Omit<FontIndexMeta, 'variants'> {
  variants: Array<{
    id: string
    fontFamily: string
    fontStyle: string
    fontWeight: string
    eot: string
    woff: string
    ttf: string
    svg: string
    woff2: string
    local: string[]
  }>
  subsetMap: Record<string, boolean>
  storeID: string
}

const fontAPI = $fetch.create({
  baseURL: 'https://gwfh.mranftl.com/api/fonts'
})

let fonts: FontIndexMeta[]

// TODO: Fetch and cache possible Google fonts
async function initialiseFontMeta () {
  fonts = await fontAPI<FontIndexMeta[]>('/')
}

function isGoogleFont (family: string) {
  return fonts.some(font => font.family === family)
}

async function getFontDetails (family: string, defaultSubsets: string[]) {
  const font = fonts.find(font => font.family === family)!
  const subsets = defaultSubsets.filter(subset => font.subsets.includes(subset))

  return await fontAPI<FontDetail>(font.id, {
    query: subsets.length ? { subsets: subsets.join(',') } : {}
  })
}
