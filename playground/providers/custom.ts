import { defineFontProvider } from '@nuxt/fonts/utils'

const resolvableFonts = new Set<string>()
export default defineFontProvider({
  async setup () {
    // Do some stuff
    resolvableFonts.add('SomeFontFromCustomProvider')
  },
  async resolveFontFaces (fontFamily) {
    if (!resolvableFonts.has(fontFamily)) { return }
    return {
      fonts: {
        src: '/some-font.woff2'
      }
    }
  },
})

