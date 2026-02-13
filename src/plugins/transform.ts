import { createUnplugin } from 'unplugin'

import { resolveMinifyCssEsbuildOptions, transformCSS } from 'fontless'
import type { FontFamilyInjectionPluginOptions } from 'fontless'

const SKIP_RE = /\/node_modules\/vite-plugin-vue-inspector\//

// TODO: support shared chunks of CSS
export const FontFamilyInjectionPlugin = (options: FontFamilyInjectionPluginOptions) => createUnplugin(() => {
  return {
    name: 'nuxt:fonts:font-family-injection',
    transform: {
      filter: {
        id: {
          include: [IS_CSS_RE, CSS_LANG_QUERY_RE, INLINE_STYLE_ID_RE],
          exclude: [SKIP_RE],
        },
        code: {
          // Early return if no font-family is used in this CSS
          exclude: !options.processCSSVariables ? [/^(?!.*font-family\s*:).*$/s] : undefined,
        },
      },
      async handler(code, id) {
        const s = await transformCSS(options, code, id)

        if (s.hasChanged()) {
          return {
            code: s.toString(),
            map: s.generateMap({ hires: true }),
          }
        }
      },
    },
    vite: {
      configResolved(config) {
        if (options.dev || !config.esbuild || options.esbuildOptions) {
          return
        }

        options.esbuildOptions = resolveMinifyCssEsbuildOptions(config.esbuild)
      },
      renderChunk(code, chunk) {
        if (chunk.facadeModuleId) {
          for (const file of chunk.moduleIds) {
            if (options.fontsToPreload.has(file)) {
              options.fontsToPreload.set(chunk.facadeModuleId, options.fontsToPreload.get(file)!)
              if (chunk.facadeModuleId !== file) {
                options.fontsToPreload.delete(file)
              }
            }
          }
        }
      },
      generateBundle: {
        enforce: 'post',
        async handler(_outputOptions, bundle) {
          for (const key in bundle) {
            const chunk = bundle[key]!
            if (chunk?.type === 'asset' && isCSS(chunk.fileName)) {
              const s = await transformCSS(options, chunk.source.toString(), key, { relative: true })
              if (s.hasChanged()) {
                chunk.source = s.toString()
              }
            }
          }
        },
      },
    },
  }
})

// Copied from vue-bundle-renderer utils
const IS_CSS_RE = /\.(?:css|scss|sass|postcss|pcss|less|stylus|styl)(?:\?[^.]+)?$/
// Matches Vue SFC style blocks with `lang.css` query (e.g. `?vue&type=style&lang.css`)
const CSS_LANG_QUERY_RE = /&lang\.css/
// Matches inline style IDs (e.g. `?index=0.css`)
const INLINE_STYLE_ID_RE = /[?&]index=\d+\.css$/

function isCSS(id: string) {
  return IS_CSS_RE.test(id)
}
