// TODO: Font metric providers

import type { Nuxt } from '@nuxt/schema'

export interface RemoteFontSource {
  url: string
  format?: string
  tech?: string
}

export interface LocalFontSource {
  name: string
}

export type FontSource = string | LocalFontSource | RemoteFontSource | (LocalFontSource & RemoteFontSource)

export interface FontFaceData {
  src: FontSource | Array<FontSource>
  /**
   * The font-display descriptor.
   * @default 'swap'
  */
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
  /** A font-weight value. */
  weight?: string | number
  /** A font-style value. */
  style?: string
  /** The range of Unicode code points to be used from the font. */
  unicodeRange?: string | string[]
  /** Allows control over advanced typographic features in OpenType fonts. */
  featureSettings?: string
  /** Allows low-level control over OpenType or TrueType font variations, by specifying the four letter axis names of the features to vary, along with their variation values. */
  variationSettings?: string

  // TODO: possibly support in future
  // metrics
  // ascent-override
  // descent-override
  // line-gap-override
  // size-adjust
}

export interface FontProvider {
  setup?: (nuxt: Nuxt) => void | Promise<void>
  resolveFontFaces?: (fontFamily: string) => void | {
    /**
     * Return data used to generate @font-face declarations
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face
     */
    fonts: FontFaceData | FontFaceData[]
  }
}
