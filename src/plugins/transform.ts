import { createUnplugin } from 'unplugin'
import { parse, walk } from 'css-tree'
import MagicString from 'magic-string'
import { transform } from 'esbuild'
import type { TransformOptions } from 'esbuild'
import type { ESBuildOptions } from 'vite'

import type { Awaitable, NormalizedFontFaceData } from '../types'
import { extractEndOfFirstChild, extractFontFamilies, extractGeneric, type GenericCSSFamily } from '../css/parse'
import { generateFontFace, generateFontFallbacks } from '../css/render'

export interface FontFaceResolution {
  fonts?: NormalizedFontFaceData[]
  fallbacks?: string[]
}

interface FontFamilyInjectionPluginOptions {
  resolveFontFace: (fontFamily: string, fallbackOptions?: { fallbacks: string[], generic?: GenericCSSFamily }) => Awaitable<undefined | FontFaceResolution>
  dev: boolean
}

const SKIP_RE = /\/node_modules\/(vite-plugin-vue-inspector)\//

// TODO: support shared chunks of CSS
export const FontFamilyInjectionPlugin = (options: FontFamilyInjectionPluginOptions) => createUnplugin(() => {
  let postcssOptions: Parameters<typeof transform>[1] | undefined

  async function transformCSS (code: string) {
    const s = new MagicString(code)

    const injectedDeclarations = new Set<string>()

    const promises = [] as any[]
    async function addFontFaceDeclaration (fontFamily: string, fallbackOptions?: {
      generic?: GenericCSSFamily
      fallbacks: string[]
      index: number
    }) {
      const result = await options.resolveFontFace(fontFamily, {
        generic: fallbackOptions?.generic,
        fallbacks: fallbackOptions?.fallbacks || []
      }) || {}

      if (!result.fonts) return

      const fallbackMap = result.fallbacks?.map(f => ({ font: f, name: `${fontFamily} Fallback: ${f}` })) || []
      let insertFontFamilies = false

      for (const font of result.fonts) {
        const fallbackDeclarations = await generateFontFallbacks(fontFamily, font, fallbackMap)
        const declarations = [generateFontFace(fontFamily, font), ...fallbackDeclarations]

        for (let declaration of declarations) {
          if (!injectedDeclarations.has(declaration)) {
            injectedDeclarations.add(declaration)
            if (!options.dev) {
              declaration = await transform(declaration, {
                loader: 'css',
                charset: 'utf8',
                minify: true,
                ...postcssOptions
              }).then(r => r.code || declaration).catch(() => declaration)
            } else {
              declaration += '\n'
            }
            s.prepend(declaration)
          }
        }

        // Add font family names for generated fallbacks
        if (fallbackDeclarations.length) { insertFontFamilies = true }
      }

      if (fallbackOptions && insertFontFamilies) {
        const insertedFamilies = fallbackMap.map(f => `"${f.name}"`).join(', ')
        s.prependLeft(fallbackOptions.index, `, ${insertedFamilies}`)
      }
    }

    const ast = parse(code, { positions: true })

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

        // Only add @font-face for the first font-family in the list and treat the rest as fallbacks
        const [fontFamily, ...fallbacks] = extractFontFamilies(node)
        if (fontFamily && !existingFontFamilies.has(fontFamily)) {
          promises.push(addFontFaceDeclaration(fontFamily, node.value.type !== 'Raw' ? {
            fallbacks,
            generic: extractGeneric(node),
            index: extractEndOfFirstChild(node)!,
          } : undefined))
        }
      }
    })

    await Promise.all(promises)

    return s
  }

  return {
    name: 'nuxt:fonts:font-family-injection',
    transformInclude (id) {
      return isCSS(id) && !SKIP_RE.test(id)
    },
    async transform (code) {
      // Early return if no font-family is used in this CSS
      if (!code.includes('font-family:')) { return }

      const s = await transformCSS(code)

      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: s.generateMap({ hires: true })
        }
      }
    },
    vite: {
      configResolved (config) {
        if (!config.esbuild || postcssOptions) { return }

        postcssOptions = {
          target: config.esbuild.target,
          ...resolveMinifyCssEsbuildOptions(config.esbuild)
        }
      },
      async generateBundle (_outputOptions, bundle) {
        for (const key in bundle) {
          const chunk = bundle[key]!
          if (chunk?.type === 'asset' && isCSS(chunk.fileName)) {
            const s = await transformCSS(chunk.source.toString())
            if (s.hasChanged()) {
              chunk.source = s.toString()
            }
          }
        }
      }
    }
  }
})

// Copied from vue-bundle-renderer utils
const IS_CSS_RE = /\.(?:css|scss|sass|postcss|pcss|less|stylus|styl)(\?[^.]+)?$/

function isCSS (id: string) {
  return IS_CSS_RE.test(id)
}


// Inlined from https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/css.ts#L1824-L1849
function resolveMinifyCssEsbuildOptions (options: ESBuildOptions): TransformOptions {
  const base: TransformOptions = {
    charset: options.charset ?? 'utf8',
    logLevel: options.logLevel,
    logLimit: options.logLimit,
    logOverride: options.logOverride,
    legalComments: options.legalComments,
  }

  if (options.minifyIdentifiers != null || options.minifySyntax != null || options.minifyWhitespace != null) {
    return {
      ...base,
      minifyIdentifiers: options.minifyIdentifiers ?? true,
      minifySyntax: options.minifySyntax ?? true,
      minifyWhitespace: options.minifyWhitespace ?? true,
    }
  }

  return { ...base, minify: true }
}
