import type { Nuxt } from '@nuxt/schema'
import type { FontFaceData as UnifontFontFaceData, ProviderFactory, ResolveFontOptions, ResolveFontResult } from 'unifont'
import type { FontlessOptions, ManualFontDetails, NormalizeFontDataContext, ProviderFontDetails } from 'fontless'
import type { LocalProviderOptions } from './providers/local'

export interface ModuleOptions extends Omit<FontlessOptions, 'local'> {
  /** Options passed directly to the `local` font provider */
  local?: LocalProviderOptions

  /**
   *  Enables support for Nuxt DevTools.
   *
   * @default true
   */
  devtools?: boolean
}

export type Awaitable<T> = T | Promise<T>

/** @deprecated Use `FontFaceData` from `unifont` */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FontFaceData extends UnifontFontFaceData {}

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
  resolveFontFaces?: (fontFamily: string, options: ResolveFontOptions) => Awaitable<void | ResolveFontResult>
}

export interface ModuleHooks {
  'fonts:providers': (providers: Record<string, ProviderFactory<string> | FontProvider>) => void | Promise<void>
  'fonts:public-asset-context': (context: NormalizeFontDataContext) => void | Promise<void>
  /**
   * Called each time a font family is resolved, with the `@font-face` data generated for it.
   *
   * Each `src` URL is the path the font file is served from, and `originalURL` is where it was
   * downloaded from. A family can be resolved more than once, for example once per bundler
   * environment, so the same family may be passed several times.
   */
  'fonts:resolved': (font: ManualFontDetails | ProviderFontDetails) => void | Promise<void>
}
