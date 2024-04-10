import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'

import { version } from '../package.json'
import type { Awaitable } from './types'

export const cacheBase = 'node_modules/.cache/nuxt/fonts/meta'

// TODO: refactor to use nitro storage when possible
export const storage = createStorage({
  driver: fsDriver({ base: cacheBase }),
})

export async function cachedData<T = unknown>(key: string, fetcher: () => Awaitable<T>, options?: {
  onError?: (err: any) => Awaitable<T>
  ttl?: number
}) {
  const cached = await storage.getItem<null | { expires: number, version: string, data: T }>(key)
  if (!cached || cached.version !== version || cached.expires < Date.now()) {
    try {
      const data = await fetcher()
      await storage.setItem(key, { expires: Date.now() + (options?.ttl || 1000 * 60 * 60 * 24 * 7), version, data })
      return data
    }
    catch (err) {
      if (options?.onError) { return options.onError(err) }
      throw err
    }
  }
  return cached.data
}
