import { promises as fsp } from 'node:fs'

import { cacheBase } from '../src/cache'

export async function setup() {
  await fsp.rm('./' + cacheBase, { recursive: true, force: true })
  for (const dir of ['basic', 'scss', 'tailwindcss@3', 'tailwindcss@4', 'unocss']) {
    await fsp.rm('./playgrounds/' + dir + cacheBase, { recursive: true, force: true })
  }
  console.log('✅ Cleared font cache.')
}
