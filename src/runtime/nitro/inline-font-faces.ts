// @ts-expect-error virtual file provided by `@nuxt/fonts`
import { applyRuntimeBase, css } from '#nuxt-fonts-inline'

import { joinURL } from 'ufo'

import { ROOT_RELATIVE_URL_RE } from '../shared/urls.js'

const STYLE_RE = /<style[^>]*>([\s\S]*?)<\/style>/g
const FONT_FACE_RE = /@font-face\s*\{[^}]*\}/g

/**
 * A rule nested in an at-rule (`@media`, `@supports`) only applies in that context, so it
 * is not interchangeable with an identical rule at the top level.
 *
 * The returned check is stateful: call it with increasing indices, such as the match
 * indices from `String.prototype.replace`.
 */
function createTopLevelCheck(style: string) {
  const tokens = /[{}]|\\[\s\S]|\/\*[\s\S]*?(?:\*\/|$)|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|(?<![\w-])url\(\s*(?![\s"'])(?:\\[\s\S]|[^\\)])*(?:\)|$)/gi
  let depth = 0
  let next = tokens.exec(style)
  return (index: number) => {
    while (next && next.index < index) {
      if (tokens.lastIndex > index) {
        return false
      }
      if (next[0] === '{') {
        depth++
      }
      else if (next[0] === '}') {
        depth--
      }
      next = tokens.exec(style)
    }
    return depth === 0
  }
}

let cachedBase: string | undefined
let cachedCSS = ''

function resolveCSS(base: string): string {
  if (!applyRuntimeBase) {
    return css
  }
  if (base !== cachedBase) {
    cachedCSS = (css as string).replace(ROOT_RELATIVE_URL_RE, (_, quote: string, url: string) => `url(${quote}${joinURL(base, url)}${quote})`)
    cachedBase = base
  }
  return cachedCSS
}

export function hoistFontFaces(html: { head: string[] }, base: string) {
  if (css) {
    html.head.push(`<style>${resolveCSS(base)}</style>`)
  }

  const seen = new Set<string>()
  for (let i = 0; i < html.head.length; i++) {
    html.head[i] = html.head[i]!.replace(STYLE_RE, (style) => {
      const isTopLevel = createTopLevelCheck(style)
      return style.replace(FONT_FACE_RE, (rule, index: number) => {
        if (!isTopLevel(index)) {
          return rule
        }
        if (seen.has(rule)) {
          return ''
        }
        seen.add(rule)
        return rule
      })
    })
  }
}
