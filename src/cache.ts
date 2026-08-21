import { resolve } from 'pathe'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import memoryDriver from 'unstorage/drivers/memory'
import type { Storage, StorageValue } from 'unstorage'
import type { ModuleOptions } from './types'

export const cacheBase = 'node_modules/.cache/nuxt/fonts/meta'

function isStorage(cache: ModuleOptions['cache']): cache is Storage<StorageValue> {
  return !!cache && typeof cache === 'object' && typeof (cache as Storage).getItem === 'function'
}

// TODO: refactor to use nitro storage when possible
export function createFontStorage(cache: ModuleOptions['cache'], rootDir: string): Storage<StorageValue> {
  if (cache === false) {
    return createStorage({ driver: memoryDriver() })
  }
  if (isStorage(cache)) {
    return cache
  }
  const dir = typeof cache === 'string' ? cache : cache?.dir
  return createStorage({ driver: fsDriver({ base: resolve(rootDir, dir || cacheBase) }) })
}
