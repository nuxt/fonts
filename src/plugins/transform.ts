import { createUnplugin } from 'unplugin'
import { parse, walk } from 'css-tree'
import MagicString from 'magic-string'

import type { Awaitable, NormalizedFontFaceData } from '../types'
import { extractFontFamilies } from '../css/parse'
import { generateFontFaces } from '../css/render'

interface FontFamilyInjectionPluginOptions {
  resolveFontFace: (fontFamily: string) => Awaitable<NormalizedFontFaceData[] | undefined>
}

// TODO: support shared chunks of CSS
export const FontFamilyInjectionPlugin = (options: FontFamilyInjectionPluginOptions) => createUnplugin(() => {
  return {
    name: 'nuxt:fonts:font-family-injection',
    transformInclude (id) {
      return isCSS(id)
    },
    async transform (code) {
      // Early return if no font-family is used in this CSS
      if (!code.includes('font-family:')) { return }

      const s = new MagicString(code)

      const processedFontFamilies = new Set<string>()
      const injectedDeclarations = new Set<string>()

      const promises = [] as any[]
      async function addFontFaceDeclaration (fontFamily: string) {
        const result = await options.resolveFontFace(fontFamily)
        if (!result) return

        for (const declaration of generateFontFaces(fontFamily, result)) {
          if (!injectedDeclarations.has(declaration)) {
            injectedDeclarations.add(declaration)
            s.prepend(declaration + '\n')
          }
        }
      }

      const ast = parse(code)

      // Collect existing `@font-face` declarations (to skip adding them)
      const existingFontFamilies = new Set<string>()
      walk(ast, {
        visit: 'Declaration',
        enter (node) {
          if (this.atrule?.name === 'font-face' && node.property === 'font-family') {
            for (const family of extractFontFamilies(node)) {
              existingFontFamilies.add(family)
            }
          }
        }
      })

      // TODO: handle CSS custom properties
      walk(ast, {
        visit: 'Declaration',
        enter (node) {
          if (node.property !== 'font-family' || this.atrule?.name === 'font-face') { return }

          // Only add @font-face for the first font-family in the list
          const [fontFamily] = extractFontFamilies(node)
          if (fontFamily && !processedFontFamilies.has(fontFamily) && !existingFontFamilies.has(fontFamily)) {
            processedFontFamilies.add(fontFamily)
            promises.push(addFontFaceDeclaration(fontFamily))
          }
          // TODO: Add font fallback metrics via @font-face
          // TODO: Add fallback font for font metric injection
        }
      })

      await Promise.all(promises)

      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: s.generateMap({ hires: true })
        }
      }
    },
  }
})

// Copied from vue-bundle-renderer utils
const IS_CSS_RE = /\.(?:css|scss|sass|postcss|pcss|less|stylus|styl)(\?[^.]+)?$/

function isCSS (id: string) {
  return IS_CSS_RE.test(id)
}

