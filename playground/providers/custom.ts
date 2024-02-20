// TODO: expose types publicly
import type { FontProvider } from '../../src/types'

const resolvableFonts = new Set<string>()
export default {
  async setup () {
    // Do some stuff
    resolvableFonts.add('SomeFontFromCustomProvider')
  },
  async resolveFontFaces (fontFamily, _defaults) {
    if (!resolvableFonts.has(fontFamily)) { return }
    return {
      fonts: {
        src: '/some-font.woff2'
      }
    }
  },
} satisfies FontProvider

