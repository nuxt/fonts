// @ts-expect-error virtual file provided by `@nuxt/fonts`
import { css } from '#nuxt-fonts-inline'

import { defineNitroPlugin } from 'nitropack/runtime'

const STYLE_RE = /<style[^>]*>([\s\S]*?)<\/style>/g
const FONT_FACE_RE = /@font-face\s*\{[^}]*\}/g

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:html', (html) => {
    if (css) {
      html.head.push(`<style>${css}</style>`)
    }

    const seen = new Set<string>()
    for (let i = 0; i < html.head.length; i++) {
      html.head[i] = html.head[i]!.replace(STYLE_RE, style => style.replace(FONT_FACE_RE, (rule) => {
        if (seen.has(rule)) {
          return ''
        }
        seen.add(rule)
        return rule
      }))
    }
  })
})
