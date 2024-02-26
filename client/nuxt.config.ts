import { createResolver } from '@nuxt/kit'
import { DEVTOOLS_UI_PATH } from '../src/constants'

const resolver = createResolver(import.meta.url)

export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@nuxt/devtools-ui-kit',
  ],
  nitro: {
    output: {
      publicDir: resolver.resolve('../dist/client'),
    },
  },
  app: {
    baseURL: DEVTOOLS_UI_PATH,
  },
})
