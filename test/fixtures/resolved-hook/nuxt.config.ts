export default defineNuxtConfig({
  modules: ['../../../src/module'],
  app: {
    baseURL: '/base/',
  },
  compatibilityDate: '2024-08-19',
  nitro: { debug: true },
  fonts: {
    local: {
      dirs: ['fonts'],
    },
    families: [
      { name: 'MyGlobal', provider: 'local', global: true },
      { name: 'MyManual', src: '/fonts/MyManual-400.woff2?v=1', weight: '400', style: 'normal', global: true },
      { name: 'MyEscaped', src: '/%2e%2e/fonts/MyLocal-400.woff2', weight: '400', style: 'normal', global: true },
    ],
  },
})
