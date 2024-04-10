import { promises as fsp } from 'node:fs'

import { cacheBase } from '../src/cache'

export async function setup() {
  await fsp.rm('./' + cacheBase, { recursive: true, force: true })
  await fsp.rm('./playground' + cacheBase, { recursive: true, force: true })
  console.log('✅ Cleared font cache.')
}
