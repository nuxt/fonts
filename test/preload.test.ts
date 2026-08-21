import { describe, expect, it } from 'vitest'
import type { FontFaceData } from 'unifont'

import { selectFontsToPreload } from '../src/preload'

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

  it('should preload nothing when disabled', () => {
    expect(selectFontsToPreload(false, 'Font', [latin, cyrillic])).toEqual([])
  })

  it('should preload the highest priority font face when enabled', () => {
    expect(selectFontsToPreload(true, 'Font', [subsetted, latin])).toEqual([subsetted])
  })

  it('should preload font faces matching the requested subsets', () => {
    expect(selectFontsToPreload({ subsets: ['latin'] }, 'Font', [latin, cyrillic, subsetted])).toEqual([latin])
  })

  it('should fall back to the default behaviour for an unrecognised value', () => {
    // @ts-expect-error a bare list of subsets is not a valid value
    expect(selectFontsToPreload(['latin'], 'Font', [latin, cyrillic])).toEqual([cyrillic])
  })

  it('should support a custom filter', () => {
    expect(selectFontsToPreload((family, font) => family === 'Font' && font === cyrillic, 'Font', [latin, cyrillic])).toEqual([cyrillic])
  })
})
