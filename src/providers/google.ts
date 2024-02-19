import type { FontProvider } from '../types'

const resolvableFontFamilies = new Set([
  'Roboto'
])



export default {
  async setup () {},
  resolveFontFaces (fontFamily) {
    if (!resolvableFontFamilies.has(fontFamily)) return

    return {
      fonts: {
        src: [
          fontFamily, // resolve to local font if it is installed
          'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
        ],
        unicodeRange: ['U+0000-00FF', 'U+0131', 'U+0152-0153', 'U+02BB-02BC', 'U+02C6', 'U+02DA', 'U+02DC', 'U+0304', 'U+0308', 'U+0329', 'U+2000-206F', 'U+2074', 'U+20AC', 'U+2122', 'U+2191', 'U+2193', 'U+2212', 'U+2215', 'U+FEFF', 'U+FFFD'],
        display: 'swap',
        weight: 400,
        style: 'normal',
      }
    }
  },
} satisfies FontProvider
