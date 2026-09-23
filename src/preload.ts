import type { FontFaceData } from 'unifont'
import { selectPreloadFonts } from 'fontless'
import type { ModuleOptions } from './types'

type PreloadOption = NonNullable<ModuleOptions['defaults']>['preload']

/**
 * Pick the `@font-face` declarations for a family that should be preloaded in the
 * initially rendered HTML.
 *
 * When no `preload` option is set we preload the highest priority font face, as long
 * as it has a URL source and is not part of a subsetted family.
 */
export function selectFontsToPreload(preload: PreloadOption, fontFamily: string, fonts: FontFaceData[], subsets?: string[]): FontFaceData[] {
  if (preload === undefined) {
    const [topPriorityFont] = [...fonts].sort((a, b) => (a.meta?.priority || 0) - (b.meta?.priority || 0))
    return topPriorityFont && topPriorityFont.src.some(s => 'url' in s) && !topPriorityFont.unicodeRange ? [topPriorityFont] : []
  }
  return selectPreloadFonts(fontFamily, fonts, preload, subsets)
}
