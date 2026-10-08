import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { buildNuxt, loadNuxt } from '@nuxt/kit'

describe('`fonts:resolved` hook', () => {
  it('fails the build when a listener throws', async () => {
    const nuxt = await loadNuxt({
      cwd: fileURLToPath(new URL('./fixtures/resolved-hook', import.meta.url)),
      dev: false,
      overrides: {
        buildDir: fileURLToPath(new URL('./fixtures/resolved-hook/.nuxt/error', import.meta.url)),
        hooks: {
          'fonts:resolved': () => {
            throw new Error('listener failed')
          },
        },
      },
    })
    try {
      await expect(buildNuxt(nuxt)).rejects.toThrow('listener failed')
    }
    finally {
      await nuxt.close()
    }
  }, 60_000)
})
