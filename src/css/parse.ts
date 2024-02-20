import { findAll, parse, type Declaration } from 'css-tree'

import type { LocalFontSource, NormalizedFontFaceData, RemoteFontSource } from '../types'

export function extractFontFaceData (css: string): NormalizedFontFaceData[] {
  const fontFaces: NormalizedFontFaceData[] = []

  for (const node of findAll(parse(css), node => node.type === 'Atrule' && node.name === 'font-face')) {
    if (node.type !== 'Atrule' || node.name !== 'font-face') { continue }

    const data: Partial<NormalizedFontFaceData> = {}
    const keyMap: Record<string, keyof NormalizedFontFaceData> = {
      src: 'src',
      'font-display': 'display',
      'font-weight': 'weight',
      'font-style': 'style',
      'font-feature-settings': 'featureSettings',
      'font-variations-settings': 'variationSettings',
      'unicode-range': 'unicodeRange',
    }
    for (const child of node.block?.children || []) {
      if (child.type !== 'Declaration') { continue }
      if (child.property in keyMap) {
        data[keyMap[child.property]!] = extractCSSValue(child) as any
      }
    }
    fontFaces.push(data as NormalizedFontFaceData)
  }

  return fontFaces
}

function extractCSSValue (node: Declaration) {
  if (node.value.type == 'Raw') {
    return [node.value.value]
  }

  const values = [] as Array<string | number | RemoteFontSource | LocalFontSource>
  for (const child of node.value.children) {
    if (child.type === 'Function') {
      if (child.name === 'local' && child.children.first?.type === 'String') {
        values.push({ name: child.children.first.value })
      }
      if (child.name === 'format' && child.children.first?.type === 'String') {
        (values.at(-1) as RemoteFontSource).format = child.children.first.value
      }
      if (child.name === 'tech' && child.children.first?.type === 'String') {
        (values.at(-1) as RemoteFontSource).tech = child.children.first.value
      }
    }
    if (child.type === 'Url') {
      values.push({ url: child.value })
    }
    if (child.type === 'Identifier') {
      values.push(child.name)
    }
    if (child.type === 'String') {
      values.push(child.value)
    }
    if (child.type === 'UnicodeRange') {
      values.push(child.value)
    }
    if (child.type === 'Number') {
      values.push(Number(child.value))
    }
  }

  if (values.length === 1) {
    return values[0]
  }

  return values
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

export function extractFontFamilies (node: Declaration) {
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
