import type { Nuxt } from '@nuxt/schema'
import type { DevframeDefinition } from 'devframe'
import { joinURL } from 'ufo'

const DEVTOOLS_ID = 'nuxt-fonts'
const DEVTOOLS_TITLE = 'Fonts'
const DEVTOOLS_ICON = 'carbon:text-font'

interface DevtoolsReadyContext {
  install: (definition: DevframeDefinition, options?: { dock?: Record<string, unknown> }) => unknown
}

interface LegacyCustomTab {
  name: string
  title: string
  icon: string
  view: { type: 'iframe', src: string }
}

type Hook = <T extends unknown[]>(name: string, fn: (...args: T) => unknown) => void

/** Nuxt DevTools v4 exposes the Vite DevTools context on `nuxt.devtools`; v3 does not. */
function isViteDevtools(nuxt: Nuxt) {
  const devtools = (nuxt as Nuxt & { devtools?: object }).devtools
  return !!devtools && 'devtoolsKit' in devtools
}

export async function setupDevtools(nuxt: Nuxt) {
  const { createFontlessDevframe } = await import('fontless/devtools')
  const { definition, exposeFont, exposeUsage, exposeWarning } = createFontlessDevframe({
    id: DEVTOOLS_ID,
    name: DEVTOOLS_TITLE,
    icon: DEVTOOLS_ICON,
    reportsUsage: true,
    ui: {
      primaryColor: '#00dc82',
      familiesOption: 'fonts.families',
      docsURL: 'https://fonts.nuxt.com',
    },
  })

  const hook = nuxt.hook as Hook

  hook('devtools:ready', (ctx: DevtoolsReadyContext) => ctx.install(definition, {
    dock: { groupId: 'nuxt', category: 'modules' },
  }))

  let legacyDevtools = false
  hook('devtools:initialized', () => {
    legacyDevtools = !isViteDevtools(nuxt)
  })

  const base = joinURL(nuxt.options.app.baseURL || '/', `/__${DEVTOOLS_ID}/`)

  hook('devtools:customTabs', (tabs: LegacyCustomTab[]) => {
    if (legacyDevtools) {
      tabs.push({ name: DEVTOOLS_ID, title: DEVTOOLS_TITLE, icon: DEVTOOLS_ICON, view: { type: 'iframe', src: base } })
    }
  })

  let instance: { close: () => Promise<void> } | undefined
  nuxt.hook('close', () => instance?.close())
  nuxt.hook('vite:serverCreated', async (server, { isClient }) => {
    if (!isClient || !legacyDevtools) {
      return
    }
    await instance?.close()
    const { initDevframe } = await import('devframe/initiate')
    const created = initDevframe(definition, { base: '/', ws: false, auth: false })
    server.middlewares.use(base, created.nodeMiddleware)
    instance = created
  })

  return { exposeFont, exposeUsage, exposeWarning }
}
