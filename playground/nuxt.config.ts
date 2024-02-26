import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { startSubprocess } from '@nuxt/devtools-kit'
import { DEVTOOLS_UI_PORT } from '../src/constants'

const resolver = createResolver(import.meta.url)

export default defineNuxtConfig({
  modules: [
    '@nuxt/fonts',
    '@unocss/nuxt',
    '@nuxtjs/tailwindcss',
    defineNuxtModule({
      setup(_, nuxt) {
        if (!nuxt.options.dev)
          return

        startSubprocess(
          {
            command: 'npx',
            args: ['nuxi', 'dev', '--port', DEVTOOLS_UI_PORT.toString()],
            cwd: resolver.resolve('../client'),
          },
          {
            id: 'nuxt-devtools:fonts-client',
            name: 'Nuxt DevTools Fonts Client',
          },
        )
      },
    }),
  ],
  unocss: {
    disableNuxtInlineStyle: false,
  },
  fonts: {
    providers: {
      custom: '~/providers/custom'
    },
    families: [
      { name: 'Abel', provider: 'bunny' },
      { name: 'Satoshi', provider: 'fontshare' },
      { name: 'Kode Mono', provider: 'none' },
      { name: 'MyCustom', src: '/custom-font.woff2' },
      { name: 'CustomGlobal', global: true, src: '/font-global.woff2' },
      { name: 'Oswald', fallbacks: ['Times New Roman'] },
    ],
    defaults: {
      fallbacks: {
        monospace: ['Tahoma']
      }
    }
  },
  devtools: {
    enabled: true,
  },
})
