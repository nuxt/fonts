// @ts-expect-error virtual file provided by `@nuxt/fonts`
import { css } from '#nuxt-fonts-inline'

import type { NitroApp } from 'nitropack'

const STYLE_RE = /<style[^>]*>([\s\S]*?)<\/style>/g
const FONT_FACE_RE = /@font-face\s*\{[^}]*\}/g

/**
 * A rule nested in an at-rule (`@media`, `@supports`) only applies in that context, so it
 * is not interchangeable with an identical rule at the top level.
 *
 * Returns a check for one stylesheet that keeps a running brace depth. It must be asked
 * about increasing indices, as `String.prototype.replace` reports its matches, so the
 * stylesheet is scanned once rather than from its start for every `@font-face` rule.
 */
function createTopLevelCheck(style: string) {
  let depth = 0
  let scanned = 0
  return (index: number) => {
    for (; scanned < index; scanned++) {
      if (style[scanned] === '{') {
        depth++
      }
      else if (style[scanned] === '}') {
        depth--
      }
    }
    return depth === 0
  }
}

export default (nitro: NitroApp) => {
  nitro.hooks.hook('render:html', (html) => {
    if (css) {
      html.head.push(`<style>${css}</style>`)
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
  })
}
