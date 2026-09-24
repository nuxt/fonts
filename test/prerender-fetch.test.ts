import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/prerender-fetch', import.meta.url)),
})

describe('prerendering', () => {
  it('serves font files to requests made within Nitro', async () => {
    // the route is prerendered, so this is the response it gave during the build
    const sizes = await $fetch<Record<string, number | string>>('/font-sizes.json')
    const original = await readFile(fileURLToPath(new URL('./fixtures/prerender-fetch/fonts/MyGlobal-400.woff2', import.meta.url)))
    expect(Object.keys(sizes)).toEqual([expect.stringMatching(/^\/_nuxt\/fonts\/[^/]+\.woff2$/)])
    expect(Object.values(sizes)).toEqual([original.byteLength])
  })
})
