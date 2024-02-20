import { $fetch } from 'ofetch'

import type { FontProvider } from '../types'

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

export default {
  async setup () {
    // TODO: Fetch and cache possible Google fonts
    fonts = await fontAPI<FontIndexMeta[]>('/')
  },
  async resolveFontFaces (fontFamily, defaults) {
    const font = fonts.find(font => font.family === fontFamily)
    if (!font) { return }

    const subsets = defaults.subsets.filter(subset => font.subsets.includes(subset))

    const details = await fontAPI<FontDetail>(font.id, {
      query: subsets.length ? { subsets: subsets.join(',') } : {}
    })

    return {
      fonts: details.variants.map(variant => ({
        style: variant.fontStyle,
        weight: variant.fontWeight,
        // TODO: handle subset unicode ranges
        // TODO: download/proxy URLs locally
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

