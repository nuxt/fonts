import type { FontFaceData } from 'unifont'
import type { ModuleOptions } from './types'

type PreloadOption = NonNullable<ModuleOptions['defaults']>['preload']

/**
 * Pick the `@font-face` declarations for a family that should be preloaded in the
 * initially rendered HTML.
 *
 * When no `preload` option is set we preload the highest priority font face, as long
 * as it has a URL source and is not part of a subsetted family.
 */
export function selectFontsToPreload(preload: PreloadOption, fontFamily: string, fonts: FontFaceData[]): FontFaceData[] {
  if (preload === false) {
    return []
  }
  if (typeof preload === 'function') {
    return fonts.filter(font => preload(fontFamily, font))
  }
  if (preload && typeof preload === 'object' && 'subsets' in preload) {
    return fonts.filter(font => !!font.meta?.subset && preload.subsets.includes(font.meta.subset))
  }

  const [topPriorityFont] = [...fonts].sort((a, b) => (a.meta?.priority || 0) - (b.meta?.priority || 0))
  if (!topPriorityFont) {
    return []
  }
  if (preload === true) {
    return [topPriorityFont]
  }
  return topPriorityFont.src.some(s => 'url' in s) && !topPriorityFont.unicodeRange ? [topPriorityFont] : []
}
