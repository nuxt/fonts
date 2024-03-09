import type { Nuxt } from '@nuxt/schema'

import type { GenericCSSFamily } from './css/parse'

export type Awaitable<T> = T | Promise<T>

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

export interface NormalizedFontFaceData extends Omit<FontFaceData, 'src'> {
  src: Array<LocalFontSource | RemoteFontSource>
}

export interface FontFallback {
  family?: string
  as: string
}

// TODO: Font metric providers
// export interface FontFaceAdjustments {
//   ascentOverride?: string // ascent-override
//   descentOverride?: string // descent-override
//   lineGapOverride?: string // line-gap-override
//   sizeAdjust?: string // size-adjust
// }

export interface ResolveFontFacesOptions {
  weights: Array<string | number>
  styles: Array<'normal' | 'italic' | 'oblique'>
  // TODO: improve support and support unicode range
  subsets: string[]
  fallbacks: string[]
}

export interface FontProvider<FontProviderOptions = Record<string, unknown>> {
  /**
   * The setup function will be called before the first `resolveFontFaces` call and is a good
   * place to register any Nuxt hooks or setup any state.
   */
  setup?: (options: FontProviderOptions, nuxt: Nuxt) => Awaitable<void>
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
    fallbacks?: string[]
  }>
}

export type FontProviderName = (string & {}) | 'google' | 'local' | 'none'


export interface FontFamilyOverrides {
  /** The font family to apply this override to. */
  name: string
  /** Inject `@font-face` regardless of usage in project. */
  global?: boolean

  // TODO:
  // as?: string
}
export interface FontFamilyProviderOverride extends FontFamilyOverrides, Partial<ResolveFontFacesOptions> {
  /** The provider to use when resolving this font. */
  provider?: FontProviderName
}

export interface FontFamilyManualOverride extends FontFamilyOverrides, FontFaceData {
  /** Font families to generate fallback metrics for. */
  fallbacks?: string[]
}

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
  defaults?: Partial<Omit<ResolveFontFacesOptions, 'fallbacks'>> & { fallbacks?: Partial<Record<GenericCSSFamily, string[]>> }
  providers?: {
    google?: FontProvider | string | false
    local?: FontProvider | string | false
    [key: string]: FontProvider | string | false | undefined
  }
  /** Configure the way font assets are exposed */
  assets: {
    /**
     * The baseURL where font files are served.
     * @default '/_fonts/'
     */
    prefix?: string
    /** Currently font assets are exposed as public assets as part of the build. This will be configurable in future */
    strategy?: 'public'
  }
  /** Options passed directly to `google` font provider */
  google?: {}
  /** Options passed directly to `local` font provider (none currently) */
  local?: {}
  /**
   * An ordered list of providers to check when resolving font families.
   *
   * After checking these providers, Nuxt Fonts will proceed by checking the
   *
   * Default behaviour is to check all user providers in the order they were defined, and then all built-in providers.
   */
  priority?: string[]
  /**
   * In some cases you may wish to use only one font provider. This is equivalent to disabling all other font providers.
   */
  provider?: FontProviderName
}

export interface ModuleHooks {
  'fonts:providers': (providers: FontProvider) => void | Promise<void>
}
