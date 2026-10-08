export default defineNuxtConfig({
  modules: ['../../../src/module.ts'],
  app: {
    cdnURL: 'https://cdn.example.com/',
  },
  css: ['~/assets/global.css'],
  routeRules: {
    '/_nuxt/**': {
      headers: { 'cache-control': 'public, max-age=60', 'x-route-rule': 'applied' },
    },
  },
  compatibilityDate: '2024-08-19',
  // TODO: remove when nuxt v4.6.1 is released (https://github.com/nuxt/nuxt/issues/36467)
  nitro: {
    externals: {
      inline: [/[\\/]node_modules[\\/]nuxt[\\/]dist[\\/]/],
    },
  },
  fonts: {
    local: {
      dirs: ['fonts'],
    },
    families: [
      { name: 'MyCustom', src: '/custom-font.woff2' },
      { name: 'MyLocal', provider: 'local' },
    ],
  },
})
