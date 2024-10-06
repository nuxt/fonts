import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'

export const cacheBase = 'node_modules/.cache/nuxt/fonts/meta'

// TODO: refactor to use nitro storage when possible
export const storage = createStorage({
  driver: fsDriver({ base: cacheBase }),
})
