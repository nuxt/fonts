import { $fetch } from 'ofetch'
import type { FontProvider, ResolveFontFacesOptions } from '../types'
import { extractFontFaceData, addLocalFallbacks } from '../css/parse'

export default {
  async setup () {
    await initialiseFontMeta()
  },
  async resolveFontFaces (fontFamily, defaults) {
    if (!isBunnyFont(fontFamily)) { return }

    return {
      fonts: await getFontDetails(fontFamily, defaults)
    }
  },
} satisfies FontProvider

const fontAPI = $fetch.create({
  baseURL: 'https://fonts.bunny.net'
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

// TODO: Fetch and cache
async function initialiseFontMeta () {
  fonts = await fontAPI<BunnyFontMeta>('/list', { responseType: 'json' })
  for (const id in fonts) {
    familyMap.set(fonts[id]!.familyName!, id)
  }
}

function isBunnyFont (family: string) {
  return familyMap.has(family)
}

async function getFontDetails (family: string, variants: ResolveFontFacesOptions) {
  const id = familyMap.get(family) as keyof typeof fonts
  const font = fonts[id]!
  const weights = variants.weights.filter(weight => font.weights.includes(Number(weight)))
  const styleMap = {
    italic: 'i',
    oblique: 'i',
    normal: ''
  }
  const styles = new Set(variants.styles.map(i => styleMap[i]))
  const resolvedVariants = weights.flatMap(w => [...styles].map(s => `${w}${s}`))

  const css = await fontAPI('/css', {
    query: {
      family: id + ':' + resolvedVariants.join(',')
    }
  })

  // TODO: support subsets
  return addLocalFallbacks(family, extractFontFaceData(css))
}
