import { existsSync } from 'node:fs'
import type { Nuxt } from 'nuxt/schema'
import { createResolver } from '@nuxt/kit'
import type { ModuleOptions } from './module'

import { DEVTOOLS_UI_PATH, DEVTOOLS_UI_PORT } from './constants'

export function setupDevToolsUI(options: ModuleOptions, nuxt: Nuxt) {
  const resolver = createResolver(import.meta.url)

  const clientPath = resolver.resolve('./client')
  const isProductionBuild = existsSync(clientPath)

  if (isProductionBuild) {
    nuxt.hook('vite:serverCreated', async (server) => {
      const sirv = await import('sirv').then(r => r.default || r)
      server.middlewares.use(
        DEVTOOLS_UI_PATH,
        sirv(clientPath, { dev: true, single: true }),
      )
    })
  } else {
    nuxt.hook('vite:extendConfig', (config) => {
      config.server = config.server || {}
      config.server.proxy = config.server.proxy || {}
      config.server.proxy[DEVTOOLS_UI_PATH] = {
        target: `http://localhost:${DEVTOOLS_UI_PORT}${DEVTOOLS_UI_PATH}`,
        changeOrigin: true,
        followRedirects: true,
        rewrite: path => path.replace(DEVTOOLS_UI_PATH, ''),
      }
    })
  }

  nuxt.hook('devtools:customTabs', (tabs) => {
    tabs.push({
      name: 'fonts',
      title: 'Fonts',
      icon: 'carbon:text-font',
      view: {
        type: 'iframe',
        src: DEVTOOLS_UI_PATH,
      },
    })
  })
}
