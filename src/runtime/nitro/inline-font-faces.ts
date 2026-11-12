// @ts-expect-error virtual file provided by `@nuxt/fonts`
import { css, resolveURLs } from '#nuxt-fonts-inline'

import { joinURL } from 'ufo'

const STYLE_RE = /<style[^>]*>([\s\S]*?)<\/style>/g
const FONT_FACE_RE = /@font-face\s*\{[^}]*\}/g
const ROOT_RELATIVE_URL_RE = /url\((['"]?)(\/(?!\/)[^'")]*)\1\)/g

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

const resolvedCSS = new Map<string, string>()

/**
 * The CDN URL can be set at runtime, so the URLs in the hoisted font faces are kept
 * root-relative at build time and resolved here, as Nuxt does for its own styles.
 */
function resolveCSS(base: string): string {
  if (!resolveURLs) {
    return css
  }
  let resolved = resolvedCSS.get(base)
  if (resolved === undefined) {
    resolved = (css as string).replace(ROOT_RELATIVE_URL_RE, (_, quote: string, url: string) => `url(${quote}${joinURL(base, url)}${quote})`)
    resolvedCSS.set(base, resolved)
  }
  return resolved
}

export function hoistFontFaces(html: { head: string[] }, base: string) {
  if (css) {
    html.head.push(`<style>${resolveCSS(base)}</style>`)
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
}
