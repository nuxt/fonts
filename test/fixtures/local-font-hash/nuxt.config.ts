export default defineNuxtConfig({
  modules: ['../../../src/module.ts'],
  compatibilityDate: '2024-08-19',
  fonts: {
    local: {
      dirs: ['assets/fonts'],
    },
    families: [
      { name: 'MyFont', provider: 'local', fallbacks: [] },
    ],
  },
})
