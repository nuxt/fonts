import type { Nuxt } from '@nuxt/schema'

type Awaitable<T> = T | Promise<T>

export interface RemoteFontSource {
  url: string
  format?: string
  tech?: string
}

export interface LocalFontSource {
  name: string
}

export type FontSource = string | LocalFontSource | RemoteFontSource

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
}

// TODO: Font metric providers
// export interface FontFaceAdjustments {
//   ascent-override
//   descent-override
//   line-gap-override
//   size-adjust
// }

export interface ResolveFontFacesOptions {
  weights: Array<string | number>
  styles: Array<'normal' | 'italic' | 'oblique'>
  // TODO: improve support and support unicode range
  subsets: string[]
}

export interface FontProvider {
  /**
   * The setup function will be called before the first `resolveFontFaces` call and is a good
   * place to register any Nuxt hooks or setup any state.
   */
  setup?: (nuxt: Nuxt) => Awaitable<void>
  /**
   * Resolve data for `@font-face` declarations.
   *
   * If nothing is returned then this provider doesn't handle the font family and we
   * will continue calling `resolveFontFaces` in other providers.
   */
  resolveFontFaces?: (fontFamily: string, options: ResolveFontFacesOptions) => Awaitable<void | {
    /**
     * Return data used to generate @font-face declarations.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face
     */
    fonts: FontFaceData | FontFaceData[]
  }>
}

export type FontProviderName = (string & {}) | 'google' | 'local' | 'none'


export interface FontFamilyOverrides {
  name: string

  // as?: string
  // fallbacks?: Array<string>
}
export interface FontFamilyProviderOverride extends FontFamilyOverrides {
  provider?: FontProviderName

  weights?: Array<string | number>
  styles?: Array<'normal' | 'italic' | 'oblique'>
  subsets?: string[]

  fallbacks?: string[]
}

export interface FontFamilyManualOverride extends FontFamilyOverrides, FontFaceData {}

export interface ModuleOptions {
  /**
   * Specify overrides for individual font families.
   *
   * ```ts
   * fonts: {
   *   families: [
   *     // do not resolve this font with any provider from `@nuxt/fonts`
   *     { name: 'Custom Font', provider: 'none' },
   *     // only resolve this font with the `google` provider
   *     { name: 'My Font Family', provider: 'google' },
   *     // specify specific font data
   *     { name: 'Other Font', src: 'url(https://example.com/font.woff2)' },
   *   ]
   * }
   * ```
   */
  families?: Array<FontFamilyManualOverride | FontFamilyProviderOverride>
  defaults?: Partial<ResolveFontFacesOptions>
  providers?: {
    google?: FontProvider | string | false
    local?: FontProvider | string | false
    [key: string]: FontProvider | string | false | undefined
  }
  // TODO: Provider options
  // google?: {}
  // local?: {}
  /**
   * An ordered list of providers to check when resolving font families.
   *
   * Default behaviour is to check all user providers in the order they were defined, and then all built-in providers.
   */
  priority?: string[]
  // TODO: support default provider
  provider?: FontProviderName
  // TODO: allow customising download behaviour with nuxt/assets
  // download?: string
}
