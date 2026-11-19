import { useRuntimeConfig, useServerHooks } from 'nuxt/server'

import { hoistFontFaces } from './inline-font-faces.js'

export default () => {
  useServerHooks().hook('render:html', (html) => {
    const { app } = useRuntimeConfig()
    hoistFontFaces(html, app.cdnURL || app.baseURL)
  })
}
