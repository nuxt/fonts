import { $fetch } from 'ofetch'
import { hash } from 'ohash'

import type { FontProvider, ResolveFontFacesOptions } from '../types'
import { extractFontFaceData, addLocalFallbacks } from '../css/parse'
import { cachedData } from '../cache'
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

/** internal */

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
    woff2?: string;
    woff?: string;
    ttf?: string;
  };
}

interface FontsourceFontVariant {
  [key: string]: {
    [key: string]: {
      [key: string]: FontsourceFontFile;
    };
  };
}

interface FontsourceFontDetail {
  id: string;
  family: string;
  subsets: string[];
  weights: number[];
  styles: string[];
  unicodeRange: Record<string, string>;
  defSubset: string;
  variable: boolean;
  lastModified: string;
  category: string;
  version: string;
  type: string;
  variants: FontsourceFontVariant;
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

async function generateFontCss (fontId: string, weights: string[], styles: ("normal" | "italic" | "oblique")[]) {
  const fontDetail = await fontAPI<FontsourceFontDetail>(`/fonts/${fontId}`, { responseType: 'json' })
  const generatedCss: string[] = []
  // TODO: support subsets apart from default
  const defaultSubset = fontDetail.defSubset

  for (const weight of weights) {
    for (const style of styles) {
      const variantUrl = fontDetail.variants[weight]![style]![defaultSubset]!.url
      const srcArray = Object.entries(variantUrl).map(([type, url]) => `url(${url}) format('${type}')`);
      generatedCss.push(`
/** ${fontDetail.family.toLowerCase().split(' ').join('-')}-${defaultSubset}-${weight}-${style} */
@font-face {
  font-family: '${fontDetail.family}';
  font-style: ${style};
  font-display: swap;
  font-weight: ${weight};
  src: ${srcArray.join(', ')};
  unicode-range: ${fontDetail.unicodeRange[defaultSubset]};
}
     `)
    }
  }

  return generatedCss.join('\n\n')
}

async function getFontDetails (family: string, variants: ResolveFontFacesOptions) {
  const id = familyMap.get(family) as keyof typeof fonts
  const font = fonts[id]!
  const weights = variants.weights.filter(weight => font.weights.includes(Number(weight)))
  const styles = variants.styles.filter(style => font.styles.includes(style))
  if (weights.length === 0 || styles.length === 0) return []

  const css = await generateFontCss(font.id, weights, styles)
  console.log(css)

  return addLocalFallbacks(family, extractFontFaceData(css))
}
