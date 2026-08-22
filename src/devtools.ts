import { existsSync } from 'node:fs'
import { createResolver, extendViteConfig, useNuxt } from '@nuxt/kit'
import { addCustomTab, extendServerRpc, onDevToolsInitialized } from '@nuxt/devtools-kit'
import type { Nuxt } from '@nuxt/schema'
import type { BirpcGroup } from 'birpc'
import { joinURL } from 'ufo'
import type { FontFaceData } from 'unifont'

import { generateFontFace } from 'fontless'
import type { ManualFontDetails, ProviderFontDetails } from 'fontless'
import { DEVTOOLS_RPC_NAMESPACE, DEVTOOLS_UI_PATH, DEVTOOLS_UI_PORT } from './constants'

export type { ManualFontDetails, ProviderFontDetails } from 'fontless'

interface DevtoolsRpcHost {
  register: (fn: unknown, force?: boolean) => void
  broadcast: (options: { method: string, args: unknown[], event?: boolean }) => void
}

interface DevtoolsReadyContext {
  rpc: DevtoolsRpcHost
  docks: { register: (entry: Record<string, unknown>) => void }
}

/**
 * `devtools:ready` carries the Vite DevTools context and is only ever called by
 * `@nuxt/devtools` v4+, so on v3 the callback simply never runs. The hook is used
 * directly rather than through `onDevtoolsReady` because that helper is not part
 * of the `@nuxt/devtools-kit` v3 range this module depends on.
 */
function onDevtoolsReady(nuxt: Nuxt, fn: (ctx: DevtoolsReadyContext) => void) {
  (nuxt.hook as (name: string, fn: (ctx: DevtoolsReadyContext) => void) => void)('devtools:ready', fn)
}

/** v4 exposes the Vite DevTools context on `nuxt.devtools`; on v3 only the legacy helpers exist. */
function supportsDevtoolsKit(nuxt: Nuxt) {
  const devtools = (nuxt as Nuxt & { devtools?: object }).devtools
  return !!devtools && 'devtoolsKit' in devtools
}

export function setupDevToolsUI() {
  const nuxt = useNuxt()
  const resolver = createResolver(import.meta.url)

  const clientPath = resolver.resolve('./client')
  const isProductionBuild = existsSync(clientPath)

  const uiPath = joinURL(nuxt.options.app?.baseURL || '/', DEVTOOLS_UI_PATH)

  if (isProductionBuild) {
    nuxt.hook('vite:serverCreated', async (server) => {
      const sirv = await import('sirv').then(r => r.default || r)
      const serve = sirv(clientPath, { dev: true, single: true })
      // the client is built with `DEVTOOLS_UI_PATH` as its base, so requests are
      // served both with and without the app's `baseURL` prefix
      server.middlewares.use(uiPath, serve)
      if (uiPath !== DEVTOOLS_UI_PATH) {
        server.middlewares.use(DEVTOOLS_UI_PATH, serve)
      }
    })
  }
  else {
    extendViteConfig((config) => {
      config.server = config.server || {}
      config.server.proxy = config.server.proxy || {}
      const proxy = {
        target: `http://localhost:${DEVTOOLS_UI_PORT}${DEVTOOLS_UI_PATH}`,
        changeOrigin: true,
        followRedirects: true,
        rewrite: (path: string) => path.replace(uiPath, '').replace(DEVTOOLS_UI_PATH, ''),
      }
      config.server.proxy[uiPath] = proxy
      if (uiPath !== DEVTOOLS_UI_PATH) {
        config.server.proxy[DEVTOOLS_UI_PATH] = proxy
      }
    })
  }

  onDevtoolsReady(nuxt, (ctx) => {
    ctx.docks.register({
      id: 'fonts',
      title: 'Fonts',
      icon: 'carbon:text-font',
      type: 'iframe',
      url: uiPath,
      groupId: 'nuxt',
    })
  })

  onDevToolsInitialized(() => {
    if (supportsDevtoolsKit(nuxt)) {
      return
    }

    addCustomTab({
      name: 'fonts',
      title: 'Fonts',
      icon: 'carbon:text-font',
      view: {
        type: 'iframe',
        src: uiPath,
      },
    })
  })
}

export function setupDevtoolsConnection(enabled: boolean) {
  if (!enabled) {
    return { exposeFont: () => {} }
  }

  const nuxt = useNuxt()

  setupDevToolsUI()

  const fonts: Array<ManualFontDetails | ProviderFontDetails> = []

  let host: DevtoolsRpcHost | undefined
  let rpc: BirpcGroup<ClientFunctions, ServerFunctions> | undefined

  function broadcast() {
    host?.broadcast({ method: `${DEVTOOLS_RPC_NAMESPACE}:exposeFonts`, args: [fonts], event: true })
    rpc?.broadcast.exposeFonts.asEvent(fonts)
  }

  onDevtoolsReady(nuxt, (ctx) => {
    host = ctx.rpc
    ctx.rpc.register({
      name: `${DEVTOOLS_RPC_NAMESPACE}:getFonts`,
      type: 'query',
      setup: () => ({ handler: () => fonts }),
    }, true)
    ctx.rpc.register({
      name: `${DEVTOOLS_RPC_NAMESPACE}:generateFontFace`,
      type: 'query',
      setup: () => ({ handler: (fontFamily: string, font: FontFaceData) => generateFontFace(fontFamily, font) }),
    }, true)
    broadcast()
  })

  onDevToolsInitialized(() => {
    if (supportsDevtoolsKit(nuxt)) {
      return
    }

    rpc = extendServerRpc<ClientFunctions, ServerFunctions>(DEVTOOLS_RPC_NAMESPACE, {
      getFonts: () => fonts,
      generateFontFace,
    })

    broadcast()
  })

  return {
    exposeFont: (font: ManualFontDetails | ProviderFontDetails) => {
      fonts.push(font)
      broadcast()
    },
  }
}

export interface ServerFunctions {
  getFonts: () => Array<ManualFontDetails | ProviderFontDetails>
  generateFontFace: (fontFamily: string, font: FontFaceData) => string
}

export interface ClientFunctions {
  exposeFonts: (fonts: Array<ManualFontDetails | ProviderFontDetails>) => void
}
