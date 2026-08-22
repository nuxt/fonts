// @ts-expect-error virtual file provided by `@nuxt/fonts`
import { css } from '#nuxt-fonts-inline'

import { defineNitroPlugin } from 'nitropack/runtime'

export default defineNitroPlugin((nitro) => {
  if (!css) return

  nitro.hooks.hook('render:html', (html) => {
    html.head.push(`<style>${css}</style>`)
  })
})
