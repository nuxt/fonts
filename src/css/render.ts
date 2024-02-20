import { hasProtocol } from 'ufo'
import type { FontFaceData, FontSource } from '../types'
import { extname } from 'pathe'

export function generateFontFaces (family: string, source: FontFaceData | FontFaceData[]) {
  const sources = Array.isArray(source) ? source : [source]
  const declarations: string[] = []
  for (const font of sources) {
    const src = Array.isArray(font.src) ? font.src : [font.src]
    const sources = src.map(s => typeof s === 'string' ? parseFont(s) : s)

    declarations.push([
      '@font-face {',
      `  font-family: '${family}';`,
      `  src: ${renderFontSrc(sources)};`,
      `  font-display: ${font.display || 'swap'};`,
      font.unicodeRange && `  unicode-range: ${font.unicodeRange};`,
      font.weight && `  font-weight: ${font.weight};`,
      font.style && `  font-style: ${font.style};`,
      font.featureSettings && `  font-feature-settings: ${font.featureSettings};`,
      font.variationSettings && `  font-variation-settings: ${font.variationSettings};`,
      `}`
    ].filter(Boolean).join('\n'))
  }

  return declarations
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
