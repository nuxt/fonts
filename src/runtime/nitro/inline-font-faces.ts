// @ts-expect-error virtual file provided by `@nuxt/fonts`
import { css } from '#nuxt-fonts-inline'

import type { NitroApp } from 'nitropack'

const STYLE_RE = /<style[^>]*>([\s\S]*?)<\/style>/g
const FONT_FACE_RE = /@font-face\s*\{[^}]*\}/g

/**
 * A rule nested in an at-rule (`@media`, `@supports`) only applies in that context, so it
 * is not interchangeable with an identical rule at the top level.
 */
function isTopLevel(style: string, index: number) {
  let depth = 0
  for (let i = 0; i < index; i++) {
    if (style[i] === '{') {
      depth++
    }
    else if (style[i] === '}') {
      depth--
    }
  }
  return depth === 0
}

export default (nitro: NitroApp) => {
  nitro.hooks.hook('render:html', (html) => {
    if (css) {
      html.head.push(`<style>${css}</style>`)
    }

    const seen = new Set<string>()
    for (let i = 0; i < html.head.length; i++) {
      html.head[i] = html.head[i]!.replace(STYLE_RE, style => style.replace(FONT_FACE_RE, (rule, index: number) => {
        if (!isTopLevel(style, index)) {
          return rule
        }
        if (seen.has(rule)) {
          return ''
        }
        seen.add(rule)
        return rule
      }))
    }
  })
}
