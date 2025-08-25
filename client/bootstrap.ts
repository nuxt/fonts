import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { startSubprocess } from '@nuxt/devtools-kit'

import { DEVTOOLS_UI_PORT } from '../src/constants'

const resolver = createResolver(import.meta.url)

export default defineNuxtModule((_, nuxt) => {
  if (!nuxt.options.dev || !nuxt.options.modules?.includes('@nuxt/fonts')) return

  startSubprocess(
    {
      command: 'npx',
      args: ['nuxt', 'dev', '--port', DEVTOOLS_UI_PORT.toString()],
      cwd: resolver.resolve('.'),
    },
    {
      id: 'nuxt-devtools:fonts-client',
      name: 'Nuxt DevTools Fonts Client',
    },
  )
})
