// @ts-expect-error virtual file provided by `@nuxt/fonts`
import { preloads } from '#nuxt-fonts-preload'

import { joinURL } from 'ufo'
import { getRouteRules, useRuntimeConfig } from 'nitropack/runtime'
import type { NitroApp } from 'nitropack'

interface RouteRulesWithFonts {
  fonts?: {
    preload?: Record<string, unknown>
  }
}

export default (nitro: NitroApp) => {
  nitro.hooks.hook('render:html', (html, { event }) => {
    const { fonts } = getRouteRules(event) as RouteRulesWithFonts
    const families = Object.keys(fonts?.preload || {})
    if (families.length === 0) {
      return
    }

    const { app } = useRuntimeConfig(event)
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
