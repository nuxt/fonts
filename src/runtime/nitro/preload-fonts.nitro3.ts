// @ts-expect-error virtual file provided by `@nuxt/fonts`
import { preloads } from '#nuxt-fonts-preload'

import { joinURL } from 'ufo'
import { getRouteRules, useRuntimeConfig, useServerHooks } from 'nuxt/server'

interface RouteRulesWithFonts {
  fonts?: {
    preload?: Record<string, unknown>
  }
}

export default () => {
  useServerHooks().hook('render:html', (html, { event }) => {
    const { fonts } = getRouteRules(event) as RouteRulesWithFonts
    const families = Object.keys(fonts?.preload || {})
    if (families.length === 0) {
      return
    }

    const { app } = useRuntimeConfig()
    const base = app.cdnURL || app.baseURL

    for (const family of families) {
      for (const url of preloads[family] || []) {
        const href = `href="${joinURL(base, url)}"`
        if (!html.head.some(chunk => chunk.includes(href))) {
          html.head.push(`<link rel="preload" as="font" crossorigin ${href}>`)
        }
      }
    }
  })
}
