import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { buildAssets, findStylesheet, sharedNamesWithDifferentContents } from '../build-assets.ts'

describe('unocss emitted asset file names', () => {
  it('changes when the font faces injected into the bundled stylesheet change', async () => {
    const rootDir = fileURLToPath(new URL('../../playgrounds/unocss', import.meta.url))
    const regular = await buildAssets(rootDir, { fonts: { defaults: { weights: [400] } } })
    const bold = await buildAssets(rootDir, { fonts: { defaults: { weights: [700] } } })

    expect(findStylesheet(regular, 'entry')).toContain('font-weight:400')
    expect(findStylesheet(regular, 'entry')).not.toContain('font-weight:700')
    expect(findStylesheet(bold, 'entry')).toContain('font-weight:700')
    expect(findStylesheet(bold, 'entry')).not.toContain('font-weight:400')

    expect(sharedNamesWithDifferentContents(regular, bold)).toEqual([])
  }, 120_000)
})
