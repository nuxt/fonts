export default defineNuxtConfig({
  modules: ['../../../src/module'],
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
