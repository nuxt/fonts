import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'

import type { Awaitable } from './types'

// TODO: refactor to use nitro storage when possible
const storage = createStorage({
  driver: fsDriver({
    base: 'node_modules/.cache/nuxt-fonts',
  })
})

export async function cachedData<T = unknown> (key: string, fetcher: () => Awaitable<T>, ttl = 1000 * 60 * 60 * 24 * 7) {
  const cached = await storage.getItem<null | { expires: number, data: T }>(key)
  if (!cached || cached.expires < Date.now()) {
    const data = await fetcher()
    await storage.setItem(key, { expires: Date.now() + ttl, data })
    return data
  }
  return cached.data
}
