export default defineNuxtConfig({
  modules: ['../../../src/module'],
  app: {
    baseURL: '/base/',
  },
  compatibilityDate: '2024-08-19',
  fonts: {
    local: {
      dirs: ['fonts'],
    },
    families: [
      { name: 'MyGlobal', provider: 'local', global: true },
      { name: 'MyManual', src: '/fonts/MyManual-400.woff2', weight: '400', style: 'normal', global: true },
    ],
  },
})
