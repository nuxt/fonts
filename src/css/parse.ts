import { findAll, parse, type Declaration } from 'css-tree'

import type { LocalFontSource, NormalizedFontFaceData, RemoteFontSource } from '../types'
import { formatPriorityList } from '../css/render'

const extractableKeyMap: Record<string, keyof NormalizedFontFaceData> = {
  src: 'src',
  'font-display': 'display',
  'font-weight': 'weight',
  'font-style': 'style',
  'font-feature-settings': 'featureSettings',
  'font-variations-settings': 'variationSettings',
  'unicode-range': 'unicodeRange',
}

const weightMap: Record<string, string> = {
  '100': 'Thin',
  '200': 'ExtraLight',
  '300': 'Light',
  '400': 'Regular',
  '500': 'Medium',
  '600': 'SemiBold',
  '700': 'Bold',
  '800': 'ExtraBold',
  '900': 'Black',
}

const styleMap: Record<string, string> = {
  'italic': 'Italic',
  'oblique': 'Oblique',
  'normal': '',
}

export function extractFontFaceData (css: string, family?: string): NormalizedFontFaceData[] {
  const fontFaces: NormalizedFontFaceData[] = []

  for (const node of findAll(parse(css), node => node.type === 'Atrule' && node.name === 'font-face')) {
    if (node.type !== 'Atrule' || node.name !== 'font-face') { continue }

    const data: Partial<NormalizedFontFaceData> = {}
    for (const child of node.block?.children || []) {
      if (child.type !== 'Declaration') { continue }
      if (family && child.property === 'font-family') {
        const value = extractCSSValue(child) as string | string[]
        const slug = family.toLowerCase()
        if (typeof value === 'string' && value.toLowerCase() !== slug) {
          return []
        }
        if (Array.isArray(value) && value.length > 0 && value.every(v => v.toLowerCase() !== slug)) {
          return []
        }
      }
      if (child.property in extractableKeyMap) {
        const value = extractCSSValue(child) as any
        data[extractableKeyMap[child.property]!] = child.property === 'src' && !Array.isArray(value) ? [value] : value
      }
    }
    fontFaces.push(data as NormalizedFontFaceData)
  }

  return mergeFontSources(fontFaces)
}

function processRawValue (value: string) {
  return value.split(',').map(v => v.trim().replace(/^(?<quote>['"])(.*)\k<quote>$/, '$2'))
}

function extractCSSValue (node: Declaration) {
  if (node.value.type == 'Raw') {
    return processRawValue(node.value.value)
  }

  const values = [] as Array<string | number | RemoteFontSource | LocalFontSource>
  let buffer = ''
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
      buffer = buffer ? `${buffer} ${child.name}` : child.name
    }
    if (child.type === 'String') {
      values.push(child.value)
    }
    if (child.type === 'Operator' && child.value === ',' && buffer) {
      values.push(buffer)
      buffer = ''
    }
    if (child.type === 'UnicodeRange') {
      values.push(child.value)
    }
    if (child.type === 'Number') {
      values.push(Number(child.value))
    }
  }

  if (buffer) {
    values.push(buffer)
  }

  if (values.length === 1) {
    return values[0]
  }

  return values
}


// https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
/* A generic family name only */
const _genericCSSFamilies = [
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
] as const
export type GenericCSSFamily = typeof _genericCSSFamilies[number]
const genericCSSFamilies = new Set(_genericCSSFamilies)

/* Global values */
const globalCSSValues = new Set([
  'inherit',
  'initial',
  'revert',
  'revert-layer',
  'unset',
])

export function extractGeneric (node: Declaration) {
  if (node.value.type == 'Raw') { return }

  for (const child of node.value.children) {
    if (child.type === 'Identifier' && genericCSSFamilies.has(child.name as GenericCSSFamily)) {
      return child.name as GenericCSSFamily
    }
  }
}

export function extractEndOfFirstChild (node: Declaration) {
  if (node.value.type == 'Raw') { return }
  for (const child of node.value.children) {
    if (child.type === 'String') {
      return child.loc!.end.offset!
    }
    if (child.type === 'Operator' && child.value === ',') {
      return child.loc!.start.offset!
    }
  }
  return node.value.children.last!.loc!.end.offset!
}

export function extractFontFamilies (node: Declaration) {
  if (node.value.type == 'Raw') {
    return processRawValue(node.value.value)
  }

  const families = [] as string[]
  // Use buffer strategy to handle unquoted 'minified' font-family names
  let buffer = ''
  for (const child of node.value.children) {
    if (child.type === 'Identifier' && !genericCSSFamilies.has(child.name as GenericCSSFamily) && !globalCSSValues.has(child.name)) {
      buffer = buffer ? `${buffer} ${child.name}` : child.name
    }
    if (buffer && child.type === 'Operator' && child.value === ',') {
      families.push(buffer)
      buffer = ''
    }
    if (child.type === 'String') {
      families.push(child.value)
    }
  }

  if (buffer) {
    families.push(buffer)
  }

  return families
}

function mergeFontSources (data: NormalizedFontFaceData[]) {
  const mergedData: NormalizedFontFaceData[] = []
  for (const face of data) {
    const keys = Object.keys(face).filter(k => k !== 'src') as Array<keyof typeof face>
    const existing = mergedData.find(f => (Object.keys(f).length === keys.length + 1) && keys.every((key) => f[key]?.toString() === face[key]?.toString()))
    if (existing) {
      existing.src.push(...face.src)
    } else {
      mergedData.push(face)
    }
  }

  // Sort font sources by priority
  for (const face of mergedData) {
    face.src.sort((a, b) => {
      // Prioritise local fonts (with 'name' property) over remote fonts, and then formats by formatPriorityList
      const aIndex = 'format' in a ? formatPriorityList.indexOf(a.format || 'woff2') : -2
      const bIndex = 'format' in b ? formatPriorityList.indexOf(b.format || 'woff2') : -2
      return aIndex - bIndex
    })
  }

  return mergedData
}

export function addLocalFallbacks (fontFamily: string, data: NormalizedFontFaceData[]) {
  for (const face of data) {

    if (face.src[0] && !('name' in face.src[0])) {
      const style = (face.style ? styleMap[face.style] : '') ?? ''

      const weights = (Array.isArray(face.weight) ? face.weight : [face.weight])
        .map(weight => weightMap[weight])
        .filter(Boolean);

      for (const weight of weights) {
        face.src.unshift({ name: ([fontFamily, weight, style].join(' ')).trim() })
      }
    }
  }
  return data
}
