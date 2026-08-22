import { createUnplugin } from 'unplugin'

import { transformCSS } from 'fontless'
import type { FontFamilyInjectionPluginOptions } from 'fontless'

const SKIP_RE = /\/node_modules\/vite-plugin-vue-inspector\//
const FONT_FACE_RE = /@font-face\s*\{[^}]*\}/g
const FONT_FAMILY_RE = /font-family:\s*(['"]?)((?:[^'";\\}]|\\.)*)\1/

interface FontFamilyInjectionPluginNuxtOptions extends FontFamilyInjectionPluginOptions {
  /** Whether `@font-face` rules from global stylesheets are rendered in the document head. */
  hoistsFontFaces?: () => boolean
  /** Whether a module id is one of the app's global stylesheets (`nuxt.options.css`). */
  isGlobalStylesheet?: (id: string) => boolean
  /** The `@font-face` rules to render in the document head. */
  hoistedFontFaces?: Set<string>
}

// TODO: support shared chunks of CSS
export const FontFamilyInjectionPlugin = (options: FontFamilyInjectionPluginNuxtOptions) => createUnplugin(() => {
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
          if (options.hoistedFontFaces && options.hoistsFontFaces?.() && options.isGlobalStylesheet?.(id.replace(/\?.*$/, ''))) {
            // Rules authored in the stylesheet itself may use URLs relative to it, so only
            // the rules we injected are safe to render elsewhere in the document.
            const original = new Set(code.match(FONT_FACE_RE))
            for (const rule of s.toString().match(FONT_FACE_RE) || []) {
              if (!original.has(rule)) {
                options.hoistedFontFaces.add(rule)
              }
            }
          }
          return {
            code: s.toString(),
            map: s.generateMap({ hires: true }),
          }
        }
      },
    },
    vite: {
      configResolved(config) {
        if (options.dev) {
          return
        }

        if (config.css?.lightningcss) {
          options.lightningcssOptions = config.css.lightningcss
        }
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
          const hoistedFamilies = options.hoistsFontFaces?.() ? familiesOf(options.hoistedFontFaces) : new Set<string>()

          for (const key in bundle) {
            const chunk = bundle[key]!
            if (chunk?.type === 'asset' && isCSS(chunk.fileName)) {
              const s = await transformCSS(options, chunk.source.toString(), key, { relative: true })
              if (s.hasChanged()) {
                chunk.source = s.toString()
              }
              if (hoistedFamilies.size > 0) {
                chunk.source = stripFontFaces(chunk.source.toString(), hoistedFamilies)
              }
            }
          }
        },
      },
    },
  }
})

function familiesOf(fontFaces: Set<string> | undefined) {
  const families = new Set<string>()
  for (const rule of fontFaces || []) {
    const family = rule.match(FONT_FAMILY_RE)?.[2]
    if (family) {
      families.add(family)
    }
  }
  return families
}

function stripFontFaces(code: string, families: Set<string>) {
  return code.replace(FONT_FACE_RE, (rule) => {
    const family = rule.match(FONT_FAMILY_RE)?.[2]
    return family && families.has(family) ? '' : rule
  })
}

// Copied from vue-bundle-renderer utils
const IS_CSS_RE = /\.(?:css|scss|sass|postcss|pcss|less|stylus|styl)(?:\?[^.]+)?$/
// Matches Vue SFC style blocks with `lang.css` query (e.g. `?vue&type=style&lang.css`)
const CSS_LANG_QUERY_RE = /&lang\.css/
// Matches inline style IDs (e.g. `?index=0.css`)
const INLINE_STYLE_ID_RE = /[?&]index=\d+\.css$/

function isCSS(id: string) {
  return IS_CSS_RE.test(id)
}
