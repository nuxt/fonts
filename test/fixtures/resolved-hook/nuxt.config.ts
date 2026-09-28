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
    ],
  },
})
