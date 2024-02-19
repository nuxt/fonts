import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
})

describe('providers', async () => {
  it('generates inlined font face rules for `google` provider', async () => {
    const html = await $fetch('/')
    for (const font of ['Poppins', 'Raleway', 'Montserrat']) {
      expect(html).toContain(`@font-face {\n  font-family: '${font}';\n  src: local("${font}"), url`)
    }
  })

  it('generates inlined font face rules for `local` provider', async () => {
    const html = await $fetch('/')
    expect(html).toContain('src: url("/custom-font.woff2") format(woff2)')
  })
})
