import { createResolver } from '@nuxt/kit'
import { DEVTOOLS_UI_PATH } from '../src/constants'

const resolver = createResolver(import.meta.url)

export default defineNuxtConfig({
  ssr: false,
  modules: ['@nuxt/devtools-ui-kit'],
  unocss: {
    icons: true,
    shortcuts: {
      'bg-base': 'bg-white dark:bg-[#151515]',
      'bg-active': 'bg-gray:5',
      'bg-hover': 'bg-gray:3',
      'border-base': 'border-gray/20',
      'glass-effect': 'backdrop-blur-6 bg-white/80 dark:bg-[#151515]/90',
      'navbar-glass': 'sticky z-10 top-0 glass-effect',
    },
  },
  nitro: {
    output: {
      publicDir: resolver.resolve('../dist/client'),
    },
  },
  app: {
    baseURL: DEVTOOLS_UI_PATH,
  },
})
