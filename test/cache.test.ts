import { describe, expect, it } from 'vitest'
import { createStorage } from 'unstorage'
import memoryDriver from 'unstorage/drivers/memory'

import type { Storage, StorageValue } from 'unstorage'

import { cacheBase, createFontStorage } from '../src/cache'

function cacheDir(storage: Storage<StorageValue>) {
  return (storage.getMount('').driver.options as { base: string }).base
}

describe('cache option', () => {
  it('should cache in the default directory', () => {
    const storage = createFontStorage(undefined, '/root')
    expect(cacheDir(storage)).toBe(`/root/${cacheBase}`)
  })

  it('should accept a custom directory', () => {
    for (const cache of ['.cache/fonts', { dir: '.cache/fonts' }]) {
      const storage = createFontStorage(cache, '/root')
      expect(cacheDir(storage)).toBe('/root/.cache/fonts')
    }
  })

  it('should accept an absolute directory', () => {
    const storage = createFontStorage('/tmp/fonts', '/root')
    expect(cacheDir(storage)).toBe('/tmp/fonts')
  })

  it('should accept a custom storage instance', () => {
    const cache = createStorage({ driver: memoryDriver() })
    expect(createFontStorage(cache, '/root')).toBe(cache)
  })

  it('should not persist anything when disabled', async () => {
    const storage = createFontStorage(false, '/root')
    await storage.setItem('key', 'value')
    expect(await storage.getItem('key')).toBe('value')
    expect(storage.getMount('').driver.name).toBe('memory')
  })
})
