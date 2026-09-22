import { resolve } from 'pathe'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import memoryDriver from 'unstorage/drivers/memory'
import type { Storage, StorageValue } from 'unstorage'
import type { ModuleOptions } from './types'

export const cacheBase = 'node_modules/.cache/nuxt/fonts/meta'

/** A cache instance supplied by the user, which need not be an `unstorage` instance. */
export type ProvidedStorage = Extract<NonNullable<ModuleOptions['cache']>, { getItem: unknown }>

/** The cache surface used to store font metadata and downloaded font files. */
export type FontStorage = Storage<StorageValue> | ProvidedStorage

function isStorage(cache: ModuleOptions['cache']): cache is ProvidedStorage {
  return !!cache && typeof cache === 'object' && typeof (cache as ProvidedStorage).getItem === 'function'
}

// TODO: refactor to use nitro storage when possible
export function createFontStorage(cache: ModuleOptions['cache'], rootDir: string): FontStorage {
  if (cache === false) {
    return createStorage({ driver: memoryDriver() })
  }
  if (isStorage(cache)) {
    return cache
  }
  const dir = typeof cache === 'string' ? cache : cache?.dir
  return createStorage({ driver: fsDriver({ base: resolve(rootDir, dir || cacheBase) }) })
}
