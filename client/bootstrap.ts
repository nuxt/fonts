import { existsSync } from 'node:fs'
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { startSubprocess } from '@nuxt/devtools-kit'

import { DEVTOOLS_UI_PORT } from '../src/constants'

const resolver = createResolver(import.meta.url)

interface DevtoolsReadyContext {
  terminals: {
    startChildProcess: (options: { command: string, args?: string[], cwd?: string }, meta: { id: string, title: string }) => unknown
  }
}

export default defineNuxtModule((_, nuxt) => {
  if (!nuxt.options.dev || !nuxt.options.modules?.includes('@nuxt/fonts')) return

  // A prebuilt client takes precedence in `src/devtools.ts`
  if (existsSync(resolver.resolve('../dist/client/index.html'))) return

  const command = {
    command: 'npx',
    args: ['nuxt', 'dev', '--port', DEVTOOLS_UI_PORT.toString()],
    cwd: resolver.resolve('.'),
  }

  // `devtools:ready` is only called by `@nuxt/devtools` v4+, where `startSubprocess` is deprecated
  ;(nuxt.hook as (name: string, fn: (ctx: DevtoolsReadyContext) => void) => void)('devtools:ready', (ctx) => {
    ctx.terminals.startChildProcess(command, {
      id: 'nuxt-devtools:fonts-client',
      title: 'Nuxt DevTools Fonts Client',
    })
  })

  nuxt.hook('devtools:initialized', () => {
    const devtools = (nuxt as typeof nuxt & { devtools?: object }).devtools
    if (devtools && 'devtoolsKit' in devtools) {
      return
    }

    startSubprocess(command, {
      id: 'nuxt-devtools:fonts-client',
      name: 'Nuxt DevTools Fonts Client',
    })
  })
})
