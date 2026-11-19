import { useRuntimeConfig } from 'nitropack/runtime'
import type { NitroApp } from 'nitropack'

import { hoistFontFaces } from './inline-font-faces.js'

export default (nitro: NitroApp) => {
  nitro.hooks.hook('render:html', (html, { event }) => {
    const { app } = useRuntimeConfig(event)
    hoistFontFaces(html, app.cdnURL || app.baseURL)
  })
}
