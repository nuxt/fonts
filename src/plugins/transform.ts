import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'

import { resolveMinifyCssEsbuildOptions, transformCSS } from 'fontless'
import type { FontFamilyInjectionPluginOptions } from 'fontless'

const SKIP_RE = /\/node_modules\/vite-plugin-vue-inspector\//

/**
 * Process CSS variables containing font stacks to insert generated fallback fonts.
 * This handles Tailwind 4's @theme variables like: --font-body: 'Noto Serif SC', Georgia, serif;
 */
async function processCSSVariableFallbacks(
  code: string,
  options: FontFamilyInjectionPluginOptions,
): Promise<MagicString | null> {
  if (!options.processCSSVariables) {
    return null
  }

  // Match CSS variables with font families (with or without fallbacks)
  // Handles both quoted and unquoted fonts:
  //   --font-body: 'Noto Serif SC', 'Times New Roman', serif;
  //   --font-display: Arial, sans-serif, system-ui;
  const cssVarRegex = /(--[\w-]+)\s*:\s*(?:(['"])((?:(?!\2).)+)\2|([A-Z]+(?:\s+[A-Z]+)*))(?:\s*,([^;]+))?;/gi

  const s = new MagicString(code)
  let hasChanges = false
  const processedFonts = new Set<string>()

  for (const match of code.matchAll(cssVarRegex)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [fullMatch, varName, quote, quotedFont, unquotedFont, fallbacks] = match
    const matchIndex = match.index!
    const fontFamily = quotedFont || unquotedFont
    const isQuoted = !!quotedFont

    // Skip if no font family was matched
    if (!fontFamily) {
      continue
    }

    // Skip if we've already processed this font
    if (processedFonts.has(fontFamily)) {
      continue
    }

    // Parse fallbacks if they exist
    const fallbackList = fallbacks
      ? fallbacks.split(',').map(f => f.trim().replace(/^['"]|['"]$/g, ''))
      : []

    // Resolve the font face for the primary font family
    const result = await options.resolveFontFace(fontFamily, {
      fallbacks: fallbackList,
    })

    if (result?.fonts && result.fonts.length > 0 && result.fallbacks) {
      // Generate fallback font family names
      const generatedFallbacks = result.fallbacks.map(
        fallback => `"${fontFamily} Fallback: ${fallback}"`,
      )

      // Find the position after the first font family
      // For quoted fonts: after the closing quote
      // For unquoted fonts: after the font name
      const fontStartInMatch = fullMatch.indexOf(fontFamily)
      const fontEndOffset = isQuoted ? fontStartInMatch + fontFamily.length + 1 : fontStartInMatch + fontFamily.length
      const afterFirstFont = matchIndex + fontEndOffset

      // Insert the generated fallbacks after the primary font
      s.prependLeft(afterFirstFont, `, ${generatedFallbacks.join(', ')}`)

      hasChanges = true
      processedFonts.add(fontFamily)
    }
  }

  return hasChanges ? s : null
}

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
        code: {
          // Early return if no font-family is used in this CSS
          exclude: !options.processCSSVariables ? [/^(?!.*font-family\s*:).*$/s] : undefined,
        },
      },
      async handler(code, id) {
        // First, try to process CSS variable fallbacks for Tailwind 4 @theme support
        const cssVarResult = await processCSSVariableFallbacks(code, options)
        if (cssVarResult) {
          code = cssVarResult.toString()
        }

        const s = await transformCSS(options, code, id)

        if (s.hasChanged() || cssVarResult) {
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
              let code = chunk.source.toString()

              // Process CSS variable fallbacks first
              const cssVarResult = await processCSSVariableFallbacks(code, options)
              if (cssVarResult) {
                code = cssVarResult.toString()
              }

              const s = await transformCSS(options, code, key, { relative: true })
              if (s.hasChanged() || cssVarResult) {
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
