import fsp from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { describe, expect, it, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  warn: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
  prompt: vi.fn(),
  addDependency: vi.fn(),
  resolveModulePath: vi.fn(),
  env: { isCI: true, isTest: true, isTTY: false },
}))

vi.mock('../src/logger', () => ({
  logger: mocks,
}))
vi.mock('nypm', async importOriginal => ({
  ...await importOriginal<typeof import('nypm')>(),
  addDependency: mocks.addDependency,
}))
vi.mock('std-env', () => ({
  get isCI() {
    return mocks.env.isCI
  },
  get isTest() {
    return mocks.env.isTest
  },
}))
vi.mock('exsolve', async importOriginal => ({
  ...await importOriginal<typeof import('exsolve')>(),
  resolveModulePath: mocks.resolveModulePath,
}))

const rootDir = fileURLToPath(new URL('./fixtures/glyphs', import.meta.url))
const font = await fsp.readFile(new URL('./fixtures/glyphs/assets/fonts/CustomFont.woff2', import.meta.url))

const { ensureSubsetter, subsetFont } = await import('../src/subset')
const { resolveModulePath } = await vi.importActual<typeof import('exsolve')>('exsolve')

const installedPath = resolveModulePath('subset-font', { from: import.meta.url })

Object.defineProperty(process.stdout, 'isTTY', { get: () => mocks.env.isTTY, configurable: true })

beforeEach(() => {
  vi.clearAllMocks()
  mocks.resolveModulePath.mockReturnValue(installedPath)
  mocks.env = { isCI: true, isTest: true, isTTY: false }
})

/** Make the environment look like an interactive terminal outside CI. */
function makeInteractive() {
  mocks.env = { isCI: false, isTest: false, isTTY: true }
}

describe('font subsetting', () => {
  it('should reduce a font to the requested glyphs', async () => {
    const subsetted = await subsetFont(font, 'abc', '/CustomFont.woff2', rootDir)

    expect(subsetted.byteLength).toBeLessThan(font.byteLength / 2)
    expect(subsetted.subarray(0, 4).toString()).toBe('wOF2')
  })

  it('should fall back to the original font when it cannot be subsetted', async () => {
    const notAFont = Buffer.from('not a font')

    expect(await subsetFont(notAFont, 'abc', '/not-a-font.woff2', rootDir)).toBe(notAFont)
    expect(mocks.warn).toHaveBeenCalledWith(expect.stringContaining('Could not subset font `/not-a-font.woff2`'), expect.anything())
  })
})

describe('subsetter installation', () => {
  it('should do nothing when `subset-font` is already installed', async () => {
    expect(await ensureSubsetter(rootDir)).toBe(true)
    expect(mocks.prompt).not.toHaveBeenCalled()
    expect(mocks.addDependency).not.toHaveBeenCalled()
  })

  it('should warn rather than prompt when it cannot ask', async () => {
    mocks.resolveModulePath.mockReturnValue(undefined)

    expect(await ensureSubsetter(rootDir)).toBe(false)
    expect(mocks.warn).toHaveBeenCalledWith(expect.stringContaining('pnpm add --save-dev subset-font'))
    expect(mocks.prompt).not.toHaveBeenCalled()
    expect(mocks.addDependency).not.toHaveBeenCalled()
  })

  it('should install `subset-font` when the user accepts', async () => {
    mocks.resolveModulePath.mockReturnValue(undefined)
    mocks.prompt.mockResolvedValue(true)
    makeInteractive()

    expect(await ensureSubsetter(rootDir)).toBe(true)
    expect(mocks.addDependency).toHaveBeenCalledWith('subset-font', { cwd: rootDir, dev: true })
  })

  it('should explain how to install `subset-font` when the user declines', async () => {
    mocks.resolveModulePath.mockReturnValue(undefined)
    mocks.prompt.mockResolvedValue(false)
    makeInteractive()

    expect(await ensureSubsetter(rootDir)).toBe(false)
    expect(mocks.addDependency).not.toHaveBeenCalled()
    expect(mocks.info).toHaveBeenCalledWith(expect.stringContaining('pnpm add --save-dev subset-font'))
  })
})
