import type { Nuxt } from '@nuxt/schema'
import type { LocalFontSource, Provider, ProviderFactory, providers, RemoteFontSource, ResolveFontOptions } from 'unifont'

import type { GenericCSSFamily } from './css/parse'

export type Awaitable<T> = T | Promise<T>

export interface FontFaceData {
  src: Array<LocalFontSource | RemoteFontSource>
  /**
   * The font-display descriptor.
   * @default 'swap'
   */
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
  /** A font-weight value. */
  weight?: string | number | [number, number]
  /** A font-stretch value. */
  stretch?: string
  /** A font-style value. */
  style?: string
  /** The range of Unicode code points to be used from the font. */
  unicodeRange?: string[]
  /** Allows control over advanced typographic features in OpenType fonts. */
  featureSettings?: string
  /** Allows low-level control over OpenType or TrueType font variations, by specifying the four letter axis names of the features to vary, along with their variation values. */
  variationSettings?: string
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

/**
 * @deprecated Use `Provider` types from `unifont`
 */
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
  resolveFontFaces?: (fontFamily: string, options: ResolveFontOptions) => Awaitable<void | {
    /**
     * Return data used to generate @font-face declarations.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face
     */
    fonts: FontFaceData[]
    fallbacks?: string[]
  }>
}

export type FontProviderName = (string & {}) | 'google' | 'local' | 'none'

export interface FontFamilyOverrides {
  /** The font family to apply this override to. */
  name: string
  /** Inject `@font-face` regardless of usage in project. */
  global?: boolean
  /**
   * Enable or disable adding preload links to the initially rendered HTML.
   * This is true by default for the highest priority format unless a font is subsetted (to avoid over-preloading).
   */
  preload?: boolean

  // TODO:
  // as?: string
}
export interface FontFamilyProviderOverride extends FontFamilyOverrides, Partial<Omit<ResolveFontOptions, 'weights'> & { weights: Array<string | number> }> {
  /** The provider to use when resolving this font. */
  provider?: FontProviderName
}

export type FontSource = string | LocalFontSource | RemoteFontSource

export interface RawFontFaceData extends Omit<FontFaceData, 'src' | 'unicodeRange'> {
  src: FontSource | Array<FontSource>
  unicodeRange?: string | string[]
}

export interface FontFamilyManualOverride extends FontFamilyOverrides, RawFontFaceData {
  /** Font families to generate fallback metrics for. */
  fallbacks?: string[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProviderOption = ((options: any) => Provider) | string | false

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
   *     { name: 'Other Font', src: 'https://example.com/font.woff2' },
   *   ]
   * }
   * ```
   */
  families?: Array<FontFamilyManualOverride | FontFamilyProviderOverride>
  defaults?: Partial<{
    preload: boolean
    weights: Array<string | number>
    styles: ResolveFontOptions['styles']
    subsets: ResolveFontOptions['subsets']
    fallbacks?: Partial<Record<GenericCSSFamily, string[]>>
  }>
  providers?: {
    adobe?: ProviderOption
    bunny?: ProviderOption
    fontshare?: ProviderOption
    fontsource?: ProviderOption
    google?: ProviderOption
    googleicons?: ProviderOption
    [key: string]: FontProvider | ProviderOption | undefined
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
  /** Options passed directly to `local` font provider (none currently) */
  local?: Record<string, never>
  /** Options passed directly to `adobe` font provider */
  adobe?: typeof providers.adobe extends ProviderFactory<infer O> ? O : Record<string, never>
  /** Options passed directly to `bunny` font provider */
  bunny?: typeof providers.bunny extends ProviderFactory<infer O> ? O : Record<string, never>
  /** Options passed directly to `fontshare` font provider */
  fontshare?: typeof providers.fontshare extends ProviderFactory<infer O> ? O : Record<string, never>
  /** Options passed directly to `fontsource` font provider */
  fontsource?: typeof providers.fontsource extends ProviderFactory<infer O> ? O : Record<string, never>
  /** Options passed directly to `google` font provider */
  google?: typeof providers.google extends ProviderFactory<infer O> ? O : Record<string, never>
  /** Options passed directly to `googleicons` font provider */
  googleicons?: typeof providers.googleicons extends ProviderFactory<infer O> ? O : Record<string, never>
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
  /**
   *  Enables support for Nuxt DevTools.
   *
   * @default true
   */
  devtools?: boolean
  experimental?: {
    /**
     * You can disable adding local fallbacks for generated font faces, like `local('Font Face')`.
     * @default false
     */
    disableLocalFallbacks?: boolean
    /**
     * You can enable support for processing CSS variables for font family names. This may have a performance impact.
     * @default false
     */
    processCSSVariables?: boolean | 'font-prefixed-only'
  }
}

export interface ModuleHooks {
  'fonts:providers': (providers: Record<string, ProviderFactory | FontProvider>) => void | Promise<void>
}
