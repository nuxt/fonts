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
          include: [IS_CSS_RE],
          exclude: [SKIP_RE],
        },
      },
      async handler(code, id) {
        // Early return if no font-family is used in this CSS
        if (!options.processCSSVariables && !code.includes('font-family:')) {
          return
        }

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

function isCSS(id: string) {
  return IS_CSS_RE.test(id)
}
