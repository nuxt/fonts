import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
})

describe('ssr', async () => {
  it('renders the index page', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Nuxt module playground!')
  })
})
