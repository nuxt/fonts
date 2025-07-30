import type { Nuxt } from '@nuxt/schema'
import type { FontFaceData as UnifontFontFaceData, ProviderFactory, ResolveFontOptions } from 'unifont'
import type { FontlessOptions } from 'fontless'

export interface ModuleOptions extends FontlessOptions {
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
  resolveFontFaces?: (fontFamily: string, options: ResolveFontOptions) => Awaitable<void | {
    /**
     * Return data used to generate @font-face declarations.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face
     */
    fonts: FontFaceData[]
    fallbacks?: string[]
  }>
}

export interface ModuleHooks {
  'fonts:providers': (providers: Record<string, ProviderFactory | FontProvider>) => void | Promise<void>
}

export type fetchType = (input: string, init?: {
  agent?: unknown
  dispatcher?: unknown
}) => Promise<Response>
