import { describe, expect, it } from 'vitest'
import type { FontFaceData } from 'unifont'

import { selectFontsToPreload } from '../src/preload.ts'

const latin: FontFaceData = {
  src: [{ url: '/latin.woff2', format: 'woff2' }],
  meta: { subset: 'latin', priority: 1 },
}
const cyrillic: FontFaceData = {
  src: [{ url: '/cyrillic.woff2', format: 'woff2' }],
  meta: { subset: 'cyrillic', priority: 0 },
}
const subsetted: FontFaceData = {
  src: [{ url: '/subsetted.woff2', format: 'woff2' }],
  unicodeRange: ['U+0000-00FF'],
}
const glyphs: FontFaceData = {
  src: [{ url: '/glyphs.woff2', format: 'woff2' }],
  unicodeRange: ['U+61-63'],
}
const localOnly: FontFaceData = {
  src: [{ name: 'Local Font' }],
}

describe('selectFontsToPreload', () => {
  it('should preload the highest priority font face by default', () => {
    expect(selectFontsToPreload(undefined, 'Font', [latin, cyrillic])).toEqual([cyrillic])
  })

  it('should not preload subsetted or local-only font faces by default', () => {
    expect(selectFontsToPreload(undefined, 'Font', [subsetted])).toEqual([])
    expect(selectFontsToPreload(undefined, 'Font', [localOnly])).toEqual([])
    expect(selectFontsToPreload(undefined, 'Font', [])).toEqual([])
  })

  it('should not preload a font face without a subset when the preload option filters by subset', () => {
    expect(selectFontsToPreload({ subsets: ['latin'] }, 'Font', [glyphs])).toEqual([])
  })

  it('should preload a glyph subsetted font face when the preload option filters by subset', () => {
    expect(selectFontsToPreload({ subsets: ['latin'] }, 'Font', [glyphs], { glyphs: true })).toEqual([glyphs])
  })

  it('should only preload the named subsets of a glyph subsetted family', () => {
    expect(selectFontsToPreload({ subsets: ['latin'] }, 'Font', [latin, cyrillic, glyphs], { glyphs: true })).toEqual([latin, glyphs])
  })
})
