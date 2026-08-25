import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('../playgrounds/nuxt5', import.meta.url)),
  env: {
    NUXT_APP_BASE_URL: '/foo',
  },
})

describe('nuxt 5 custom base URL', () => {
  // nitro v3 does not apply `app.baseURL` to server routing, so the app is served at `/`
  it.fails('serves the app under the base URL', async () => {
    const html = await $fetch<string>('/foo/providers/bunny')
    expect(html).toContain('Abel')
  })
})
