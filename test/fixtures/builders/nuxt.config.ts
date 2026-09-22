export default defineNuxtConfig({
  modules: ['../../../src/module'],
  css: ['~/assets/global.css'],
  compatibilityDate: '2024-08-19',
  fonts: {
    local: {
      dirs: ['fonts'],
    },
    families: [
      { name: 'MyCustom', src: '/custom-font.woff2' },
      { name: 'MyLocal', provider: 'local' },
      { name: 'CustomGlobal', global: true, src: '/custom-font.woff2' },
    ],
  },
})
