
import { existsSync } from 'node:fs'
import { createResolver, useNuxt } from '@nuxt/kit'
import { addCustomTab, extendServerRpc, onDevToolsInitialized } from '@nuxt/devtools-kit'
import type { BirpcGroup } from 'birpc'

import { DEVTOOLS_RPC_NAMESPACE, DEVTOOLS_UI_PATH, DEVTOOLS_UI_PORT } from './constants'
import type { FontFaceData, NormalizedFontFaceData } from './types'

import { generateFontFace } from './css/render'

export function setupDevToolsUI () {
  const nuxt = useNuxt()
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

  addCustomTab({
    name: 'fonts',
    title: 'Fonts',
    icon: 'carbon:text-font',
    view: {
      type: 'iframe',
      src: DEVTOOLS_UI_PATH,
    },
  })
}

interface SharedFontDetails {
  fontFamily: string
  fonts: FontFaceData | FontFaceData[]
}

interface ManualFontDetails extends SharedFontDetails {
  type: 'manual'
}

interface ProviderFontDetails extends SharedFontDetails {
  type: 'override' | 'auto'
  provider: string
}

export function setupDevtoolsConnection () {
  let rpc: BirpcGroup<ClientFunctions, ServerFunctions>
  const fonts: Array<ManualFontDetails | ProviderFontDetails> = []

  onDevToolsInitialized(async () => {
    rpc = extendServerRpc<ClientFunctions, ServerFunctions>(DEVTOOLS_RPC_NAMESPACE, {
      getFonts () {
        return fonts
      },
      generateFontFace(fontFamily, font) {
        return generateFontFace(fontFamily, font)
      },
    })

    await rpc.broadcast.exposeFonts(fonts)
  })
  function exposeFonts (font: ManualFontDetails | ProviderFontDetails) {
    if (rpc) {
      rpc.broadcast.exposeFonts([font])
    }
    fonts.push(font)
  }
  return {
    exposeFont: exposeFonts
  }
}

export interface ServerFunctions {
  getFonts: () => Array<ManualFontDetails | ProviderFontDetails>
  generateFontFace: (fontFamily: string, font: NormalizedFontFaceData) => string
}

export interface ClientFunctions {
  exposeFonts: (fonts: Array<ManualFontDetails | ProviderFontDetails>) => void
}
