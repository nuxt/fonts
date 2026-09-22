import { fileURLToPath } from 'node:url'
import { describe } from 'vitest'
import { setup } from '@nuxt/test-utils'

import { itInjectsFontFaces } from './builders'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/builders', import.meta.url)),
  nuxtConfig: {
    builder: 'rspack',
  },
})

describe('rspack builder', itInjectsFontFaces)
