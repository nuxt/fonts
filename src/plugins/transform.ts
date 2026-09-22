import { createUnplugin } from 'unplugin'
import type { TransformResult, UnpluginBuildContext, UnpluginContext } from 'unplugin'
import { resolveModulePath } from 'exsolve'

import { transformCSS } from 'fontless'
import type { FontFamilyInjectionPluginOptions } from 'fontless'
import { assetEmitter } from '../assets'
import type { BuildAssetStrategy } from '../assets'
import { logger } from '../logger'

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
  /** How to emit fonts as Vite build assets, if the build supports it. */
  buildAssets?: BuildAssetStrategy
}

const PLUGIN_NAME = 'nuxt:fonts:font-family-injection'
const EMPTY_SOURCE = new Uint8Array()

// TODO: support shared chunks of CSS
export const FontFamilyInjectionPlugin = (options: FontFamilyInjectionPluginNuxtOptions) => createUnplugin(() => {
  async function handler(this: UnpluginBuildContext & UnpluginContext, code: string, id: string): Promise<TransformResult> {
    // The webpack and rspack loader context has no `emitFile`.
    const emit = options.buildAssets && typeof this.emitFile === 'function'
      ? (file: string) => {
          const fileName = options.buildAssets!.fileName(file)
          const placeholder = `__VITE_ASSET__${this.emitFile({ type: 'asset', fileName, source: EMPTY_SOURCE })}__`
          options.buildAssets!.placeholders.set(placeholder, fileName)
          return placeholder
        }
      : undefined

    const s = emit
      ? await assetEmitter.run(emit, () => transformCSS(options, code, id))
      : await transformCSS(options, code, id)

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
  }

  return {
    name: PLUGIN_NAME,
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
      handler,
    },
    webpack(compiler) {
      relocateTransformLoader(compiler, 'webpack', handler, options)
    },
    rspack(compiler) {
      relocateTransformLoader(compiler, 'rspack', handler, options)
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
            if (options.buildAssets?.emitted.has(chunk.fileName)) {
              // These assets exist only so Vite mints and rewrites their URLs; `assets.ts`
              // writes the real bytes, which empty placeholders would otherwise shadow.
              Reflect.deleteProperty(bundle, key)
              continue
            }
            if (chunk?.type === 'asset' && isCSS(chunk.fileName)) {
              const s = await transformCSS(options, chunk.source.toString(), key, { relative: !options.buildAssets })
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRule = Record<string, any>

interface WebpackLikeCompiler {
  options: { module: { rules: unknown[] } }
}

const CSS_LOADER_RE = /(?:^|[\\/])css-loader(?:[\\/]|$)/

/**
 * Move the CSS transform from the loader slot unplugin gives it to immediately before
 * `css-loader`, which is the last point in the chain where the stylesheet is still CSS
 * rather than a JavaScript module, and the first at which preprocessors have run.
 */
function relocateTransformLoader(
  compiler: WebpackLikeCompiler,
  framework: 'webpack' | 'rspack',
  handler: (this: UnpluginBuildContext & UnpluginContext, code: string, id: string) => Promise<TransformResult>,
  options: FontFamilyInjectionPluginNuxtOptions,
) {
  const rules = compiler.options.module.rules

  const registered = rules.findIndex((rule) => {
    const use = (rule as AnyRule)?.use
    return typeof use === 'function' && [use({ resource: 'a.css', resourceQuery: '' })].flat().some(entry => entry?.ident === PLUGIN_NAME)
  })
  if (registered !== -1) {
    rules.splice(registered, 1)
  }

  const entry = {
    loader: resolveModulePath(`unplugin/${framework}/loaders/transform`, { from: import.meta.url }),
    ident: PLUGIN_NAME,
    options: {
      plugin: {
        name: PLUGIN_NAME,
        transform(this: UnpluginBuildContext & UnpluginContext, code: string, id: string) {
          if (SKIP_RE.test(id) || (!options.processCSSVariables && !code.includes('font-family'))) {
            return
          }
          return handler.call(this, code, id)
        },
      },
    },
  }

  if (!insertBeforeCSSLoader(rules, entry)) {
    logger.warn(`Could not find \`css-loader\` in the ${framework} configuration, so no fonts will be injected into your styles.`)
  }
}

function insertBeforeCSSLoader(rules: unknown[], entry: AnyRule): boolean {
  let inserted = false
  for (const rule of rules as AnyRule[]) {
    if (!rule || typeof rule !== 'object') {
      continue
    }
    for (const key of ['oneOf', 'rules'] as const) {
      if (Array.isArray(rule[key])) {
        inserted = insertBeforeCSSLoader(rule[key], entry) || inserted
      }
    }
    if (!Array.isArray(rule.use)) {
      continue
    }
    const index = rule.use.findIndex((use: AnyRule | string) => CSS_LOADER_RE.test(typeof use === 'string' ? use : use?.loader || ''))
    if (index === -1) {
      continue
    }
    rule.use.splice(index + 1, 0, entry)
    inserted = true
  }
  return inserted
}

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
