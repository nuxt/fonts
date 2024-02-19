import { createUnplugin } from 'unplugin'
import { parse, walk, type Declaration } from 'css-tree'
import MagicString from 'magic-string'
import { extname } from 'pathe'
import { hasProtocol } from 'ufo'

import type { FontFaceData, FontSource } from './types'

interface FontFamilyInjectionPluginOptions {
  dev: boolean
  resolveFontFace: (fontFamily: string) => FontFaceData | FontFaceData[] | undefined
}

export const FontFamilyInjectionPlugin = (options: FontFamilyInjectionPluginOptions) => createUnplugin(() => {
  return {
    name: 'nuxt:fonts:font-family-injection',
    transformInclude (id) {
      return isCSS(id)
    },
    transform (code) {
      // Early return if no font-family is used in this CSS
      if (!code.includes('font-family:')) { return }

      const s = new MagicString(code)
      const processedFontFamilies = new Set<string>()
      const injectedDeclarations = new Set<string>()

      // TODO: handle these edge cases
      // 1. existing font-family in this scope
      // 2. handle CSS custom property
      walk(parse(code), node => {
        if (node.type === 'Declaration' && node.property === 'font-family') {
          for (const fontFamily of extractFontFamilies(node)) {
            if (processedFontFamilies.has(fontFamily)) continue
            processedFontFamilies.add(fontFamily)

            const result = options.resolveFontFace(fontFamily)
            if (!result) continue

            for (const declaration of generateFontFaces(fontFamily, result)) {
              if (!injectedDeclarations.has(declaration)) {
                injectedDeclarations.add(declaration)
                s.prepend(declaration)
              }
            }
          }
        }
      })

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

// https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
const genericCSSFamilies = new Set([
  /* A generic family name only */
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'emoji',
  'math',
  'fangsong',

  /* Global values */
  'inherit',
  'initial',
  'revert',
  'revert-layer',
  'unset',
])

function* generateFontFaces (family: string, source: FontFaceData | FontFaceData[]) {
  const sources = Array.isArray(source) ? source : [source]
  for (const font of sources) {
    const src = Array.isArray(font.src) ? font.src : [font.src]
    const sources = src.map(s => typeof s === 'string' ? parseFont(s) : s)

    yield [
      '@font-face {',
      `  font-family: '${family}';`,
      `  src: ${renderFontSrc(sources)};`,
      `  unicode-range: ${font.unicodeRange};`,
      `  font-display: ${font.display || 'swap'};`,
      font.weight && `  font-weight: ${font.weight};`,
      font.style && `  font-style: ${font.style};`,
      font.featureSettings && `  font-feature-settings: ${font.featureSettings};`,
      font.variationSettings && `  font-variation-settings: ${font.variationSettings};`,
      `}`
    ].filter(Boolean).join('\n')
  }
}

const formatMap: Record<string, string> = {
  otf: 'opentype',
  woff: 'woff',
  woff2: 'woff2',
  ttf: 'truetype',
  eot: 'embedded-opentype',
  svg: 'svg',
}

function parseFont (font: string) {
  // render as `url("url/to/font") format("woff2")`
  if (font.startsWith('/') || hasProtocol(font)) {
    const extension = extname(font).slice(1)
    const format = formatMap[extension]

    return {
      url: font,
      format
    }
  }

  // render as `local("Font Name")`
  return { name: font }
}

function renderFontSrc (sources: Exclude<FontSource, string>[]) {
  return sources.map(src => {
    if ('url' in src) {
      let rendered = `url("${src.url}")`
      for (const key of ['format', 'tech'] as const) {
        if (key in src) {
          rendered += ` ${key}(${src[key]})`
        }
      }
      return rendered
    }
    return `local("${src.name}")`
  }).join(', ')
}

function extractFontFamilies (node: Declaration) {
  if (node.value.type == 'Raw') {
    return [node.value.value]
  }

  const families = [] as string[]
  for (const child of node.value.children) {
    if (child.type === 'Identifier' && !genericCSSFamilies.has(child.name)) {
      families.push(child.name)
    }
    if (child.type === 'String') {
      families.push(child.value)
    }
  }

  return families
}
