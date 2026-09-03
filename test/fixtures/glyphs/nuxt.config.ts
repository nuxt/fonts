export default defineNuxtConfig({
  modules: ['../../../src/module'],
  features: {
    inlineStyles: true,
  },
  compatibilityDate: '2024-08-19',
  fonts: {
    local: {
      dirs: ['assets/fonts'],
    },
    families: [
      { name: 'CustomFont', provider: 'local', glyphs: 'abc' },
    ],
  },
})
