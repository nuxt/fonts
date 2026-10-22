import type { FontFaceData } from 'unifont'
import { selectPreloadFonts } from 'fontless'
import type { ModuleOptions } from './types.ts'

type PreloadOption = NonNullable<ModuleOptions['defaults']>['preload']

interface SelectFontsToPreloadOptions {
  /** The subsets the family was resolved with. */
  subsets?: string[]
  /** Whether the family's files are reduced to a set of glyphs rather than to a named subset. */
  glyphs?: boolean
}

/**
 * Pick the `@font-face` declarations for a family that should be preloaded in the
 * initially rendered HTML.
 *
 * When no `preload` option is set we preload the highest priority font face, as long
 * as it has a URL source and is not part of a subsetted family.
 */
export function selectFontsToPreload(preload: PreloadOption, fontFamily: string, fonts: FontFaceData[], options: SelectFontsToPreloadOptions = {}): FontFaceData[] {
  if (preload === undefined) {
    const [topPriorityFont] = [...fonts].sort((a, b) => (a.meta?.priority || 0) - (b.meta?.priority || 0))
    return topPriorityFont && topPriorityFont.src.some(s => 'url' in s) && !topPriorityFont.unicodeRange ? [topPriorityFont] : []
  }
  if (options.glyphs && typeof preload === 'object' && preload.subsets) {
    // A family reduced to a set of glyphs is not split into named subsets, so its faces
    // carry no subset for a subset filter to select them by.
    const named = fonts.filter(font => font.meta?.subset)
    const unnamed = fonts.filter(font => !font.meta?.subset)
    return [
      ...selectPreloadFonts(fontFamily, named, preload, options.subsets),
      ...selectPreloadFonts(fontFamily, unnamed, { styles: preload.styles, weights: preload.weights }, options.subsets),
    ]
  }
  return selectPreloadFonts(fontFamily, fonts, preload, options.subsets)
}
