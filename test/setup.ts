import { promises as fsp } from 'node:fs'

import { glob } from 'tinyglobby'

import { cacheBase } from '../src/cache'

export async function setup() {
  const caches = await glob([cacheBase, `{playgrounds,test/fixtures}/*/${cacheBase}`], {
    onlyDirectories: true,
    absolute: true,
  })
  for (const cache of caches) {
    await fsp.rm(cache, { recursive: true, force: true })
  }
  console.log('✅ Cleared font cache.')
}
