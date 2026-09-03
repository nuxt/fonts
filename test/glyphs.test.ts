import { fileURLToPath } from 'node:url'
import fsp from 'node:fs/promises'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, fetch } from '@nuxt/test-utils'

const fixtureURL = new URL('./fixtures/glyphs/', import.meta.url)

await setup({
  rootDir: fileURLToPath(fixtureURL),
})

describe('glyph subsetting', () => {
  it('emits a font file reduced to the glyphs a family asks for', async () => {
    const html = await $fetch<string>('/')
    const fontFace = html.match(/@font-face\s*\{[^}]*font-family:\s*['"]?CustomFont['"]?;[^}]*\}/)![0]

    expect(fontFace).toContain('unicode-range:U+61-63')

    const url = fontFace.match(/url\(['"]?(\/_fonts\/[^'")]+)['"]?\)/)![1]!
    const emitted = await fetch(url).then(r => r.arrayBuffer())
    const original = await fsp.readFile(new URL('./assets/fonts/CustomFont.woff2', fixtureURL))

    expect(emitted.byteLength).toBeLessThan(original.byteLength / 2)
  })
})
