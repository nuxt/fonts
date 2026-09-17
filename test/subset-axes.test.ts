import { fileURLToPath } from 'node:url'

import { describe, expect, it, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  subsetFont: vi.fn((font: Buffer) => Promise.resolve(font)),
  resolveModulePath: vi.fn(() => undefined),
}))

vi.mock('subset-font', () => ({ default: mocks.subsetFont }))
vi.mock('exsolve', async importOriginal => ({
  ...await importOriginal<typeof import('exsolve')>(),
  resolveModulePath: mocks.resolveModulePath,
}))

const rootDir = fileURLToPath(new URL('./fixtures/glyphs', import.meta.url))
const font = Buffer.from('font')

const { subsetFont } = await import('../src/subset')

beforeEach(() => {
  mocks.subsetFont.mockClear()
})

describe('variable font axes', () => {
  it('should apply requested axes to the font file', async () => {
    await subsetFont(font, 'abc', '/CustomFont.woff2', rootDir, { CASL: 1, MONO: { min: 0, max: 1 } })

    expect(mocks.subsetFont).toHaveBeenCalledTimes(1)
    expect(mocks.subsetFont).toHaveBeenCalledWith(font, 'abc', { variationAxes: { CASL: 1, MONO: { min: 0, max: 1 } } })
  })

  it('should subset without axes when none are requested', async () => {
    await subsetFont(font, 'abc', '/CustomFont.woff2', rootDir, {})

    expect(mocks.subsetFont).toHaveBeenCalledWith(font, 'abc')
  })
})
